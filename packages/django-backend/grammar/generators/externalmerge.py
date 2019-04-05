from typing import Deque, List

from grammar.generators.unification.unify import get_or_create_so_value, unify
from lexicon.models import LexicalItem
from .base import Generator, NextStepDef
from ..models import SyntacticObject


class ExternalMerge(Generator):
    description = (
        "Pulls the next item from the lexical array tail and merges it to "
        "the top of the current root syntactic object."
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
            root_so = unify(root_so, next_so)

        return [
            NextStepDef(root_so=root_so, lexical_array_tail=lexical_array_tail)
        ]
