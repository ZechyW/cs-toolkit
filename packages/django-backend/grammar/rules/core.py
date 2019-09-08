from typing import List

from grammar.models import SyntacticObject
from .base import Rule, DerivationFailed, RuleNonFatalError


class CoreNoUninterpretable(Rule):
    description = (
        "There should be no uninterpretable values left on the syntactic "
        "object."
    )

    @staticmethod
    def apply(root_so, lexical_array_tail) -> List[RuleNonFatalError]:
        if not root_so:
            # No SyntacticObject built up yet.
            return []

        # Check all features of all nodes in `root_so`.
        uninterpretable_features = []
        this_so: SyntacticObject
        for this_so in root_so.get_descendants(include_self=True):
            for feature in this_so.features.all():
                interp = feature.properties.filter(name__exact="interpretable")
                if len(interp) > 0:
                    if not interp[0].value:
                        # This feature is uninterpretable.
                        uninterpretable_features.append(
                            "Uninterpretable feature {} on {}.".format(
                                feature, this_so
                            )
                        )

        return uninterpretable_features
