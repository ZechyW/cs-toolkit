from typing import Deque, List, Sequence

from django.db.models import Count

from lexicon.models import Feature, LexicalItem
from .base import Generator, NextStepDef
from ..models import SyntacticObject, SyntacticObjectValue


class ExternalMerge(Generator):
    description = (
        "Pulls the next item from the lexical array tail and merges it to "
        "the top of the current root syntactic object. Reports completion "
        "when the lexical array tail is empty."
    )

    @staticmethod
    def generate(
        root_so, lexical_array_tail: Deque[LexicalItem]
    ) -> List[NextStepDef]:
        # We may have been called with no more items in our tail.
        if not lexical_array_tail:
            return []

        # Pop an item and create a SyntacticObject out of it.
        next_item = lexical_array_tail.popleft()
        next_so_value = get_or_create_so_value(
            text=next_item.text,
            current_language=next_item.language,
            feature_list=next_item.features.all(),
        )
        next_so: SyntacticObject = SyntacticObject.objects.create(
            value=next_so_value
        )

        # Merge next SyntacticObject with the current root SO.
        if root_so is None:
            root_so = next_so
        else:
            # Create a new parent SO, then set it as the root.
            parent_so_value = get_or_create_so_value(
                text=next_so_value.text,
                current_language=next_so_value.current_language,
                feature_list=list(root_so.value.features.all())
                + list(next_so_value.features.all()),
            )
            parent_so = SyntacticObject.objects.create(value=parent_so_value)

            next_so.parent = parent_so
            next_so.save()
            root_so.parent = parent_so
            root_so.save()

            root_so = parent_so

        return [
            NextStepDef(root_so=root_so, lexical_array_tail=lexical_array_tail)
        ]


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
