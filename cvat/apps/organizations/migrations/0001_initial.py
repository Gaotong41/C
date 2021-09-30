# Generated by Django 3.1.13 on 2021-09-29 12:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(max_length=16, unique=True)),
                ('name', models.CharField(blank=True, max_length=64)),
                ('description', models.TextField(blank=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('company', models.CharField(blank=True, max_length=64)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('location', models.CharField(blank=True, max_length=256)),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'default_permissions': (),
            },
        ),
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_active', models.BooleanField(default=False)),
                ('joined_date', models.DateTimeField(null=True)),
                ('role', models.CharField(choices=[('W', 'Worker'), ('S', 'Supervisor'), ('M', 'Maintainer')], max_length=1)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='members', to='organizations.organization')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'default_permissions': (),
                'unique_together': {('user', 'organization')},
            },
        ),
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('key', models.CharField(max_length=64, primary_key=True, serialize=False)),
                ('accepted', models.BooleanField(default=False)),
                ('created_date', models.DateTimeField(null=True)),
                ('membership', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='organizations.membership')),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'default_permissions': (),
            },
        ),
    ]
