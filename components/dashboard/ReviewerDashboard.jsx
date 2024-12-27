import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
  Badge,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Assignment,
  Assessment,
  CheckCircle,
  Visibility,
  Notes
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ReviewerDashboard = ({ reviewer }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    reviewed: 0,
    approved: 0,
    rejected: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // API calls to fetch reviewer data
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Reviewer Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Badge badgeContent={stats.pending} color="warning">
              <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
            </Badge>
            <Typography variant="h6">Pending Reviews</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.reviewed}</Typography>
            <Typography variant="h6">Completed Reviews</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.approved}</Typography>
            <Typography variant="h6">Approved</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.rejected}</Typography>
            <Typography variant="h6">Rejected</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search applications..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <Search />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter Status</InputLabel>
              <Select value={filter} onChange={handleFilterChange}>
                <MenuItem value="all">All Applications</MenuItem>
                <MenuItem value="pending">Pending Review</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="flagged">Flagged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Application ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Scholarship</TableCell>
              <TableCell>Submitted Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>{application._id}</TableCell>
                <TableCell>{application.studentName}</TableCell>
                <TableCell>{application.scholarshipTitle}</TableCell>
                <TableCell>
                  {new Date(application.submittedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={application.status}
                    color={
                      application.status === 'pending' ? 'warning' :
                      application.status === 'approved' ? 'success' :
                      application.status === 'rejected' ? 'error' :
                      'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    component={RouterLink}
                    to={`/review/${application._id}`}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleAddNote(application._id)}>
                    <Notes />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Performance Metrics */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Review Performance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">Average Review Time</Typography>
            <Typography variant="h6">2.5 hours</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">Reviews This Week</Typography>
            <Typography variant="h6">15</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2">Accuracy Rate</Typography>
            <Typography variant="h6">95%</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReviewerDashboard;