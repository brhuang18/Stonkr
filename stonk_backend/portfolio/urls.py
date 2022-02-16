from django.urls import path
from portfolio import views

urlpatterns = [
    path('portfolio/', views.PortfolioDetail.as_view()),
    path('portfolio/holdings', views.get_holdings_view),
    path('portfolio/upload_csv', views.CSVUploadView.as_view()),
    path('portfolio/time_series', views.get_portfolio_time_series),
    path('portfolio/groupings', views.get_portfolio_groupings),
    path('portfolio/overview', views.get_portfolio_overview_view),
    path('portfolio/stocks', views.get_portfolio_stocks),
    path('portfolios/', views.get_portfolios),
    path('portfolios/overview', views.get_portfolios_overview_view),
    path('combined_portfolio/overview', views.get_combined_portfolio_overview),
    path('combined_portfolio/time_series', views.get_combined_portfolio_time_series),
    path('combined_portfolio/groupings', views.get_combined_portfolio_groupings),
    path('combined_portfolio/stocks', views.get_combined_portfolio_stocks),
    path('popularity/stock', views.get_stock_popularity),
    path('popularity/stocks', views.get_popular_stocks),
    path('performance/portfolios', views.get_high_performing_portfolios)
]