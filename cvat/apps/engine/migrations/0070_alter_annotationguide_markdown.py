# Generated by Django 3.2.18 on 2023-05-30 00:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('engine', '0069_annotationguide_markdown'),
    ]

    operations = [
        migrations.AlterField(
            model_name='annotationguide',
            name='markdown',
            field=models.TextField(blank=True, default=''),
        ),
    ]
