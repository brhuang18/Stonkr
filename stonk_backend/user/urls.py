from django.urls import path
from user.views import(
    follow_watchlist_view,
    profile_update_view,
    update_password_view,
    account_profile_view,
    follow_watchlist_view,
    unfollow_watchlist_view,
    follow_portfolio_view,
    unfollow_portfolio_view,
    get_followed_view,
    is_following_portfolio_view,
    is_following_watchlist_view
)

from rest_framework.authtoken.views import obtain_auth_token

app_name = 'user'

urlpatterns = [
    path('edit/', profile_update_view),
    path('edit_password/', update_password_view),
    path('view/', account_profile_view),
    path('followWatchlist/',follow_watchlist_view),
    path('unfollowWatchlist/',unfollow_watchlist_view),
    path('followPortfolio/',follow_portfolio_view),
    path('unfollowPortfolio/',unfollow_portfolio_view),
    path('getFollowed/', get_followed_view),
    path('isFollowingPortfolio/', is_following_portfolio_view),
    path('isFollowingWatchlist/', is_following_watchlist_view)
]