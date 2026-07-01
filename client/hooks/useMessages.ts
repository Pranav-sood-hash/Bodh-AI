import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export const useMessages = (chatId: string | null) => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const { data } = await api.get(`/messages/${chatId}`);
      return data.data;
    },
    enabled: !!chatId
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { content: string; provider?: string; model?: string; mode?: string }) => {
      if (!chatId) throw new Error('No active chat');
      const { data } = await api.post('/messages/send', { chatId, ...payload });
      return data.data;
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
      const previousMessages = queryClient.getQueryData(['messages', chatId]);

      // Optimistically append user message
      if (previousMessages) {
        queryClient.setQueryData(['messages', chatId], (old: any) => [
          ...old,
          { id: `opt-${Date.now()}`, role: 'USER', content: newMessage.content, createdAt: new Date().toISOString() }
        ]);
      }

      return { previousMessages };
    },
    onError: (_err, _newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', chatId], context.previousMessages);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    }
  });

  return {
    messages: messages || [],
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    deleteMessage: deleteMessageMutation.mutateAsync
  };
};

export default useMessages;
