import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

const Journal = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Journal
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Structured journaling module coming soon! This will include mood tracking, 
            color psychology integration, and privacy-conscious data capture.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Journal;