import logging
from typing import Deque, List, Optional

from grammar.generators.base import Generator, GeneratorMetadata, NextStepDef
from grammar.generators.unify.unify import unify
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
        derivation_actor,
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

        # Phases: Don't IM if one of the direct children of the `root_so` is
        # a phase head. (Anti-locality)
        # E.g.: `root_so` looks like [v*P [v*] [...]], where v* is a phase
        # head.
        for root_child in root_so.get_children():
            if root_child.has_feature("PhaseHead"):
                return []

        # Recursively apply IM to descendants of `root_so`, adding the
        # generated step definitions to `next_steps`.
        next_steps = []

        def merge_children(so: SyntacticObject):
            """
            Recursively Internal-Merges the children of the given SO to the
            top of `root_so`.

            - Does not search into the domain of phase heads.  If at least
            one of the children of the given `so` is a phase head, *none* of
            the children are merged.

            :param so:
            :return:
            """
            # Look for phase heads in this node's children.  If we find any,
            # this node is out of bounds to IM.
            child: SyntacticObject
            for child in so.get_children():
                if child.has_feature("PhaseHead"):
                    return

            # If we are still here, IM each child and all its children.
            for child in so.get_children():
                # Create a new root SO, add clones of the current root and
                # the IM-ed descendant as its children, and unify.
                new_parent = SyntacticObject.objects.create()
                child.create_clone(new_parent=new_parent)
                root_so.create_clone(
                    new_parent=new_parent, mark_copy=str(child.id)
                )

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

                merge_children(child)

        # Does not IM the direct children of `root_so` (anti-locality)
        for descendant in root_so.get_descendants().filter(
            level=root_so.level + 1
        ):
            merge_children(descendant)

        # top_child: SyntacticObject
        # for top_child in root_so.get_children():
        #     descendant: SyntacticObject
        #     for descendant in top_child.get_descendants():
        #         # TODO: Not hack this.
        #         if descendant.get_descendant_count() > 0:
        #             continue
        #
        #         # Create a new root SO, add clones of the current root and
        #         # the IM-ed descendant as its children, and unify.
        #         new_parent = SyntacticObject.objects.create()
        #         descendant.create_clone(new_parent=new_parent)
        #         root_so.create_clone(new_parent=new_parent)
        #
        #         unify(new_parent)
        #
        #         next_steps.append(
        #             NextStepDef(
        #                 root_so=new_parent,
        #                 lexical_array_tail=lexical_array_tail,
        #                 metadata=GeneratorMetadata(
        #                     last_generator="InternalMerge"
        #                 ),
        #             )
        #         )

        return next_steps
