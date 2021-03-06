# Generated by Django 3.2.7 on 2021-10-04 06:02

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0001_initial'),
        ('trade', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trade',
            old_name='Brokerage_fee',
            new_name='brokerage_fee',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='Order_Price',
            new_name='order_price',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='Order_type',
            new_name='order_type',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='Quantity',
            new_name='quantity',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='Stock_id',
            new_name='stock_id',
        ),
        migrations.RenameField(
            model_name='trade',
            old_name='Trade_date',
            new_name='trade_date',
        ),
        migrations.AddField(
            model_name='trade',
            name='portfolio_id',
            field=models.ForeignKey(default=10000000000, on_delete=django.db.models.deletion.CASCADE, to='portfolio.portfolio'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='trade',
            name='quantity_left',
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=16, null=True),
        ),
    ]
