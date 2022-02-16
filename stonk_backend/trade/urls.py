from django.urls import path
from trade.views import(
    create_trade_view,
    delete_trade_view,
    update_trade_view,
    trade_stock_view,
    trade_portfolio_view,
)

app_name = 'trade'

urlpatterns = [
    path('add_trade/', create_trade_view),
    path('delete_trade/', delete_trade_view),
    path('edit_trade/', update_trade_view),
    path('holdings/get_trades/', trade_stock_view),
    path('get_trades/', trade_portfolio_view),
]