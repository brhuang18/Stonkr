from django.urls import path
from search.views import(
    summary_view,
    statistics_view,
    histdata_view,
    get_user_view,
    get_all_users_view,
    search_endpoint_view,
    get_followers_view
)

app_name = 'search'

urlpatterns = [
    path('summary/', summary_view),
    path('statistics/', statistics_view),
    path('histdata/', histdata_view),
    path('user/',get_user_view),
    path('allUsers/',get_all_users_view),
    path('stocks/',search_endpoint_view),
    path('getFollowers/',get_followers_view)
]