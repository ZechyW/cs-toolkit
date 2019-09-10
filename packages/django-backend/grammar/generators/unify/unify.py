import logging
import time

from .case import assign_case
from grammar.models import SyntacticObject

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
    uninterpretable_1 = []
    uninterpretable_2 = []
    exclude_generic = ["Case"]

    so: SyntacticObject
    for so in so_1.get_descendants(include_self=True):
        for feature in so.features.all():
            if feature.uninterpretable and feature.name not in exclude_generic:
                # This feature is uninterpretable.
                uninterpretable_1.append((so, feature))

    for so in so_2.get_descendants(include_self=True):
        for feature in so.features.all():
            if feature.uninterpretable and feature.name not in exclude_generic:
                # This feature is uninterpretable.
                uninterpretable_2.append((so, feature))

    # Match and delete them.
    u_so: SyntacticObject
    for (u_so, u_feature) in uninterpretable_1:
        for feature in so_2.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.features.remove(u_feature)
                u_so.deleted_features.add(u_feature)
                u_so.save()

    for (u_so, u_feature) in uninterpretable_2:
        for feature in so_1.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.features.remove(u_feature)
                u_so.deleted_features.add(u_feature)
                u_so.save()

    # Update the parent SO
    # TODO: Should defer to an explicit Labelling Algorithm, but for now,
    #  just use the text label from so_1
    parent_so.text = so_1.text
    parent_so.current_language = so_1.current_language
    parent_so.save()

    logger.debug(
        "Unified {}: {}/{} ({:.3f}s)".format(
            parent_so.text,
            so_1.text,
            so_2.text,
            time.perf_counter() - start_time,
        )
    )
