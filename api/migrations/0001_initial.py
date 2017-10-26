# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-15 16:58
from __future__ import unicode_literals

import datetime
from django.conf import settings
import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion
from django.utils.timezone import utc
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0008_alter_user_username_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('first_name', models.CharField(blank=True, max_length=30, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=30, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('username', models.CharField(max_length=50)),
                ('password', models.CharField(max_length=100)),
                ('gender', models.IntegerField(default=0)),
                ('is_admin', models.BooleanField(default=False)),
                ('expiration', models.DateField(blank=True, default=None, null=True)),
                ('join_date', models.DateField(default=datetime.datetime(2017, 10, 15, 16, 58, 2, 391744, tzinfo=utc))),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'abstract': False,
                'verbose_name_plural': 'users',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Map',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=30)),
                ('height', models.IntegerField()),
                ('width', models.IntegerField()),
                ('n_max_hand_boxes', models.IntegerField()),
                ('n_blockly', models.IntegerField()),
                ('instr_set', models.TextField()),
                ('init_ground_colors', models.TextField()),
                ('init_ground_boxes', models.TextField()),
                ('init_pos_x', models.IntegerField()),
                ('init_pos_y', models.IntegerField()),
                ('init_hand_boxes', models.TextField()),
                ('final_ground_colors', models.TextField(blank=True, default=None, null=True)),
                ('final_ground_boxes', models.TextField(blank=True, default=None, null=True)),
                ('final_pos_x', models.IntegerField(blank=True, default=None, null=True)),
                ('final_pos_y', models.IntegerField(blank=True, default=None, null=True)),
                ('final_hand_boxes', models.TextField(blank=True, default=None, null=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
