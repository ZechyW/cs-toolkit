"""
Definitions for syntactic generation operations.

Generators should inherit from the base `Generator` class and provide an
implementation of the `.generate()` method.
"""
from .externalmerge import ExternalMerge
from .internalmerge import InternalMerge
