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
import { useParams } from 'react-router-dom'


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

export default function PortfolioNewsSingle() {
  const [news, setNews] = React.useState([])
  const params = useParams(); 

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/stocks?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      if (res.data.length > 0) {
        let url = `https://stocknewsapi.com/api/v1?tickers=`;
        for (let i = 0; i < res.data.length; i++) {
            url = url + res.data[i];
            if (i + 1 !== res.data.length) {
                url = url + ",";
            }
        }
        url = url + "&items=10&sortby=rank&days=3&token=ptoaroicumkkbbcfzs22uozd51spfnjkctgcg7se";
        axios.get(url, null, null)
        .then(function (res) {
            setNews(res.data.data)
        }).catch(function (err) {
            setNews([])
            console.log("error", err.response)
        })
      }
      
    }).catch(function (err) {
      console.log("error", err.response)
    })
  }, [])

  return (
    <Card>
      <CardHeader title="Portfolio Stock News" />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          {news.map((news) => (
            <NewsItem key={news.title} news={news} />
          ))}
        </Stack>
      </Scrollbar>
      <Divider />
    </Card>
  );
}
