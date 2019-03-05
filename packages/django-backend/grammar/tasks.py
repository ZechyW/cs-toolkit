"""
Dramatiq actors for processing derivations.
"""
import logging
import uuid

import dramatiq

from .derive import merge
from .models import DerivationStep, LexicalArrayItem

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
    step: DerivationStep = DerivationStep.objects.get(id=step_id)

    # Have we already processed this step?
    if step.processed:
        # Our workers may have died halfway and processed this step but not
        # the next one -- Keep processing through the chain just in case.
        logger.info(
            "Re-processing previous DerivationStep: {}".format(step_id)
        )
        if step.next_step:
            process_derivation_step.send(step.next_step.id.hex)

        return

    # Is the derivation over?
    if len(step.lexical_array_tail) == 0:
        for derivation in step.derivations.all():
            derivation.ended = True
            derivation.save()

        step.processed = True
        step.save()
        return

    # Get the next step.
    root_so, lexical_array_tail = merge(
        root_so=step.root_so,
        lexical_array_tail=step.lexical_array_tail,
        rules=step.rules.all(),
    )

    next_step = DerivationStep.objects.create(root_so=root_so)
    for [idx, lexical_item] in enumerate(lexical_array_tail):
        LexicalArrayItem.objects.create(
            derivation_step=next_step, lexical_item=lexical_item, order=idx
        )
    for derivation in step.derivations.all():
        next_step.derivations.add(derivation)

    # Clean up this one.
    step.processed = True
    step.next_step = next_step
    step.save()

    # Go!
    process_derivation_step.send(next_step.id.hex)
