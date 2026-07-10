import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

export interface CodePlaygroundData {
  code: string;
  output: string;
  language: string;
}

export interface ComparePanelData {
  title: string;
  concept: string;
  code: string;
  points: string[];
}

export interface CompareData {
  left: ComparePanelData;
  right: ComparePanelData;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  codePlayground?: CodePlaygroundData;
  compareData?: CompareData;
}

export interface ChatSession {
  id: string;
  title: string;
  mode: 'voice' | 'study' | 'code' | 'compare';
  messages: Message[];
  attachments: string[];
}

interface ChatContextType {
  chats: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  createNewChat: (title: string, mode: 'voice' | 'study' | 'code' | 'compare', attachmentFiles?: string[]) => Promise<string>;
  startMilestonePracticeChat: (milestoneId: string) => Promise<string>;
  sendMessage: (chatId: string, text: string, mode?: string) => Promise<Message | null>;
  updateCodeOutput: (chatId: string, messageId: string, output: string) => void;
  deleteChat: (id: string) => void;
  clearAllChats: () => void;
}

function parseCompareMarkdown(content: string): CompareData | undefined {
  if (!content) return undefined;
  
  const lines = content.split('\n').map(l => l.trim());
  const tableLines = lines.filter(l => l.startsWith('|'));
  
  if (tableLines.length < 3) {
    return undefined;
  }

  try {
    const headerCols = tableLines[0].split('|').map(s => s.trim()).filter(Boolean);
    if (headerCols.length < 3) return undefined;
    
    const leftTitle = headerCols[1];
    const rightTitle = headerCols[2];

    let leftConcept = '';
    let rightConcept = '';
    let leftCode = '';
    let rightCode = '';
    let leftPoints: string[] = [];
    let rightPoints: string[] = [];

    for (let i = 2; i < tableLines.length; i++) {
      const cols = tableLines[i].split('|').map(s => s.trim());
      const cleanCols = cols.slice(1, cols.length - 1).map(c => c.trim());
      if (cleanCols.length < 3) continue;
      
      const feature = cleanCols[0].toLowerCase();
      const leftVal = cleanCols[1];
      const rightVal = cleanCols[2];

      if (feature.includes('concept') || feature.includes('overview') || feature.includes('definition')) {
        leftConcept = leftVal;
        rightConcept = rightVal;
      } else if (feature.includes('code') || feature.includes('snippet') || feature.includes('example')) {
        leftCode = leftVal.replace(/\\n/g, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/^`{1,3}([a-z]+)?\n?|`{1,3}$/gi, '');
        rightCode = rightVal.replace(/\\n/g, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/^`{1,3}([a-z]+)?\n?|`{1,3}$/gi, '');
      } else {
        const parseBullets = (val: string) => {
          return val
            .split(/<br\s*\/?>|\\n|\n|•|[-*]\s+/)
            .map(b => b.trim())
            .filter(b => b.length > 0 && b !== '-' && b !== '*');
        };
        const lBullets = parseBullets(leftVal);
        const rBullets = parseBullets(rightVal);
        
        leftPoints.push(...lBullets.map(b => `${cleanCols[0]}: ${b}`));
        rightPoints.push(...rBullets.map(b => `${cleanCols[0]}: ${b}`));
      }
    }

    return {
      left: {
        title: leftTitle,
        concept: leftConcept || `Core architecture overview for ${leftTitle}`,
        code: leftCode || `// ${leftTitle} sample`,
        points: leftPoints.length > 0 ? leftPoints : ['Scalable implementation pattern'],
      },
      right: {
        title: rightTitle,
        concept: rightConcept || `Core architecture overview for ${rightTitle}`,
        code: rightCode || `// ${rightTitle} sample`,
        points: rightPoints.length > 0 ? rightPoints : ['Alternative architecture pattern'],
      }
    };
  } catch (err) {
    console.error('Error parsing comparison table:', err);
    return undefined;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper to map DB message role to frontend
const mapMessage = (msg: any): Message => {
  let codePlayground;
  let compareData;

  if (msg.metadata) {
    try {
      const parsed = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
      if (parsed.codePlayground) codePlayground = parsed.codePlayground;
      if (parsed.compareData) compareData = parsed.compareData;
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (!compareData && msg.role === 'ASSISTANT' && msg.content) {
    compareData = parseCompareMarkdown(msg.content);
  }

  return {
    id: msg.id,
    sender: msg.role === 'USER' ? 'user' : 'ai',
    text: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    codePlayground,
    compareData
  };
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // 1. Fetch Chats on mount / auth change
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const { data } = await api.get('/chats');
      const mapped = data.data.chats.map((c: any) => {
        let frontendMode: 'voice' | 'study' | 'code' | 'compare' = 'study';
        if (c.mode === 'FREE_CHAT') frontendMode = 'voice';
        else if (c.mode === 'LEARNING') frontendMode = 'study';
        else if (c.mode === 'CODE_HELPER') frontendMode = 'code';
        else if (c.mode === 'PROJECT_BUILDER') frontendMode = 'compare';

        return {
          id: c.id,
          title: c.title,
          mode: frontendMode,
          attachments: [],
          messages: []
        };
      });
      setChats(mapped);
      if (mapped.length > 0 && !activeChatId) {
        setActiveChatId(mapped[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // 2. Fetch Messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) return;
    const fetchMessages = async () => {
      try {
        const { data } = await api.get(`/messages/${activeChatId}`);
        const mappedMessages = data.data.map(mapMessage);
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, messages: mappedMessages } : c))
        );
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [activeChatId]);

  const createNewChat = async (
    title: string,
    mode: 'voice' | 'study' | 'code' | 'compare',
    attachmentFiles: string[] = []
  ): Promise<string> => {
    try {
      let dbMode = 'FREE_CHAT';
      if (mode === 'voice') dbMode = 'FREE_CHAT';
      else if (mode === 'study') dbMode = 'LEARNING';
      else if (mode === 'code') dbMode = 'CODE_HELPER';
      else if (mode === 'compare') dbMode = 'PROJECT_BUILDER';

      const { data } = await api.post('/chats', {
        title,
        mode: dbMode
      });
      const newChat = data.data;
      const mappedSession: ChatSession = {
        id: newChat.id,
        title: newChat.title,
        mode: mode,
        attachments: attachmentFiles,
        messages: [
          {
            id: `init-${Date.now()}`,
            sender: 'ai',
            text: `Welcome to your BodhAI session! I've activated **${
              mode === 'voice'
                ? 'Voice Assistant Mode 🎙️'
                : mode === 'study'
                ? 'Study Doubts Mode 📚'
                : mode === 'code'
                ? 'Code Helper Mode 💻'
                : 'Architectural Compare Mode 🧠'
              }**. How can I help you master your goals today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setChats((prev) => [mappedSession, ...prev]);
      setActiveChatId(newChat.id);
      return newChat.id;
    } catch (err) {
      console.error('Failed to create chat:', err);
      throw err;
    }
  };

  const startMilestonePracticeChat = async (milestoneId: string): Promise<string> => {
    try {
      const { data } = await api.post(`/roadmap/milestone/${milestoneId}/practice`);
      const { chatId } = data.data;
      await fetchChats();
      setActiveChatId(chatId);
      return chatId;
    } catch (err) {
      console.error('Failed to start milestone practice chat:', err);
      throw err;
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await api.delete(`/chats/${id}`);
      setChats((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeChatId === id) {
          setActiveChatId(filtered.length > 0 ? filtered[0].id : null);
        }
        return filtered;
      });
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const clearAllChats = async () => {
    try {
      // Clear chats one by one or batch endpoint if exists
      for (const c of chats) {
        await api.delete(`/chats/${c.id}`);
      }
      setChats([]);
      setActiveChatId(null);
    } catch (err) {
      console.error('Failed to clear chats:', err);
    }
  };

  const sendMessage = async (chatId: string, text: string, mode?: string): Promise<Message | null> => {
    // 1. Optimistic user message rendering
    const userMsg: Message = {
      id: `msg-user-opt-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, userMsg] } : c))
    );

    try {
      const { data } = await api.post('/messages/send', {
        chatId,
        content: text,
        mode
      });

      const responseData = data.data;
      const responseMsg = mapMessage(responseData.assistantMessage);

      // 2. Replace user optimistic message and append real AI response message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const filtered = c.messages.filter((m) => !m.id.startsWith('msg-user-opt'));
          return {
            ...c,
            messages: [...filtered, mapMessage(responseData.userMessage), responseMsg]
          };
        })
      );

      return responseMsg;
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Remove user optimistic message on error and add alert message
      const errText = err.response?.status === 402
        ? "No API key configured. Please configure an API Key under Settings > AI Configuration."
        : "Failed to send message. Please verify network or credentials.";

      const aiErrorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ Error: ${errText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const filtered = c.messages.filter((m) => !m.id.startsWith('msg-user-opt'));
          return { ...c, messages: [...filtered, aiErrorMsg] };
        })
      );

      return null;
    }
  };

  const updateCodeOutput = (chatId: string, messageId: string, output: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId || !m.codePlayground) return m;
            return {
              ...m,
              codePlayground: {
                ...m.codePlayground,
                output
              }
            };
          })
        };
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        setActiveChatId,
        createNewChat,
        startMilestonePracticeChat,
        sendMessage,
        updateCodeOutput,
        deleteChat,
        clearAllChats
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
