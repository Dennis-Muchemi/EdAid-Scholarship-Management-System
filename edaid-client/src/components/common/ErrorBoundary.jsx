import React from 'react';
import { Alert, Button, Box } from '@mui/material';

class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">
                        Something went wrong
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </Alert>
                </Box>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;