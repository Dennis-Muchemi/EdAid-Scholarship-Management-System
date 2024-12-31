import React from 'react';
import {
    Grid, Paper, Typography, Box
} from '@mui/material';
import {
    People, School, AssignmentTurnedIn, TrendingUp
} from '@mui/icons-material';
import { LoadingSpinner } from '../common';

const StatCard = ({ title, value, icon: Icon }) => (
    <Paper
        elevation={3}
        sx={{
            p: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
    >
        <Box>
            <Typography variant="h6" color="textSecondary">
                {title}
            </Typography>
            <Typography variant="h4">
                {value}
            </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
    </Paper>
);

const AdminDashboard = () => {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value="1,234"
                        icon={People}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Scholarships"
                        value="45"
                        icon={School}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Applications"
                        value="789"
                        icon={AssignmentTurnedIn}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Success Rate"
                        value="76%"
                        icon={TrendingUp}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;