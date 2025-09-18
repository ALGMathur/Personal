import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Slider,
  Box,
  Alert,
  Paper,
} from '@mui/material';

const PrivacyConsent = ({ onConsentComplete }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    analyticsOptIn: false,
    shareAnonymizedData: false,
    dataRetention: 365,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const token = await getAccessTokenSilently();
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          consentVersion: '1.0',
          ...formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onConsentComplete(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save consent preferences');
      }
    } catch (error) {
      console.error('Consent error:', error);
      setError('An error occurred while saving your preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="h2" fontWeight={600} color="primary">
          Privacy & Consent
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your privacy is important to us. Please review and customize your data preferences.
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            Data Collection & Usage
          </Typography>
          
          <Typography variant="body2" paragraph>
            We collect minimal data necessary to provide mental health support. 
            All personal information is encrypted and stored securely.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.analyticsOptIn}
                onChange={handleChange('analyticsOptIn')}
                color="primary"
              />
            }
            label="Enable personal analytics to track mood patterns and insights"
            sx={{ mb: 2, display: 'block' }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.shareAnonymizedData}
                onChange={handleChange('shareAnonymizedData')}
                color="primary"
              />
            }
            label="Share anonymized data to help improve campus mental health services"
            sx={{ mb: 3, display: 'block' }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Data Retention Period
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            How long should we keep your data? (30 days - 3 years)
          </Typography>
          
          <Box sx={{ px: 2 }}>
            <Slider
              value={formData.dataRetention}
              onChange={(_, value) => setFormData(prev => ({ ...prev, dataRetention: value }))}
              min={30}
              max={1095}
              step={30}
              marks={[
                { value: 30, label: '1 month' },
                { value: 365, label: '1 year' },
                { value: 1095, label: '3 years' },
              ]}
              valueLabelDisplay="on"
              valueLabelFormat={(value) => `${Math.round(value / 30)} months`}
            />
          </Box>
        </Paper>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Your Rights:</strong> You can update these preferences anytime, 
            export your data, or delete your account from your profile settings.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          sx={{ py: 1.5 }}
        >
          {loading ? 'Saving Preferences...' : 'Accept & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrivacyConsent;