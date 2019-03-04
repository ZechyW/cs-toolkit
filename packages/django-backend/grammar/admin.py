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

admin.site.register(DerivationRequest)
admin.site.register(Derivation)


class LexicalArrayInline(admin.TabularInline):
    model = LexicalArrayItem
    extra = 0


class DerivationStepAdmin(AppModelAdmin):
    inlines = [LexicalArrayInline]


admin.site.register(DerivationStep, DerivationStepAdmin)

admin.site.register(SyntacticObject, MPTTModelAdmin)
admin.site.register(SyntacticObjectValue)


class RuleDescriptionAdmin(AppModelAdmin):
    list_display = ["name", "description", "rule_class"]
    readonly_fields = ["id", "rule_class"]
    form = RuleDescriptionForm


admin.site.register(RuleDescription, RuleDescriptionAdmin)
