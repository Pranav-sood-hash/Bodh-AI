import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Edit2, ArrowLeft, Info, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { OTPInput } from '../../components/auth/OTPInput';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendOTP } = useAuth();

  const email = (location.state as any)?.email || '';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto trigger verification when 6 digits are typed
  const handleVerify = async (otpStr: string) => {
    if (otpStr.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, otpStr);
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
      await resendOTP(email, 'EMAIL_VERIFICATION');
    } catch (err) {
      // Error is caught by global handler / logger
    }
  };

  if (!email) {
    return (
      <AuthLayout type="verify">
        <div className="text-center">
          <p className="text-red-500">Invalid session. Please sign up again.</p>
          <Link to="/signup" className="text-blue-600 mt-4 block">Return to Sign Up</Link>
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
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border border-white"></span>
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Verify Your Gmail
          </h2>
          <p className="text-slate-500 text-sm mt-3.5 leading-relaxed">
            We've sent a 6-digit verification code to{' '}
            <span className="text-slate-900 font-semibold">{email}</span>.
            Please enter it below to proceed.
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
              <span>Account Verified! Redirecting...</span>
            </div>
          )}
        </div>

        {/* Spam Box Notification */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-slate-500 text-xs leading-relaxed">
            Didn't see an email? Check your <span className="font-bold text-slate-700">Spam</span> or{' '}
            <span className="font-bold text-slate-700">Promotions</span> folder, or try resending the code after the timer expires.
          </p>
        </div>

        {/* Links Navigation */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full">
          <Link
            to="/signup"
            className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Email Address</span>
          </Link>
          <Link
            to="/signup"
            className="text-slate-500 text-sm font-medium hover:text-slate-800 flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign Up</span>
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}
