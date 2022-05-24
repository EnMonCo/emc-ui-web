import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import superagent from 'superagent';
// material
import {
  Card,
  Checkbox,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
// components
import Page from '../components/Page';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import CustomListHead from '../components/CustomListHead';
import CustomListToolbar from '../components/CustomListToolbar';
import CustomMoreMenu from '../components/CustomMoreMenu';
// mock
import useAuth from '../hooks/useAuth';

import { EMC_METERS_V1 } from '../config';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'serialNumber', label: 'Serial Number', alignRight: false },
  { id: '' },
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

function applySortFilter(array, comparator, query, field = 'serialNumber') {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (meter) => meter[field].toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Meters() {
  const { getUser } = useAuth();

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [meters, setMeters] = useState([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const user = getUser();

  useEffect(() => {
    setLoading(true);
    superagent
      .get(`${EMC_METERS_V1}/users/${user.id}/meters`)
      .query({
        page: page + 1,
        limit: rowsPerPage,
      })
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .then((res) => {
        setMeters(res.body.data);
        setTotal(res.body.totalCount);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [rowsPerPage, page, user.bearerToken]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = meters.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, serialNumber) => {
    const selectedIndex = selected.indexOf(serialNumber);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, serialNumber);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
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
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - meters.length) : 0;

  const filteredMeters = applySortFilter(meters, getComparator(order, orderBy), filterName);

  const isMeterNotFound = filteredMeters.length === 0;

  return (
    <Page title="Meters">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Meters
          </Typography>
        </Stack>

        <Card>
          <CustomListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            placeholder={"Search meter..."}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <CustomListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={meters.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {loading ? (
                    <TableRow style={{ height: 69 * rowsPerPage }}>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMeters.map((row, key) => {
                      const {name, serialNumber, id} = row;
                      const isItemSelected = selected.indexOf(id) !== -1;

                      return (
                        <TableRow
                          hover
                          key={key}
                          tabIndex={-1}
                          role="checkbox"
                          selected={isItemSelected}
                          aria-checked={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
                          </TableCell>
                          <TableCell align="left">{name}</TableCell>
                          <TableCell align="left">{serialNumber}</TableCell>

                          <TableCell align="right">
                            <CustomMoreMenu />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 69 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isMeterNotFound && (
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
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
