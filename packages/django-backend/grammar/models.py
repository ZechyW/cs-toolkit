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
import logging
import uuid
from collections import deque
from typing import List

from django.db import models
from django.db.models import QuerySet
from model_utils import FieldTracker
from mptt.models import MPTTModel, TreeForeignKey, TreeOneToOneField

from notify.models import NotifyModel

logger = logging.getLogger("cs-toolkit-grammar")


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Models for derivation requests and associated derivations.
class DerivationRequest(NotifyModel):
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
    derivations = models.ManyToManyField(
        "Derivation", related_name="derivation_requests"
    )

    # Meta details
    creation_time = models.DateTimeField()
    created_by = models.CharField(max_length=255, blank=True, null=True)
    # Each DerivationRequest is associated with one or more Derivations,
    # which may be associated with one or more DerivationStep chains.
    # Record the time the last chain converged/crashed.
    last_completion_time = models.DateTimeField(null=True, blank=True)

    #: Used for change notifications. Subscribers will only be alerted when a
    #: substantive change is made to a model instance.
    tracker = FieldTracker()

    #: Used for change notifications. Subscribers will receive the latest model
    #: data processed via this serializer.
    serializer_class = "grammar.serializers.DerivationRequestSerializer"

    def __str__(self):
        return str(self.raw_lexical_array)


