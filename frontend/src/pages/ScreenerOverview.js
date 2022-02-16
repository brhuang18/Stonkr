// material
import { Box, Grid, Container, Typography } from '@mui/material';
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
  ScreenerList
} from '../components/_dashboard/screeners';


// ----------------------------------------------------------------------

export default function ScreenerOverview() {
  
  return (
    <Page title="Screeners | Stonkr">
      <Container maxWidth="lg">
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Screener List</Typography>
          <Typography variant="body">
            Find Stonkr predefined, ready-to-use stock screeners to search stocks by industry, index membership, and more.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ScreenerList />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}