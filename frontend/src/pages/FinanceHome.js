// material
import { Grid, Container, Stack, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { FinanceHomeNewsCard } from 'src/components/_dashboard/financehome';
import LoadingScreen from '../components/LoadingScreen';
//
import axios from 'axios'
import React from 'react'
import TickerTape from '../components/TickerTape';

export default function FinanceHome() {
  const [news, setNews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])


  React.useEffect(() => {
    let url = `https://stocknewsapi.com/api/v1/category?section=general&items=23&token=ptoaroicumkkbbcfzs22uozd51spfnjkctgcg7se`

    axios.get(url, null, null)
    .then(function (res) {
      setNews(res.data.data);
      setIsLoading(false);
    }).catch(function (err) {
      setNews([])
      console.log("error", err.response)
    })
  }, [])

  return !isLoading ? (
    <Page title="Finance Home | Stonkr">
      <TickerTape></TickerTape>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5}>
          <Typography variant="h4" gutterBottom>
            Financial News
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {news.map((news, index) => (
            <FinanceHomeNewsCard key={news.id} news={news} index={index} />
          ))}
        </Grid>
      </Container>
    </Page>
  ) : (<LoadingScreen></LoadingScreen>);
}
