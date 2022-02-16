// material
import { Box, Grid, Container, Typography, Card } from '@mui/material';
// components
import Page from '../components/Page';

import { useParams, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios'
import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';
import follow from '@iconify/icons-eva/person-add-fill';

import {
  PortfolioList
} from '../components/_dashboard/portfolio'

import TodaysBalance from 'src/components/_dashboard/portfolio/TodaysBalance';
import { ProfitLoss } from '../components/_dashboard/portfolio';
import TodaysMovements from 'src/components/_dashboard/portfolio/TodaysMovements';

import PieChartAll from 'src/components/_dashboard/portfolio/PieChartAll';
import DonutChartAll from 'src/components/_dashboard/portfolio/DonutChartAll';
import { PortfolioNavBarAll } from '../components/_dashboard/portfolio';

import LoadingScreen from '../components/LoadingScreen';
import PortfolioNewsAll from 'src/components/_dashboard/portfolio/PortfolioNewsAll';
// ----------------------------------------------------------------------

export default function PortfolioOverview() {
  const [balance, setBalance] = useState(null);
  const [totalPL, setTotalPL] = useState(null);
  const [todayMovement, setTodayMovement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoading = () => {
    setIsLoading(false);
  }

  useEffect(()=>{
    window.addEventListener("load",handleLoading);
    return () => window.removeEventListener("load",handleLoading);
  },[])

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/portfolios/overview', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpBalance = 0;
      let tmpPL = 0;
      let tmpTodayMovement = 0;
      for (let i = 0; i < res.data.portfolios.length; i++) {
        tmpBalance += res.data.portfolios[i].market_value;
        tmpPL += res.data.portfolios[i].total_profit;
        tmpTodayMovement += res.data.portfolios[i].today_profit;
      }
      setBalance(tmpBalance);
      setTotalPL(tmpPL);
      setTodayMovement(tmpTodayMovement);
      setIsLoading(false);
    }).catch(function (err) {
      console.log("portfolio list error")
      console.log(err.response)
    })
  }, [])

  return !isLoading ? (
    <Page title="Portfolios | Stonkr">
      <Container maxWidth="xl">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">My Portfolio List</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <TodaysBalance balance = { balance } />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <ProfitLoss totalPL = { totalPL } />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TodaysMovements todayMovement = { todayMovement }/>
          </Grid>

          <Grid item xs={12}  md={8} lg={8}>
            <PortfolioNavBarAll style={{ marginBottom: '24px' }} />
            <Outlet />
          </Grid>

          <Grid item xs={12} md={4} lg={4}>
            <DonutChartAll />
          </Grid>

          <Grid item xs={12} md={8} lg={8}>
            <PortfolioList />
          </Grid>

          <Grid item xs={12} md={4} lg={4}>
            <Card>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }} dir="ltr">
              <Typography variant="h4">Combined Portfolio Weightings</Typography>
              < PieChartAll/>
            </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8} lg={8}>
            <PortfolioNewsAll />
          </Grid>

        </Grid>
      </Container>
    </Page>
  ) : (<LoadingScreen></LoadingScreen>);
}
