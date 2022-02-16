// material
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Table,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  CardHeader,
  Typography,
  TableContainer
} from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// import mockData from '../../../utils/mock-data';
//
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';
import React from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function PortfolioPerformance() {
  const theme = useTheme();
  const [dataDaily, setDataDaily] = React.useState([]);
  const [dataWeekly, setDataWeekly] = React.useState([]);
  const [dataMonthly, setDataMonthly] = React.useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  React.useEffect(()=>{
  window.addEventListener("load",handleLoading);
  return () => window.removeEventListener("load",handleLoading);
  },[])

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/performance/portfolios`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpDaily = res.data.daily;
      tmpDaily.reverse();
      let tmpDataDaily = [];
      for (let i = 0; i < tmpDaily.length; i++) {
          let tmpDictDaily = {};
          tmpDictDaily["portfolio_id"] = tmpDaily[i].portfolio_id;
          tmpDictDaily["portfolio_name"] = tmpDaily[i].portfolio_name;
          tmpDictDaily["count"] = tmpDaily[i].profit * 100;
          tmpDictDaily["user_id"] = tmpDaily[i].user_id;
          tmpDictDaily["username"] = tmpDaily[i].username;
          tmpDictDaily["rank"] = "Top " + (i+1);
          tmpDataDaily.push(tmpDictDaily);
      }
      setDataDaily(tmpDataDaily);

      let tmpWeekly = res.data.weekly;
      tmpWeekly.reverse();
      let tmpDataWeekly = [];
      for (let i = 0; i < tmpWeekly.length; i++) {
          let tmpDictWeekly = {};
          tmpDictWeekly["portfolio_id"] = tmpWeekly[i].portfolio_id;
          tmpDictWeekly["portfolio_name"] = tmpWeekly[i].portfolio_name;
          tmpDictWeekly["count"] = tmpWeekly[i].profit * 100;
          tmpDictWeekly["user_id"] = tmpWeekly[i].user_id;
          tmpDictWeekly["username"] = tmpWeekly[i].username;
          tmpDictWeekly["rank"] = "Top " + (i+1);
          tmpDataWeekly.push(tmpDictWeekly);
      }
      setDataWeekly(tmpDataWeekly);

      let tmpMonthly = res.data.monthly;
      tmpMonthly.reverse();
      let tmpDataMonthly = [];
      for (let i = 0; i < tmpMonthly.length; i++) {
          let tmpDictMonthly = {};
          tmpDictMonthly["portfolio_id"] = tmpMonthly[i].portfolio_id;
          tmpDictMonthly["portfolio_name"] = tmpMonthly[i].portfolio_name;
          tmpDictMonthly["count"] = tmpMonthly[i].profit * 100;
          tmpDictMonthly["user_id"] = tmpMonthly[i].user_id;
          tmpDictMonthly["username"] = tmpMonthly[i].username;
          tmpDictMonthly["rank"] = "Top " + (i+1);
          tmpDataMonthly.push(tmpDictMonthly);
      }
      setDataMonthly(tmpDataMonthly);
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err.response);
    })
  }, [])

  function handleProfileRoute (value) {
    let str = value
    if (value == localStorage.getItem('user_id')) {
      str = 'me'
    }
    navigate(`/dashboard/profile/${str}/portfolio`, { replace: true });
  }


  return !isLoading ? (
    <Card sx={{ pb: 3, px: 3 }}>
      <CardHeader title="Top 5 Public Portfolios Daily" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Portfolio Name</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Daily Profit %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataDaily.map((row) => (
                <TableRow key={row.portfolio_id}>
                  <TableCell>
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={
                        (row.rank === 'Top 1' && 'primary') ||
                        (row.rank === 'Top 2' && 'info') ||
                        (row.rank === 'Top 3' && 'success') ||
                        (row.rank === 'Top 4' && 'warning') ||
                        'error'
                      }
                    >
                      {row.rank}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/dashboard/portfolio/${row.portfolio_id}`, { replace: true });
                      }}>
                        <Typography variant="body2">
                          {row.portfolio_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        handleProfileRoute(row.user_id)
                      }}>
                        <Typography variant="body2">
                          {row.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.count.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <CardHeader title="Top 5 Public Portfolios Weekly" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{sx: '24px'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Portfolio Name</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Weekly Profit %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataWeekly.map((row) => (
                <TableRow key={row.portfolio_id}>
                  <TableCell>
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={
                        (row.rank === 'Top 1' && 'primary') ||
                        (row.rank === 'Top 2' && 'info') ||
                        (row.rank === 'Top 3' && 'success') ||
                        (row.rank === 'Top 4' && 'warning') ||
                        'error'
                      }
                    >
                      {row.rank}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/dashboard/portfolio/${row.portfolio_id}`, { replace: true });
                      }}>
                        <Typography variant="body2" >
                          {row.portfolio_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        handleProfileRoute(row.user_id)
                      }}>
                        <Typography variant="body2">
                          {row.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.count.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      <CardHeader title="Top 5 Public Portfolios Monthly" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{sx: '24px'}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Portfolio Name</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Monthly Profit %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataMonthly.map((row) => (
                <TableRow key={row.portfolio_id}>
                  <TableCell>
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={
                        (row.rank === 'Top 1' && 'primary') ||
                        (row.rank === 'Top 2' && 'info') ||
                        (row.rank === 'Top 3' && 'success') ||
                        (row.rank === 'Top 4' && 'warning') ||
                        'error'
                      }
                    >
                      {row.rank}
                    </Label>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/dashboard/portfolio/${row.portfolio_id}`, { replace: true });
                      }}>
                        <Typography variant="body2" >
                          {row.portfolio_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ ml: 2 }} noWrap style={{ cursor: "pointer" }} onClick={() => {
                        handleProfileRoute(row.user_id)
                      }}>
                        <Typography variant="body2">
                          {row.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.count.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  ) : (<div></div>);
}
