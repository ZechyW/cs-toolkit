from grammar.models import SyntacticObject


def assign_case(so_1: SyntacticObject, so_2: SyntacticObject) -> None:
    """
    Checks either SO for an active [Case] feature coupled with a [uPhi]
    feature.
    If one is found, searches down the other SO for a [uCase] feature coupled
    with a [Phi] feature bundle.  If one is found, deactivates the [Case],
    [uCase], and [uPhi] features.

    Alternatively, checks either SO for an active [uCase] feature coupled
    with a [Phi] feature bundle.
    If one is found, searches down the other SO for a [Case] feature coupled
    with a [uPhi, EPP] feature.  If one is found, deactivates the [Case],
    [uCase], and [uPhi, EPP] features.

    :param so_1:
    :param so_2:
    :return:
    """
    pass
