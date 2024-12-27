import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Dialog,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  CheckCircle,
  Error,
  Share,
  Description,
  School,
  AttachMoney,
  Email
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ScholarshipDetails = ({ scholarship, loading, error, onApply }) => {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const {
    title,
    amount,
    deadline,
    description,
    eligibilityCriteria,
    requiredDocuments,
    category,
    status,
    contactEmail
  } = scholarship;

  const isDeadlinePassed = new Date(deadline) < new Date();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<AttachMoney />}
                  label={`$${amount.toLocaleString()}`}
                  color="primary"
                />
                <Chip
                  icon={<School />}
                  label={category}
                />
                <Chip
                  icon={<AccessTime />}
                  label={new Date(deadline).toLocaleDateString()}
                  color={isDeadlinePassed ? 'error' : 'default'}
                />
              </Box>
              <Chip
                label={status}
                color={status === 'open' ? 'success' : 'error'}
                sx={{ mr: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Description */}
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {description}
            </Typography>

            {/* Eligibility Criteria */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Eligibility Criteria
            </Typography>
            <List>
              {eligibilityCriteria.map((criterion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={criterion} />
                </ListItem>
              ))}
            </List>

            {/* Required Documents */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Required Documents
            </Typography>
            <List>
              {requiredDocuments.map((doc, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText primary={doc} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            {isDeadlinePassed ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Application deadline has passed
              </Alert>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => onApply(scholarship._id)}
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
            )}

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Share />}
              onClick={() => setShowShareDialog(true)}
              sx={{ mb: 2 }}
            >
              Share
            </Button>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">{contactEmail}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Related Scholarships */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Scholarships
            </Typography>
            {/* Add related scholarships component here */}
          </Paper>
        </Grid>
      </Grid>

      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        aria-labelledby="share-dialog-title"
      >
        {/* Add share dialog content here */}
      </Dialog>
    </Container>
  );
};

ScholarshipDetails.defaultProps = {
  loading: false,
  error: null,
  onApply: () => {}
};

export default ScholarshipDetails;