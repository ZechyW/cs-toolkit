import logging
from typing import Sequence

from grammar.models import SyntacticObject
from lexicon.models import Feature

logger = logging.getLogger("cs-toolkit-grammar")


def unify(so_1: SyntacticObject, so_2: SyntacticObject) -> SyntacticObject:
    """
    Determines how the two child SOs are unified to produce a parent SO.
    Deals with feature matching/valuation/deletion/etc.
    :return:
    """
    logger.info("--------------------------------------------------")

    # Clone the children SOs (to preserve deleted features, etc.)
    so_1 = clone_so_tree(so_1)
    so_2 = clone_so_tree(so_2)

    # Find uninterpretable features in the two SOs.
    uninterpretable_1 = []
    uninterpretable_2 = []

    so: SyntacticObject
    for so in so_1.get_descendants(include_self=True):
        for feature in so.features.all():
            interp = feature.properties.filter(name__exact="interpretable")
            if len(interp) > 0:
                if not interp[0].value:
                    # This feature is uninterpretable.
                    uninterpretable_1.append((so, feature))

    for so in so_2.get_descendants(include_self=True):
        for feature in so.features.all():
            interp = feature.properties.filter(name__exact="interpretable")
            if len(interp) > 0:
                if not interp[0].value:
                    # This feature is uninterpretable.
                    uninterpretable_2.append((so, feature))

    # Match and delete them.
    u_so: SyntacticObject
    for (u_so, u_feature) in uninterpretable_1:
        for feature in so_2.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.features.remove(u_feature)
                u_so.deleted_features.add(u_feature)

    for (u_so, u_feature) in uninterpretable_2:
        for feature in so_1.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.features.remove(u_feature)
                u_so.deleted_features.add(u_feature)

    # Clone the children SOs (to preserve deleted features, etc.), create a
    # new parent SO, then set it as the root.
    new_parent = create_so(
        text=so_2.text, current_language=so_2.current_language
    )

    # The order that the children are added determines the order in which
    # they are displayed in the tree
    # (But remember that the tree structures are supposed to be unordered.)
    so_1.move_to(new_parent, "first-child")
    so_1.save()
    so_2.move_to(new_parent, "first-child")
    so_2.save()

    logger.info("{}: {}/{}".format(new_parent.text, so_1.text, so_2.text))

    return new_parent


def create_so(
    text,
    current_language,
    features: Sequence[Feature] = (),
    deleted_features: Sequence[Feature] = (),
):
    """
    Creates a new SyntacticObject with the given parameters.
    In particular, handles the addition of each Feature as a ManyToMany
    relation.
    :param text:
    :param current_language:
    :param features:
    :param deleted_features:
    :return:
    """

    # DEPRECATED: We don't separate the SO value from the SO anymore,
    # but this snippet is retained as an example of retrieving an annotated
    # QuerySet.
    #
    # # We need to annotate the query with a count of the associated features
    # # so that we don't pick up SyntacticObjectValues with the given features
    # # *and more*.
    # existing = SyntacticObjectValue.objects.filter(
    #     text=text, current_language=current_language
    # )
    # existing = existing.annotate(count=Count("features")).filter(
    #     count=len(feature_list)
    # )
    # for feature in feature_list:
    #     existing = existing.filter(features=feature)
    #
    # if len(existing) > 0:
    #     return existing.get()

    # Still here? Create a new SyntacticObjectValue
    so = SyntacticObject.objects.create(
        text=text, current_language=current_language
    )
    so.features.set(features)
    so.deleted_features.set(deleted_features)

    return so


def clone_so_tree(
    so: SyntacticObject, parent: SyntacticObject = None
) -> SyntacticObject:
    """
    Creates a clone of the given SyntacticObject, optionally changing its
    parent.
    Recursively clones the SO's children as well, setting their new parents
    accordingly.
    (cf. https://stackoverflow.com/questions/3879500/making-a-copy-of-a
    -feincms-page-tree-using-django-mptt-changes-child-order)
    :param so:
    :param parent:
    :return:
    """

    # re-read so django-mptt fields get updated
    so = SyntacticObject.objects.get(id=so.id)
    if parent:
        parent = SyntacticObject.objects.get(id=parent.id)

    # Clone the current SO
    new_so = create_so(
        text=so.text,
        current_language=so.current_language,
        features=so.features.all(),
        deleted_features=so.deleted_features.all(),
    )

    # logger.info("{}:{}".format(new_so.id, so.id))

    # Re-parent the SO and its children
    new_so.move_to(parent, "last-child")
    new_so.save()

    for child in so.get_children():
        clone_so_tree(child, new_so)

    new_so = SyntacticObject.objects.get(id=new_so.id)
    return new_so
