// material
import { Box, Grid, Container, Typography, Card } from '@mui/material';
import { Outlet } from 'react-router-dom';
// components
import Page from '../components/Page';
import {
  AppTasks,
  AppNewUsers,
  AppBugReports,
  AppItemOrders,
  AppNewsUpdate,
  AppWeeklySales,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates,
} from '../components/_dashboard/app';

import {
  PortfolioList
} from '../components/_dashboard/portfolio'
import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';


import TodaysBalance from 'src/components/_dashboard/portfolio/TodaysBalance';
import { ProfitLoss } from '../components/_dashboard/portfolio';
import TodaysMovements from 'src/components/_dashboard/portfolio/TodaysMovements';
import YearlyMovement from 'src/components/_dashboard/portfolio/YearlyMovement';

import PortfolioNavBarSingle from 'src/components/_dashboard/portfolio/PortfolioNavBarSingle';
import PieChartSingle from 'src/components/_dashboard/portfolio/PieChartSingle';
import DonutChartSingle from 'src/components/_dashboard/portfolio/DonutChartSingle';
import LoadingScreen from '../components/LoadingScreen';
import PortfolioNewsSingle from 'src/components/_dashboard/portfolio/PortfolioNewsSingle';
import FollowingPortfolioButton from 'src/components/_dashboard/portfolio/FollowingPortfolioButton';

// ----------------------------------------------------------------------

export default function Portfolio() {
  const params = useParams();
  const [balance, setBalance] = useState(null);
  const [totalPL, setTotalPL] = useState(null);
  const [todayMovement, setTodayMovement] = useState(null);
  const [news, setNews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [title, setTitle] = useState([]);
  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/holdings?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpBalance = 0;
      let tmpPL = 0;
      let tmpTodayMovement = 0;
      for (let i = 0; i < res.data.length; i++) {
        tmpBalance += res.data[i].holding_value;
        tmpPL += res.data[i].profit;
        tmpTodayMovement += res.data[i].holding_value_change;
      }
      setBalance(tmpBalance);
      setTotalPL(tmpPL);
      setTodayMovement(tmpTodayMovement);
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setTitle(res.data);
    }).catch(function (err) {
      console.log(err)
      console.log(err.response);
    })
  }, [])

  return !isLoading ? (
    <Page title="Portfolio | Stonkr">
      <Container maxWidth="xl">
        <Box sx={{ pb: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">{ title.portfolio_name }</Typography>
            <Link to={`/dashboard/profile/${title.user_id}`} style={{ textDecoration: 'none', color: 'black' }} >
              <Typography variant="subtitle1" noWrap>
                {title.username}
              </Typography>
            </Link>
          </Box>
          <FollowingPortfolioButton />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TodaysBalance balance = { balance } />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ProfitLoss totalPL = { totalPL } />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TodaysMovements todayMovement = { todayMovement } />
          </Grid>

          <Grid item xs={12} md={8} lg={8}>
            <PortfolioNavBarSingle style={{ marginBottom: '24px' }} />
            <Outlet />
          </Grid>
          
          <Grid item xs={12} md={4} lg={4}>
            <DonutChartSingle />
            <Card sx={{ mt: "24px"}}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }} dir="ltr">
              <Typography variant="h4">Portfolio Holding Weightings</Typography>
              < PieChartSingle/>
            </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8} lg={8}>
            <PortfolioNewsSingle />
          </Grid>

        </Grid>
      </Container>
    </Page>
  ) : (<LoadingScreen></LoadingScreen>);
}
