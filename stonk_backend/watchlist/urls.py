from django.urls import path
from watchlist.views import (
    create_view,
    get_view,
    get_all_view,
    edit_view,
    delete_view,
    add_stock_view,
    remove_stock_view,
    metrics_view,
    movements_view
)

app_name = 'watchlist'

urlpatterns = [
    path('create/', create_view),
    path('get/', get_view),
    path('getAll/', get_all_view),
    path('edit/', edit_view),
    path('delete/', delete_view),
    path('addStock/', add_stock_view),
    path('removeStock/', remove_stock_view),
    path('metrics/', metrics_view),
    path('movements/',movements_view)
]