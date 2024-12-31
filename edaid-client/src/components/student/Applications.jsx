import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    Chip
} from '@mui/material';

const Applications = () => {
    const applications = [
        {
            id: 1,
            scholarship: 'STEM Excellence',
            amount: '$5000',
            submittedDate: '2024-03-10',
            status: 'Under Review'
        },
        // Add more mock data
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>My Applications</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Scholarship</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Submitted Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.scholarship}</TableCell>
                                <TableCell>{app.amount}</TableCell>
                                <TableCell>{app.submittedDate}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={app.status}
                                        color={app.status === 'Approved' ? 'success' : 'default'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Applications;