import React from 'react';
import {
   Grid,
   Paper,
   Typography,
   Box,
   List,
   ListItem,
   ListItemText,
   Chip
} from '@mui/material';

const StudentDashboard = () => {
   const applications = [
       { id: 1, scholarship: 'Merit Scholarship', status: 'Pending', amount: '$5000' },
       { id: 2, scholarship: 'Need-Based Grant', status: 'Approved', amount: '$3000' }
   ];

   return (
       <Box>
           <Typography variant="h4" gutterBottom>Student Dashboard</Typography>
           <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                   <Paper elevation={3} sx={{ p: 2 }}>
                       <Typography variant="h6" gutterBottom>My Applications</Typography>
                       <List>
                           {applications.map((app) => (
                               <ListItem key={app.id} divider>
                                   <ListItemText
                                       primary={app.scholarship}
                                       secondary={`Amount: ${app.amount}`}
                                   />
                                   <Chip
                                       label={app.status}
                                       color={app.status === 'Approved' ? 'success' : 'default'}
                                   />
                               </ListItem>
                           ))}
                       </List>
                   </Paper>
               </Grid>
           </Grid>
       </Box>
   );
};

export default StudentDashboard;