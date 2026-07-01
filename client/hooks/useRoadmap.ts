import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useRoadmap = () => {
  const queryClient = useQueryClient();
  const [loadingMessage, setLoadingMessage] = useState('');

  const { data: roadmap, isLoading, error } = useQuery({
    queryKey: ['activeRoadmap'],
    queryFn: async () => {
      const { data } = await api.get('/roadmap');
      return data.data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (payload: { goal: string; title?: string; level?: string; estimatedWeeks?: number; focusAreas?: string[] }) => {
      const { data } = await api.post('/roadmap/generate', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status?: string; progress?: number; actualHours?: number; completedAt?: string }) => {
      const { data } = await api.put(`/roadmap/milestone/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    }
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/roadmap/reoptimize');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    }
  });

  // Cycle loading messages when generating or optimizing
  useEffect(() => {
    let interval: any;
    const isPending = generateMutation.isPending || optimizeMutation.isPending;

    if (isPending) {
      const messages = [
        "Initializing neural cognitive alignment...",
        "Analyzing curriculum prerequisites...",
        "Synthesizing milestone credential stages...",
        "Generating structured code practice sessions...",
        "Aligning custom study modules with target goals...",
        "Finalizing personalized learning pathway..."
      ];
      let idx = 0;
      setLoadingMessage(messages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMessage(messages[idx]);
      }, 2500);
    } else {
      setLoadingMessage('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateMutation.isPending, optimizeMutation.isPending]);

  return {
    roadmap: roadmap || null,
    milestones: roadmap?.milestones || [],
    isLoading,
    error,
    generateRoadmap: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    updateMilestone: updateMilestoneMutation.mutateAsync,
    reoptimizeRoadmap: optimizeMutation.mutateAsync,
    isOptimizing: optimizeMutation.isPending,
    loadingMessage
  };
};

export default useRoadmap;
