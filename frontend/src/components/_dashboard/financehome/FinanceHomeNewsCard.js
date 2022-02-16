import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import { Link as RouterLink } from 'react-router-dom';
import shareFill from '@iconify/icons-eva/share-fill';
import messageCircleFill from '@iconify/icons-eva/message-circle-fill';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Avatar, Typography, CardContent } from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
import { fShortenNumber } from '../../../utils/formatNumber';
//
import SvgIconStyle from '../../SvgIconStyle';

// ----------------------------------------------------------------------

const CardMediaStyle = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)'
});

const TitleStyle = styled(Link)({
  height: 44,
  overflow: 'hidden',
  WebkitLineClamp: 2,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical'
});

const AvatarStyle = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2)
}));

const InfoStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  color: theme.palette.text.disabled
}));

const CoverImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

// BlogPostCard.propTypes = {
//   post: PropTypes.object.isRequired,
//   index: PropTypes.number
// };

FinanceHomeNewsCard.propTypes = {
    news: PropTypes.object.isRequired,
    index: PropTypes.number
  };

export default function FinanceHomeNewsCard({ news, index }) {
  //const { cover, title, view, comment, share, author, createdAt } = post;
  const { image_url, title, text, date, news_url, source_name } = news;
  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;
  
  

  return (
    <Grid item xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
      <Card sx={{ position: 'relative' }}>
        <CardMediaStyle
          sx={{
            ...((latestPostLarge || latestPost) && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
              }
            }),
            ...(latestPostLarge && {
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)'
              }
            })
          }}
        >
          <SvgIconStyle
            color="paper"
            src= "/static/icons/shape-avatar.svg"
            sx={{
              width: 80,
              height: 36,
              zIndex: 9,
              bottom: -15,
              position: 'absolute',
              ...((latestPostLarge || latestPost) && { display: 'none' })
            }}
          />
          <CoverImgStyle alt={title} src={image_url} />
        </CardMediaStyle>

        <CardContent
          sx={{
            pt: 4,
            ...((latestPostLarge || latestPost) && {
              bottom: 0,
              width: '100%',
              position: 'absolute'
            })
          }}
        >

          <Typography
            gutterBottom
            variant="caption"
            sx={{ color: "Orange", display: 'block' }}
          >
            {source_name}
          </Typography>

          <Typography
            gutterBottom
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block' }}
          >
            {fDate(date)}
          </Typography>
          
          
            <Link href={news_url} color="inherit" underline="hover" >
              <TitleStyle                   
                color="inherit"
                variant="subtitle2"
                underline="hover"
                sx={{
                ...(latestPostLarge && { typography: 'h5', height: 60 }),
                ...((latestPostLarge || latestPost) && {
                    color: 'common.white'
                })
                }}
              >
                {title}
              </TitleStyle>
            </Link>
        
        </CardContent>
      </Card>
    </Grid>
  );
}
