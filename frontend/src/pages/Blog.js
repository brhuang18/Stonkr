import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import { BlogPostCard, BlogPostsSort, BlogPostsSearch } from '../components/_dashboard/blog';
import { FinanceHomeNewsCard } from 'src/components/_dashboard/financehome';
//
import POSTS from '../_mocks_/blog';
import axios from 'axios'
import React from 'react'

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' }
];

// ----------------------------------------------------------------------

export default function Blog() {
  const [news, setNews] = React.useState([])

  React.useEffect(() => {
    let url = `https://stocknewsapi.com/api/v1/category?section=general&items=23&token=ptoaroicumkkbbcfzs22uozd51spfnjkctgcg7se`

    axios.get(url, null, null)
    .then(function (res) {
      setNews(res.data.data)
    }).catch(function (err) {
      setNews([])
      console.log("error", err.response)
    })
  }, [])

  return (
    <Page title="Dashboard: Blog | Minimal-UI">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Finance Home
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {news.map((news, index) => (
            <FinanceHomeNewsCard key={news.id} news={news} index={index} />
          ))}
        </Grid>
      </Container>
    </Page>
  );
}
