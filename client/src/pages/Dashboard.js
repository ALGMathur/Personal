import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  Analytics,
  Add,
} from '@mui/icons-material';

const Dashboard = ({ user }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await getAccessTokenSilently();
      
      // Fetch mood stats
      const statsResponse = await fetch('/api/journal/stats/mood?days=30', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent journal entries
      const entriesResponse = await fetch('/api/journal?limit=3', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setRecentEntries(entriesData.entries);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Welcome back, {user?.displayName || 'Friend'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your mental wellness overview for the past 30 days.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Mood Average</Typography>
              </Box>
              <Typography variant="h3" color="primary.main" fontWeight={600}>
                {stats?.avgMood ? stats.avgMood.toFixed(1) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of 10 (last 30 days)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Psychology />
                </Avatar>
                <Typography variant="h6">Journal Entries</Typography>
              </Box>
              <Typography variant="h3" color="secondary.main" fontWeight={600}>
                {stats?.totalEntries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entries this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Analytics />
                </Avatar>
                <Typography variant="h6">Stress Level</Typography>
              </Box>
              <Typography variant="h3" color="success.main" fontWeight={600}>
                {stats?.avgStress ? stats.avgStress.toFixed(1) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average stress (1-10)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  href="/journal"
                  sx={{ minWidth: 200 }}
                >
                  New Journal Entry
                </Button>
                <Button
                  variant="outlined"
                  href="/analytics"
                  sx={{ minWidth: 200 }}
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  href="/profile"
                  sx={{ minWidth: 200 }}
                >
                  Update Preferences
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Entries */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Journal Entries
              </Typography>
              {recentEntries.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {recentEntries.map((entry, index) => (
                    <Box
                      key={entry._id}
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={`Mood: ${entry.entry.mood.scale}/10`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {entry.entry.content.substring(0, 150)}
                        {entry.entry.content.length > 150 && '...'}
                      </Typography>
                      {entry.entry.mood.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {entry.entry.mood.tags.map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                  <Button href="/journal" variant="text">
                    View All Entries
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No journal entries yet. Start your mental health journey by creating your first entry!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;