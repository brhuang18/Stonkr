import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useEffect, useState } from 'react';
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
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
// components
import USERLIST from '../../../_mocks_/user';
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';
import SearchNotFound from '../../SearchNotFound';

import { UserListHead, UserListToolbar, UserMoreMenu } from '../../_dashboard/user'
import React from 'react'
import axios from 'axios'
import { fShortenNumber } from '../../../utils/formatNumber';
import { useParams, useNavigate } from 'react-router-dom'
import link from '@iconify/icons-eva/external-link-outline';
import WatchlistHoldingsToolbar from './WatchlistHoldingsToolbar';
import WatchlistHoldingsMoreMenu from './WatchlistHoldingsMoreMenu';
import LoadingScreen from '../../../components/LoadingScreen';

// ----------------------------------------------------------------------


const TABLE_HEAD = [
    { id: 'stock_ticker', label: 'Ticker', alignRight: false },
    { id: 'stock_name', label: 'Name', alignRight: false },
    { id: 'change', label: '$ % Change', alignRight: false },
    { id: 'bid', label: 'Bid', alignRight: false },
    { id: 'ask', label: 'Ask', alignRight: false },
    { id: 'open', label: 'Open', alignRight: false },
    { id: 'close', label: 'Close', alignRight: false },
    { id: 'high', label: 'High', alignRight: false },
    { id: 'low', label: 'Low', alignRight: false },
    { id: 'volume', label: 'Volume', alignRight: false },
    { id: '', label: '', alignRight: false },
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


export default function WatchlistHoldings() {
  const params = useParams();
  const navigate = useNavigate();
  const watchlist_id = params.watchlist_id;
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('watchlist_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoading = () => {
  setIsLoading(false);
  }

  useEffect(()=>{
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
    axios.get(`http://127.0.0.1:8000/watchlist/metrics?watchlist_id=${watchlist_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      if (res.data.metrics.length > 0) {
        setData(res.data.metrics);
        setFilteredData(res.data.metrics);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
      
    }).catch(function (err) {
      console.log(err)
      setIsLoading(false);
      let err_status = err.response.status;
      let err_msg = err.response.data.response;
      console.log(err)
      console.log(err_msg)
      if (err_status == "400") {
        console.log(err_msg)
      } else if (err.status == "403") {
        console.log(err_msg)
      }
    })
  }, [])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setFilteredData(applySortFilter(data, getComparator(order, orderBy), filterName))
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData.map((n) => n.watchlist_id);
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

  return !isLoading ?  (
    <Card>
      <WatchlistHoldingsToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={handleFilterByName}
        setData={setData}
        setFilteredData={setFilteredData}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, px: '24px' }}>
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
                    stock_ticker, 
                    stock_name, 
                    close, 
                    change, 
                    percent_change, 
                    bid, 
                    ask, 
                    open, 
                    high, 
                    low, 
                    volume
                  } = row;
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
                      key={stock_ticker}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap style={{ cursor: "pointer" }} onClick={() => {
                            navigate(`/dashboard/search/${stock_ticker}/overview`, { replace: true });
                          }}>
                            {stock_ticker}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {stock_name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(change) + "  "}
                        <Label
                          variant="ghost"
                          color={handleColor(percent_change.slice(0,-1))}
                        >
                          {percent_change}
                        </Label>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {/* {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(bid) + "  "} */}
                            {bid}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {/* {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(ask) + "  "} */}
                            {ask}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(open) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(close) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(high) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(low) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(volume) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        <WatchlistHoldingsMoreMenu 
                        watchlistID = {watchlist_id}
                        stockTicker = {stock_ticker}
                        setData={setData}
                        setFilteredData={setFilteredData}
                        />
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
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  )  : (<LoadingScreen></LoadingScreen>);
}
