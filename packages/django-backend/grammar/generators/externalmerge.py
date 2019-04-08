from typing import Deque, List

from grammar.generators.unification.unify import unify, create_so
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
        next_so: SyntacticObject = create_so(
            text=next_item.text,
            current_language=next_item.language,
            features=next_item.features.all(),
            deleted_features=[],
        )

        # Merge next SyntacticObject with the current root SO.
        if root_so is None:
            root_so = next_so
        else:
            root_so = unify(root_so, next_so)

        return [
            NextStepDef(root_so=root_so, lexical_array_tail=lexical_array_tail)
        ]
