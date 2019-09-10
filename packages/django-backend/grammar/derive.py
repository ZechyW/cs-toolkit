"""
The algorithm for processing a single DerivationStep.
Imported and run by the Dramatiq task workers.
"""
import dataclasses
import json
import logging
import time
from typing import List

from django.utils import timezone

import grammar.generators
import grammar.rules
from grammar.generators.base import NextStepDef, Generator, GeneratorMetadata
from grammar.models import DerivationStep, LexicalArrayItem
from grammar.rules.base import DerivationFailed, RuleNonFatalError, Rule

logger = logging.getLogger("cs-toolkit-grammar")


def process_derivation_step(
    step: DerivationStep, derivation_actor
) -> List[DerivationStep]:
    """
    Idempotent function to process the given DerivationStep.

    We also receive the Dramatiq actor itself, in case sub-components need
    to dispatch requests directly.  Currently, this is used for
    sub-derivations under ExternalMerge.

    Possible results:
    - This DerivationStep could crash the current derivational chain.
    - This DerivationStep could generate one or more subsequent
      DerivationSteps, continuing the current derivational chain and possibly
      forking new ones.
    - This DerivationStep could cause the current derivational chain to
      converge.

    Return values:
    - A List of the next DerivationSteps to process, if any.

    :param step:
    :param derivation_actor:
    :return:
    """

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 0: Status check

    # If we have seen processed this DerivationStep before, we can
    # short-circuit here instead of re-processing it fully.
    # TODO: We should check to see if the Rules/Generators have changed
    #       since we last processed this DerivationStep -- If so, we should
    #       always do a full re-run.

    # We can manually disable short-circuits for debugging if necessary.
    quick_reprocess = True
    if quick_reprocess:
        if (
            step.status == DerivationStep.STATUS_PROCESSED
            and step.next_steps.count() > 0
        ):
            # Our workers may have died halfway and processed this step but
            # not the next one(s) -- Keep processing through the chain just
            # in case.
            # We also re-run the step if there are no `next_steps`, just to
            # confirm the crash/convergence.
            logger.info("Re-processing DerivationStep: {}".format(step.id))
            return step.next_steps.all()

        if step.status == DerivationStep.STATUS_CONVERGED:
            # If we are the last in a converged chain, mark completion
            mark_derivation_chain_ended(
                step, converged=True, reprocessing=True
            )
            return []

        if step.status == DerivationStep.STATUS_CRASHED:
            # Whoo boy
            mark_derivation_chain_ended(
                step, converged=False, reprocessing=True
            )
            return []

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 1: Rule checking

    # Apply every active Rule to the current DerivationStep.  It should not
    # matter what order the Rules are applied in; they are not allowed to
    # mutate their input.

    # If a Rule determines that a Derivation can *never* converge, it will
    # raise a DerivationFailed exception.
    # E.g., there may be a fundamental incompatibility within a single
    #   DerivationStep (e.g., between two Merged items) that will *never* be
    #   resolved even if there are more DerivationSteps in the chain.

    # If the Derivation can continue (i.e., the Rule passed, or failed
    # non-fatally), the Rule check should return a List of error message
    # strings.  This List will be empty if the Rule passed.

    start_time = time.perf_counter()

    rule_errors: List[RuleNonFatalError] = []

    try:
        for rule in step.rules.all():
            handler: Rule = getattr(grammar.rules, rule.rule_class)
            this_rule_errors = handler.apply(
                step.root_so, step.lexical_array_tail
            )
            rule_errors = rule_errors + this_rule_errors
    except DerivationFailed as error:
        # This Derivation chain has reached a bad end.
        step.status = DerivationStep.STATUS_CRASHED
        step.crash_reason = str(error)
        step.processed_time = timezone.now()
        step.save()
        mark_derivation_chain_ended(step, converged=False)
        logger.info("DerivationStep {} crashed: {}".format(step.id, error))
        return []

    # Save the error messages to the DerivationStep
    step.rule_errors_json = json.dumps(rule_errors)
    step.save()

    logger.debug(
        "Rule checking took {:.3f}s.".format(time.perf_counter() - start_time)
    )

    # Convergence check
    if not len(step.lexical_array_tail) and not len(rule_errors):
        step.status = DerivationStep.STATUS_CONVERGED
        step.processed_time = timezone.now()
        step.save()
        mark_derivation_chain_ended(step, converged=True)
        logger.info("DerivationStep {} converged.".format(step.id))
        return []

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 2: Generation

    # Get the definitions for the next step(s) in the chain.  The generation
    # operations may return empty lists if they have no more steps to
    # generate.
    start_time = time.perf_counter()

    next_step_defs: List[NextStepDef] = []

    step_metadata = None
    if step.generator_metadata_json:
        # Convert metadata: json -> dict -> GeneratorMetadata
        step_metadata = json.loads(step.generator_metadata_json)
        step_metadata = GeneratorMetadata(**step_metadata)

    for generator in step.generators.all():
        # Get next step definitions from each Generator.
        handler: Generator = getattr(
            grammar.generators, generator.generator_class
        )
        generator_defs: List[NextStepDef] = handler.generate(
            derivation_actor,
            step.root_so,
            step.lexical_array_tail,
            step_metadata,
        )
        next_step_defs = next_step_defs + generator_defs

    logger.debug(
        "Generation took {:.3f}s.".format(time.perf_counter() - start_time)
    )

    # Crash check: If we have no next steps generated but still have Rule
    # errors, we have crashed.
    crash_reason = (
        "No more potential steps in the derivation, but some rule checks are "
        "still failing."
    )
    if not len(next_step_defs) and len(rule_errors):
        step.status = DerivationStep.STATUS_CRASHED
        step.crash_reason = crash_reason
        step.processed_time = timezone.now()
        step.save()
        mark_derivation_chain_ended(step, converged=False)
        logger.info(
            "DerivationStep {} crashed: {}".format(step.id, crash_reason)
        )
        return []

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 3: Cleanup

    # If our Generators provided at least one next step and our Rules didn't
    # crash the Derivation, the show goes on.

    # Create actual DerivationSteps for each of our next steps.
    # TODO: Change to get_or_create()-style retrieval
    start_time = time.perf_counter()

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

        # Add metadata from generators
        if next_step_def.metadata is not None:
            next_step.generator_metadata_json = json.dumps(
                dataclasses.asdict(next_step_def.metadata)
            )

        # Link to this step
        next_step.previous_step = step
        next_step.save()

        next_steps.append(next_step)

    logger.debug(
        "Cleanup took {:.3f}s.".format(time.perf_counter() - start_time)
    )

    # -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-
    # Phase 4: Dispatch

    # Return the next DerivationSteps for processing.
    step.status = DerivationStep.STATUS_PROCESSED
    step.processed_time = timezone.now()
    step.save()
    return next_steps


def mark_derivation_chain_ended(
    step: DerivationStep, converged: bool, reprocessing: bool = False
):
    """
    Given a DerivationStep, mark its derivational chain as complete.
    If `converged` is True, the chain is marked as converged for any
    corresponding Derivations / DerivationRequests.
    If `converged` is False, the chain is marked as crashed instead.
    :return:
    """
    for derivation in step.derivations.all():
        if converged:
            derivation.converged_steps.add(step.id)
        else:
            derivation.crashed_steps.add(step.id)

        # Also update the last chain completion time
        for derivation_request in derivation.derivation_requests.all():
            if not reprocessing:
                # A new result: Use the current time
                derivation_request.last_completion_time = timezone.now()
                derivation_request.save()
            elif (
                not derivation_request.last_completion_time
                or step.processed_time
                > derivation_request.last_completion_time
            ):
                # An old result: Use the latest previous step completion time
                derivation_request.last_completion_time = step.processed_time
                derivation_request.save()
