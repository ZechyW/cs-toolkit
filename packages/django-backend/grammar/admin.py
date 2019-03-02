from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from grammar.models import (
    Derivation,
    DerivationRequest,
    DerivationStep,
    SyntacticObject,
    SyntacticObjectValue,
    RuleDescription,
)

admin.site.register(DerivationRequest)
admin.site.register(Derivation)
admin.site.register(DerivationStep)

admin.site.register(SyntacticObject, MPTTModelAdmin)
admin.site.register(SyntacticObjectValue)

admin.site.register(RuleDescription)
