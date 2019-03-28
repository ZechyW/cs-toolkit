from .base import Rule, DerivationFailed


class CoreNoUninterpretable(Rule):
    description = (
        "There should be no uninterpretable values left on the syntactic "
        "object at the end of the derivation."
    )

    @staticmethod
    def apply(root_so, lexical_array_tail):
        # DEBUG: Always fail
        root_so = "immutability test"
        raise DerivationFailed("Debug: Fail.")
