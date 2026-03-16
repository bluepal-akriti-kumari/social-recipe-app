import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, Alert, CircularProgress, Divider
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import type { AppDispatch } from '../../store/store';
import { registerThunk } from '../../features/auth/authThunks';
import { useAuth } from '../../hooks/useAuth';
import { clearError } from '../../features/auth/authSlice';
import { useEffect } from 'react';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAuth();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>();

  useEffect(() => {
    if (isAuthenticated) navigate('/feed', { replace: true });
    return () => { dispatch(clearError()); };
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = (data: RegisterFormValues) => {
    dispatch(registerThunk({ username: data.username, email: data.email, password: data.password }) as any);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4 py-8">
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', p: 1.5, display: 'inline-flex', mb: 1 }}>
              <PersonAddOutlinedIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join our community of food lovers</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth label="Username" margin="normal"
              {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 characters' } })}
              error={!!errors.username} helperText={errors.username?.message}
            />
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
              })}
              error={!!errors.email} helperText={errors.email?.message}
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
              error={!!errors.password} helperText={errors.password?.message}
            />
            <TextField
              fullWidth label="Confirm Password" type="password" margin="normal"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: val => val === watch('password') || 'Passwords do not match'
              })}
              error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography align="center" variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
