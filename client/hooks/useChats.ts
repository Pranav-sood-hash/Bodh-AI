import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useChats = (page = 1, limit = 50) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chats', page, limit],
    queryFn: async () => {
      const { data } = await api.get('/chats', { params: { page, limit } });
      return data.data;
    }
  });

  const { data: folders, isLoading: isLoadingFolders } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data } = await api.get('/folders');
      return data.data;
    }
  });

  const createChatMutation = useMutation({
    mutationFn: async (payload: { title?: string; mode?: string; aiProvider?: string; folderId?: string }) => {
      const { data } = await api.post('/chats', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const updateChatMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; title?: string; mode?: string; aiProvider?: string; folderId?: string }) => {
      const { data } = await api.put(`/chats/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/chats/${id}/pin`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const deleteChatMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/chats/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: async (payload: { name: string; color?: string }) => {
      const { data } = await api.post('/folders', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/folders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  return {
    chats: data?.chats || [],
    totalChats: data?.total || 0,
    pages: data?.pages || 0,
    isLoading,
    error,
    folders: folders || [],
    isLoadingFolders,
    createChat: createChatMutation.mutateAsync,
    isCreatingChat: createChatMutation.isPending,
    updateChat: updateChatMutation.mutateAsync,
    togglePin: togglePinMutation.mutateAsync,
    deleteChat: deleteChatMutation.mutateAsync,
    createFolder: createFolderMutation.mutateAsync,
    deleteFolder: deleteFolderMutation.mutateAsync
  };
};

export default useChats;
