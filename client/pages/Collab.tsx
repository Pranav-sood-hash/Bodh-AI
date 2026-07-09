import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { 
  Users, MessageSquare, Plus, Search, Send, Shield, Globe, Lock, Hash, 
  ChevronRight, Sparkles, User, Circle, Radio, ArrowLeft, Terminal, AlertCircle
} from 'lucide-react';

interface Room {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  category: string;
  createdAt: string;
  _count?: {
    members: number;
    messages: number;
  };
}

interface Member {
  id: string;
  roomId: string;
  userId: string;
  role: string;
  isOnline: boolean;
  lastSeenAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function Collab() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Navigation states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  
  // Chat States
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  
  // Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('General');
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  
  // Refs & Socket
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current user & rooms list
  useEffect(() => {
    const initPage = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const [userRes, roomsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/collab/rooms')
        ]);

        setCurrentUser(userRes.data.data);
        const roomsData = roomsRes.data.data || [];
        setRooms(roomsData);
        setFilteredRooms(roomsData);
      } catch (err) {
        console.error('Failed to load collab data', err);
      }
    };
    initPage();
  }, [navigate]);

  // Categories helper
  const categories = ['All', 'General', 'Programming', 'AI & ML', 'Web Dev', 'Design', 'Other'];

  // Filter rooms
  useEffect(() => {
    let result = rooms;
    if (selectedCategory !== 'All') {
      result = result.filter(r => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredRooms(result);
  }, [searchQuery, selectedCategory, rooms]);

  // Handle active room / socket connection
  useEffect(() => {
    if (!activeRoom) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);
      setMembers([]);
      setTypingUsers({});
      return;
    }

    const token = localStorage.getItem('accessToken');
    const socketUrl = window.location.origin;

    // Connect socket
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    // Join room
    socket.emit('join-room', { roomId: activeRoom.id }, (res: any) => {
      if (res?.error) {
        console.error('Socket join error:', res.error);
        alert(`Failed to join room: ${res.error}`);
        setActiveRoom(null);
      } else {
        if (res?.members) {
          setMembers(res.members);
        }
      }
    });

    // Fetch initial messages & members via HTTP
    const fetchRoomDetails = async () => {
      try {
        const [msgRes, memRes] = await Promise.all([
          api.get(`/collab/rooms/${activeRoom.id}/messages`),
          api.get(`/collab/rooms/${activeRoom.id}/members`)
        ]);
        setMessages(msgRes.data.data || []);
        setMembers(memRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch room messages/members', err);
      }
    };
    fetchRoomDetails();

    // Socket listeners
    socket.on('room-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('room-members-updated', (data: { roomId: string; members: Member[] }) => {
      if (data.roomId === activeRoom.id) {
        setMembers(data.members);
      }
    });

    socket.on('user-typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        if (data.isTyping) {
          updated[data.userId] = data.userName;
        } else {
          delete updated[data.userId];
        }
        return updated;
      });
    });

    return () => {
      socket.emit('leave-room', { roomId: activeRoom.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeRoom]);

  // Scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Typing indicator trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    if (socketRef.current && activeRoom) {
      socketRef.current.emit('typing', { roomId: activeRoom.id, isTyping: true });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && activeRoom) {
          socketRef.current.emit('typing', { roomId: activeRoom.id, isTyping: false });
        }
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom || !socketRef.current) return;

    // Send via socket
    socketRef.current.emit('send-room-message', {
      roomId: activeRoom.id,
      content: inputText.trim()
    }, (res: any) => {
      if (res?.error) {
        console.error('Failed to send message:', res.error);
      }
    });

    setInputText('');
    // Clear typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit('typing', { roomId: activeRoom.id, isTyping: false });
  };

  // Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomTitle.trim()) return;

    try {
      const res = await api.post('/collab/rooms', {
        title: newRoomTitle.trim(),
        description: newRoomDesc.trim(),
        category: newRoomCategory,
        isPrivate: newRoomIsPrivate
      });

      const newRoom = res.data.data;
      setRooms(prev => [newRoom, ...prev]);
      setIsCreateModalOpen(false);
      setNewRoomTitle('');
      setNewRoomDesc('');
      setNewRoomCategory('General');
      setNewRoomIsPrivate(false);
      
      // Auto-enter created room
      setActiveRoom(newRoom);
    } catch (err) {
      console.error('Failed to create room', err);
      alert('Error creating room. Try a unique title!');
    }
  };

  // User Name formatting
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      <Sidebar userName={userName} />

      <main className="flex-1 flex overflow-hidden pl-0 lg:pl-64">
        {/* ROOMS LIST VIEW */}
        {!activeRoom ? (
          <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-900/50 p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <Users className="w-8 h-8 text-cyan-400" />
                  Collaborative Rooms
                </h1>
                <p className="text-slate-400 text-xs mt-1">Study, pair-program, and debug real-time with other developers around the globe.</p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white rounded-xl px-5 py-3 text-xs font-bold transition shadow-lg shadow-purple-500/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pr-2 pb-1 sm:pb-0 scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition ${
                      selectedCategory === cat 
                        ? 'bg-cyan-500 text-white shadow-md' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search active rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>
            </div>

            {/* Rooms Grid */}
            {filteredRooms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-sm font-extrabold text-slate-300">No rooms found</h3>
                <p className="text-[11px] text-slate-500 mt-1">Try broadening your search or create the very first room for this topic.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className="group cursor-pointer bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/50 hover:bg-gradient-to-br hover:from-slate-900 hover:to-cyan-950/10 transition-all duration-300 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                          {room.category}
                        </span>
                        {room.isPrivate ? (
                          <span title="Private"><Lock className="w-3.5 h-3.5 text-pink-500" /></span>
                        ) : (
                          <span title="Public"><Globe className="w-3.5 h-3.5 text-emerald-400" /></span>
                        )}
                      </div>

                      <h3 className="text-md font-bold text-slate-100 group-hover:text-white transition line-clamp-1 mb-2">
                        {room.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {room.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {room._count?.members || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {room._count?.messages || 0}
                        </span>
                      </div>

                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Join Room
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE ROOM CHAT WORKSPACE */
          <div className="flex-1 flex h-full overflow-hidden bg-slate-950">
            {/* Main Chat Pane */}
            <div className="flex-1 flex flex-col h-full border-r border-white/5">
              {/* Top Room Header */}
              <div className="bg-slate-900/50 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Hash className="w-4 h-4 text-cyan-400" />
                      {activeRoom.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{activeRoom.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">Live Socket Sync</span>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                    <p className="text-xs text-slate-400 font-bold">This room represents the beginning of a fresh path.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Send a message below to kickstart the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.userId === currentUser?.id;
                    const initials = `${msg.user?.firstName?.charAt(0) || ''}${msg.user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
                    
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-white text-[10px] font-extrabold flex-shrink-0">
                          {msg.user?.avatar ? (
                            <img src={msg.user.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
                          ) : initials}
                        </div>
                        
                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider mb-1 block">
                            {isOwn ? 'You' : `${msg.user?.firstName} ${msg.user?.lastName}`}
                          </span>
                          
                          <div className={`rounded-2xl px-4 py-2.5 text-xs ${
                            isOwn 
                              ? 'bg-cyan-500 text-white rounded-tr-none' 
                              : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing status bar */}
                {Object.keys(typingUsers).length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium italic">
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/30 border-t border-white/5 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message or paste a code block..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-cyan-500 hover:brightness-110 disabled:opacity-50 text-white rounded-xl px-5 py-3 transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Sidebar Members Pane */}
            <div className="w-64 bg-slate-900/20 h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Room Members
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {members.map((member) => {
                  const initials = `${member.user?.firstName?.charAt(0) || ''}${member.user?.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
                  return (
                    <div key={member.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-white text-[9px] font-extrabold">
                            {member.user?.avatar ? (
                              <img src={member.user.avatar} className="w-full h-full object-cover rounded-lg" alt="" />
                            ) : initials}
                          </div>
                          <Circle className={`w-2 h-2 absolute -bottom-0.5 -right-0.5 rounded-full border border-slate-950 fill-current ${
                            member.isOnline ? 'text-emerald-400' : 'text-slate-600'
                          }`} />
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-300 block leading-tight">
                            {member.user?.firstName} {member.user?.lastName}
                          </span>
                          <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wide">
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE ROOM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/5 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Create Study Room
            </h3>
            <p className="text-[11px] text-slate-400 mb-6">Create a room to pair-program, share feedback, and solve doubts together.</p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Room Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Routing Deep-Dive"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Description</label>
                <textarea
                  placeholder="Describe what members will study or build..."
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Category</label>
                  <select
                    value={newRoomCategory}
                    onChange={(e) => setNewRoomCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  >
                    <option>General</option>
                    <option>Programming</option>
                    <option>AI & ML</option>
                    <option>Web Dev</option>
                    <option>Design</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Visibility</label>
                  <select
                    value={newRoomIsPrivate ? 'private' : 'public'}
                    onChange={(e) => setNewRoomIsPrivate(e.target.value === 'private')}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="private">Private (Invite Only)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
