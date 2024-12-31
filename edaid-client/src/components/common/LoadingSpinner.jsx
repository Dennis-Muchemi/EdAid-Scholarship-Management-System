import { CircularProgress, Box } from '@mui/material';

export const LoadingSpinner = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
    </Box>
);