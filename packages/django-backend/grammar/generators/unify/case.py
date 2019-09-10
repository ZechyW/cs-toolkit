from grammar.models import SyntacticObject


def assign_case(
    so_1: SyntacticObject, so_2: SyntacticObject, second_pass=False
) -> None:
    """
    Checks either SO for an active [Case] feature coupled with a [uPhi]
    feature.
    If one is found, searches down the other SO for a [uCase] feature coupled
    with a [Phi] feature bundle.  If one is found, deactivates the [Case],
    [uCase], and [uPhi] features.

    Alternatively, checks either SO for an active [uCase] feature coupled
    with a [Phi] feature bundle.
    If one is found, searches direct children of the other SO for a [Case]
    feature coupled with a [uPhi, EPP] feature.  If one is found,
    deactivates the [Case], [uCase], and [uPhi, EPP] features.

    :param so_1:
    :param so_2:
    :param second_pass:
    :return:
    """
    # Explicitly make sure so_1's Phi feature does not have an EPP property.
    so_1_Case = so_1.features.filter(name__exact="Case")
    so_1_uPhi = so_1.features.filter(name__exact="Phi").exclude(
        properties__name="EPP"
    )
    if (
        len(so_1_Case) > 0
        and len(so_1_uPhi) > 0
        and not so_1_Case.get().uninterpretable
        and so_1_uPhi.get().uninterpretable
    ):
        # so_1 is a candidate case assigner.
        for other_so in so_2.get_descendants(include_self=True):
            other_so_uCase = other_so.features.filter(name__exact="Case")
            other_so_Phi = other_so.features.filter(name__exact="Phi")
            if (
                len(other_so_uCase) > 0
                and len(other_so_Phi) > 0
                and other_so_uCase.get().uninterpretable
                and not other_so_Phi.get().uninterpretable
            ):
                # Found a match
                so_1_Case = so_1_Case.get()
                so_1.features.remove(so_1_Case)
                so_1.deleted_features.add(so_1_Case)

                so_1_uPhi = so_1_uPhi.get()
                so_1.features.remove(so_1_uPhi)
                so_1.deleted_features.add(so_1_uPhi)

                other_so_uCase = other_so_uCase.get()
                other_so.features.remove(other_so_uCase)
                other_so.deleted_features.add(other_so_uCase)

                so_1.save()
                other_so.save()

                break

    so_1_uCase = so_1.features.filter(name__exact="Case")
    so_1_Phi = so_1.features.filter(name__exact="Phi")
    if (
        len(so_1_uCase) > 0
        and len(so_1_Phi) > 0
        and so_1_uCase.get().uninterpretable
        and not so_1_Phi.get().uninterpretable
    ):
        # so_1 has uninterpretable Case with interpretable Phi features --
        # Check for a case assigner with [uPhi,EPP] in the other SO
        for other_so in so_2.children.all():
            other_so_Case = other_so.features.filter(name__exact="Case")
            other_so_uPhi = other_so.features.filter(name__exact="Phi").filter(
                properties__name="EPP"
            )
            if (
                len(other_so_Case) > 0
                and len(other_so_uPhi) > 0
                and not other_so_Case.get().uninterpretable
                and other_so_uPhi.get().uninterpretable
            ):
                # Found a match
                so_1_uCase = so_1_uCase.get()
                so_1.features.remove(so_1_uCase)
                so_1.deleted_features.add(so_1_uCase)

                other_so_Case = other_so_Case.get()
                other_so.features.remove(other_so_Case)
                other_so.deleted_features.add(other_so_Case)

                other_so_uPhi = other_so_uPhi.get()
                other_so.features.remove(other_so_uPhi)
                other_so.deleted_features.add(other_so_uPhi)

                so_1.save()
                other_so.save()

                break

    # Second pass failsafe
    if not second_pass:
        assign_case(so_2, so_1, True)
