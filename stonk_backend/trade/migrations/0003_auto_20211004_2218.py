# Generated by Django 3.2.7 on 2021-10-04 11:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trade', '0002_auto_20211004_1702'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trade',
            old_name='portfolio_id',
            new_name='portfolio',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='stock_id',
            new_name='stock',
        ),
    ]
