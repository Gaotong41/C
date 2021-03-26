# Generated by Django 3.1.7 on 2021-03-26 16:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('engine', '0038_manifest'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingProject',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('host', models.CharField(max_length=256)),
                ('username', models.CharField(max_length=256)),
                ('password', models.CharField(max_length=256)),
                ('training_id', models.CharField(max_length=64)),
                ('enabled', models.BooleanField(null=True)),
            ],
        ),
        migrations.AddField(
            model_name='project',
            name='project_class',
            field=models.CharField(blank=True, choices=[('OD', 'Object Detection')], max_length=2, null=True),
        ),
        migrations.CreateModel(
            name='TrainingProjectLabel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('training_label_id', models.CharField(max_length=64)),
                ('cvat_label', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='training_project_label', to='engine.label')),
            ],
        ),
        migrations.CreateModel(
            name='TrainingProjectImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('idx', models.PositiveIntegerField()),
                ('training_image_id', models.CharField(max_length=64)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='engine.task')),
            ],
        ),
        migrations.AddField(
            model_name='project',
            name='training_project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='engine.trainingproject'),
        ),
    ]
