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

const ApplicationReview = () => {
    const applications = [
        {
            id: 1,
            student: 'John Doe',
            scholarship: 'Merit Scholarship',
            submittedDate: '2024-03-15',
            status: 'Pending'
        },
        // Add more mock data
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Application Review</Typography>
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
                                    <Button variant="contained" size="small">
                                        Review
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

export default ApplicationReview;