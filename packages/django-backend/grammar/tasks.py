"""
Dramatiq actors for processing derivations.
"""
import logging
import uuid

import dramatiq

from grammar.derive import process_derivation_step
from grammar.models import DerivationStep

logger = logging.getLogger("cs-toolkit")


@dramatiq.actor
def derivation_actor(step_id_hex: str):
    """
    Main task for processing DerivationSteps.
    Wraps the main processing algorithm in `.derive`.
    Arguments must be serializable, so we need to send the hex
    representation of the DerivationStep's UUID rather than the raw
    DerivationStep itself.
    :param step_id_hex:
    :return:
    """
    # Retrieve the DerivationStep.
    step_id = uuid.UUID(step_id_hex)

    try:
        step: DerivationStep = DerivationStep.objects.get(id=step_id)
    except DerivationStep.DoesNotExist:
        logger.warning("Could not find DerivationStep: {}".format(step_id))
        return

    # Process the DerivationStep and continue the chain.
    next_steps = process_derivation_step(step)
    for next_step in next_steps:
        derivation_actor.send(next_step.id.hex)
