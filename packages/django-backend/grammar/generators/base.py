from dataclasses import dataclass
from typing import Deque, List, Optional

from grammar.models import SyntacticObject
from lexicon.models import LexicalItem


class Generator:
    """
    Base template for a syntactic generator.
    """

    description = ""

    @staticmethod
    def generate(root_so, lexical_array_tail) -> List["NextStepDef"]:
        """
        Given the currently built-up syntactic object and the remainder of
        the lexical array for some DerivationStep, generate the parameters
        for the next set of DerivationSteps.
        The empty set may be returned if this generator has no more steps to
        generate.
        :return:
        """
        pass


@dataclass
class NextStepDef:
    """
    Definition for a next DerivationStep (we don't want the generator to
    modify the database by creating DerivationSteps directly; the derivation
    workers will take care of that.)
    """

    lexical_array_tail: Deque[LexicalItem]
    root_so: Optional[SyntacticObject] = None
