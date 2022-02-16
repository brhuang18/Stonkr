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
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
// components
import USERLIST from '../../../_mocks_/user';
import Label from 'src/components/Label';
import Scrollbar from 'src/components/Scrollbar';
import SearchNotFound from 'src/components/SearchNotFound';

import { UserListHead, UserListToolbar, UserMoreMenu } from '../../_dashboard/user'
import React from 'react'
import axios from 'axios'
import { fShortenNumber } from '../../../utils/formatNumber';
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import HoldingsToolbar from './HoldingsToolbar';
import HoldingsMoreMenu from './HoldingsMoreMenu';
import link from '@iconify/icons-eva/external-link-outline';
import ViewTradeHistoryButton from './ViewTradeHistoryButton';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ticker', label: 'Stock Ticker', alignRight: false },
  // { id: 'name', label: 'Stock Name', alignRight: false },
  { id: 'units', label: 'Units', alignRight: false },
  { id: 'cost_basis', label: 'Cost Basis', alignRight: false },
  { id: 'market_price', label: 'Market Price', alignRight: false }, //%
  { id: 'holding_value', label: 'Holding Value', alignRight: false }, //%
  { id: 'profit', label: 'Profit', alignRight: false }, //%
  { id: 'weight', label: 'Weight', alignRight: false },
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


export default function PortfolioHoldings() {
  const params = useParams();
  const location = useLocation()
  const navigate = useNavigate();
  const cur_graph = location.pathname.split("/")[4]

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('portfolio_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  function applySortFilter(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    const h = stabilizedThis.map((el) => el[0])
    if (query) {
      return filter(h, (_user) => _user.ticker.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return h
  }

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/portfolio/holdings?portfolio_id=${params.portfolio_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setData(res.data)
      setFilteredData(res.data)
    }).catch(function (err) {
      console.log(err)
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
      const newSelecteds = filteredData.map((n) => n.portfolio_id);
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

  return (
    <Card sx= {{mt: "24px"}}>
      <HoldingsToolbar
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
                    cost_basis,
                    holding_value,
                    holding_value_change,
                    market_price,
                    market_price_change,
                    market_price_percentage_change,
                    name,
                    profit,
                    profit_percentage,
                    ticker,
                    units,
                    weight,
                  } = row;
                  const isItemSelected = selected.indexOf(ticker) !== -1;

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
                      key={ticker}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap style={{ cursor: "pointer" }} onClick={() => {
                            navigate(`/dashboard/search/${ticker}/overview`, { replace: true });
                          }}>
                            {ticker}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {units}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(cost_basis) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(market_price) + "  "}
                        <Label
                          variant="ghost"
                          color={handleColor(market_price_change)}
                        >
                          {(market_price_percentage_change*100).toFixed(2) + "%"}
                        </Label>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(holding_value) + "  "}
                        <Label
                          variant="ghost"
                          color={handleColor(holding_value_change)}
                        >
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(holding_value_change) + "  "}
                        </Label>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(profit) + "  "}
                        <Label
                          variant="ghost"
                          color={handleColor(profit_percentage)}
                        >
                          {(profit_percentage*100).toFixed(2) + "%"}
                        </Label>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingleft="5px">
                        <Typography variant="subtitle2" noWrap>
                          {(weight*100).toFixed(2) + "%"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <ViewTradeHistoryButton cur_graph={cur_graph} ticker={ticker} />
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
  );
}
