# Generated by Django 3.2.7 on 2021-10-05 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0003_auto_20211004_1813'),
    ]

    operations = [
        migrations.AddField(
            model_name='stock',
            name='stock_name',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
    ]
