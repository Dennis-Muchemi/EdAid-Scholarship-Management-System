import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Badge
} from '@mui/material';
import { 
  AccessTime, 
  AttachMoney,
  School
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ScholarshipCard = ({ scholarship, viewMode }) => {
  const {
    _id,
    title,
    amount,
    deadline,
    category,
    description,
    applicationsCount,
    maxApplications,
    status
  } = scholarship;

  const isDeadlineSoon = () => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return daysRemaining <= 7 && daysRemaining > 0;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open': return 'success';
      case 'closing-soon': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const formatDeadline = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: viewMode === 'list' ? 'row' : 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
          <Chip
            label={status}
            color={getStatusColor()}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoney sx={{ mr: 1 }} />
            <Typography variant="body2">
              ${amount.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1 }} />
            <Typography variant="body2">
              {formatDeadline(deadline)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} />
            <Typography variant="body2">
              {category}
            </Typography>
          </Box>
        </Box>

        {viewMode === 'grid' && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}
          >
            {description}
          </Typography>
        )}

        {maxApplications && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Applications: {applicationsCount} / {maxApplications}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(applicationsCount / maxApplications) * 100}
              sx={{ mt: 1 }}
            />
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
        {isDeadlineSoon() && (
          <Chip 
            label="Deadline Soon!" 
            color="warning" 
            size="small" 
            sx={{ mr: 1 }}
          />
        )}
        <Button
          component={RouterLink}
          to={`/scholarships/${_id}`}
          variant="outlined"
          size="small"
        >
          View Details
        </Button>
        {status === 'open' && (
          <Button
            component={RouterLink}
            to={`/scholarships/${_id}/apply`}
            variant="contained"
            size="small"
          >
            Apply Now
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

ScholarshipCard.defaultProps = {
  viewMode: 'grid'
};

export default ScholarshipCard;