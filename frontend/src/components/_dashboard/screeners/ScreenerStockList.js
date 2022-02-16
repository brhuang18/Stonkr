import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination
} from '@mui/material';
// components
// import USERLIST from '../../../_mocks_/user';
import Label from 'src/components/Label';
import Scrollbar from 'src/components/Scrollbar';
import SearchNotFound from 'src/components/SearchNotFound';

import { UserListHead, UserListToolbar, UserMoreMenu } from '../../_dashboard/user'
import React from 'react'
import axios from 'axios'
import { fShortenNumber } from '../../../utils/formatNumber';
import { ScreenerStockHead, ScreenerStockToolbar } from '.';
import { useParams } from 'react-router';
import LoadingScreen from '../../../components/LoadingScreen';
//
// import USERLIST from '../../../_mocks_/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'stock_ticker', label: 'Symbol', alignRight: false },
  { id: 'stock_name', label: 'Name', alignRight: false },
  { id: 'stock_price', label: 'Price (Intraday)', alignRight: false },
  { id: 'value_change', label: 'Change', alignRight: false },
  { id: 'precent_change', label: '% Change', alignRight: false },
  { id: 'volume', label: 'Volume', alignRight: false },
  { id: 'avg_3_month_volume', label: 'Avg Vol (3 month)', alignRight: false },
  { id: 'market_cap', label: 'Market Cap', alignRight: false },
  { id: 'PE_ratio', label: 'PE Ratio (TTM)', alignRight: false },
  { id: '52_week_range_high', label: 'High', alignRight: false },
  { id: '52_week_range_low', label: 'Low', alignRight: false },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}


export default function ScreenerList() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('portfolio_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const params = useParams()
  const [news, setNews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoading = () => {
    setIsLoading(false);
  }

  React.useEffect(()=>{
    window.addEventListener("load",handleLoading);
    return () => window.removeEventListener("load",handleLoading);
  },[])


  function applySortFilter(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    const h = stabilizedThis.map((el) => el[0])
    if (query) {
      return filter(h, (_user) => _user.stock_ticker.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return h
  }

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/screeners/get?screener_name=${params.screener_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setData(res.data.screener_list)
      setFilteredData(res.data.screener_list)
      setIsLoading(false);
    }).catch(function (err) {
      console.log("portfolio list error")
      console.log(err)
    })
  }, [])

  const handleRequestSort = (event, property) => { // smthing is wrong here
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setFilteredData(applySortFilter(data, getComparator(order, orderBy), filterName))
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData.map((n) => n.screener_name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value)
    if (event.target.value == "") {
      setFilteredData(data)
    } else {
      setFilteredData(applySortFilter(data, getComparator(order, orderBy), event.target.value))
    }
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  const filteredUsers = applySortFilter(data, getComparator(order, orderBy), filterName);

  const isUserNotFound = filteredUsers.length === 0;

  return !isLoading ? (
    <Card>
      <ScreenerStockToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={handleFilterByName}
        setData={setData}
        setFilteredData={setFilteredData}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, px: '6px' }}>
          <Table>
            <UserListHead
              order={order}
              orderBy={orderBy}
              headLabel={TABLE_HEAD}
              rowCount={filteredData.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const {
                    PE_ratio,
                    avg_3_month_volume,
                    market_cap,
                    percent_change,
                    stock_name,
                    stock_price,
                    stock_ticker,
                    value_change,
                    volume,
                  } = row;
                  const high = row["52_week_range_high"]
                  const low = row["52_week_range_low"]
                  const isItemSelected = selected.indexOf(stock_ticker) !== -1;

                  function handleColor (value) {
                    if (value > 0) {
                      return ("success")
                    } else if (value < 0) {
                      return ("error")
                    } else {
                      return ("primary")
                    }
                  }

                  return (
                    <TableRow
                      // hover
                      key={stock_name}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell component="th" scope="row" paddingLeft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Link to={`/dashboard/search/${stock_ticker}/overview`} style={{ textDecoration: 'none', color: 'black' }} >
                            <Typography variant="subtitle2" noWrap>
                              {stock_ticker}
                            </Typography>
                          </Link>
                        </Stack>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {stock_name}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(stock_price) + "  "}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(value_change) + "  "}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {percent_change.toFixed(3)}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {String(volume).replace(/(.)(?=(\d{3})+$)/g,'$1,')}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {String(avg_3_month_volume).replace(/(.)(?=(\d{3})+$)/g,'$1,')}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {String(market_cap).replace(/(.)(?=(\d{3})+$)/g,'$1,')}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {PE_ratio == 'N/A' ? PE_ratio : PE_ratio.toFixed(3)}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(high) + "  "}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2">
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(low) + "  "}
                        </Typography>
                      </TableCell>

                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            {filteredData.length == 0 && (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                    <SearchNotFound searchQuery={filterName} />
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  ) : (<LoadingScreen></LoadingScreen>);
}
