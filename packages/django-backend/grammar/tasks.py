"""
Dramatiq actors for processing derivations.
"""
import logging
import time

import dramatiq
from dramatiq import group
from dramatiq.brokers.redis import RedisBroker
from dramatiq.results.backends import RedisBackend
from dramatiq.results import Results

from grammar.derive import process_derivation_step
from grammar.models import DerivationStep

logger = logging.getLogger("cs-toolkit-grammar")

# result_backend = RedisBackend()
# broker = RedisBroker()
# broker.add_middleware(Results(backend=result_backend))
# dramatiq.set_broker(broker)


@dramatiq.actor(store_results=True)
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
    next_steps = process_derivation_step(step, derivation_actor)

    # Performance logging
    logger.info(
        "Processed a DerivationStep in {:.3f}s: {} next steps".format(
            time.perf_counter() - start_time, len(next_steps)
        )
    )

    # Continue chain
    for next_step in next_steps:
        derivation_actor.send(str(next_step.id))

    if len(next_steps) == 0:
        check_completion(step_id)


def check_completion(step_id: str):
    """
    When DerivationStep chains reach their conclusion, the last
    DerivationStep is marked complete.  This function then checks whether
    every DerivationStep in the chain is complete (i.e., it and all its
    descendants are complete)
    :param step_id:
    :return:
    """
    # Check subsequent steps
    step: DerivationStep = DerivationStep.objects.get(id=step_id)
    complete = True
    for next_step in step.next_steps.all():
        if not next_step.complete:
            complete = False

    # If this step is complete, check its predecessor
    if complete:
        step.complete = True
        step.save()

        if step.previous_step:
            check_completion(str(step.previous_step.id))
        else:
            # This is the first step in a Derivation
            for derivation in step.derivations.all():
                derivation.complete = True
                derivation.save()
