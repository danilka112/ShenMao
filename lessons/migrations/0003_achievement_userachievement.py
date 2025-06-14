# Generated by Django 5.2.3 on 2025-06-10 19:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lessons', '0002_alter_word_chinese_character_alter_word_lesson_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('points', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_earned', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lessons.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_achievements', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'achievement')},
            },
        ),
    ]
