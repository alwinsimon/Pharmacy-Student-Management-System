import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '80vh',
              textAlign: 'center',
              py: 5,
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 600, mb: 4 }}>
              We're sorry, an unexpected error occurred. Our team has been notified and is working to fix the issue.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={this.handleReset}
            >
              Go Back to Dashboard
            </Button>
            
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <Box sx={{ mt: 4, textAlign: 'left', width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Error Details:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                  }}
                >
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 