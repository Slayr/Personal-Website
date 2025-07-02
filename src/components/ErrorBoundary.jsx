import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Paper sx={{ p: 4, maxWidth: 600, width: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h4" color="error" gutterBottom>Something went wrong.</Typography>
            <Typography variant="body1">We're sorry, but an unexpected error occurred.</Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2, p: 2, border: '1px solid red', overflow: 'auto' }}>
                <Typography variant="h6">Error Details:</Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
