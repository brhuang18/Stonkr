from django.urls import path
from screener.views import(
    get_all_view,
    get_view,
)
app_name = 'screener'

urlpatterns = [
    path('getAll/', get_all_view),
    path('get/', get_view),
]