import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useProgress = () => {
  const queryClient = useQueryClient();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data } = await api.get('/progress');
      return data.data;
    }
  });

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap'],
    queryFn: async () => {
      const { data } = await api.get('/progress/heatmap');
      return data.data;
    }
  });

  const logActivityMutation = useMutation({
    mutationFn: async (payload: { hoursStudied?: number; activityCount?: number; date?: string }) => {
      const { data } = await api.post('/progress/log-activity', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async (payload: { title: string; type: string; metadata?: string }) => {
      const { data } = await api.post('/progress/milestones', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    }
  });

  return {
    progress,
    isLoading,
    error,
    heatmap: heatmap || [],
    logActivity: logActivityMutation.mutateAsync,
    addMilestone: addMilestoneMutation.mutateAsync
  };
};

export default useProgress;
