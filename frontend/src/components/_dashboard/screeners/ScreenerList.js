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
import USERLIST from '../../../_mocks_/user';
import Label from 'src/components/Label';
import Scrollbar from 'src/components/Scrollbar';
import SearchNotFound from 'src/components/SearchNotFound';

import { UserListHead, UserListToolbar, UserMoreMenu } from '../../_dashboard/user'
import React from 'react'
import axios from 'axios'
import { fShortenNumber } from '../../../utils/formatNumber';
import { ScreenerStockHead } from '.';
import LoadingScreen from '../../../components/LoadingScreen';
//
// import USERLIST from '../../../_mocks_/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'screener_name', label: 'Screener Name', alignRight: false },
  { id: 'description', label: 'Screener Description', alignRight: false },
  { id: 'screener_count', label: 'Screener Count', alignRight: false },
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


export default function ScreenerList(props) {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('portfolio_name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
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
      return filter(h, (_user) => _user.portfolio_name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return h
  }

  React.useEffect(() => {
    axios.get('http://127.0.0.1:8000/screeners/getAll', {
      headers: {
        Authorization: 'Token ' + localStorage.getItem("user_token")
      }
    }, null).then(function (res) {
      setData(res.data.screeners)
      setFilteredData(res.data.screeners)
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
      <Scrollbar>
        <TableContainer sx={{ minWidth: 800, p: '24px' }}>
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
                  const { screener_name, description, screener_count } = row;
                  const isItemSelected = selected.indexOf(screener_name) !== -1;

                  let arr = screener_name.split("_")
                  for (var i = 0; i < arr.length; i++) {
                    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
                  }
                  const display_name = arr.join(" ")

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
                      key={screener_name}
                      tabIndex={-1}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell component="th" scope="row" paddingLeft="5px">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {/* <Avatar alt={name} src={avatarUrl} /> */}
                          <Link to={`/dashboard/screeners/${screener_name}`} style={{ textDecoration: 'none', color: 'black' }} >
                            <Typography variant="subtitle2" noWrap>
                              {display_name}
                            </Typography>
                          </Link>
                        </Stack>
                      </TableCell>

                      <TableCell align="left" sx={{ width: '50%' }}>
                        <Typography variant="subtitle2">
                          {description}
                        </Typography>
                      </TableCell>

                      <TableCell align="left">
                        <Typography variant="subtitle2" noWrap>
                          {screener_count}
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

      {/* <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}
    </Card>
  ) : (   
      <LoadingScreen></LoadingScreen>
  );
}
