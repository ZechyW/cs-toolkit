"""
Contains the Django models used to represent the various steps of a
syntactic derivation.

- Users submit a DerivationRequest with some underspecified array of lexical
  items.

- One or more Derivations matching those lexical items are generated or
  retrieved.

- One or more DerivationSteps within that Derivation are generated or
  retrieved.

- The user may retrieve information about the DerivationRequest as a whole,
  or view individual DerivationSteps.

The actual rules applied at each derivational step are found in `.rules`.

Also contains the Django model used to represent syntactic objects.

- SyntacticObjects are represented as collections of nodes within a
  hierarchical tree structure. Each SyntacticObject has some `parent` and
  some set of `children`.

- DerivationSteps store a reference to the root node of the corresponding
  SyntacticObject tree.
"""

import uuid
from collections import deque

from django.db import models
from mptt.models import MPTTModel, TreeForeignKey, TreeOneToOneField


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Models for derivation requests and associated derivations.


class DerivationRequest(models.Model):
    """
    A Django model representing a request to generate a derivation.

    Because the elements in the lexical array for a DerivationRequest are
    underspecified with regard to the actual lexical items used in a
    particular Derivation, there is a potential many-to-many relationship
    between DerivationRequests and Derivations.

    - One underspecified DerivationRequest may correspond to multiple
      fully-specified Derivations.

    - One particular Derivation may be requested via separate
      DerivationRequests (e.g., if the user submits multiple requests with
      the same lexical array).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # String representation of a lexical array, as received from a client.
    # Will be transformed into one or more lists of fully-specified
    # LexicalItems and used to generate/retrieve the corresponding number of
    # Derivations.
    raw_lexical_array = models.TextField()

    # Each DerivationRequest may correspond to multiple actual Derivations,
    # since the lexical array provided to a DerivationRequest is
    # underspecified with regard to actual LexicalItems.
    derivations = models.ManyToManyField("Derivation")

    # Meta details
    creation_time = models.DateTimeField()
    created_by = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return str(self.raw_lexical_array)


class Derivation(models.Model):
    """
    A Django model representing a grammatical derivation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # All Derivations end...
    ended = models.BooleanField(default=False)
    # But not all Derivations converge.
    converged = models.BooleanField(default=False)

    # The first DerivationStep is initialised with the list of fully-specified
    # LexicalItems unique to the Derivation.
    first_step = models.ForeignKey(
        "DerivationStep", blank=True, null=True, on_delete=models.SET_NULL
    )

    def __str__(self):
        return str(self.first_step)


class DerivationStep(models.Model):
    """
    A Django model representing an individual step in a grammatical derivation.

    Each DerivationStep has a unique:
    - `root_so` representing the currently built-up SyntacticObject
    - `lexical_array_tail` representing the remainder of the input lexical
      array
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # Multiple Derivations may include this particular DerivationStep (via
    # fingerprinting and memoisation)
    derivations = models.ManyToManyField("Derivation")

    # Each DerivationStep has one unique root SyntacticObject,
    # since SyntacticObjects encode specific hierarchical information --
    # Different DerivationSteps will have different hierarchies,
    # and therefore different sets of SyntacticObjects.
    root_so = TreeOneToOneField(
        "SyntacticObject", blank=True, null=True, on_delete=models.SET_NULL
    )

    # How the derivation proceeds depends on the remaining LexicalItems
    # within the input, and which rules are currently active.
    # The rules are set here; the lexical array tail is managed by the
    # LexicalArrayItem model, which tracks order as well.
    rules = models.ManyToManyField("RuleDescription", blank=True)

    @property
    def lexical_array_tail(self):
        """
        Convenience function to return the tail of LexicalItems left in this
        Derivation as a deque.
        :return:
        """

        return deque(
            [
                lexical_array_item.lexical_item
                for lexical_array_item in self.lexical_array_items.all()
            ]
        )

    # Has this DerivationStep been processed?
    processed = models.BooleanField(default=False)
    crashed = models.BooleanField(default=False)
    # If it has, it should have a reference to the next DerivationStep in
    # the chain, unless this step crashed the derivation.
    next_step = models.OneToOneField(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="previous_step",
    )

    def __str__(self):
        tail_string = ", ".join(map("<{}>".format, self.lexical_array_tail))
        if not tail_string.strip():
            tail_string = "<<Finished Derivation>>"
        return tail_string


class LexicalArrayItem(models.Model):
    """
    An intermediary model for managing ordered lists of LexicalItems for
    DerivationSteps.
    """

    derivation_step = models.ForeignKey(
        "DerivationStep",
        on_delete=models.CASCADE,
        related_name="lexical_array_items",
    )
    lexical_item = models.ForeignKey(
        "lexicon.LexicalItem", on_delete=models.CASCADE, related_name="+"
    )
    order = models.IntegerField()

    class Meta:
        unique_together = ("derivation_step", "lexical_item", "order")
        ordering = ["order"]


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Models for syntactic objects.


class SyntacticObject(MPTTModel):
    """
    A `django-mptt` model for representing SyntacticObjects hierarchically.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # The same SyntacticObjectValue may be used in multiple
    # SyntacticObjects; most trivially, when the SyntacticObject appears in
    # a separate DerivationStep in a different hierarchical position
    # (i.e., with different `lft` and `rght` MPTT values)
    value = models.ForeignKey("SyntacticObjectValue", on_delete=models.CASCADE)

    # MPTT parent
    parent = TreeForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )

    def __str__(self):
        return "{}".format(str(self.value))


class SyntacticObjectValue(models.Model):
    """
    A structured representation of the value of any node in a SyntacticObject.
    Based on the representation of a single LexicalItem.
    """

    text = models.CharField(max_length=100)
    current_language = models.CharField(max_length=50)
    features = models.ManyToManyField("lexicon.Feature", blank=True)

    # For display in the admin interface
    def feature_string(self):
        return ", ".join(
            [str(feature) for feature in sorted(self.features.all(), key=str)]
        )

    feature_string.short_description = "Features"

    def __str__(self):
        return "{} ({}) {}".format(
            self.text, self.current_language, self.feature_string()
        )


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Stub for describing syntactic rules so that the other models can reference
# them -- Actual rule implementations are in `.rules`.


class RuleDescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # When attempting to process DerivationSteps, the name given in the
    # RuleDescription is normalised and used as the class name for the
    # rule in `.rules`.
    # Normalisation involves CamelCasing and removing non-alphanumeric
    # characters.
    name = models.CharField(max_length=255)

    description = models.TextField()

    def rule_class(self):
        """
        Turns our user-friendly rule name into the class name for a
        corresponding Rule in `grammar.rules`.
        :return:
        """
        # CamelCase and remove non-alphanumeric
        return "".join(x for x in self.name.title() if x.isalnum())

    def __str__(self):
        return self.name
