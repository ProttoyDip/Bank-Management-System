import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "left" | "right" | "center";
  format?: (value: any) => string;
}

interface DataTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
}

export default function DataTable({ columns, rows, onRowClick, onEdit, onDelete, onView }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (!orderBy) return 0;
    const aVal = a[orderBy];
    const bVal = b[orderBy];
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ width: "100%", overflow: "hidden" }}>
      {/* Search and Filter Bar */}
      <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder="Search..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 600, bgcolor: "background.default" }}
                >
                  {column.id !== "actions" ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) => (
              <TableRow
                hover
                key={row.id}
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? "pointer" : "default" }}
              >
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value) : value}
                    </TableCell>
                  );
                })}
                {onEdit || onDelete || onView ? (
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuOpen(e, row); }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {onView && (
          <MenuItem onClick={() => { handleMenuClose(); onView(selectedRow); }}>
            View
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => { handleMenuClose(); onEdit(selectedRow); }}>
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => { handleMenuClose(); onDelete(selectedRow); }} sx={{ color: "error.main" }}>
            Delete
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}

