import React, { useState, useEffect } from 'react';
import { useNavigate as useNav, Link as RouterLink } from 'react-router-dom';
import { Key, Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPassword() {
  const navigate = useNav();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

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

  useEffect(() => {
    if (emailTouched) {
      validateEmail(email);
    }
  }, [email, emailTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!validateEmail(email)) return;

    setLoading(true);
    setGlobalError('');

    try {
      await forgotPassword(email);
      setLoading(false);
      navigate('/reset-password', { state: { email } });
    } catch (err: any) {
      setLoading(false);
      const rawMsg = err.response?.data?.message || err.response?.data?.error || err.message || '';
      setGlobalError(typeof rawMsg === 'string' ? rawMsg : 'Failed to request reset code');
    }
  };

  return (
    <AuthLayout type="forgot">
      <div className="max-w-sm mx-auto">
        
        {/* Top Key Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">
            <Key className="text-blue-600 w-7 h-7" />
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Heading */}
          <div className="text-left mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Forgot Password?
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <FormInput
              label="Registered Gmail Address"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={emailError}
              isValid={isEmailValid}
              disabled={loading}
            />

            {/* Send Reset Code Button */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/70 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all duration-200 mt-6 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-5 text-center">
            <RouterLink
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm font-semibold transition-colors focus:outline-none"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to login</span>
            </RouterLink>
          </div>
        </div>

        {/* Global Errors */}
        {globalError && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* Contact Support */}
        <p className="text-sm text-slate-500 text-center mt-8">
          Need help?{' '}
          <a href="#" className="text-blue-600 font-semibold hover:underline transition-colors">
            Contact Support
          </a>
        </p>

        {/* Horizontal Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-500 text-xs">BodhAI</span>
              <span className="text-slate-300">|</span>
              <span>© 2024 BodhAI Cognitive Systems.</span>
            </div>
            <div className="flex gap-3">
              <a href="#" className="hover:underline hover:text-slate-600">Privacy Policy</a>
              <a href="#" className="hover:underline hover:text-slate-600">Terms of Service</a>
              <a href="#" className="hover:underline hover:text-slate-600">Security</a>
              <a href="#" className="hover:underline hover:text-slate-600">Help Center</a>
            </div>
          </div>
        </div>

      </div>
    </AuthLayout>
  );
}
