import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../services/api';

interface AdminSetting {
  id?: number;
  settingKey: string;
  settingValue: string | null;
  description?: string | null;
  updatedAt?: string;
}

interface SettingsForm {
  minimumBalance: string;
  transactionLimit: string;
  transferFee: string;
  loanInterestRate: string;
  fraudDetectionThreshold: string;
}

const MotionCard = motion(Card);

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<SettingsForm>({
    minimumBalance: '',
    transactionLimit: '',
    transferFee: '',
    loanInterestRate: '',
    fraudDetectionThreshold: '',
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/settings');
      const settingsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setSettings(settingsData);

      // Populate form with existing settings
      const newForm: SettingsForm = {
        minimumBalance: '',
        transactionLimit: '',
        transferFee: '',
        loanInterestRate: '',
        fraudDetectionThreshold: '',
      };

      settingsData.forEach((setting: AdminSetting) => {
        switch (setting.settingKey) {
          case 'minimumBalance':
            newForm.minimumBalance = setting.settingValue || '';
            break;
          case 'transactionLimit':
            newForm.transactionLimit = setting.settingValue || '';
            break;
          case 'transferFee':
            newForm.transferFee = setting.settingValue || '';
            break;
          case 'loanInterestRate':
            newForm.loanInterestRate = setting.settingValue || '';
            break;
          case 'fraudDetectionThreshold':
            newForm.fraudDetectionThreshold = setting.settingValue || '';
            break;
        }
      });

      setForm(newForm);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');

      const settingsToUpdate = [
        {
          settingKey: 'minimumBalance',
          settingValue: form.minimumBalance,
          description: 'Minimum balance required for accounts',
        },
        {
          settingKey: 'transactionLimit',
          settingValue: form.transactionLimit,
          description: 'Maximum transaction amount per transaction',
        },
        {
          settingKey: 'transferFee',
          settingValue: form.transferFee,
          description: 'Fee charged for fund transfers',
        },
        {
          settingKey: 'loanInterestRate',
          settingValue: form.loanInterestRate,
          description: 'Default interest rate for loans',
        },
        {
          settingKey: 'fraudDetectionThreshold',
          settingValue: form.fraudDetectionThreshold,
          description: 'Amount threshold for fraud detection alerts',
        },
      ];

      await api.put('/admin/settings', { settings: settingsToUpdate });
      setMessage('Settings saved successfully.');
      await loadSettings();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SettingsForm) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Box>
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          System Settings
        </Typography>
        <Typography color="text.secondary">
          Configure system-wide banking parameters and thresholds.
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {loading ? (
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Loading settings...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} lg={6}>
            <MotionCard
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <SettingsIcon color="primary" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Account Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure account-related parameters
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Minimum Balance (BDT)"
                    type="number"
                    value={form.minimumBalance}
                    onChange={handleInputChange('minimumBalance')}
                    placeholder="e.g., 1000"
                    helperText="Minimum balance required to maintain in accounts"
                  />
                  <TextField
                    fullWidth
                    label="Transaction Limit (BDT)"
                    type="number"
                    value={form.transactionLimit}
                    onChange={handleInputChange('transactionLimit')}
                    placeholder="e.g., 100000"
                    helperText="Maximum amount per single transaction"
                  />
                  <TextField
                    fullWidth
                    label="Transfer Fee (BDT)"
                    type="number"
                    value={form.transferFee}
                    onChange={handleInputChange('transferFee')}
                    placeholder="e.g., 10"
                    helperText="Fee charged for fund transfers"
                  />
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Loan & Fraud Settings */}
          <Grid item xs={12} lg={6}>
            <MotionCard
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <SettingsIcon color="primary" />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Loan & Security Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure loan and fraud detection parameters
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Loan Interest Rate (%)"
                    type="number"
                    value={form.loanInterestRate}
                    onChange={handleInputChange('loanInterestRate')}
                    placeholder="e.g., 12.5"
                    helperText="Default annual interest rate for loans"
                  />
                  <TextField
                    fullWidth
                    label="Fraud Detection Threshold (BDT)"
                    type="number"
                    value={form.fraudDetectionThreshold}
                    onChange={handleInputChange('fraudDetectionThreshold')}
                    placeholder="e.g., 50000"
                    helperText="Amount threshold for flagging suspicious transactions"
                  />
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Grid>

          {/* Current Settings Display */}
          <Grid item xs={12}>
            <MotionCard
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Current Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {settings.length > 0 ? (
                  <Stack spacing={2}>
                    {settings.map((setting) => (
                      <Box
                        key={setting.settingKey}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {setting.settingKey}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {setting.description || 'No description'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {setting.settingValue || 'Not set'}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No settings configured yet.</Typography>
                )}
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminSettingsPage;
