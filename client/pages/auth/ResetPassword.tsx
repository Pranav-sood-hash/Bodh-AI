import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Key, Lock, ArrowRight, CheckCircle2, Loader2, Check } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  // Get email from router state or default to alex.weaver@gmail.com
  const email = (location.state as any)?.email || 'alex.weaver@gmail.com';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [otpTouched, setOtpTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const [otpError, setOtpError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Strength check helper
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber;

  const validateConfirmPassword = (val: string) => {
    if (!val) {
      setConfirmPasswordError('Confirm password is required');
      setIsConfirmPasswordValid(false);
      return false;
    }
    if (val !== password) {
      setConfirmPasswordError('Passwords do not match');
      setIsConfirmPasswordValid(false);
      return false;
    }
    setConfirmPasswordError('');
    setIsConfirmPasswordValid(true);
    return true;
  };

  useEffect(() => {
    if (confirmPasswordTouched || password) {
      validateConfirmPassword(confirmPassword);
    }
  }, [confirmPassword, password, confirmPasswordTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!otp || otp.length !== 6) {
      setOtpError('Enter a valid 6-digit verification code');
      return;
    }

    if (!isPasswordStrong) return;
    if (password !== confirmPassword) return;

    setLoading(true);
    setGlobalError('');

    try {
      await resetPassword({ email, otp, newPassword: password });
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setGlobalError(err.response?.data?.message || 'Invalid or expired reset code');
    }
  };

  return (
    <AuthLayout type="reset">
      {/* Top back navigation */}
      <div className="mb-4">
        <Link
          to="/login"
          className="text-slate-500 hover:text-slate-700 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Reset Icon */}
        <div className="flex justify-start mb-4">
          <div className="bg-blue-100/60 w-14 h-14 rounded-full flex items-center justify-center">
            <RefreshCw className="text-blue-500 w-6 h-6 animate-spin-slow" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-left mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Set New Password
          </h2>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            Please enter your 6-digit verification code and new password to reset your credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Verification code */}
          <FormInput
            label="6-Digit Code"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            onBlur={() => setOtpTouched(true)}
            error={otpError}
            disabled={loading || success}
          />

          {/* New Password input */}
          <div className="space-y-1">
            <FormInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              leftIcon={<Key className="w-4 h-4" />}
              disabled={loading || success}
            />

            {/* Password strength bar */}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1.5">
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setConfirmPasswordTouched(true)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={confirmPasswordError}
              isValid={isConfirmPasswordValid && password.length > 0}
              disabled={loading || success}
            />

            {/* Inline success state for match */}
            {isConfirmPasswordValid && password.length > 0 && (
              <p className="text-green-600 text-xs font-semibold flex items-center gap-1 mt-1 animate-pulse">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Passwords match ✓</span>
              </p>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || success || !isPasswordStrong || password !== confirmPassword}
            className={`w-full font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-200 shadow-md mt-6
              ${success 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Password Updated! ✓</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {globalError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5 animate-shake">
            <Check className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Contact Support */}
        <p className="text-sm text-slate-500 text-center mt-6">
          Need help?{' '}
          <a href="#" className="text-blue-600 font-semibold hover:underline transition-colors">
            Contact Support
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
