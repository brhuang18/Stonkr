// material
import { Box, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { useState, useEffect } from 'react';
import axios from 'axios';

import WatchlistHoldings from 'src/components/_dashboard/watchlist/WatchlistHoldings';
import WatchlistNewsSingle from 'src/components/_dashboard/watchlist/WatchlistNewsSingle';
import { useParams, Link, useLocation } from 'react-router-dom';
import { StockSummary } from '../components/_dashboard/search';
import FollowWatchlistButton from 'src/components/_dashboard/watchlist/FollowWatchlistButton';
// ----------------------------------------------------------------------

export default function WatchlistHoldingsPage() {
  const params = useParams();
  const location = useLocation();
  const [title, setTitle] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/watchlist/get?watchlist_id=${params.watchlist_id}&user=${Number(localStorage.getItem("user_id"))}`, {
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

  return (
    <Page title="Watchlist | Stonkr">
      <Container maxWidth="lg">
      <Box sx={{ pb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4">{ title.watchlist_name }</Typography>
            <Link to={`/dashboard/profile/${title.user_id}`} style={{ textDecoration: 'none', color: 'black' }} >
              <Typography variant="subtitle1" noWrap>
                {title.username}
              </Typography>
            </Link>
          </Box>
          <FollowWatchlistButton />
        </Box>
        <Grid container spacing={2}>

          <Grid item xs={12} md={12} lg={12}>
             <WatchlistHoldings />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
             <WatchlistNewsSingle />
          </Grid>

        </Grid>
      </Container>
    </Page>
  );
}
