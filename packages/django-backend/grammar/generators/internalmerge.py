import logging
from typing import Deque, List, Optional

from grammar.generators.base import Generator, GeneratorMetadata, NextStepDef
from grammar.generators.unification.unify import unify
from grammar.models import SyntacticObject
from lexicon.models import LexicalItem

logger = logging.getLogger("cs-toolkit-grammar")


class InternalMerge(Generator):
    description = (
        "Pulls already-merged Syntactic Objects out from the current root "
        "Syntactic Object and (re-)merges them on top. "
        "Does not perform multiple Internal Merges consecutively. "
        "Does not target direct children of the root SO."
    )

    @staticmethod
    def generate(
        root_so: Optional[SyntacticObject],
        lexical_array_tail: Deque[LexicalItem],
        metadata: Optional[GeneratorMetadata] = None,
    ) -> List[NextStepDef]:
        # We may have been called with no current root SO.
        if root_so is None:
            return []

        # Recursion limit: Don't allow multiple IMs consecutively.
        # TODO: Make this configurable
        if metadata is not None and metadata.last_generator == "InternalMerge":
            return []

        # For each descendant in the tree: Clone it and attempt unification.
        # Only take descendants that are not direct children of the root (to
        # avoid spurious merging of top-level children)
        next_steps = []

        top_child: SyntacticObject
        for top_child in root_so.get_children():
            descendant: SyntacticObject
            for descendant in top_child.get_descendants():
                # TODO: Not hack this.
                if descendant.get_descendant_count() > 0:
                    continue

                # Create a new root SO, add clones of the current root and
                # the IM-ed descendant as its children, and unify.
                new_parent = SyntacticObject.objects.create()
                descendant.create_clone(new_parent=new_parent)
                root_so.create_clone(new_parent=new_parent)

                unify(new_parent)

                next_steps.append(
                    NextStepDef(
                        root_so=new_parent,
                        lexical_array_tail=lexical_array_tail,
                        metadata=GeneratorMetadata(
                            last_generator="InternalMerge"
                        ),
                    )
                )

        return next_steps
