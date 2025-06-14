import { filter } from 'lodash';
import { useEffect, useState } from 'react';
import superagent from 'superagent';
import PropTypes from 'prop-types';
// material
import {
  Card,
  Checkbox,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
// components
import { sentenceCase } from 'change-case';
import Scrollbar from './Scrollbar';
import SearchNotFound from './SearchNotFound';
import MetersListHead from './MetersListHead';
import MetersListToolbar from './MetersListToolbar';
import MetersMoreMenu from './MetersMoreMenu';

import { EMC_METERS_V1 } from '../config';
import useAuth from '../hooks/useAuth';
import Label from './Label';
import Iconify from './Iconify';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'serialNumber', label: 'Serial Number', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
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

export default function UserMetersTable({ forUserId }) {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [meters, setMeters] = useState([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState({});

  const { getUser } = useAuth();

  const user = getUser();

  const targetUserId = forUserId || user.id;

  useEffect(() => {
    setLoading(true);
    superagent
      .get(`${EMC_METERS_V1}/users/${targetUserId}/meters`)
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
  }, [rowsPerPage, page, user, targetUserId]);

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

  const handleEditClickWithMeter =
    (editingMeter) =>
    ({ setIsOpen }) => {
      setEditing({ [editingMeter.id]: editingMeter.name || '' });
      setIsOpen(false);
    };

  const handleConfirmEditClick = (editingMeter) => {
    const newName = editing[editingMeter.id];
    superagent
      .patch(`${EMC_METERS_V1}/users/${targetUserId}/meters/${editingMeter.id}`)
      .set('Authorization', `Bearer ${user.bearerToken}`)
      .send({
        name: newName,
      })
      .then(() => {
        setMeters(
          meters.map((meter) => {
            if (meter.id === editingMeter.id) {
              return { ...meter, name: newName };
            }
            return meter;
          })
        );
        setEditing((prevEditing) => {
          const newEditing = { ...prevEditing };
          delete newEditing[editingMeter.id];
          return newEditing;
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  function handleNameChange(id, event) {
    let name = event.target.value;
    if (name.length > 50) {
      name = name.slice(0, 50);
    }
    setEditing((prev) => ({ ...prev, [id]: name }));
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - meters.length) : 0;

  const filteredMeters = applySortFilter(meters, getComparator(order, orderBy), filterName);

  const isMeterNotFound = filteredMeters.length === 0;

  return (
    <Card>
      <MetersListToolbar
        numSelected={selected.length}
        filterName={filterName}
        onFilterName={handleFilterByName}
        placeholder={'Search meter...'}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <MetersListHead
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
                  const { name, serialNumber, status, id } = row;
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
                      <TableCell align="left" >
                        {Object.prototype.hasOwnProperty.call(editing, id) ? (
                          <TextField
                            // label="Name"
                            variant="outlined"
                            size="small"
                            value={editing[id] || ''}
                            onChange={(event) => handleNameChange(id, event)}
                          />
                        ) : (
                          name
                        )}
                      </TableCell>
                      <TableCell align="left">{serialNumber}</TableCell>
                      <TableCell align="left">
                        <Label variant="ghost" color={(status.id === 2 && 'error') || 'success'}>
                          {sentenceCase(status.name)}
                        </Label>
                      </TableCell>

                      <TableCell align="right">
                        {Object.prototype.hasOwnProperty.call(editing, id) ? (
                          <IconButton onClick={() => handleConfirmEditClick(row)}>
                            <Iconify icon="eva:checkmark-fill" width={20} height={20} />
                          </IconButton>
                        ) : (
                          <MetersMoreMenu onEditClick={handleEditClickWithMeter(row)} />
                        )}
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
  );
}

UserMetersTable.propTypes = {
  forUserId: PropTypes.number,
};
