import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

const Analytics = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Analytics
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Analytics dashboard coming soon! This will include mood trends, 
            anonymized campus statistics, and privacy-conscious insights.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Analytics;