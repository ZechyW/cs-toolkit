# Generated by Django 2.1.7 on 2019-04-01 06:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("grammar", "0004_auto_20190401_0633")]

    operations = [
        migrations.AlterField(
            model_name="derivation",
            name="first_step",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="first_step_derivations",
                to="grammar.DerivationStep",
            ),
        )
    ]
