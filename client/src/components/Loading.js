import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: '#4A90A4',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: '#2C3E50',
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;