# Generated by Django 3.2.15 on 2022-09-12 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('webhooks', '0004_auto_20220912_0809'),
    ]

    operations = [
        migrations.RenameField(
            model_name='webhookdelivery',
            old_name='delivered_at',
            new_name='created_at',
        ),
        migrations.AddField(
            model_name='webhookdelivery',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
