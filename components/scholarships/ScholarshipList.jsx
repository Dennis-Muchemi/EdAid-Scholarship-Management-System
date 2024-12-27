import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  CircularProgress,
  Pagination,
  IconButton,
  Card
} from '@mui/material';
import { ViewList, ViewModule, Search } from '@mui/icons-material';
import ScholarshipCard from './ScholarshipCard';

const ScholarshipList = ({ 
  scholarships, 
  loading, 
  totalPages,
  onPageChange,
  onSearch,
  onFilter,
  onSort 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [page, setPage] = useState(1);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value);
  };

  const handleFilter = (event) => {
    setFilter(event.target.value);
    onFilter(event.target.value);
  };

  const handleSort = (event) => {
    setSortBy(event.target.value);
    onSort(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    onPageChange(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Controls Bar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search scholarships..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <Search />
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter By</InputLabel>
          <Select value={filter} onChange={handleFilter} label="Filter By">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closing-soon">Closing Soon</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} onChange={handleSort} label="Sort By">
            <MenuItem value="deadline">Deadline</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <IconButton 
            onClick={() => setViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ViewList />
          </IconButton>
          <IconButton 
            onClick={() => setViewMode('grid')}
            color={viewMode === 'grid' ? 'primary' : 'default'}
          >
            <ViewModule />
          </IconButton>
        </Box>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : scholarships.length === 0 ? (
        // Empty State
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No scholarships found
          </Typography>
        </Box>
      ) : (
        // Scholarship List/Grid
        <Grid container spacing={3}>
          {scholarships.map((scholarship) => (
            <Grid 
              item 
              key={scholarship._id}
              xs={12} 
              md={viewMode === 'grid' ? 4 : 12}
            >
              <ScholarshipCard 
                scholarship={scholarship}
                viewMode={viewMode}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

ScholarshipList.defaultProps = {
  scholarships: [],
  loading: false,
  totalPages: 1,
  onPageChange: () => {},
  onSearch: () => {},
  onFilter: () => {},
  onSort: () => {}
};

export default ScholarshipList;