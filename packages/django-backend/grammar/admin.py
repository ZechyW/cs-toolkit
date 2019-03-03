from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from grammar.models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    SyntacticObject,
    SyntacticObjectValue,
    RuleDescription,
    LexicalArrayItem,
)

admin.site.register(DerivationRequest)
admin.site.register(Derivation)


class LexicalArrayInline(admin.TabularInline):
    model = LexicalArrayItem
    extra = 0


class DerivationStepAdmin(admin.ModelAdmin):
    inlines = [LexicalArrayInline]


admin.site.register(DerivationStep, DerivationStepAdmin)

admin.site.register(SyntacticObject, MPTTModelAdmin)
admin.site.register(SyntacticObjectValue)

admin.site.register(RuleDescription)
