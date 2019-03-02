from grammar.rules.base import Rule


class CoreNoUninterpretable(Rule):
    description = (
        "There should be no uninterpretable values left on the syntactic "
        "object at the end of the derivation."
    )

    def apply(self, root_so, lexical_array_tail):
        pass
