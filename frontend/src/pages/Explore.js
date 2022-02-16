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
// import {
//   
// } from '../components/_dashboard/watchlist';
import WatchlistList from '../components/_dashboard/watchlist/WatchlistList';
import TopMovements from 'src/components/_dashboard/watchlist/TopMovements';
import BottomMovements from 'src/components/_dashboard/watchlist/BottomMovements';
import WatchlistNewsAll from 'src/components/_dashboard/watchlist/WatchlistNewsAll';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { StockSummary } from '../components/_dashboard/search';
import UserList from 'src/components/_dashboard/explore/UserList';
import { PopularStocks } from 'src/components/_dashboard/explore';
import { PortfolioPerformance } from 'src/components/_dashboard/explore';
// ----------------------------------------------------------------------

export default function Explore() {
  const params = useParams();
  const location = useLocation();

  return (
    <Page title="Explore | Stonkr">
      <Container maxWidth="lg">
        <Grid container spacing={3}>
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Explore Page</Typography>
        </Box>
          <Grid item xs={12} md={12} lg={12}>
            <UserList />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
             <PortfolioPerformance />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <PopularStocks />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
