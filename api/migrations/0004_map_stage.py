# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-11-01 14:31
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_auto_20171026_0232'),
    ]

    operations = [
        migrations.AddField(
            model_name='map',
            name='stage',
            field=models.IntegerField(blank=True, default=None, null=True, unique=True),
        ),
    ]
