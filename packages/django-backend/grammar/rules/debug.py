from .base import Rule, DerivationFailed


class DebugAlwaysFail(Rule):
    description = "Debug: This Rule always crashes the DerivationStep it is applied to."

    @staticmethod
    def apply(root_so, lexical_array_tail):
        # DEBUG: Always fail
        root_so = "immutability test"
        raise DerivationFailed("DebugAlwaysFail", "Debug: Always fail.")


class DebugAlwaysPass(Rule):
    description = "Debug: This Rule always allows the DerivationStep it is applied to."

    @staticmethod
    def apply(root_so, lexical_array_tail):
        # DEBUG: Always fail
        root_so = "immutability test"
        raise DerivationFailed("DebugAlwaysPass", "Debug: Always pass.")
