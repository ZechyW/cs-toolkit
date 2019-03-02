class Rule:
    """
    Base template for a syntactic rule.
    """

    # Rule names should be unique.
    name = ""
    description = ""

    def apply(self, syntactic_object, lexical_array_tail):
        """
        Given the currently built-up syntactic object and the remainder of
        the lexical array for some DerivationStep, checks whether the
        derivation should continue.
        :return:
        """
        pass


class DerivationFailed(Exception):
    """
    Raised by Rules to halt the derivation.
    """

    def __init__(self, message):
        self.message = message

    def __str__(self):
        return "Derivation failed to converge: {}".format(self.message)
