import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data } = await api.get('/user/profile');
      return data.data;
    }
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data } = await api.get('/user/stats');
      return data.data;
    }
  });

  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['activeSessions'],
    queryFn: async () => {
      const { data } = await api.get('/user/sessions');
      return data.data;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put('/user/profile', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], (old: any) => ({ ...old, avatar: data.avatar }));
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put('/user/preferences', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const saveOnboardingMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put('/user/onboarding', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/user/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/user/sessions');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
    }
  });

  return {
    profile,
    isLoading,
    error,
    stats,
    isLoadingStats,
    sessions,
    isLoadingSessions,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    saveOnboarding: saveOnboardingMutation.mutateAsync,
    isSavingOnboarding: saveOnboardingMutation.isPending,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeAllSessions: revokeAllSessionsMutation.mutateAsync
  };
};

export default useProfile;
