import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        Profile & Settings
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Profile management coming soon! This will include privacy settings, 
            color theme preferences, and data export capabilities.
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;