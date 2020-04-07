"""
Custom template tags:
Brings back the ordered sidebar_menu that was removed from the bootstrap_admin library
"""
from functools import reduce

from bootstrap_admin.templatetags.bootstrap_admin_template_tags import (
    sidebar_menu_setting,
)
from django import VERSION as DJANGO_VERSION, template
from django.apps import apps
from django.conf import settings
from django.contrib.admin import site
from django.core.exceptions import ImproperlyConfigured
from django.urls import NoReverseMatch, reverse
from django.utils import six
from django.utils.text import capfirst

from app.admin import model_order

register = template.Library()


def render_menu_app_list(context):
    """
    TODO: Copied from django-admin-bootstrap 0.4.2 until we can fix it more
    permanently
    https://github.com/douglasmiranda/django-admin-bootstrap/commit
    /1eeade05f44b7d2bb59975103114c049406df0c4
    :param context:
    :return:
    """
    show_global_menu = sidebar_menu_setting()
    if not show_global_menu:
        return {"app_list": ""}

    if DJANGO_VERSION < (1, 8):
        dependencie = "django.core.context_processors.request"
        processors = settings.TEMPLATE_CONTEXT_PROCESSORS
        dependency_str = "settings.TEMPLATE_CONTEXT_PROCESSORS"
    else:
        dependencie = "django.template.context_processors.request"
        implemented_engines = getattr(
            settings,
            "BOOTSTRAP_ADMIN_ENGINES",
            ["django.template.backends.django.DjangoTemplates"],
        )
        dependency_str = (
            "the 'context_processors' 'OPTION' of one of the "
            + "following engines: %s" % implemented_engines
        )
        filtered_engines = [
            engine
            for engine in settings.TEMPLATES
            if engine["BACKEND"] in implemented_engines
        ]
        if len(filtered_engines) == 0:
            raise ImproperlyConfigured(
                "bootstrap_admin: No compatible template engine found"
                + "bootstrap_admin requires one of the following engines: %s"
                % implemented_engines
            )
        processors = reduce(
            lambda x, y: x.extend(y),
            [
                engine.get("OPTIONS", {}).get("context_processors", [])
                for engine in filtered_engines
            ],
        )

    if dependencie not in processors:
        raise ImproperlyConfigured(
            "bootstrap_admin: in order to use the 'sidebar menu' requires"
            + " the '%s' to be added to %s" % (dependencie, dependency_str)
        )

    # Code adapted from django.contrib.admin.AdminSite
    app_dict = {}
    user = context.get("user")
    for model, model_admin in site._registry.items():
        app_label = model._meta.app_label
        has_module_perms = user.has_module_perms(app_label)

        if has_module_perms:
            perms = model_admin.get_model_perms(context.get("request"))

            # Check whether user has any perm for this module.
            # If so, add the module to the model_list.
            if True in perms.values():
                info = (app_label, model._meta.model_name)
                model_dict = {
                    "name": capfirst(model._meta.verbose_name_plural),
                    "object_name": model._meta.object_name,
                    "perms": perms,
                }
                if perms.get("change", False):
                    try:
                        model_dict["admin_url"] = reverse(
                            "admin:%s_%s_changelist" % info, current_app=site.name
                        )
                    except NoReverseMatch:
                        pass
                if perms.get("add", False):
                    try:
                        model_dict["add_url"] = reverse(
                            "admin:%s_%s_add" % info, current_app=site.name
                        )
                    except NoReverseMatch:
                        pass
                if app_label in app_dict:
                    app_dict[app_label]["models"].append(model_dict)
                else:
                    app_dict[app_label] = {
                        "name": apps.get_app_config(app_label).verbose_name,
                        "app_label": app_label,
                        "app_url": reverse(
                            "admin:app_list",
                            kwargs={"app_label": app_label},
                            current_app=site.name,
                        ),
                        "has_module_perms": has_module_perms,
                        "models": [model_dict],
                    }

    # Sort the apps alphabetically.
    app_list = list(six.itervalues(app_dict))
    app_list.sort(key=lambda x: x["name"].lower())

    # Sort the models alphabetically within each sapp.
    for app in app_list:
        app["models"].sort(key=lambda x: x["name"])
    return {"app_list": app_list, "current_url": context.get("request").path}


@register.inclusion_tag("admin/sidebar_menu.html", takes_context=True)
def render_menu_app_list_ordered(context):
    """
    Customised version of `render_menu_app_list` from
    `bootstrap_admin_template_tags` that uses our custom model ordering
    """
    new_context = render_menu_app_list(context)
    for app in new_context["app_list"]:
        app["models"].sort(key=lambda m: model_order[m["name"]])
    return new_context
