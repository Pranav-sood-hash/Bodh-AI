import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useApiKeys = () => {
  const queryClient = useQueryClient();

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const { data } = await api.get('/apikeys');
      return data.data;
    }
  });

  const { data: usage } = useQuery({
    queryKey: ['apiKeysUsage'],
    queryFn: async () => {
      const { data } = await api.get('/apikeys/usage');
      return data.data;
    }
  });

  const addKeyMutation = useMutation({
    mutationFn: async (payload: { provider: string; apiKey: string; label?: string; customEndpoint?: string; customModel?: string }) => {
      const { data } = await api.post('/apikeys', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      queryClient.invalidateQueries({ queryKey: ['apiKeysUsage'] });
    }
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; label?: string; isActive?: boolean; customEndpoint?: string; customModel?: string }) => {
      const { data } = await api.put(`/apikeys/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/apikeys/${id}/primary`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });

  const updateRoutingMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; routeLearning?: string; routeCode?: string; routeRoadmap?: string; routePlanner?: string; routeProject?: string }) => {
      const { data } = await api.put(`/apikeys/${id}/routing`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/apikeys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      queryClient.invalidateQueries({ queryKey: ['apiKeysUsage'] });
    }
  });

  const testKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/apikeys/test/${id}`);
      return data.data;
    }
  });

  return {
    keys: keys || [],
    usage: usage || { totalRequests: 0, estimatedCost: 0 },
    isLoading,
    error,
    addKey: addKeyMutation.mutateAsync,
    isAdding: addKeyMutation.isPending,
    updateKey: updateKeyMutation.mutateAsync,
    setPrimary: setPrimaryMutation.mutateAsync,
    updateRouting: updateRoutingMutation.mutateAsync,
    deleteKey: deleteKeyMutation.mutateAsync,
    testKey: testKeyMutation.mutateAsync,
    isTesting: testKeyMutation.isPending
  };
};

export default useApiKeys;
