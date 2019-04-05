from typing import Deque, List, Optional

from grammar.models import SyntacticObject
from lexicon.models import LexicalItem

# Type aliases
RuleNonFatalError = str


class Rule:
    """
    Base template for a syntactic Rule.
    """

    description = ""

    @staticmethod
    def apply(
        root_so: Optional[SyntacticObject],
        lexical_array_tail: Deque[LexicalItem],
    ) -> List[RuleNonFatalError]:
        """
        Given the currently built-up syntactic object and the remainder of
        the lexical array for some DerivationStep, checks whether the
        Derivation chain should continue.

        If the Rule determines that the Derivation can *never* converge,
        it should raise a DerivationFailed exception with a message
        specifying the reason.

        If the Rule doesn't pass at the given DerivationStep, but could
        conceivably do so in the future, it should return a List of
        RuleNonFatalError messages specifying why it failed.

        If the Rule passes for the given DerivationStep, it should return an
        empty List.
        :return:
        """
        pass


class DerivationFailed(Exception):
    """
    Raised by Rules to halt the derivation.
    """

    def __init__(self, rule_class: str, message: str):
        self.rule_class = rule_class
        self.message = message

    def __str__(self):
        return "{}: {}".format(self.rule_class, self.message)
