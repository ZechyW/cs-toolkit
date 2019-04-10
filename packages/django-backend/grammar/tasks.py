"""
Dramatiq actors for processing derivations.
"""
import logging
import time

import dramatiq

from grammar.derive import process_derivation_step
from grammar.models import DerivationStep

logger = logging.getLogger("cs-toolkit-grammar")


@dramatiq.actor
def derivation_actor(step_id: str):
    """
    Main task for processing DerivationSteps.
    Wraps the main processing algorithm in `.derive`.
    Arguments must be serializable, so we need to send the string
    representation of the DerivationStep's UUID rather than the raw
    DerivationStep itself.
    :param step_id:
    :return:
    """
    start_time = time.perf_counter()

    try:
        step: DerivationStep = DerivationStep.objects.get(id=step_id)
    except DerivationStep.DoesNotExist:
        logger.warning("Could not find DerivationStep: {}".format(step_id))
        return

    # Process the DerivationStep and continue the chain.
    next_steps = process_derivation_step(step)

    # Performance logging
    logger.debug(
        "Processed a DerivationStep in {:.3f}s: {} next steps".format(
            time.perf_counter() - start_time, len(next_steps)
        )
    )

    # Continue chain
    for next_step in next_steps:
        derivation_actor.send(str(next_step.id))
