from typing import Sequence

from django.db.models import Count

from grammar.models import SyntacticObject, SyntacticObjectValue
from lexicon.models import Feature


def unify(so_1: SyntacticObject, so_2: SyntacticObject) -> SyntacticObject:
    """
    Determines how the features on two child SOs are unified to give the
    features on their parent SO.
    :return:
    """

    # Find uninterpretable features in the two SOs.
    uninterpretable_1 = []
    uninterpretable_2 = []

    so: SyntacticObject
    for so in so_1.get_descendants(include_self=True):
        for feature in so.value.features.all():
            interp = feature.properties.filter(name__exact="interpretable")
            if len(interp) > 0:
                if not interp[0].value:
                    # This feature is uninterpretable.
                    uninterpretable_1.append((so, feature))

    so: SyntacticObject
    for so in so_2.get_descendants(include_self=True):
        for feature in so.value.features.all():
            interp = feature.properties.filter(name__exact="interpretable")
            if len(interp) > 0:
                if not interp[0].value:
                    # This feature is uninterpretable.
                    uninterpretable_2.append((so, feature))

    # Match and delete them.
    for (u_so, u_feature) in uninterpretable_1:
        for feature in so_2.value.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.value.features.remove(u_feature)
                u_so.value.deleted_features.add(u_feature)

    for (u_so, u_feature) in uninterpretable_2:
        for feature in so_1.value.features.all():
            if not feature.uninterpretable and feature.name == u_feature.name:
                u_so.value.features.remove(u_feature)
                u_so.value.deleted_features.add(u_feature)

    # Create a new parent SO, then set it as the root.
    new_so_value = get_or_create_so_value(
        text=so_2.value.text,
        current_language=so_2.value.current_language,
        feature_list=[],
    )
    new_so = SyntacticObject.objects.create(value=new_so_value)
    so_2.parent = new_so
    so_2.save()
    so_1.parent = new_so
    so_1.save()

    return new_so


def get_or_create_so_value(
    text, current_language, feature_list: Sequence[Feature]
):
    """
    Retrieves a raw SyntacticObjectValue with the given parameters, creating it
    if it doesn't exist.
    :param text:
    :param current_language:
    :param feature_list:
    :return:
    """

    # We need to annotate the query with a count of the associated features
    # so that we don't pick up SyntacticObjectValues with the given features
    # *and more*.
    existing = SyntacticObjectValue.objects.filter(
        text=text, current_language=current_language
    )
    existing = existing.annotate(count=Count("features")).filter(
        count=len(feature_list)
    )
    for feature in feature_list:
        existing = existing.filter(features=feature)

    if len(existing) > 0:
        return existing.get()

    # Still here? Create a new SyntacticObjectValue
    so_value = SyntacticObjectValue.objects.create(
        text=text, current_language=current_language
    )
    for feature in feature_list:
        so_value.features.add(feature)

    return so_value
