# Generated by Django 3.2.7 on 2021-10-05 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0004_stock_stock_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='stock_name',
            field=models.TextField(blank=True, null=True),
        ),
    ]