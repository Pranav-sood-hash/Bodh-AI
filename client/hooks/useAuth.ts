import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', data);
      navigate('/verify-email', {
        state: { email: data.email, type: 'EMAIL_VERIFICATION' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-email', { email, otp });
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await api.post('/auth/login', data);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error;
      if (msg?.includes('verify your email')) {
        navigate('/verify-email', {
          state: { email: data.email, type: 'EMAIL_VERIFICATION' }
        });
        return;
      }
      setError(msg || 'Login failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      navigate('/verify-reset-otp', {
        state: { email, type: 'PASSWORD_RESET' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Request failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
      navigate('/reset-password', {
        state: { email, resetToken: data.data.resetToken }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', data);
      navigate('/login', {
        state: { success: 'Password updated. Please sign in.' }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Reset failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email: string, type: string) => {
    try {
      await api.post('/auth/resend-otp', { email, type });
    } catch (err: any) {
      const msg = err.response?.data?.error || '';
      if (msg.includes('Please wait')) {
        throw new Error(msg);
      }
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return {
    loading, error, setError,
    register, verifyEmail, login,
    forgotPassword, verifyResetOTP,
    resetPassword, resendOTP, logout
  };
};
