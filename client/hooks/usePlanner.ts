import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const usePlanner = (start?: string, end?: string) => {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['studySessions', start, end],
    queryFn: async () => {
      const { data } = await api.get('/planner/sessions', { params: { start, end } });
      return data.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['plannerStats'],
    queryFn: async () => {
      const { data } = await api.get('/planner/stats');
      return data.data;
    }
  });

  const createSessionMutation = useMutation({
    mutationFn: async (payload: { title: string; type: string; startTime: string; endTime: string; duration?: number; date: string; notes?: string; tags?: string[] }) => {
      const { data } = await api.post('/planner/sessions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['plannerStats'] });
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; title?: string; type?: string; startTime?: string; endTime?: string; duration?: number; date?: string; notes?: string; tags?: string[]; status?: string }) => {
      const { data } = await api.put(`/planner/sessions/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['plannerStats'] });
    }
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/planner/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['plannerStats'] });
    }
  });

  const completeSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/planner/sessions/${id}/complete`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
      queryClient.invalidateQueries({ queryKey: ['plannerStats'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['heatmap'] });
    }
  });

  return {
    sessions: sessions || [],
    stats: stats || { totalScheduled: 0, completed: 0, totalMinutesStudied: 0 },
    isLoading,
    error,
    createSession: createSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
    updateSession: updateSessionMutation.mutateAsync,
    deleteSession: deleteSessionMutation.mutateAsync,
    completeSession: completeSessionMutation.mutateAsync
  };
};

export default usePlanner;
