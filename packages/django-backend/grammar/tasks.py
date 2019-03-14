"""
Dramatiq actors for processing derivations.
"""
import logging
import uuid

import dramatiq
from django.utils import timezone

from .derive import merge
from .models import Derivation, DerivationStep, LexicalArrayItem

logger = logging.getLogger("cs-toolkit")


@dramatiq.actor
def process_derivation_step(step_id_hex: str):
    """
    Idempotent function to process the given DerivationStep and generate the
    next one in the derivation.
    :param step_id_hex:
    :return:
    """
    # Retrieve DerivationStep
    step_id = uuid.UUID(step_id_hex)

    try:
        step: DerivationStep = DerivationStep.objects.get(id=step_id)
    except DerivationStep.DoesNotExist:
        logger.warning("Could not find DerivationStep: {}".format(step_id))
        return

    # This function will be called for all matching DerivationSteps whenever
    # a DerivationRequest is made; if we have already processed the
    # DerivationStep, we can short-circuit here.
    if step.status == DerivationStep.STATUS_CONVERGED:
        # Our workers may have died halfway and processed this step but not
        # the next one(s) -- Keep processing through the chain just in case.
        logger.info("Re-processing DerivationStep: {}".format(step_id))
        next_steps = step.next_steps.all()
        for next_step in next_steps:
            process_derivation_step.send(next_step.id.hex)

        # If we are the last in the chain, mark completion
        if not next_steps:
            mark_derivation_chain_converged(step)
        return

    if step.status == DerivationStep.STATUS_CRASHED:
        # Whoo boy
        mark_derivation_chain_crashed(step)
        return

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 1: Rule checking

    # To be implemented.

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 2: Generation

    # Get the next step(s).  The generation operations may return False if
    # they have no more steps to generate.
    next_steps = []

    next_step_params = merge(
        root_so=step.root_so,
        lexical_array_tail=step.lexical_array_tail,
        rules=step.rules.all(),
    )

    if next_step_params:
        root_so, lexical_array_tail = next_step_params
        next_step = DerivationStep.objects.create(root_so=root_so)
        for [idx, lexical_item] in enumerate(lexical_array_tail):
            LexicalArrayItem.objects.create(
                derivation_step=next_step, lexical_item=lexical_item, order=idx
            )
        for derivation in step.derivations.all():
            next_step.derivations.add(derivation)

        # Link the next step(s) to this one
        next_step.previous_step = step
        next_step.save()
        next_steps.append(next_step)

    # Clean up this step
    step.status = DerivationStep.STATUS_CONVERGED
    step.save()

    # Go!
    for next_step in next_steps:
        process_derivation_step.send(next_step.id.hex)

    # This might be the end of this derivation chain.
    if not next_steps:
        mark_derivation_chain_converged(step)


def mark_derivation_chain_converged(step: DerivationStep):
    """
    Given a DerivationStep, mark all its related Derivations and
    DerivationRequests as complete.
    :return:
    """
    for derivation in step.derivations.all():
        derivation.converged_steps.add(step)

        for derivation_request in derivation.derivation_requests.all():
            derivation_request.last_completion_time = timezone.now()
            derivation_request.save()


def mark_derivation_chain_crashed(step: DerivationStep):
    """
    Given a DerivationStep, mark all its related Derivations and
    DerivationRequests as having crashed.
    :return:
    """
    for derivation in step.derivations.all():
        derivation.crashed_steps.add(step)

        for derivation_request in derivation.derivation_requests.all():
            derivation_request.last_completion_time = timezone.now()
            derivation_request.save()
