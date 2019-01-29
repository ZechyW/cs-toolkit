from django.contrib import admin

from lexicon.forms import FeatureForm
from .models import LexicalItem, FeatureSet, Feature, FeatureProperty


# Register your models here.


class LexicalItemAdmin(admin.ModelAdmin):
    list_display = ["text", "language_code", "feature_set"]


admin.site.register(LexicalItem, LexicalItemAdmin)
admin.site.register(FeatureSet)


class FeatureAdmin(admin.ModelAdmin):
    list_display = ["__str__", "description"]
    filter_horizontal = ["properties"]
    form = FeatureForm


admin.site.register(Feature, FeatureAdmin)
admin.site.register(FeatureProperty)
