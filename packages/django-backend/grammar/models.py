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
    lexical_array = models.TextField()


class Derivation(models.Model):
    """
    A Django model representing a grammatical derivation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # Each DerivationRequest may correspond to multiple actual Derivations,
    # since the lexical array provided to a DerivationRequest is
    # underspecified with regard to actual LexicalItems.
    derivation_request = models.ForeignKey(
        "DerivationRequest", on_delete=models.CASCADE
    )

    # All Derivations end...
    ended = models.BooleanField()
    # But not all Derivations converge.
    converged = models.BooleanField()


class DerivationStep(models.Model):
    """
    A Django model representing an individual step in a grammatical derivation.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # Each DerivationStep has one unique root SyntacticObject,
    # since SyntacticObjects encode specific hierarchical information --
    # Different DerivationSteps will have different hierarchies,
    # and therefore different sets of SyntacticObjects.
    root_so = TreeOneToOneField("SyntacticObject", on_delete=models.CASCADE)

    # Multiple Derivations may include this particular DerivationStep (via
    # fingerprinting and memoisation)
    derivation = models.ForeignKey("Derivation", on_delete=models.CASCADE)


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

    def __str__(self):
        return self.text
