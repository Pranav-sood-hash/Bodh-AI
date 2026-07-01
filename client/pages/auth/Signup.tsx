import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import FormInput from '../../components/auth/FormInput';
import { GoogleButton } from '../../components/auth/GoogleButton';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { useAuth } from '../../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Touched states
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [termsTouched, setTermsTouched] = useState(false);

  // Field error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

  // Valid states
  const [isFirstNameValid, setIsFirstNameValid] = useState(false);
  const [isLastNameValid, setIsLastNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);

  // Global states
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // Real-time validations
  const validateFirstName = (val: string) => {
    if (!val) {
      setFirstNameError('First name is required');
      setIsFirstNameValid(false);
      return false;
    }
    if (val.length < 2) {
      setFirstNameError('Must be at least 2 characters');
      setIsFirstNameValid(false);
      return false;
    }
    if (!/^[A-Za-z]+$/.test(val)) {
      setFirstNameError('Enter a valid first name');
      setIsFirstNameValid(false);
      return false;
    }
    setFirstNameError('');
    setIsFirstNameValid(true);
    return true;
  };

  const validateLastName = (val: string) => {
    if (!val) {
      setLastNameError('Last name is required');
      setIsLastNameValid(false);
      return false;
    }
    if (val.length < 2) {
      setLastNameError('Must be at least 2 characters');
      setIsLastNameValid(false);
      return false;
    }
    if (!/^[A-Za-z]+$/.test(val)) {
      setLastNameError('Enter a valid last name');
      setIsLastNameValid(false);
      return false;
    }
    setLastNameError('');
    setIsLastNameValid(true);
    return true;
  };

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

  // Trigger checks
  useEffect(() => {
    if (firstNameTouched) validateFirstName(firstName);
  }, [firstName, firstNameTouched]);

  useEffect(() => {
    if (lastNameTouched) validateLastName(lastName);
  }, [lastName, lastNameTouched]);

  useEffect(() => {
    if (emailTouched) validateEmail(email);
  }, [email, emailTouched]);

  useEffect(() => {
    if (confirmPasswordTouched || password) {
      validateConfirmPassword(confirmPassword);
    }
  }, [confirmPassword, password, confirmPasswordTouched]);

  useEffect(() => {
    if (termsTouched) {
      if (!agreeTerms) {
        setTermsError('Please accept terms to continue');
      } else {
        setTermsError('');
      }
    }
  }, [agreeTerms, termsTouched]);

  // Assessment of full form validity
  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    isConfirmPasswordValid &&
    agreeTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirstNameTouched(true);
    setLastNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);
    setTermsTouched(true);

    const fOk = validateFirstName(firstName);
    const lOk = validateLastName(lastName);
    const eOk = validateEmail(email);
    const cOk = validateConfirmPassword(confirmPassword);
    const tOk = agreeTerms;

    if (!agreeTerms) {
      setTermsError('Please accept terms to continue');
    }

    if (!fOk || !lOk || !eOk || !cOk || !tOk) return;

    setLoading(true);
    setGlobalError('');

    try {
      await register({ firstName, lastName, email, password });
      setLoading(false);
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setLoading(false);
      setGlobalError(err.response?.data?.message || 'Email already registered');
    }
  };

  const handleGoogleClick = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <AuthLayout type="signup">
      {/* Welcome Header */}
      <div className="text-left mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create Your Account
        </h2>
        <p className="text-slate-500 text-sm mt-1.5">
          Start your journey into high-performance learning.
        </p>
      </div>

      {/* Form Card wrapper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Google sign up */}
        <GoogleButton mode="signup" />

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-white text-xs text-slate-400 font-medium uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name fields row */}
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setFirstNameTouched(true)}
              leftIcon={<User className="w-4 h-4" />}
              error={firstNameError}
              isValid={isFirstNameValid}
              disabled={loading}
            />
            <FormInput
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setLastNameTouched(true)}
              leftIcon={<User className="w-4 h-4" />}
              error={lastNameError}
              isValid={isLastNameValid}
              disabled={loading}
            />
          </div>

          {/* Email field with inline code trigger button */}
          <div className="space-y-1.5 relative">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
            </div>
            <FormInput
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={emailError}
              isValid={isEmailValid}
              disabled={loading}
            />
            <p className="text-slate-400 text-[11px] mt-1 select-none">
              A verification code will be sent to this Gmail.
            </p>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              leftIcon={<Lock className="w-4 h-4" />}
              disabled={loading}
            />

            {/* Password strength checklist */}
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setConfirmPasswordTouched(true)}
            leftIcon={<Shield className="w-4 h-4" />}
            error={confirmPasswordError}
            isValid={isConfirmPasswordValid}
            disabled={loading}
          />

          {/* Terms checkbox */}
          <div className="space-y-1.5 mt-2">
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                onBlur={() => setTermsTouched(true)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2.5 block text-sm text-slate-600 select-none">
                I agree to the{' '}
                <a href="#" className="text-blue-600 font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 font-medium hover:underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {termsError && (
              <p className="text-xs text-red-500 font-medium animate-shake">
                {termsError}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/60 text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.99] transition-all duration-200 mt-4
              ${(!isFormValid || loading) ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Global errors */}
        {globalError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{globalError}. </span>
              <Link to="/login" className="font-bold underline hover:text-red-800">
                Sign In here →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
