import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Psychology,
  Security,
  Analytics,
  Group,
  MobileFriendly,
  ColorLens,
} from '@mui/icons-material';

const Landing = () => {
  const { loginWithRedirect } = useAuth0();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'Mental Wellness Support',
      description: 'Safe space for journaling, mood tracking, and personal growth with evidence-based techniques.',
      color: '#4A90A4',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Privacy-First Design',
      description: 'Your data is encrypted, anonymized, and you control retention periods. GDPR compliant.',
      color: '#7FB3D3',
    },
    {
      icon: <Analytics sx={{ fontSize: 40 }} />,
      title: 'Personal Analytics',
      description: 'Understand patterns in your mental health journey with privacy-conscious insights.',
      color: '#A8E6CF',
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Campus Community',
      description: 'Connect with campus resources and anonymous peer support when you need it.',
      color: '#FFE66D',
    },
    {
      icon: <MobileFriendly sx={{ fontSize: 40 }} />,
      title: 'Mobile-First Experience',
      description: 'Responsive design optimized for your phone, tablet, and desktop usage.',
      color: '#FF8E53',
    },
    {
      icon: <ColorLens sx={{ fontSize: 40 }} />,
      title: 'Color Psychology',
      description: 'UI themes based on color psychology to enhance your mood and wellbeing.',
      color: '#A29BFE',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 12 }}>
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            mb: 8,
          }}
        >
          <Typography
            variant={isMobile ? 'h3' : 'h1'}
            component="h1"
            fontWeight={700}
            sx={{ mb: 3 }}
          >
            Campus Mental Health Platform
          </Typography>
          <Typography
            variant={isMobile ? 'h6' : 'h4'}
            component="h2"
            sx={{ mb: 4, opacity: 0.9, maxWidth: 800, mx: 'auto' }}
          >
            A secure, mobile-first platform for mental wellness support designed 
            specifically for campus communities
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Chip
              label="Privacy-Focused"
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label="Evidence-Based"
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label="Mobile-First"
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            <Chip
              label="MERN Stack"
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={() => loginWithRedirect()}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            Get Started with Auth0 Login
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Technology Stack */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 4, color: 'white', fontWeight: 600 }}
          >
            Built with Modern Technology
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {[
              'React', 'Node.js', 'MongoDB', 'Express', 'Auth0', 
              'Socket.io', 'Material-UI', 'Privacy-First Design'
            ].map((tech) => (
              <Grid item key={tech}>
                <Chip
                  label={tech}
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{ mb: 3, color: 'white', fontWeight: 500 }}
          >
            Ready to prioritize your mental health?
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => loginWithRedirect()}
            sx={{
              py: 1.5,
              px: 3,
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Join Our Community
          </Button>
        </Box>
      </Container>

      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.1)',
          display: { xs: 'none', md: 'block' },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 100,
          left: -75,
          width: 150,
          height: 150,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)',
          display: { xs: 'none', md: 'block' },
        }}
      />
    </Box>
  );
};

export default Landing;