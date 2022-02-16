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

// const COUNTRY = ['de', 'en', 'fr', 'kr', 'us'];
// const CATEGORY = ['CAP', 'Branded Shoes', 'Headphone', 'Cell Phone', 'Earings'];

// const MOCK_SALES = [...Array(5)].map((_, index) => ({
//   id: mockData.id(index),
//   name: mockData.name.fullName(index),
//   email: mockData.email(index),
//   avatar: mockData.image.avatar(index + 8),
//   category: CATEGORY[index],
//   flag: `/static/icons/ic_flag_${COUNTRY[index]}.svg`,
//   total: mockData.number.price(index),
//   rank: `Top ${index + 1}`
// }));

// ----------------------------------------------------------------------

export default function PopularStocks() {
  const theme = useTheme();
  const [data, setData] = React.useState([]);
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
    axios.get(`http://127.0.0.1:8000/popularity/stocks`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpRes = res.data.popular_stocks;
      tmpRes.reverse();
      let tmpData = [];
      for (let i = 0; i < tmpRes.length; i++) {
          let tmpDict = {};
          tmpDict["stock_ticker"] = tmpRes[i][0];
          tmpDict["count"] = tmpRes[i][1];
          tmpDict["rank"] = "Top " + (i+1);
          tmpData.push(tmpDict);
      }
      setData(tmpData);
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err.response);
    })
  }, [])


  return !isLoading ? (
    <Card sx={{ pb: 3, px: 3 }}>
      <CardHeader title="Top 5 Most Popular Stocks Across Users" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Ticker</TableCell>
                <TableCell>Number of Users</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.stock_ticker}>
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
                        navigate(`/dashboard/search/${row.stock_ticker}/overview`, { replace: true });
                      }}>
                        <Typography variant="subtitle2"> {row.stock_ticker}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {row.stock_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  ) : (<div></div>);
}
