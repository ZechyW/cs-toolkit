from django.dispatch import receiver
from django.db.models.signals import m2m_changed

from .models import NotifyModel


@receiver(m2m_changed, dispatch_uid="notify_m2m")
def notify_m2m(instance=None, action="", reverse=None, **kwargs):
    """
    Emit notifications on the `notify` channel layer group when ManyToMany
    fields change on tracked models.

    N.B.: Will only track changes made to the instance containing the
    ManyToMany field, and not changes made via the reverse relation (i.e.,
    `reverse=False`)
    """

    # Should we handle this?
    if action != "post_add" and action != "post_remove":
        return
    if NotifyModel not in instance.__class__.__bases__:
        return
    if reverse:
        return

    # Yes.
    instance.notify_changes()
