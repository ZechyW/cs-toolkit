from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from grammar.models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    SyntacticObject,
    SyntacticObjectValue,
)

admin.site.register(DerivationRequest)


class DerivationStepInline(admin.TabularInline):
    model = DerivationStep
    extra = 0


class DerivationAdmin(admin.ModelAdmin):
    inlines = [DerivationStepInline]


admin.site.register(Derivation, DerivationAdmin)
admin.site.register(DerivationStep)

admin.site.register(SyntacticObject, MPTTModelAdmin)
admin.site.register(SyntacticObjectValue)
