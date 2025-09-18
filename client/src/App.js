import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Navigation from './components/Navigation';
import Loading from './components/Loading';
import PrivacyConsent from './components/PrivacyConsent';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Hooks and Utils
import { useColorTheme } from './hooks/useColorTheme';
import { SocketProvider } from './hooks/useSocket';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [user, setUser] = useState(null);
  const [needsConsent, setNeedsConsent] = useState(false);
  const { theme, colorTheme } = useColorTheme();

  // Create Material-UI theme based on color psychology
  const muiTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: theme.primary,
      },
      secondary: {
        main: theme.secondary,
      },
      background: {
        default: theme.background,
        paper: theme.surface,
      },
      text: {
        primary: theme.text,
        secondary: theme.textSecondary,
      },
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
      h1: {
        fontFamily: 'Poppins, Inter, sans-serif',
        fontWeight: 600,
      },
      h2: {
        fontFamily: 'Poppins, Inter, sans-serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: 'Poppins, Inter, sans-serif',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 500,
            minHeight: 44, // Mobile accessibility
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.requiresConsent) {
          setNeedsConsent(true);
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleConsentComplete = (userData) => {
    setUser(userData);
    setNeedsConsent(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className={`theme-${colorTheme}`}>
        <Router>
          {isAuthenticated && needsConsent && (
            <PrivacyConsent onConsentComplete={handleConsentComplete} />
          )}
          
          {isAuthenticated && !needsConsent && (
            <SocketProvider>
              <Navigation user={user} />
            </SocketProvider>
          )}
          
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated && !needsConsent ? (
                  <ProtectedRoute>
                    <Dashboard user={user} />
                  </ProtectedRoute>
                ) : (
                  <Landing />
                )
              } 
            />
            <Route 
              path="/journal" 
              element={
                <ProtectedRoute>
                  <Journal user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;