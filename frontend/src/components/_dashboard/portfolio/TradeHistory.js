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
import { useParams, useNavigate } from 'react-router-dom'
import HoldingsToolbar from './HoldingsToolbar';
import HoldingsMoreMenu from './HoldingsMoreMenu';
import link from '@iconify/icons-eva/external-link-outline';
import TradeMoreMenu from './TradeMoreMenu';
import { TradeToolbar } from '.';

// ----------------------------------------------------------------------

// id,
// portfolio,
// stock,
// trade_date,
// order_price,
// brokerage_fee,
// order_type,
// quantity

const TABLE_HEAD = [
  { id: 'trade_date', label: 'Trade Date', alignRight: false },
  { id: 'order_type', label: 'Order Type', alignRight: false }, //%
  { id: 'order_price', label: 'Order Price', alignRight: false },
  { id: 'brokerage_fee', label: 'Brokerage Fee', alignRight: false },
  { id: 'quantity', label: 'Quantity', alignRight: false }, //%
  { id: '', label: '', alignRight: false }, //%
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
  const navigate = useNavigate();

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
      return filter(h, (_user) => _user.trade_date.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return h
  }

  React.useEffect(() => {
    axios.get(`http://127.0.0.1:8000/trade/holdings/get_trades/?portfolio_id=${params.portfolio_id}&stock_ticker=${params.trade_id}`, {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null)
    .then(function (res) {
      setData(res.data.trades)
      setFilteredData(res.data.trades)
    }).catch(function (err) {
      console.log(err.response)
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
    <Card sx={{ mt: '24px' }}>
      <TradeToolbar
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
                    id,
                    portfolio,
                    stock,
                    trade_date,
                    order_price,
                    brokerage_fee,
                    order_type,
                    quantity
                  } = row;
                  const isItemSelected = selected.indexOf(id) !== -1;

                  return (
                    <TableRow
                      key={id}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >

                      <TableCell scope="row" padding="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {trade_date}
                          </Typography>
                        </Stack>
                      </TableCell>
                      
                      <TableCell scope="row" padding="5px">
                        <Label
                          variant="ghost"
                          color={order_type == "B" ? "success" : "error"}
                        >
                          {order_type == "B" ? "Buy" : "Sell"}
                        </Label>
                      </TableCell>

                      <TableCell scope="row" padding="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(order_price) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell scope="row" padding="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                          {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'USD' }).format(brokerage_fee) + "  "}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell scope="row" padding="5px">
                        <Typography variant="subtitle2" noWrap>
                          {Math.round(quantity)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <TradeMoreMenu 
                          trade_id={id}
                          data={row}
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
  );
}
