import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import PortfolioOverview from './pages/PortfolioOverview';
import Products from './pages/Products';
import Blog from './pages/Blog';
import User from './pages/User';
import NotFound from './pages/Page404';
import Watchlist from './pages/Watchlist';
import SendResetCode from './pages/SendResetCode'
import ResetPassword from './pages/ResetPassword'
import PleaseLogin from './pages/PleaseLogin';
import SearchResult from './pages/SearchResult';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import NotificationOverview from './pages/NotificationOverview';

import { is_loggedin } from './utils/check_auth';
import { StockChart, StockHisData, StockProfile, StockHisSetting, StockStats } from './components/_dashboard/search';
import StockOverview from './components/_dashboard/search/StockOverview';
import { PortfolioHoldings, PortfolioList, PortfolioListOutlet, TradeHistory, UploadCSV } from './components/_dashboard/portfolio';
import WatchlistHoldings from './components/_dashboard/watchlist/WatchlistHoldings';
import { WatchlistList } from './components/_dashboard/watchlist';

import WatchlistHoldingsPage from './pages/WatchlistHoldingsPage';
import { LineChartAll } from './components/_dashboard/portfolio';
import { LineChartAllProfit } from './components/_dashboard/portfolio';
import { LineChartSingle } from './components/_dashboard/portfolio';
import { LineChartSingleProfit } from './components/_dashboard/portfolio';
import ScreenerOverview from './pages/ScreenerOverview';
import ScreenerStockList from './components/_dashboard/screeners/ScreenerStockList';

import FinanceHome from './pages/FinanceHome';
import Explore from './pages/Explore';
import { Following } from './components/_dashboard/profile';
import Followers from './components/_dashboard/profile/Followers';
import ScreenerListPage from './pages/ScreenerListPage'
// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/financehome" replace /> },
        { 
          path: 'portfolio/overview/:user_id', 
          element: !is_loggedin() ? <PleaseLogin /> : <PortfolioOverview />,
          children: [
            { element: <Navigate to="combinedValue" replace /> },
            { path: 'combinedValue', element: <LineChartAll /> },
            { path: 'combinedProfit', element: <LineChartAllProfit />},
          ]
        },
        { 
          path: 'portfolio/:portfolio_id', 
          element: !is_loggedin() ? <PleaseLogin /> : <Portfolio />,
          children: [
            { element: <Navigate to="singleValue" replace /> },
            {
              path: "singleValue",
              element: <LineChartSingle />,
              children: [
                { element: <Navigate to="overview" replace /> },
                { path: 'overview', element: <PortfolioHoldings /> },
                { path: ':trade_id', element: <TradeHistory /> },
                { path: 'upload', element: <UploadCSV /> },
              ]
            },
            {
              path: "singleProfit",
              element: <LineChartSingleProfit />,
              children: [
                { element: <Navigate to="overview" replace /> },
                { path: 'overview', element: <PortfolioHoldings /> },
                { path: ':trade_id', element: <TradeHistory /> },
                { path: 'upload', element: <UploadCSV /> },
              ]
            },
          ]
        },
        { path: 'notifications', element: !is_loggedin() ? <PleaseLogin /> : <NotificationOverview/> },
        { path: 'explore', element: !is_loggedin() ? <PleaseLogin /> : <Explore /> },
        { path: 'products', element: <Products /> },
        { path: 'financehome', element: <FinanceHome /> },
        { path: 'screeners', element: <ScreenerOverview /> },
        { path: 'screeners/:screener_id', element: <ScreenerListPage /> },
        { path: 'watchlist', element: !is_loggedin() ? <PleaseLogin /> : <Watchlist /> },
        { path: 'watchlist/:watchlist_id', element: !is_loggedin() ? <PleaseLogin /> : <WatchlistHoldingsPage /> },
        { 
          path: 'search/:ticker', 
          element: <SearchResult />,
          children: [
            { element: <Navigate to="/dashboard/search/:ticker/overview" replace /> },
            { path: 'overview', element: <StockOverview /> },
            { path: 'hisdata', element: <StockHisSetting /> },
            { path: 'profile', element: <StockProfile /> },
            { path: 'statistics', element: <StockStats /> },
          ]
        },
        { path: 'profile/:user_id', 
          element: <Profile />,
          children: [
            { element: <Navigate to="portfolio" replace /> },
            { path: 'portfolio', element: <PortfolioList /> },
            { path: 'watchlist', element: <WatchlistList /> },
            { path: 'following', element: <Following /> },
            { path: 'followers', element: <Followers /> },
          ]
        },
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'sendresetcode', element: <SendResetCode /> },
        { path: 'resetpassword/:token', element: <ResetPassword /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
