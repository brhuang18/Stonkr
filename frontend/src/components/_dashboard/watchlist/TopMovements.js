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

export default function TopMovements() {
  const theme = useTheme();
  const [data, setData] = React.useState([]);
  const navigate = useNavigate();
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
    axios.get(`http://127.0.0.1:8000/watchlist/movements?user=${Number(localStorage.getItem("user_id"))}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      let tmpRes = res.data.movements.top_movements;
      let tmpData = [];
      for (let i = 0; i < tmpRes.length ; i++) {
        let tmpDict = {};
        tmpDict["stock_ticker"] = tmpRes[i].stock_ticker;
        tmpDict["stock_name"] = tmpRes[i].stock_name;
        tmpDict["close"] = tmpRes[i].close;
        tmpDict["change"] = tmpRes[i].change;
        tmpDict["percent_change"] = tmpRes[i].percent_change;
        tmpDict["rank"] = "Top " + (i+1);
        tmpData.push(tmpDict);
      }
      setData(tmpData);
      setIsLoading(false);
    }).catch(function (err) {
      console.log(err)
      console.log(err.response);
    })
  }, [])

  return !isLoading ? (
    <Card sx={{ pb: 3 }}>
      <CardHeader title="Top Percentage Movements From Your Watchlists" sx={{ mb: 3 }} />
      <Scrollbar>
        <TableContainer sx={{ px: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell>Close</TableCell>
                <TableCell>Change</TableCell>
                {/* <TableCell align="right">Rank</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.stock_ticker}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box noWrap style={{ cursor: "pointer" }} onClick={() => {
                        navigate(`/dashboard/search/${row.stock_ticker}/overview`, { replace: true });
                      }}>
                        <Typography variant="subtitle2">
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
                          {"  " + row.stock_ticker}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {row.stock_name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{fCurrency(row.close) + " "}</TableCell>
                  <TableCell>
                    {fCurrency(row.change) + " "}
                    <Label
                      variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                      color={'primary'}
                    >
                      {row.percent_change}
                    </Label>
                  </TableCell>
                  {/* <TableCell align="right">
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
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  ) : (<div></div>);
}
