import logging
import time

from grammar.models import SyntacticObject
from .case import assign_case

logger = logging.getLogger("cs-toolkit-grammar")


class UnificationError(Exception):
    """
    Raised if anything goes wrong with Unification
    """

    def __init__(self, message: str):
        self.message = message

    def __str__(self):
        return self.message


def unify(parent_so: SyntacticObject) -> None:
    """
    Takes a pre-formed SO with an indeterminate feature set.
    Assumes it has two children.
    Determines how the two child SOs are unified to produce its features.
    Deals with feature matching/valuation/deletion/etc. (Unify and Agree)
    Assumes that the SO's children are freely mutable.
    :return:
    """
    start_time = time.perf_counter()

    children = list(parent_so.get_children())
    if not len(children) == 2:
        logger.info(children)
        raise UnificationError("Unify called on non-binary-branching SO.")

    [so_1, so_2] = children

    ######
    # Specific unify handlers
    assign_case(so_1, so_2)

    ######
    # Generic unify handler
    # Find uninterpretable features in the two SOs, except the ones named in
    # `exclude_generic`
    exclude_generic = ["Case"]

    so: SyntacticObject
    for so in so_1.get_descendants(include_self=True):
        for feature in so.features.all():
            if feature.uninterpretable and feature.name not in exclude_generic:
                # This feature is uninterpretable.
                for i_feature in so_2.features.all():
                    if not i_feature.uninterpretable and i_feature.name == feature.name:
                        so.features.remove(feature)
                        so.deleted_features.add(feature)
                        so.save()

    for so in so_2.get_descendants(include_self=True):
        for feature in so.features.all():
            if feature.uninterpretable and feature.name not in exclude_generic:
                # This feature is uninterpretable.
                for i_feature in so_1.features.all():
                    if not i_feature.uninterpretable and i_feature.name == feature.name:
                        so.features.remove(feature)
                        so.deleted_features.add(feature)
                        so.save()

    # Update the parent SO
    # TODO: Should defer to an explicit Labelling Algorithm, but for now,
    #  just use the text label from so_1
    parent_so.text = so_1.text
    parent_so.current_language = so_1.current_language
    parent_so.save()

    logger.debug(
        "Unified {}: {}/{} ({:.3f}s)".format(
            parent_so.text, so_1.text, so_2.text, time.perf_counter() - start_time,
        )
    )
