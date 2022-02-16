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
// import Label from 'src/components/Label';
import Label from '../../Label';
import Scrollbar from '../../Scrollbar';
import SearchNotFound from '../../SearchNotFound';

import { UserListHead, UserListToolbar, UserMoreMenu } from '../../_dashboard/user'
import React from 'react'
import axios from 'axios'
import { fShortenNumber } from '../../../utils/formatNumber';
//
// import USERLIST from '../../../_mocks_/user';
import { FollowingToolbar } from '.'
import LoadingScreen from '../../../components/LoadingScreen';
import { useParams } from 'react-router';

// ----------------------------------------------------------------------

const TABLE_HEAD2 = [
  { id: 'watchlist_name', label: 'Watchlist Name', alignRight: false },
  { id: 'user_id', label: 'Username', alignRight: false },
  { id: 'privacy', label: 'Privacy', alignRight: false },
  { id: '', label: '', alignRight: false },
]

function createData(id, watchlist_name, privacy) {
  return {id, watchlist_name, privacy };
}

const rows = [
  createData(1, 'Watchlist 1', "true"),
  createData(2, 'Watchlist 2', "true"),
  createData(3, 'Watchlist 3', "true"),
  createData(4, 'Watchlist 4', "true"),
  createData(5, 'Watchlist 5', "true"),
  createData(6, 'Watchlist 6', "true"),
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


export default function FollowingWatchlist(props) {
  const { watchlist } = props

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('watchlist_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [news, setNews] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const params = useParams()

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
      return filter(h, (_user) => _user.watchlist_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return h
  }

  React.useEffect(() => {
    setData(watchlist)
    setFilteredData(watchlist)
    setIsLoading(false)
  }, [])

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setFilteredData(applySortFilter(data, getComparator(order, orderBy), filterName))
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredData.map((n) => n.id);
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
      <FollowingToolbar
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
              headLabel={TABLE_HEAD2}
              rowCount={filteredData.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const { watchlist_id, watchlist_name, user_id, privacy, username } = row;
                  const isItemSelected = selected.indexOf(watchlist_id) !== -1;

                  function handlePrivacy (value) {
                    if (value == true) {
                      return ("error")
                    } else {
                      return ("success")
                    }
                  }

                  return (
                    <TableRow
                      key={watchlist_id}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell component="th" scope="row" paddingLeft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Link to={`/dashboard/watchlist/${watchlist_id}`} style={{ textDecoration: 'none', color: 'black' }} >
                            <Typography variant="subtitle2" noWrap>
                              {watchlist_name}
                            </Typography>
                          </Link>
                        </Stack>
                      </TableCell>

                      <TableCell component="th" scope="row" paddingLeft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Link to={`/dashboard/profile/${user_id}`} style={{ textDecoration: 'none', color: 'black' }} >
                            <Typography variant="subtitle2" noWrap>
                              {username}
                            </Typography>
                          </Link>
                        </Stack>
                      </TableCell>

                      <TableCell align="left">
                        <Label
                          variant="ghost"
                          color={handlePrivacy(privacy)}
                        >
                          {privacy ? "Private" : "Public"}
                        </Label>
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
