# Generated by Django 4.2.6 on 2024-04-10 06:58

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        (
            "engine",
            "0086_rename_ai_audio_annotation_task_id_job_ai_audio_annotation_background_task_id",
        ),
    ]

    operations = [
        migrations.AlterField(
            model_name="job",
            name="ai_audio_annotation_background_task_id",
            field=models.CharField(default="", max_length=100, null=True),
        ),
    ]
