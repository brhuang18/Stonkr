// material
import { Box, Grid, Container, Typography } from '@mui/material';
import { useParams } from 'react-router';
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
  AppTrafficBySite,
  AppCurrentSubject,
  AppConversionRates
} from '../components/_dashboard/app';

import {
  ScreenerList, ScreenerStockList
} from '../components/_dashboard/screeners';


// ----------------------------------------------------------------------

export default function ScreenerListPage() {
  const params = useParams()
  let arr = params.screener_id.split("_")
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
  }
  const display_name = arr.join(" ")


  return (
    <Page title="Screeners | Stonkr">
      <Container maxWidth="lg">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">{display_name}</Typography>
          <Typography variant="body">
            Find Stonkr predefined, ready-to-use stock screeners to search stocks by industry, index membership, and more.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ScreenerStockList />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}