# Generated by Django 2.1.5 on 2019-01-29 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("lexicon", "0007_feature_name")]

    operations = [
        migrations.AddField(
            model_name="feature",
            name="description",
            field=models.TextField(default=""),
            preserve_default=False,
        )
    ]
