import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import { GoogleButton } from '../../components/auth/GoogleButton';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field validation and touched states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Form level states
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email format validation
  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email address is required');
      setIsEmailValid(false);
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) {
      setEmailError('Please enter a valid email address');
      setIsEmailValid(false);
      return false;
    }
    setEmailError('');
    setIsEmailValid(true);
    return true;
  };

  // Password validation
  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Check email on change if touched
  useEffect(() => {
    if (emailTouched) {
      validateEmail(email);
    }
  }, [email, emailTouched]);

  // Check password on change if touched
  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    const emailOk = validateEmail(email);
    const passOk = validatePassword(password);

    if (!emailOk || !passOk) return;

    setLoading(true);
    setFormError('');

    try {
      await login({ email, password });
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      const rawMsg = err.response?.data?.message || err.response?.data?.error || err.message || '';
      const errMsg = typeof rawMsg === 'string' ? rawMsg : '';
      if (errMsg.toLowerCase().includes('verify')) {
        setFormError('not_verified');
      } else if (errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('invalid')) {
        setFormError('wrong_password');
      } else if (err.response?.status === 404) {
        setFormError('not_registered');
      } else {
        setFormError(errMsg || 'An error occurred. Please try again.');
      }
    }
  };

  const handleGoogleClick = () => {
    // OAuth flow redirect or simulation
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };


  return (
    <AuthLayout type="login">
      {/* Welcome Header */}
      <div className="text-left">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome Back
        </h2>
        <p className="text-slate-500 text-sm mt-1.5">
          Enter your credentials to access your thinking space.
        </p>
      </div>

      {/* Google Sign In */}
      <div className="mt-8">
        <GoogleButton mode="login" />
      </div>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <span className="relative px-3 bg-slate-50 text-xs text-slate-400 font-medium uppercase tracking-wider">
          or sign in with email
        </span>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          leftIcon={<Mail className="w-4 h-4" />}
          error={emailError}
          isValid={isEmailValid}
          disabled={loading}
        />

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-600 hover:underline hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <FormInput
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordError}
            disabled={loading}
          />
        </div>

        {/* Remember me row */}
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 select-none cursor-pointer">
            Remember me
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white font-semibold text-base rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Global Form Errors */}
      {formError && (
        <div className="mt-5 animate-shake">
          {formError === 'wrong_password' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Incorrect password. Please try again.</span>
            </div>
          )}
          {formError === 'not_verified' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>Your email is not verified yet. </span>
                <Link to="/verify-email" state={{ email }} className="font-bold underline hover:text-amber-900">
                  Verify your email now →
                </Link>
              </div>
            </div>
          )}
          {formError === 'not_registered' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>No account found with this email. </span>
                <Link to="/signup" className="font-bold underline hover:text-red-800">
                  Create a new account →
                </Link>
              </div>
            </div>
          )}
          {formError !== 'wrong_password' && formError !== 'not_verified' && formError !== 'not_registered' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{formError}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Text Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
