# Generated by Django 3.1.1 on 2020-12-06 17:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('engine', '0039_auto_20201126_1727'),
    ]

    operations = [
        migrations.AddField(
            model_name='clowderfile',
            name='srcdatasetid',
            field=models.CharField(default='5fb6d623e4b05bd995d2290b', max_length=1024),
            preserve_default=False,
        ),
    ]
