# Generated by Django 2.1.5 on 2019-01-29 16:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("lexicon", "0001_initial")]

    operations = [
        migrations.RemoveField(model_name="lexicalitem", name="feature_set"),
        migrations.AddField(
            model_name="lexicalitem",
            name="features",
            field=models.ManyToManyField(to="lexicon.Feature"),
        ),
    ]
