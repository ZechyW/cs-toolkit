"""
Grammar-related utility functions.
"""
from typing import List

from django.db.models import Count

from lexicon.models import LexicalItem
from .models import (
    Derivation,
    DerivationStep,
    GeneratorDescription,
    LexicalArrayItem,
    RuleDescription,
)


def get_derivation_by_lexical_array(
    lexical_array: List[LexicalItem]
) -> Derivation:
    """
    Creates or retrieves the Derivation associated with a unique array of
    LexicalItems.
    :param lexical_array:
    :return:
    """
    # We have to add `.filter()` once per lexical item/order pair,
    # because of the way ManyToMany filtering works.
    # We also add a count annotation to make sure we don't pick up
    # any Derivations that start with the same lexical items,
    # but whose lexical arrays continue after.
    existing = Derivation.objects.annotate(
        count=Count("first_step__lexical_array_items")
    ).filter(count=len(lexical_array))
    for [idx, lexical_item] in enumerate(lexical_array):
        existing = existing.filter(
            first_step__lexical_array_items__lexical_item=lexical_item,
            first_step__lexical_array_items__order=idx,
        )

    if len(existing) > 0:
        return existing.get()
    else:
        return create_derivation(lexical_array)


def create_derivation(lexical_array: List[LexicalItem]) -> Derivation:
    """
    Given an array of LexicalItems, create a corresponding Derivation
    :param lexical_array:
    :return:
    """
    # Start with a DerivationStep
    first_step = DerivationStep.objects.create()
    for [idx, lexical_item] in enumerate(lexical_array):
        LexicalArrayItem.objects.create(
            derivation_step=first_step, lexical_item=lexical_item, order=idx
        )

    # For now, add all rules and generators
    first_step.rules.set(RuleDescription.objects.all())
    first_step.generators.set(GeneratorDescription.objects.all())

    # External merge only variant
    # first_step.generators.add(
    #     GeneratorDescription.objects.get(name="external-merge")
    # )

    # Create and return a Derivation
    derivation = Derivation.objects.create(first_step=first_step)
    first_step.derivations.add(derivation)
    return derivation
