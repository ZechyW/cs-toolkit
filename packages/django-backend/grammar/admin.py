from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from app.admin import AppModelAdmin
from grammar.forms import RuleDescriptionForm
from grammar.models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    LexicalArrayItem,
    RuleDescription,
    SyntacticObject,
    SyntacticObjectValue,
)


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Derivations
class DerivationRequestAdmin(AppModelAdmin):
    list_display = ["__str__", "created_by", "creation_time"]
    readonly_fields = ["id", "created_by", "creation_time"]


admin.site.register(DerivationRequest, DerivationRequestAdmin)
admin.site.register(Derivation)


class LexicalArrayInline(admin.TabularInline):
    model = LexicalArrayItem
    extra = 0


class DerivationStepAdmin(AppModelAdmin):
    inlines = [LexicalArrayInline]
    readonly_fields = ["id"]
    filter_horizontal = ["rules"]


admin.site.register(DerivationStep, DerivationStepAdmin)

# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Syntactic objects
admin.site.register(SyntacticObject, MPTTModelAdmin)


class SyntacticObjectValueAdmin(AppModelAdmin):
    list_display = ["text", "current_language", "feature_string"]
    filter_horizontal = ["features"]


admin.site.register(SyntacticObjectValue, SyntacticObjectValueAdmin)


# -'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,.-'~'-.,__,
# Rules
class RuleDescriptionAdmin(AppModelAdmin):
    list_display = ["name", "description", "rule_class"]
    readonly_fields = ["id", "rule_class"]
    form = RuleDescriptionForm


admin.site.register(RuleDescription, RuleDescriptionAdmin)
