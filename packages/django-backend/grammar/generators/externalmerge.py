import logging
from typing import Deque, List, Optional

from grammar.generators.base import Generator, GeneratorMetadata, NextStepDef
from grammar.generators.unify.unify import unify
from grammar.models import SyntacticObject
from lexicon.models import LexicalItem

logger = logging.getLogger("cs-toolkit-grammar")


class ExternalMerge(Generator):
    description = (
        "Pulls the next item from the Lexical Array tail and merges it to "
        "the top of the current root Syntactic Object."
    )

    @staticmethod
    def generate(
        root_so: Optional[SyntacticObject],
        lexical_array_tail: Deque[LexicalItem],
        metadata: Optional[GeneratorMetadata] = None,
    ) -> List[NextStepDef]:
        # We may have been called with no more items in our tail.
        if not lexical_array_tail:
            return []

        # Pop an item from the lexical array.  We will create an SO that
        # inherits the LI's features.  (But not `deleted_features`,
        # since the LI doesn't have any)
        next_item = lexical_array_tail.popleft()

        # Prepare the next root SO.
        if root_so is None:
            # There is no current root SO: The SO formed from the next LI
            # will be the root.  No unification needed.
            root_so = SyntacticObject.objects.create(
                text=next_item.text, current_language=next_item.language
            )
            root_so.features.set(next_item.features.all())
        else:
            # There is a current root SO: We need to create a new SO to
            # serve as the new root, then add the new LI's SO and a clone of
            # the current root as its children.
            new_parent = SyntacticObject.objects.create()
            next_so: SyntacticObject = SyntacticObject.objects.create(
                text=next_item.text,
                current_language=next_item.language,
                parent=new_parent,
            )
            next_so.features.set(next_item.features.all())
            root_so.create_clone(new_parent=new_parent)

            # The children of `root_so` are now freely mutable; unify to get
            # the features on `root_so`.
            root_so = new_parent
            unify(root_so)

        return [
            NextStepDef(
                root_so=root_so,
                lexical_array_tail=lexical_array_tail,
                metadata=GeneratorMetadata(last_generator="ExternalMerge"),
            )
        ]
