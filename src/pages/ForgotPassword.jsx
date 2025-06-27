import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { authAPI } from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setMessage('If this email is registered, a password reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #e0f2f1 0%, #bbf7d0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 400,
          height: 400,
          zIndex: 0,
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="200" fill="#16a34a" />
        </svg>
      </Box>
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(22,163,74,0.15)',
          border: '1.5px solid #bbf7d0',
          background: 'rgba(255,255,255,0.97)',
          zIndex: 1,
          animation: 'fadeInUp 0.7s cubic-bezier(.39,.575,.56,1) both',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <img
            src="/images/logo.svg"
            alt="Sugarcane Monitoring Logo"
            style={{ height: 56, marginBottom: 8 }}
          />
          <Typography
            variant="h5"
            fontWeight="bold"
            color="#16a34a"
            mb={0.5}
            sx={{ letterSpacing: 1 }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="subtitle2"
            color="#15803d"
            fontWeight={500}
            sx={{ mb: 1.5 }}
          >
            Enter your email to receive a password reset link.
          </Typography>
        </Box>
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoFocus
            InputLabelProps={{ style: { color: '#16a34a' } }}
            InputProps={{
              style: { borderRadius: 8, background: '#f0fdf4' },
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mb: 2, mt: 1 }}>
              {message}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: '1.1rem',
              background: 'linear-gradient(90deg, #16a34a 0%, #15803d 100%)',
              boxShadow: '0 2px 8px 0 rgba(22,163,74,0.10)',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                background: 'linear-gradient(90deg, #15803d 0%, #16a34a 100%)',
              },
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                color: '#16a34a',
                fontWeight: 600,
                textDecoration: 'underline',
                transition: 'color 0.2s',
              }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(40px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}

export default ForgotPassword;