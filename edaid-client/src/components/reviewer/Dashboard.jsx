import React from 'react';
import {
   Grid,
   Paper,
   Typography,
   Box,
   List,
   ListItem,
   ListItemText,
   Button
} from '@mui/material';

const ReviewerDashboard = () => {
   const pendingApplications = [
       { id: 1, student: 'John Doe', scholarship: 'Merit Scholarship', submitted: '2024-03-15' },
       { id: 2, student: 'Jane Smith', scholarship: 'Need-Based Grant', submitted: '2024-03-14' }
   ];

   return (
       <Box>
           <Typography variant="h4" gutterBottom>Reviewer Dashboard</Typography>
           <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                   <Paper elevation={3} sx={{ p: 2 }}>
                       <Typography variant="h6" gutterBottom>Pending Reviews</Typography>
                       <List>
                           {pendingApplications.map((app) => (
                               <ListItem key={app.id} divider>
                                   <ListItemText
                                       primary={app.student}
                                       secondary={`${app.scholarship} - Submitted: ${app.submitted}`}
                                   />
                                   <Button variant="contained" size="small">
                                       Review
                                   </Button>
                               </ListItem>
                           ))}
                       </List>
                   </Paper>
               </Grid>
           </Grid>
       </Box>
   );
};

export default ReviewerDashboard;