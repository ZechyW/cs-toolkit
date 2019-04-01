class Rule:
    """
    Base template for a syntactic rule.
    """

    description = ""

    @staticmethod
    def apply(root_so, lexical_array_tail):
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

    def __init__(self, rule_class, message):
        self.rule_class = rule_class
        self.message = message

    def __str__(self):
        return "{}: {}".format(self.rule_class, self.message)
