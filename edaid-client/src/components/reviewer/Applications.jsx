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
    Box
} from '@mui/material';

const Applications = () => {
    const applications = [
        {
            id: 1,
            student: 'Jane Smith',
            scholarship: 'Academic Excellence',
            submittedDate: '2024-03-14',
            status: 'Pending Review'
        },
        // Add more mock data
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Review Applications</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Scholarship</TableCell>
                            <TableCell>Submitted Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.student}</TableCell>
                                <TableCell>{app.scholarship}</TableCell>
                                <TableCell>{app.submittedDate}</TableCell>
                                <TableCell>{app.status}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        size="small"
                                    >
                                        Start Review
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