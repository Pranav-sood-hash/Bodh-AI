import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const needsOnboarding = params.get('onboarding') === 'true';
    const error = params.get('error');

    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (!accessToken || !refreshToken) {
      navigate('/login?error=missing_tokens', { replace: true });
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    queryClient.clear();

    navigate('/dashboard', { replace: true });
  }, [navigate, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/>
        <p className="text-slate-600 mt-4 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};
