"""
Definitions for rules and other syntactic constraints on the derivation.

Rules should inherit from the base `Rule` class and provide an
implementation of the `.apply()` method.
"""
from .core import CoreNoUninterpretable

from .debug import DebugAlwaysFail, DebugAlwaysPass