class Derivation(NotifyModel):
    """
    A Django model representing a grammatical derivation.

    Each Derivation can host multiple DerivationStep chains, since multiple
    operation types can result in multiple branching paths at each
    individual DerivationStep.

    Each DerivationStep chain should either converge or crash, as determined
    by the last step in the chain.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # The first DerivationStep is initialised with the list of fully-specified
    # LexicalItems unique to the Derivation and an empty built-up
    # SyntacticObject.
    first_step = models.ForeignKey(
        "DerivationStep",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="first_step_derivations",
    )

    # Derivations are complete if all their possible chains have been
    # processed to a crash/convergence
    complete = models.BooleanField(default=False)

    # Record the final step in any related DerivationStep chain -- As a
    # final step, it either converged or crashed.
    converged_steps = models.ManyToManyField(
        "DerivationStep", related_name="converged_derivations"
    )
    crashed_steps = models.ManyToManyField(
        "DerivationStep", related_name="crashed_derivations"
    )

    @property
    def converged_count(self):
        return self.converged_steps.count()

    @property
    def crashed_count(self):
        return self.crashed_steps.count()

    @property
    def converged_chains(self):
        """
        Returns all the DerivationStep chains associated with this
        Derivation which converged.
        :return:
        """
        return Derivation.get_chains_from_steps(self.converged_steps.all())

    @property
    def crashed_chains(self):
        """
        Returns all the DerivationStep chains associated with this
        Derivation which converged.
        :return:
        """
        return Derivation.get_chains_from_steps(self.crashed_steps.all())

    @staticmethod
    def get_chains_from_steps(end_steps):
        """
        From a given iterable of end DerivationSteps, retrieve all the
        corresponding full chains.
        :param end_steps:
        :return:
        """
        chains = []
        for end_step in end_steps:
            this_chain = [end_step]
            this_step = end_step

            # Each DerivationStep may have multiple `next_steps`, but only one
            # `previous_step`.  If we follow the chain backward, we will get
            # back to the `first_step`.
            while this_step.previous_step:
                this_chain.append(this_step.previous_step)
                this_step = this_step.previous_step

            # We now have a chain from last step to first -- Reverse it and
            # append it to the list of all chains for this Derivation.
            this_chain.reverse()
            chains.append(this_chain)

        return chains

    #: Used for change notifications. Subscribers will only be alerted when a
    #: substantive change is made to a model instance.
    tracker = FieldTracker()

    #: Used for change notifications. Subscribers will receive the latest model
    #: data processed via this serializer.
    serializer_class = "grammar.serializers.DerivationSerializer"

    def __str__(self):
        return str(self.first_step)


class DerivationStep(models.Model):
    """
    A Django model representing an individual step in a grammatical derivation.

    Each DerivationStep has a unique combination of:
    - `root_so` representing the currently built-up SyntacticObject
    - `lexical_array_tail` representing the remainder of the input lexical
      array
    - `rules` representing the Rules active for this derivation
    - `generators` representing the Generators active for this derivation

    DerivationSteps go through a number of phases when processed:
    - Before processing (STATUS_PENDING).
    - Rule checks - Crashes (STATUS_CRASHED) if any rules raise errors.
    - Generator applications - Generates the next DerivationSteps in the
      Derivation based on the configured generators.
    - Continued processing with subsequent steps (STATUS_PROCESSED).

    Also:
    - The DerivationStep could cause its derivational chain to converge
      (STATUS_CONVERGED)
    - If there are no more generated next DerivationSteps and the
      Rule checks still fail, the derivation is marked as crashed
      (STATUS_CRASHED)
    """

    STATUS_PENDING = "Pending"
    STATUS_PROCESSED = "Processed"
    STATUS_CONVERGED = "Converged"
    STATUS_CRASHED = "Crashed"
    STATUSES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_PROCESSED, "Processed"),
        (STATUS_CONVERGED, "Converged"),
        (STATUS_CRASHED, "Crashed"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    status = models.CharField(
        max_length=10, choices=STATUSES, default=STATUS_PENDING
    )

    # Multiple Derivations may include this particular DerivationStep (via
    # fingerprinting and memoisation)
    # TODO: Fingerprinting and memoisation
    derivations = models.ManyToManyField("Derivation")

    # Each DerivationStep has one unique root SyntacticObject,
    # since SyntacticObjects encode specific hierarchical information --
    # Different DerivationSteps will have different hierarchies,
    # and therefore different sets of SyntacticObjects.
    root_so = TreeOneToOneField(
        "SyntacticObject", blank=True, null=True, on_delete=models.SET_NULL
    )

    # How the derivation proceeds depends on the remaining LexicalItems
    # within the input, and which rules/generators are currently active.
    # - The rules and generators are set here
    # - The lexical array tail is managed externally by the LexicalArrayItem
    #   model, which tracks order as well.
    rules = models.ManyToManyField("RuleDescription", blank=True)
    generators = models.ManyToManyField("GeneratorDescription", blank=True)

    # Any Rule error messages or Generator metadata, as JSON data
    rule_errors_json = models.TextField(blank=True)
    generator_metadata_json = models.TextField(blank=True)

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

    # If this isn't the first step in a Derivation, it should have a
    # reference to the previous step in the chain.
    previous_step = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="next_steps",
    )

    # If this DerivationStep crashed, we should provide a reason.
    crash_reason = models.TextField(blank=True)

    # Note the time when we first process this DerivationStep
    processed_time = models.DateTimeField(null=True, blank=True)

    # DerivationSteps are complete if they and all their next steps have
    # been processed.
    complete = models.BooleanField(default=False)

    # Any sub-derivations that were triggered by this DerivationStep;
    # They will be added to the timeline display of this DerivationStep's chain
    # TODO: Get these out from ExternalMerge
    sub_derivations = models.ManyToManyField(
        "Derivation", related_name="trigger_steps"
    )

    def lexical_array_friendly(self):
        """
        A user-friendly representation of the lexical array tail for this
        DerivationStep (primarily for the admin UI)
        :return:
        """
        tail_string = "; ".join(map("{}".format, self.lexical_array_tail))
        if not tail_string.strip():
            tail_string = "<Finished Derivation>"
        return tail_string

    lexical_array_friendly.short_description = "Lexical array tail"

    def __str__(self):
        return self.lexical_array_friendly()


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
    Also includes a structured representation of the SO's value, in terms of
    its text, current lexicon, and features.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    text = models.CharField(max_length=100)
    current_language = models.CharField(max_length=50)

    # Features that are no longer active in the derivation (e.g.,
    # uninterpretable features that have been valued and deleted) are moved
    # to `deleted_features` instead.
    features = models.ManyToManyField(
        "lexicon.Feature", blank=True, related_name="so_set"
    )
    deleted_features = models.ManyToManyField(
        "lexicon.Feature", blank=True, related_name="so_deleted_set"
    )

    # When this SO has been copied to a different position (e.g.,
    # via Internal Merge), the original SO can be marked as a copy.
    is_copy = models.BooleanField(default=False)

    # For serialisation and the admin interface
    def feature_string(self):
        return ", ".join(
            [str(feature) for feature in sorted(self.features.all(), key=str)]
        )

    def deleted_feature_string(self):
        return ", ".join(
            [
                str(feature)
                for feature in sorted(self.deleted_features.all(), key=str)
            ]
        )

    feature_string.short_description = "Features"
    deleted_feature_string.short_description = "Deleted Features"

    # For directly referencing this SyntacticObject's text label
    def name(self):
        return self.text

    def __str__(self):
        return "{} ({}) {}".format(
            self.text, self.current_language, self.feature_string()
        )

    # MPTT parent
    parent = TreeForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )

    # MPTT level (with 0 being root nodes)
    level = models.PositiveIntegerField(db_index=True, editable=False)

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Model instance helpers and utilities
    def create_clone(
        self, new_parent: "SyntacticObject" = None, mark_copy: str = None
    ) -> "SyntacticObject":
        """
        Utility function to create a clone of this SO, optionally changing
        its parent.  Recursively clones the SO's children as well, setting
        their new parents accordingly.
        (cf. https://stackoverflow.com/questions/3879500/making-a-copy-of-a
        -feincms-page-tree-using-django-mptt-changes-child-order)

        Should be called between DerivationSteps if the SO is going to be
        mutated, so that changes aren't inadvertently propagated to
        previous DerivationSteps as well.

        Optionally, if the id of one of the SO's children is passed as
        `mark_copy`, the clone of that child SO will be marked as a copy
        (i.e., `is_copy` will be set to True)

        :param new_parent:
        :param mark_copy:
        :return:
        """
        # Clone the current SO
        new_so: SyntacticObject = SyntacticObject.objects.create(
            text=self.text,
            current_language=self.current_language,
            parent=new_parent,
            is_copy=self.is_copy or str(self.id) == mark_copy,
        )
        new_so.features.set(self.features.all())
        new_so.deleted_features.set(self.deleted_features.all())
        new_so.save()

        # Clone children
        children: List[SyntacticObject] = list(self.get_children())
        for child in children:
            child.create_clone(new_so, mark_copy)

        return new_so

    def has_feature(self, name):
        """
        Checks if this SO has an active feature with the given name.
        :param name:
        :return:
        """
        return self.features.filter(name=name).exists()

    def get_uninterpretable_features(self) -> QuerySet:
        """
        Returns a QuerySet representing all the active uninterpretable
        features on this SO for future filtering/processing.
        :return:
        """
        return self.features.filter(properties__name="interpretable").exclude(
            properties__raw_value="True"
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

    @property
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


# Stub for describing syntactic generators so that the other models can
# reference them -- Actual implementations are in `.generators`.
class GeneratorDescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # When attempting to process DerivationSteps, the name given here is
    # normalised and used as the class name for the
    # generator in `.generators`.
    # Normalisation involves CamelCasing and removing non-alphanumeric
    # characters.
    name = models.CharField(max_length=255)

    description = models.TextField()

    @property
    def generator_class(self):
        """
        Turns our user-friendly name into the class name for a
        corresponding Generator in `grammar.generators`.
        :return:
        """
        # CamelCase and remove non-alphanumeric
        return "".join(x for x in self.name.title() if x.isalnum())

    def __str__(self):
        return self.name
