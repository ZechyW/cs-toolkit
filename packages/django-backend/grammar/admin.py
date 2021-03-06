from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from app.admin import AppModelAdmin
from .forms import GeneratorDescriptionForm, RuleDescriptionForm
from .models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    GeneratorDescription,
    LexicalArrayItem,
    RuleDescription,
    SyntacticObject,
)


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Derivations
@admin.register(DerivationRequest)
class DerivationRequestAdmin(AppModelAdmin):
    list_display = ["__str__", "created_by", "creation_time"]
    readonly_fields = [
        "id",
        "created_by",
        "creation_time",
        "last_completion_time",
    ]


@admin.register(Derivation)
class DerivationAdmin(AppModelAdmin):
    readonly_fields = ["id"]


class LexicalArrayInline(admin.TabularInline):
    model = LexicalArrayItem
    extra = 0


@admin.register(DerivationStep)
class DerivationStepAdmin(AppModelAdmin):
    list_display = ["root_so_text", "lexical_array_friendly"]
    inlines = [LexicalArrayInline]
    readonly_fields = ["id", "processed_time", "complete"]
    filter_horizontal = ["rules"]


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Syntactic objects
@admin.register(SyntacticObject)
class SyntacticObjectAdmin(MPTTModelAdmin):
    list_display = [
        "text",
        "current_language",
        "feature_string",
        "deleted_feature_string",
    ]
    filter_horizontal = ["features", "deleted_features"]


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Rules
@admin.register(RuleDescription)
class RuleDescriptionAdmin(AppModelAdmin):
    list_display = ["name", "description", "rule_class"]
    readonly_fields = ["id", "rule_class"]
    form = RuleDescriptionForm


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Generators
@admin.register(GeneratorDescription)
class GeneratorDescriptionAdmin(AppModelAdmin):
    list_display = ["name", "description", "generator_class"]
    readonly_fields = ["id", "generator_class"]
    form = GeneratorDescriptionForm
