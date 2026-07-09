import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { 
  BookOpen, Search, Plus, Trash2, Edit, Sparkles, Send, FileText, 
  HelpCircle, ArrowLeft, Eye, UploadCloud, ChevronRight, CheckCircle2, 
  Settings, AlertCircle, FileCode, Check, Copy, ExternalLink
} from 'lucide-react';

interface KnowledgeDoc {
  id: string;
  title: string;
  fileType: string;
  totalChunks: number;
  extractedText?: string;
  createdAt: string;
}

export default function Knowledge() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Docs lists
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<KnowledgeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected / Active states
  const [activeDoc, setActiveDoc] = useState<KnowledgeDoc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Form fields for create/edit
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // AI query states
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiSources, setAiSources] = useState<string[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  
  // Copy feedback
  const [copied, setCopied] = useState(false);

  // Initialize data
  useEffect(() => {
    const initPage = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const [userRes, docsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/knowledge/list')
        ]);

        setCurrentUser(userRes.data.data);
        setDocs(docsRes.data.data || []);
        setFilteredDocs(docsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load knowledge data', err);
      }
    };
    initPage();
  }, [navigate]);

  // Filter docs
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocs(docs);
    } else {
      setFilteredDocs(
        docs.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, docs]);

  // Fetch full details of an active document (extractedText) when selected
  const handleSelectDoc = async (doc: KnowledgeDoc) => {
    try {
      const res = await api.get(`/knowledge/${doc.id}`);
      const fullDoc = res.data.data;
      setActiveDoc(fullDoc);
      setIsEditing(false);
      setIsCreatingNew(false);
      
      // Clear previous query/answers
      setAiQuery('');
      setAiAnswer('');
      setAiSources([]);
    } catch (err) {
      console.error('Failed to fetch doc details', err);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('doc', file);
    
    setIsUploading(true);
    try {
      const res = await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newDoc = res.data.data;
      setDocs(prev => [newDoc, ...prev]);
      handleSelectDoc(newDoc);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please upload a PDF, TXT, or MD document under 10MB.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Create article
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim()) return;

    try {
      const res = await api.post('/knowledge/article', {
        title: articleTitle.trim(),
        content: articleContent.trim()
      });
      const newDoc = res.data.data;
      setDocs(prev => [newDoc, ...prev]);
      setActiveDoc(newDoc);
      setIsCreatingNew(false);
      setArticleTitle('');
      setArticleContent('');
    } catch (err) {
      console.error('Failed to create article', err);
      alert('Error creating article. Try again!');
    }
  };

  // Update article
  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !articleTitle.trim() || !articleContent.trim()) return;

    try {
      const res = await api.put(`/knowledge/article/${activeDoc.id}`, {
        title: articleTitle.trim(),
        content: articleContent.trim()
      });
      const updatedDoc = res.data.data;
      
      // Update list
      setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      setActiveDoc(updatedDoc);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update article', err);
      alert('Error updating article. Try again!');
    }
  };

  // Delete document
  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/knowledge/${docId}`);
      setDocs(prev => prev.filter(d => d.id !== docId));
      if (activeDoc?.id === docId) {
        setActiveDoc(null);
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  // Ask AI about this doc
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc || !aiQuery.trim() || isQuerying) return;

    setIsQuerying(true);
    setAiAnswer('');
    setAiSources([]);
    
    try {
      const res = await api.post(`/knowledge/${activeDoc.id}/query`, {
        query: aiQuery.trim()
      });
      
      const { answer, sources } = res.data.data;
      setAiAnswer(answer);
      setAiSources(sources || []);
    } catch (err) {
      console.error('AI query failed', err);
      setAiAnswer('Sorry, the AI Mentor was unable to process your request at this time. Please check your API keys or try a different query.');
    } finally {
      setIsQuerying(false);
    }
  };

  // Switch to editing mode
  const startEditing = () => {
    if (!activeDoc) return;
    setArticleTitle(activeDoc.title);
    setArticleContent(activeDoc.extractedText || '');
    setIsEditing(true);
  };

  // Switch to creation mode
  const startCreating = () => {
    setArticleTitle('');
    setArticleContent('');
    setIsCreatingNew(true);
    setActiveDoc(null);
  };

  // Copy text helper
  const handleCopyText = () => {
    if (!activeDoc?.extractedText) return;
    navigator.clipboard.writeText(activeDoc.extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Markdown to HTML helper
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
      return `<pre class="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-xs overflow-x-auto text-emerald-400 my-4">${p1.trim()}</pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[11px] text-cyan-400">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-white mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-white mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-white mt-8 mb-4">$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline inline-flex items-center gap-0.5">$1 <span class="text-[9px]">↗</span></a>');

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr class="border-white/5 my-6" />');

    // Bullet points
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc ml-5 text-xs text-slate-300 my-1">$1</li>');
    html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc ml-5 text-xs text-slate-300 my-1">$1</li>');

    // Paragraphs
    const lines = html.split('\n');
    const processedLines = lines.map(line => {
      if (line.trim() === '') return '<br/>';
      if (line.startsWith('<h') || line.startsWith('<pre') || line.startsWith('<li') || line.startsWith('<hr') || line.startsWith('<br')) {
        return line;
      }
      return `<p class="my-2.5 leading-relaxed text-xs text-slate-300">${line}</p>`;
    });

    return processedLines.join('\n');
  };

  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      <Sidebar userName={userName} />

      <main className="flex-1 flex flex-col overflow-hidden lg:pl-[var(--sidebar-width)] transition-all duration-300">
        {/* Mobile top bar */}
        <MobileTopBar title="Knowledge Base" />

        {/* 3-panel layout — stacked on mobile, side-by-side on lg */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: LIST & SEARCH */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/40 flex flex-col lg:h-full max-h-64 lg:max-h-full overflow-y-auto">
          <div className="p-5 border-b border-white/5">
            <h1 className="text-xl font-black text-white flex items-center gap-2.5 mb-1">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Wiki & Docs
            </h1>
            <p className="text-[10px] text-slate-400">Manage learning files and markdown articles.</p>
          </div>

          {/* Quick upload & create buttons */}
          <div className="p-4 grid grid-cols-2 gap-2 border-b border-white/5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl border border-white/5 transition disabled:opacity-50"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.md,.json,.js,.ts"
            />

            <button
              onClick={startCreating}
              className="flex items-center justify-center gap-1.5 bg-cyan-500 hover:brightness-110 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Wiki
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-7 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Doc List */}
          <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1">
            {filteredDocs.length === 0 ? (
              <div className="p-6 text-center text-slate-600 text-xs italic">
                No documents found.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = activeDoc?.id === doc.id;
                const isWiki = doc.fileType === 'text/markdown';
                
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`group cursor-pointer flex items-center justify-between p-3 rounded-xl transition ${
                      isActive 
                        ? 'bg-cyan-500/10 border border-cyan-500/25 text-white' 
                        : 'hover:bg-white/5 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isWiki ? (
                        <FileCode className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      )}
                      
                      <div className="overflow-hidden">
                        <span className={`text-xs font-bold truncate block ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                          {doc.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">
                          {isWiki ? 'Wiki Article' : doc.fileType.split('/')[1]?.toUpperCase() || 'Doc'} • {doc.totalChunks} Chunks
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="p-1 rounded bg-white/0 hover:bg-white/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE / MAIN CONTENT WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main article / editor workspace */}
          <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
            {/* Active view header */}
            {activeDoc && !isEditing && (
              <div className="bg-slate-900/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeDoc.fileType === 'text/markdown' ? (
                      <FileCode className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-cyan-400" />
                    )}
                    {activeDoc.title}
                  </h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    Uploaded on {new Date(activeDoc.createdAt).toLocaleDateString()} • {activeDoc.totalChunks} Retrieval Segments
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-[10px] font-bold"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  {activeDoc.fileType === 'text/markdown' && (
                    <button
                      onClick={startEditing}
                      className="p-2 rounded-xl bg-cyan-500 hover:brightness-110 text-white transition flex items-center gap-1.5 text-[10px] font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Article
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Document display feed */}
            <div className="flex-1 overflow-y-auto p-8">
              {isCreatingNew ? (
                /* CREATE ARTICLE FORM */
                <form onSubmit={handleCreateArticle} className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-md font-bold text-white">Create Wiki Article</h2>
                      <p className="text-[10px] text-slate-400">Write custom notes in Markdown format to construct your knowledge base.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Redux Toolkit Cheat Sheet"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>

                  <div className="flex-1 flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Content (Markdown)</label>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <textarea
                        required
                        placeholder="# Header 1&#10;Write clean markdown content here..."
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full h-96 bg-slate-900 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                      />
                      <div className="border border-white/5 rounded-xl p-4 bg-slate-900/40 overflow-y-auto h-96 prose max-w-none">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Live Render</div>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(articleContent) }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                    >
                      Publish Article
                    </button>
                  </div>
                </form>
              ) : isEditing && activeDoc ? (
                /* EDIT ARTICLE FORM */
                <form onSubmit={handleUpdateArticle} className="space-y-6 max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h2 className="text-md font-bold text-white">Edit Wiki Article</h2>
                      <p className="text-[10px] text-slate-400">Modify your wiki document text and re-index for search retrieval.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Redux Toolkit Cheat Sheet"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    />
                  </div>

                  <div className="flex-1 flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Content (Markdown)</label>
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <textarea
                        required
                        placeholder="# Header 1&#10;Write clean markdown content here..."
                        value={articleContent}
                        onChange={(e) => setArticleContent(e.target.value)}
                        className="w-full h-96 bg-slate-900 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                      />
                      <div className="border border-white/5 rounded-xl p-4 bg-slate-900/40 overflow-y-auto h-96 prose max-w-none">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-3">Live Render</div>
                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(articleContent) }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : activeDoc ? (
                /* READ ARTICLE / VIEWING DOCUMENT MODE */
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Rich Render Box */}
                  <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 md:p-8">
                    {activeDoc.fileType === 'text/markdown' ? (
                      <div className="prose prose-invert max-w-none text-slate-200" dangerouslySetInnerHTML={{ __html: renderMarkdown(activeDoc.extractedText || '') }} />
                    ) : (
                      /* Flat plain text for raw files */
                      <pre className="font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-6 rounded-xl border border-white/5 overflow-x-auto whitespace-pre-wrap">
                        {activeDoc.extractedText || 'No text extracted.'}
                      </pre>
                    )}
                  </div>
                </div>
              ) : (
                /* EMPTY STATE / WELCOME PANEL */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Build Your Knowledge Base</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    Upload learning materials (PDFs, JS codebases, Markdown) or write custom wikis. The AI Mentor indexes all articles to answer queries with precise citation links.
                  </p>
                  <button
                    onClick={startCreating}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:brightness-110 text-white rounded-xl px-6 py-3 text-xs font-bold transition shadow-lg shadow-cyan-500/10 active:scale-[0.98]"
                  >
                    Create Your First Wiki
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AI MENTOR IN-DOC QUERY PANEL */}
          {activeDoc && !isEditing && !isCreatingNew && (
            <div className="w-80 border-l border-white/5 bg-slate-900/30 flex flex-col h-full overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Ask AI Mentor</h3>
              </div>

              {/* Prompt Feed & Answer Display */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiAnswer ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5">
                      <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest block mb-2">AI Answer</span>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                    </div>

                    {/* Sources / Reference cards */}
                    {aiSources.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">Extracted Reference Citations</span>
                        {aiSources.map((src, i) => (
                          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-2.5 text-[10px] text-slate-400 font-mono leading-normal">
                            <span className="text-cyan-400 font-bold text-[9px] block mb-1">Segment {i+1}</span>
                            {src.length > 180 ? `${src.slice(0, 180)}...` : src}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600 text-xs italic">
                    {isQuerying ? 'Querying document chunks...' : 'Enter a query to look up facts in this document.'}
                  </div>
                )}
              </div>

              {/* Chat-like input box */}
              <form onSubmit={handleAiQuery} className="p-4 border-t border-white/5 bg-slate-950/50 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ask a question about this doc..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim() || isQuerying}
                  className="bg-cyan-500 hover:brightness-110 disabled:opacity-50 text-white rounded-xl px-4.5 py-2.5 transition flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);
}
