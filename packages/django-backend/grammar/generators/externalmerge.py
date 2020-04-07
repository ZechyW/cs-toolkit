import logging
import time
from typing import Deque, List, Optional

from grammar.generators.base import Generator, GeneratorMetadata, NextStepDef
from grammar.generators.unify.unify import unify
from grammar.models import Derivation, SyntacticObject
from grammar.util import get_derivation_by_lexical_array
from lexicon.models import LexicalItem

logger = logging.getLogger("cs-toolkit-grammar")


class ExternalMerge(Generator):
    description = (
        "Pulls the next item from the Lexical Array tail and merges it to "
        "the top of the current root Syntactic Object. "
        "Handles sub-derivations (defined using square brackets)."
    )

    @staticmethod
    def generate(
        derivation_actor,
        root_so: Optional[SyntacticObject],
        lexical_array_tail: Deque[LexicalItem],
        metadata: Optional[GeneratorMetadata] = None,
    ) -> List[NextStepDef]:
        # We may have been called with no more items in our tail.
        if not lexical_array_tail:
            return []

        # Pop an item from the lexical array.  We will create an SO that
        # inherits the LI's features.  (But not `deleted_features`,
        # since the LI doesn't inherently have any)
        next_item = lexical_array_tail.popleft()

        # Special handling if `next_item` heralds a sub-derivation
        if next_item.text == "[" and next_item.language == "sys":
            sub_lexical_array = []
            next_item = lexical_array_tail.popleft()
            while not (next_item.text == "]" and next_item.language == "sys"):
                sub_lexical_array.append(next_item)
                next_item = lexical_array_tail.popleft()

            # Get a reference to the required Derivation and wait for it to
            # complete.
            sub_derivation = get_derivation_by_lexical_array(sub_lexical_array)
            logger.info("Sub-derivation: {}".format(sub_derivation.id))

            derivation_actor.send(str(sub_derivation.first_step.id))
            complete = False
            failsafe = 0
            while (not complete) and failsafe < 100:
                failsafe += 1
                complete = (
                    Derivation.objects.filter(id=sub_derivation.id).get().complete
                )
                time.sleep(0.1)

            if not complete:
                logger.error(
                    "ERROR: Sub-derivation did not complete: {}".format(
                        sub_derivation.id
                    )
                )

            # ExternalMerge all of the sub-derivation's final SO's
            next_steps = []
            for sub_step in sub_derivation.converged_steps.all():
                if root_so is None:
                    # This is the first step; we can just take clones of the
                    # sub-derivations' final SOs, no unification needed
                    new_so = sub_step.root_so.create_clone()
                else:
                    # Create a new root SO, add clones of the sub-derivation's
                    # SO and the current SO, and unify
                    new_so = SyntacticObject.objects.create()
                    sub_step.root_so.create_clone(new_parent=new_so)
                    root_so.create_clone(new_parent=new_so)

                    unify(new_so)

                next_steps.append(
                    NextStepDef(
                        root_so=new_so,
                        lexical_array_tail=lexical_array_tail,
                        metadata=GeneratorMetadata(
                            last_generator="ExternalMerge",
                            last_merged_node=str(sub_step.root_so.id),
                        ),
                    )
                )

            # Do the same for crashed steps, in case they crashed
            # non-fatally and have a chance to survive in the full derivation
            for sub_step in sub_derivation.crashed_steps.all():
                if root_so is None:
                    new_so = sub_step.root_so.create_clone()
                else:
                    new_so = SyntacticObject.objects.create()
                    sub_step.root_so.create_clone(new_parent=new_so)
                    root_so.create_clone(new_parent=new_so)

                    unify(new_so)

                next_steps.append(
                    NextStepDef(
                        root_so=new_so,
                        lexical_array_tail=lexical_array_tail,
                        metadata=GeneratorMetadata(
                            last_generator="ExternalMerge",
                            last_merged_node=str(sub_step.root_so.id),
                        ),
                    )
                )
            return next_steps

        # Normal External Merge. Prepare the next root SO.
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
            new_so = SyntacticObject.objects.create()
            next_so: SyntacticObject = SyntacticObject.objects.create(
                text=next_item.text, current_language=next_item.language, parent=new_so,
            )
            next_so.features.set(next_item.features.all())
            root_so.create_clone(new_parent=new_so)

            # The children of `root_so` are now freely mutable; unify to get
            # the features on `root_so`.
            root_so = new_so
            unify(root_so)

        return [
            NextStepDef(
                root_so=root_so,
                lexical_array_tail=lexical_array_tail,
                metadata=GeneratorMetadata(last_generator="ExternalMerge"),
            )
        ]
