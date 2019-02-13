from django.contrib import admin

from app.admin import AppModelAdmin
from .models import LexicalItem, Feature, FeatureProperty
from .forms import LexicalItemForm, FeatureForm, FeaturePropertyForm


# Register your models here.


class LexicalItemAdmin(AppModelAdmin):
    list_display = ["text", "language", "features_string"]
    filter_horizontal = ["features"]
    form = LexicalItemForm


admin.site.register(LexicalItem, LexicalItemAdmin)


class FeatureAdmin(AppModelAdmin):
    list_display = ["__str__", "description"]
    filter_horizontal = ["properties"]
    form = FeatureForm


admin.site.register(Feature, FeatureAdmin)


class FeaturePropertyAdmin(AppModelAdmin):
    list_display = ["__str__", "type", "description"]
    form = FeaturePropertyForm


admin.site.register(FeatureProperty, FeaturePropertyAdmin)
