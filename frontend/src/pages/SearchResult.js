// material
import { Box, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import {
  StockChart,
  StockTitle,
  StockNavBar
} from '../components/_dashboard/search';
import {
  AppNewsUpdate,
} from '../components/_dashboard/app';

import { useParams, Outlet, useLocation } from 'react-router-dom';
import { StockSummary } from 'src/components/_dashboard/search';

// ----------------------------------------------------------------------

export default function SerachResult() {
  const params = useParams();
  const location = useLocation();

  return (
    <Page title="Stock Result | Stonkr">
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <StockTitle />
          </Grid>

          {/* <Grid item xs={12} md={12} lg={12}>
            navbar
          </Grid> */}

          <Grid item xs={12} md={8} lg={8}>
            <StockNavBar style={{ marginBottom: '24px' }} />
            <Outlet />
          </Grid>

          <Grid item xs={12} md={4} lg={4}>
            <StockSummary />
            {/* <AppCurrentVisits />
            <AppCurrentVisits /> */}
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
