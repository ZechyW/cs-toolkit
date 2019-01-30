from django.contrib import admin

from lexicon.forms import FeatureForm
from .models import LexicalItem, Feature, FeatureProperty


# Register your models here.


class LexicalItemAdmin(admin.ModelAdmin):
    list_display = ["text", "language", "features_string"]
    filter_horizontal = ["features"]


admin.site.register(LexicalItem, LexicalItemAdmin)


class FeatureAdmin(admin.ModelAdmin):
    list_display = ["__str__", "description"]
    filter_horizontal = ["properties"]
    form = FeatureForm


admin.site.register(Feature, FeatureAdmin)


class FeaturePropertyAdmin(admin.ModelAdmin):
    list_display = ["__str__", "description"]


admin.site.register(FeatureProperty, FeaturePropertyAdmin)
