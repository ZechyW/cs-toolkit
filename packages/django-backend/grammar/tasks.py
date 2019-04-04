"""
Dramatiq actors for processing derivations.
"""
import logging
import uuid
from typing import List

import dramatiq
from django.utils import timezone

import grammar.generators
import grammar.rules
from grammar.generators.base import NextStepDef
from grammar.models import DerivationStep, LexicalArrayItem
from grammar.rules.base import DerivationFailed

logger = logging.getLogger("cs-toolkit-workers")


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
    if step.status == DerivationStep.STATUS_OKAY:
        # Our workers may have died halfway and processed this step but not
        # the next one(s) -- Keep processing through the chain just in case.
        logger.info("Re-processing DerivationStep: {}".format(step_id))
        next_steps = step.next_steps.all()
        for next_step in next_steps:
            process_derivation_step.send(next_step.id.hex)
        return

    if step.status == DerivationStep.STATUS_CONVERGED:
        # If we are the last in the chain, mark completion
        mark_derivation_chain_converged(step, reprocessing=True)
        return

    if step.status == DerivationStep.STATUS_CRASHED:
        # Whoo boy
        mark_derivation_chain_crashed(step, reprocessing=True)
        return

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 1: Generation

    # Get the definitions for the next step(s) in the chain.  The generation
    # operations may return empty lists if they have no more steps to
    # generate.

    next_step_defs: List[NextStepDef] = []

    for generator in step.generators.all():
        # Get next step definitions from each Generator.
        handler = getattr(grammar.generators, generator.generator_class)
        generator_defs: List[NextStepDef] = handler.generate(
            step.root_so, step.lexical_array_tail
        )
        next_step_defs = next_step_defs + generator_defs

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 2: Rule checking

    # Apply every active Rule to the current DerivationStep.  It should not
    # matter what order the Rules are applied in; they are not allowed to
    # mutate their input.

    # If a Rule determines that a Derivation can *never* converge, it will
    # raise a DerivationFailed exception.
    # E.g.:
    # - We may be at the end of the Derivation (`next_step_defs` is empty)
    #   with some Rules still failing.
    # - There may be a fundamental incompatibility within a single
    #   DerivationStep, e.g., between two Merged items, that will *never* be
    #   resolved even if there are more DerivationSteps in the chain.

    try:
        is_last_step = len(next_step_defs) > 0
        for rule in step.rules.all():
            handler = getattr(grammar.rules, rule.rule_class())
            handler.apply(step.root_so, step.lexical_array_tail, is_last_step)
    except DerivationFailed as error:
        # This Derivation chain has reached a bad end.
        step.status = DerivationStep.STATUS_CRASHED
        step.crash_reason = str(error)
        step.save()
        mark_derivation_chain_crashed(step)
        logger.info("DerivationStep {} crashed: {}".format(step_id, error))
        return

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 3: Cleanup

    # If our Generators provided at least one next step and our Rules didn't
    # crash the Derivation, the show goes on.
    # Alternatively, if the Generators all declared completion and our Rules
    # didn't complain, the Derivation has converged.

    # Create actual DerivationSteps for each of our next steps.
    next_steps: List[DerivationStep] = []
    for next_step_def in next_step_defs:
        next_step = DerivationStep.objects.create(
            root_so=next_step_def.root_so
        )

        # Lexical array tail
        for [idx, lexical_item] in enumerate(next_step_def.lexical_array_tail):
            LexicalArrayItem.objects.create(
                derivation_step=next_step, lexical_item=lexical_item, order=idx
            )

        # Corresponding derivations
        for derivation in step.derivations.all():
            next_step.derivations.add(derivation)

        # Inherit rules and generators
        for rule in step.rules.all():
            next_step.rules.add(rule)
        for generator in step.generators.all():
            next_step.generators.add(generator)

        # Link to this step
        next_step.previous_step = step
        next_step.save()

        next_steps.append(next_step)

    # Is the Derivation continuing?
    if next_steps:
        step.status = DerivationStep.STATUS_OKAY
        step.save()

        # Go!
        for next_step in next_steps:
            process_derivation_step.send(next_step.id.hex)
    else:
        # This Derivation chain has reached a good end.
        step.status = DerivationStep.STATUS_CONVERGED
        step.save()
        mark_derivation_chain_converged(step)


def mark_derivation_chain_converged(
    step: DerivationStep, reprocessing: bool = False
):
    """
    Given a DerivationStep, mark all its related Derivations and
    DerivationRequests as complete.
    :return:
    """
    for derivation in step.derivations.all():
        derivation.converged_steps.add(step)

        # Also update the last chain completion time if this is a new result.
        if not reprocessing:
            for derivation_request in derivation.derivation_requests.all():
                derivation_request.last_completion_time = timezone.now()
                derivation_request.save()


def mark_derivation_chain_crashed(
    step: DerivationStep, reprocessing: bool = False
):
    """
    Given a DerivationStep, mark all its related Derivations and
    DerivationRequests as having crashed.
    :return:
    """
    for derivation in step.derivations.all():
        derivation.crashed_steps.add(step)

        # Also update the last chain completion time if this is a new result.
        if not reprocessing:
            for derivation_request in derivation.derivation_requests.all():
                derivation_request.last_completion_time = timezone.now()
                derivation_request.save()
