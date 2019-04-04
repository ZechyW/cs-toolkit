"""
Definitions for rules and other syntactic constraints on the derivation.

Rules should inherit from the base `Rule` class and provide an
implementation of the `.apply()` method.

If a rule determines that a Derivation can *never* converge, it should raise
a DerivationFailed exception.

For most rules, this final determination should only be made at the last
step of a Derivation, i.e., with the Lexical Array empty and no further
steps from any available Generator.
"""
from .core import CoreNoUninterpretable

from .debug import DebugAlwaysFail, DebugAlwaysPass
