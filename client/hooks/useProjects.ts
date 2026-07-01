import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useProjects = (page = 1, limit = 20) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { page, limit } });
      return data.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['projectsStats'],
    queryFn: async () => {
      const { data } = await api.get('/projects/stats');
      return data.data;
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (payload: { name: string; description?: string; priority?: string; techStack?: string[]; coverImage?: string }) => {
      const { data } = await api.post('/projects', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsStats'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name?: string; description?: string; status?: string; priority?: string; techStack?: string[]; progress?: number; progressLabel?: string }) => {
      const { data } = await api.put(`/projects/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsStats'] });
      queryClient.setQueryData(['project', data.id], data);
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectsStats'] });
    }
  });

  return {
    projects: data?.projects || [],
    totalProjects: data?.total || 0,
    pages: data?.pages || 0,
    stats: stats || { total: 0, completed: 0, inProgress: 0 },
    isLoading,
    error,
    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync
  };
};

export const useProjectDetail = (projectId: string | null) => {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await api.get(`/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId
  });

  return { project, isLoading, error };
};

export default useProjects;
