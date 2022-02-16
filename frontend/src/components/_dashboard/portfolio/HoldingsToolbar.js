import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import trash2Fill from '@iconify/icons-eva/trash-2-fill';
import back from '@iconify/icons-eva/arrow-back-fill';
import roundFilterList from '@iconify/icons-ic/round-filter-list';
import upload from '@iconify/icons-ic/round-upload';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  OutlinedInput,
  InputAdornment
} from '@mui/material';
import { CreatePortfolio } from '../portfolio';
import CreateTrade from './CreateTrade';
import { useLocation, useNavigate, useParams } from 'react-router';

import Button from '@mui/material/Button';
import follow from '@iconify/icons-eva/person-add-fill';
import FollowingPortfolioButton from './FollowingPortfolioButton';
import React from 'react';
import axios from 'axios'

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3)
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));

// ----------------------------------------------------------------------

HoldingsToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func
};

export default function HoldingsToolbar({ numSelected, filterName, onFilterName, setData, setFilteredData }) {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const cur_path = location.pathname.split("/")[4]
  const [user_id, setuser_id] = React.useState(-1)

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setuser_id(res.data.user_id)
    }).catch(function (err) {
      console.log(err)
    })
  }, [])

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter'
        })
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <SearchStyle
          value={filterName}
          onChange={onFilterName}
          placeholder="Search ..."
          startAdornment={
            <InputAdornment position="start">
              <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
        />
      )}

      {user_id == localStorage.getItem("user_id") ? (
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Back to portfolios">
            <IconButton onClick={() => {
              navigate(`/dashboard/portfolio/overview/me/combinedValue`)
            }}>
              <Icon icon={back} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Upload CSV">
            <IconButton onClick={() => {
              navigate(`/dashboard/portfolio/${params.portfolio_id}/${cur_path}/upload`)
            }}>
              <Icon icon={upload} />
            </IconButton>
          </Tooltip>
          <CreateTrade setData={setData} setFilteredData={setFilteredData} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex' }}>
        </Box>
      )}
    </RootStyle>
  );
}
