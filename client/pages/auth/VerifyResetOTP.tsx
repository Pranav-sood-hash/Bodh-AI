import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { OTPInput } from '../../components/auth/OTPInput';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyResetOTP() {
  const location = useLocation();
  const { verifyResetOTP, resendOTP } = useAuth();

  const email = (location.state as any)?.email || '';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (otpStr: string) => {
    if (otpStr.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      await verifyResetOTP(email, otpStr);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      const rawMsg = err.response?.data?.message || err.response?.data?.error || err.message || '';
      setError(typeof rawMsg === 'string' ? rawMsg : 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(email, 'PASSWORD_RESET');
    } catch (err) {
      // Error is caught by global handler / logger
    }
  };

  if (!email) {
    return (
      <AuthLayout type="verify">
        <div className="text-center">
          <p className="text-red-500">Invalid session. Please request a new password reset.</p>
          <Link to="/forgot-password" className="text-blue-600 mt-4 block">Back to Forgot Password</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout type="verify">
      <div className="max-w-sm mx-auto flex flex-col items-center">
        
        {/* Verification Icon Header */}
        <div className="relative mb-6">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
            <Mail className="text-blue-600 w-9 h-9" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Verify Reset Code
          </h2>
          <p className="text-slate-500 text-sm mt-3.5 leading-relaxed">
            We've sent a 6-digit code to{' '}
            <span className="text-slate-900 font-semibold">{email}</span>.
            Enter it below to reset your password.
          </p>
        </div>

        <div className="w-full space-y-6">
          <OTPInput
            onComplete={handleVerify}
            onResend={handleResend}
            loading={loading || success}
            error={error}
          />

          {success && (
            <div className="bg-green-600 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified! Proceeding to reset...</span>
            </div>
          )}
        </div>

        {/* Links Navigation */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full">
          <Link
            to="/forgot-password"
            className="text-slate-500 text-sm font-medium hover:text-slate-800 flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
