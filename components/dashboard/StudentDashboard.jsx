import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  School,
  Assignment,
  Notifications,
  Description,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const StudentDashboard = ({ student }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    applications: [],
    recommendations: [],
    deadlines: [],
    profileCompletion: 0,
    notifications: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // API call to fetch dashboard data
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Message */}
      <Typography variant="h4" gutterBottom>
        Welcome back, {student.firstName}!
      </Typography>

      {/* Status Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Applications</Typography>
            <Typography variant="h4">{dashboardData.applications.length}</Typography>
            <Typography color="text.secondary">Total Applications</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Profile</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={dashboardData.profileCompletion} 
                />
              </Box>
              <Typography variant="body2">
                {dashboardData.profileCompletion}%
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Documents</Typography>
            <Typography variant="h4">
              {student.documents ? student.documents.length : 0}
            </Typography>
            <Typography color="text.secondary">Uploaded Documents</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>Notifications</Typography>
            <Typography variant="h4">
              {dashboardData.notifications.length}
            </Typography>
            <Typography color="text.secondary">Unread Notifications</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Active Applications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Applications
            </Typography>
            <List>
              {dashboardData.applications.map((application) => (
                <ListItem
                  key={application._id}
                  secondaryAction={
                    <Chip 
                      label={application.status} 
                      color={application.status === 'pending' ? 'warning' : 'success'}
                    />
                  }
                >
                  <ListItemText
                    primary={application.scholarshipTitle}
                    secondary={`Submitted: ${new Date(application.submittedDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
            <Button 
              component={RouterLink}
              to="/applications"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              View All Applications
            </Button>
          </Paper>
        </Grid>

        {/* Recommended Scholarships */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Scholarships
            </Typography>
            <List>
              {dashboardData.recommendations.map((scholarship) => (
                <ListItem
                  key={scholarship._id}
                  secondaryAction={
                    <Button 
                      component={RouterLink}
                      to={`/scholarships/${scholarship._id}`}
                      variant="contained"
                      size="small"
                    >
                      Apply
                    </Button>
                  }
                >
                  <ListItemText
                    primary={scholarship.title}
                    secondary={`Amount: $${scholarship.amount.toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Deadlines
            </Typography>
            <Grid container spacing={2}>
              {dashboardData.deadlines.map((deadline) => (
                <Grid item xs={12} sm={6} md={4} key={deadline._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{deadline.scholarshipTitle}</Typography>
                      <Typography color="error">
                        Deadline: {new Date(deadline.date).toLocaleDateString()}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to={`/scholarships/${deadline.scholarshipId}`}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;