from dataclasses import dataclass
from typing import Deque, List, Optional

from grammar.models import SyntacticObject
from lexicon.models import LexicalItem


class Generator:
    """
    Base template for a syntactic generator.
    """

    @staticmethod
    def generate(
        derivation_actor,
        root_so: Optional[SyntacticObject],
        lexical_array_tail: Deque[LexicalItem],
        metadata: Optional["GeneratorMetadata"] = None,
    ) -> List["NextStepDef"]:
        """
        Given the currently built-up syntactic object and the remainder of
        the lexical array for some DerivationStep, generate the parameters
        for the next set of DerivationSteps.
        The empty set may be returned if this generator has no more steps to
        generate.
        :return:
        """
        pass

    description = ""


@dataclass
class NextStepDef:
    """
    Definition for a next DerivationStep (we don't want the generator to
    modify the database by creating DerivationSteps directly; the derivation
    workers will take care of that.)
    """

    lexical_array_tail: Deque[LexicalItem]
    root_so: Optional[SyntacticObject] = None
    metadata: Optional["GeneratorMetadata"] = None


@dataclass
class GeneratorMetadata:
    """
    Pre-defined set of metadata attributes that generators can place on the
    steps they generate.
    """

    # The class name for the Generator that produced this step.
    last_generator: str

    # The node ID of the last merged SyntacticObject
    last_merged_node: Optional[str] = None
