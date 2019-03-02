from grammar.rules.base import Rule


class CoreNoUninterpretable(Rule):
    name = "core-no-uninterpretable"
    description = (
        "There should be no uninterpretable values left on the syntactic "
        "object at the end of the derivation."
    )

    def apply(self, syntactic_object, lexical_array_tail):
        pass
