# Generated by Django 3.2.7 on 2021-10-27 01:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('watchlist', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='watchlist_data',
            old_name='stock_id',
            new_name='stock',
        ),
        migrations.RenameField(
            model_name='watchlist_data',
            old_name='watchlist_id',
            new_name='watchlist',
        ),
    ]