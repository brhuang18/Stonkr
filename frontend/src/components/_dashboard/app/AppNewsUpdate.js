import faker from 'faker';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import { formatDistance } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import arrowIosForwardFill from '@iconify/icons-eva/arrow-ios-forward-fill';
// material
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader } from '@mui/material';
// utils
import { mockImgCover } from '../../../utils/mockImages';
//
import Scrollbar from '../../Scrollbar';
import axios from 'axios'
import React from 'react'

// ----------------------------------------------------------------------

const NEWS = [...Array(5)].map((_, index) => {
  const setIndex = index + 1;
  return {
    title: faker.name.title(),
    description: faker.lorem.paragraphs(),
    image: mockImgCover(setIndex),
    postedAt: faker.date.soon()
  };
});

// ----------------------------------------------------------------------

NewsItem.propTypes = {
  news: PropTypes.object.isRequired
};

function NewsItem({ news }) {
  const { image_url, title, text, date, news_url } = news;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        component="img"
        alt={title}
        src={image_url}
        sx={{ 
          width: 64, height: 64, borderRadius: 1.5,
        }}
      />
      <Box sx={{ minWidth: 240 }}>
        <Link href={news_url} color="inherit" underline="hover" >
          <Typography variant="subtitle2" noWrap>
            {title}
          </Typography>
        <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary', textAlign: 'right', pt: 0 }}>
          {date}
        </Typography>
        </Link>
        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {text}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function AppNewsUpdate(props) {
  const { search } = props
  const [news, setNews] = React.useState([])

  React.useEffect(() => {
    let url = `https://stocknewsapi.com/api/v1?tickers=${search}&items=10&sortby=rank&days=3&token=ptoaroicumkkbbcfzs22uozd51spfnjkctgcg7se`

    axios.get(url, null, null)
    .then(function (res) {
      setNews(res.data.data)
    }).catch(function (err) {
      setNews([])
      console.log("error", err.response)
    })
  }, [search])

  return (
    <Card>
      <CardHeader title="News Update" />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {news.map((news) => (
            <NewsItem key={news.title} news={news} />
          ))}
        </Stack>
      </Scrollbar>

      <Divider />

      {/* <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          to="#"
          size="small"
          color="inherit"
          component={RouterLink}
          endIcon={<Icon icon={arrowIosForwardFill} />}
        >
          View all
        </Button>
      </Box> */}
    </Card>
  );
}
