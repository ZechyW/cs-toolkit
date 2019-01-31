"""
Custom template tags
"""

from django import template

from bootstrap_admin.templatetags.bootstrap_admin_template_tags import (
    render_menu_app_list,
)

from app.admin import model_order

register = template.Library()


@register.inclusion_tag(
    "bootstrap_admin/sidebar_menu.html", takes_context=True
)
def render_menu_app_list_ordered(context):
    """
    Customised version of `render_menu_app_list` from
    `bootstrap_admin_template_tags` that uses our custom model ordering
    """
    new_context = render_menu_app_list(context)
    for app in new_context["app_list"]:
        app["models"].sort(key=lambda m: model_order[m["name"]])
    return new_context
