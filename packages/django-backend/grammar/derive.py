"""
Main functions driving a syntactic derivation.
"""
import logging
from typing import Deque, Optional, Sequence

from django.db.models import Count

import grammar.rules
from grammar.models import (
    DerivationStep,
    LexicalArrayItem,
    RuleDescription,
    SyntacticObject,
    SyntacticObjectValue,
)
from lexicon.models import Feature, LexicalItem

logger = logging.getLogger("cs-toolkit")


def process_derivation_step(step: DerivationStep):
    """
    Idempotent function to process the given DerivationStep and generate the
    next one in the derivation.
    :param step:
    :return:
    """
    # Have we already processed this step?
    if step.processed:
        logger.warning(
            "Tried to process a DerivationStep that has already been "
            "processed: {}".format(step.id)
        )
        return

    # Is the derivation over?
    if len(step.lexical_array_tail) == 0:
        for derivation in step.derivations.all():
            derivation.ended = True
            derivation.save()
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


def merge(
    root_so: Optional[SyntacticObject],
    lexical_array_tail: Deque[LexicalItem],
    rules: Sequence[RuleDescription],
):
    """
    Calculates the next step in a derivation from the given parameters.
    :param root_so:
    :param lexical_array_tail:
    :param rules:
    :return:
    """
    # Pop an item and create a SyntacticObject out of it.
    next_item = lexical_array_tail.popleft()
    next_so_value = get_or_create_so_value(
        text=next_item.text,
        current_language=next_item.language,
        feature_list=next_item.features.all(),
    )
    next_so = SyntacticObject.objects.create(value=next_so_value)

    # Merge next SyntacticObject with the current root SO.
    if root_so is None:
        root_so = next_so
    else:
        # Create a new parent SO, then set it as the root.
        parent_so_value = get_or_create_so_value(
            text=next_so_value.text,
            current_language=next_so_value.current_language,
            feature_list=list(root_so.value.features.all())
            + list(next_so_value.features.all()),
        )
        parent_so = SyntacticObject.objects.create(value=parent_so_value)

        root_so.parent = parent_so
        root_so.save()
        next_so.parent = parent_so
        next_so.save()

        root_so = parent_so

    # Apply every listed Rule
    for rule in rules:
        handler = getattr(grammar.rules, rule.rule_class())
        handler.apply(root_so, lexical_array_tail)

    return [root_so, lexical_array_tail]


def get_or_create_so_value(
    text, current_language, feature_list: Sequence[Feature]
):
    """
    Retrieves a raw SyntacticObjectValue with the given parameters, creating it
    if it doesn't exist.
    :param text: 
    :param current_language:
    :param feature_list:
    :return:
    """

    # We need to annotate the query with a count of the associated features
    # so that we don't pick up SyntacticObjectValues with the given features
    # *and more*.
    existing = SyntacticObjectValue.objects.filter(
        text=text, current_language=current_language
    )
    existing = existing.annotate(count=Count("features")).filter(
        count=len(feature_list)
    )
    for feature in feature_list:
        existing = existing.filter(features=feature)

    if len(existing) > 0:
        return existing.get()

    # Still here? Create a new SyntacticObjectValue
    so_value = SyntacticObjectValue.objects.create(
        text=text, current_language=current_language
    )
    for feature in feature_list:
        so_value.features.add(feature)

    return so_value
