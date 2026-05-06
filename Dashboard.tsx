import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send, FileSearch, Brain, Zap, Sparkles, Paperclip, X,
  FileText, Image, File, Search, MessageSquare, Clock, ArrowRight, Trash2
} from 'lucide-react';
import AppSidebar, { type Chat, type SidebarView } from '@/components/AppSidebar';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: FileSearch, label: 'Document Analysis', desc: 'Upload and analyse your documents with AI', color: 'text-cobalt bg-cobalt-light' },
  { icon: Brain,      label: 'Smart Insights',    desc: 'Get intelligent answers from your content', color: 'text-emerald bg-emerald-light' },
  { icon: Zap,        label: 'Fast Processing',   desc: 'Quick responses powered by advanced RAG',  color: 'text-amber bg-amber-light' },
];

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_FILE_SIZE_MB = 20;
const MAX_FILES        = 5;
const MAX_CHARS        = 500;

// ── Types ──────────────────────────────────────────────────────────────────
interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  files?: any[]; // Updated to match backend DTO
  timestamp: string; // ISO string from backend
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getFileIcon(type: string) {
  if (type.startsWith('image/'))                            return Image;
  if (type === 'application/pdf' || type.includes('word')) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function timeAgo(ts: string | number) {
  const timestamp = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Sub-views ──────────────────────────────────────────────────────────────

// Home view
function HomeView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
      <div className="flex flex-col items-center text-center max-w-2xl animate-rise">
        <div className="w-16 h-16 rounded-2xl bg-cobalt-light flex items-center justify-center mb-5 shadow-soft">
          <Sparkles className="w-7 h-7 text-cobalt" />
        </div>
        <h2 className="font-display text-3xl font-bold text-ink mb-2">Welcome to DocuMind</h2>
        <p className="text-ink-60 text-sm mb-8 max-w-sm">
          Your AI-powered document analysis assistant.<br />Upload documents and start asking questions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl stagger">
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="card p-5 flex flex-col items-center text-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink mb-1">{label}</p>
                <p className="text-xs text-ink-40">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Search view
function SearchView({
  chats,
  chatMessages,
  onSelectChat,
}: {
  chats: Chat[];
  chatMessages: Record<number, Message[]>;
  onSelectChat: (id: number) => void;
}) {
  const [query, setQuery] = useState('');

  const results = query.trim().length < 2 ? [] : chats.filter(chat => {
    if (chat.title.toLowerCase().includes(query.toLowerCase())) return true;
    const msgs = chatMessages[chat.id] ?? [];
    return msgs.some(m => m.text.toLowerCase().includes(query.toLowerCase()));
  });

  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-2xl mx-auto w-full">
      <h2 className="font-display text-2xl font-bold text-ink mb-4">Search</h2>

      {/* Search box */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-40" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search chats and messages…"
          autoFocus
          className="field pl-10 py-3 rounded-2xl w-full"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-40 hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {query.trim().length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Search className="w-8 h-8 text-ink-20 mb-3" />
          <p className="text-ink-60 text-sm">No chats match "<span className="font-medium text-ink">{query}</span>"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-ink-40 font-medium">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map(chat => {
            const msgs       = chatMessages[chat.id] ?? [];
            const matchedMsg = msgs.find(m => m.text.toLowerCase().includes(query.toLowerCase()));
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="card-hover w-full text-left p-4 flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-cobalt-light flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-cobalt" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{chat.title}</p>
                  {matchedMsg && (
                    <p className="text-xs text-ink-60 mt-0.5 truncate">"{matchedMsg.text.slice(0, 80)}"</p>
                  )}
                  <p className="text-[10px] text-ink-40 mt-1">{chat.messageCount} messages · {timeAgo(chat.createdAt)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-40 shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      )}

      {query.trim().length < 2 && chats.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <MessageSquare className="w-8 h-8 text-ink-20 mb-3" />
          <p className="text-ink-60 text-sm">No chats yet. Start a conversation first.</p>
        </div>
      )}

      {query.trim().length < 2 && chats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ink-40 font-medium mb-3">All chats</p>
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="card-hover w-full text-left p-4 flex items-center gap-3"
            >
              <MessageSquare className="w-4 h-4 text-ink-40 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{chat.title}</p>
                <p className="text-[10px] text-ink-40 mt-0.5">{chat.messageCount} messages · {timeAgo(chat.createdAt)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-40 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Chats list view
function ChatsView({
  chats,
  chatMessages,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: {
  chats: Chat[];
  chatMessages: Record<number, Message[]>;
  onSelectChat: (id: number) => void;
  onNewChat: () => void;
  onDeleteChat: (id: number) => void;
}) {
  return (
    <div className="flex-1 flex flex-col px-6 py-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">All Chats</h2>
        <button
          onClick={onNewChat}
          className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2"
        >
          + New Chat
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <MessageSquare className="w-10 h-10 text-ink-20 mb-4" />
          <p className="font-display text-lg font-bold text-ink mb-1">No conversations yet</p>
          <p className="text-ink-60 text-sm mb-6">Start a new chat to begin analysing your documents.</p>
          <button onClick={onNewChat} className="btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2">
            Start your first chat <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {chats.map(chat => {
            const msgs    = chatMessages[chat.id] ?? [];
            const lastMsg = msgs[msgs.length - 1];
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="group card-hover w-full text-left p-4 flex items-start gap-4"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-cobalt-light flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-cobalt" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-ink truncate">{chat.title}</p>
                    <span className="text-[10px] text-ink-40 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{timeAgo(chat.createdAt)}
                    </span>
                  </div>

                  {lastMsg ? (
                    <p className="text-xs text-ink-60 truncate">
                      {lastMsg.role === 'user' ? 'You: ' : 'AI: '}
                      {lastMsg.text || (lastMsg.files?.length ? `${lastMsg.files[0]?.name || 'File'} + files` : '')}
                    </p>
                  ) : (
                    <p className="text-xs text-ink-40">Empty conversation</p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge text-[10px] px-2 py-0.5 bg-cream-200 text-ink-60 rounded-full font-mono">
                      {chat.messageCount} msg{chat.messageCount !== 1 ? 's' : ''}
                    </span>
                    {msgs.some(m => m.files?.length) && (
                      <span className="badge text-[10px] px-2 py-0.5 bg-cobalt-light text-cobalt rounded-full font-mono">
                        has files
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <ArrowRight className="w-4 h-4 text-ink-40 shrink-0 mt-1" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                    className="p-2 rounded-xl text-ink-20 opacity-0 group-hover:opacity-100 hover:text-ruby hover:bg-ruby-light transition-all duration-200"
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Chat input bar (shared across views) ───────────────────────────────────
function ChatInputBar({
  message, setMessage,
  uploadedFiles, processFiles, removeFile,
  handleSend, canSend, isOverLimit, charsLeft,
  dragOver, handleDragOver, handleDragLeave, handleDrop,
  fileInputRef,
  error, setError,
}: any) {
  return (
    <div className="shrink-0 px-6 pb-6 pt-2 border-t border-ink-10">
      <div className="w-full max-w-2xl mx-auto space-y-2">

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-ruby-light border border-ruby/20 text-ruby text-sm animate-pop">
            <span className="w-1.5 h-1.5 rounded-full bg-ruby shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-ruby/60 hover:text-ruby transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {uploadedFiles.map(({ id, file, preview }: any) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={id} className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-xl bg-card border border-ink-10 shadow-soft text-xs text-ink max-w-[220px] animate-pop">
                  {preview
                    ? <img src={preview} alt={file.name} className="w-5 h-5 rounded object-cover shrink-0" />
                    : <Icon className="w-4 h-4 text-cobalt shrink-0" />}
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-ink-40 shrink-0">{formatSize(file.size)}</span>
                  <button type="button" onClick={() => removeFile(id)}
                    className="ml-0.5 p-0.5 rounded-lg text-ink-40 hover:text-ruby hover:bg-ruby-light transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            <span className={`self-center text-xs font-mono px-2 py-1 rounded-lg
              ${uploadedFiles.length >= MAX_FILES ? 'text-ruby bg-ruby-light' : 'text-ink-40 bg-cream-200'}`}>
              {uploadedFiles.length}/{MAX_FILES}
            </span>
          </div>
        )}

        <form onSubmit={handleSend} className="relative flex items-end">
          <label
            htmlFor="file-upload"
            className={`absolute left-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-colors
              ${uploadedFiles.length >= MAX_FILES
                ? 'text-ink-20 cursor-not-allowed'
                : 'cursor-pointer text-ink-40 hover:text-cobalt hover:bg-cobalt-light'}`}
            title={uploadedFiles.length >= MAX_FILES ? `Max ${MAX_FILES} files reached` : 'Attach file'}
          >
            <Paperclip className="w-5 h-5" />
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(',')}
              onChange={(e: any) => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = ''; }}
              disabled={uploadedFiles.length >= MAX_FILES}
              className="hidden"
            />
          </label>

          <textarea
            value={message}
            onChange={(e: any) => setMessage(e.target.value)}
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (canSend) handleSend(e); }
            }}
            placeholder="Ask anything about your documents… (Shift+Enter for new line)"
            rows={1}
            className={`field pl-12 pr-14 py-3.5 rounded-2xl shadow-lifted text-base resize-none leading-relaxed w-full
              ${isOverLimit ? 'border-ruby focus:border-ruby' : ''}`}
            style={{ minHeight: '54px', maxHeight: '160px', overflowY: 'auto' }}
          />

          <button
            type="submit"
            disabled={!canSend}
            className="absolute right-3 bottom-3 w-9 h-9 rounded-xl bg-cobalt text-primary-foreground flex items-center justify-center hover:bg-cobalt-dark transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-ink-40">
            PDF, Word, TXT, CSV, PNG, JPG · Max {MAX_FILE_SIZE_MB} MB · Up to {MAX_FILES} files · Drag & drop
          </p>
          <span className={`text-xs font-mono tabular-nums shrink-0 ml-3 transition-colors
            ${isOverLimit ? 'text-ruby font-semibold' : charsLeft <= 50 ? 'text-amber' : 'text-ink-40'}`}>
            {charsLeft}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [chats, setChats]               = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<number, Message[]>>({});
  const [activeView, setActiveView]     = useState<SidebarView>('home');

  const [message, setMessage]             = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver]           = useState(false);
  const [error, setError]                 = useState('');
  const [isLoading, setIsLoading]         = useState(false);
  
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);

  const charsLeft      = MAX_CHARS - message.length;
  const isOverLimit    = message.length > MAX_CHARS;
  const activeMessages = activeChatId ? (chatMessages[activeChatId] ?? []) : [];

  // Fetch chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (err: any) {
      toast.error('Failed to load conversations');
    }
  };

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChatId && !chatMessages[activeChatId]) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  const loadMessages = async (id: number) => {
    try {
      const data = await api.getMessages(id);
      setChatMessages(prev => ({ ...prev, [id]: data }));
    } catch (err: any) {
      toast.error('Failed to load messages');
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNewChat = () => {
    setActiveChatId(null);
    setActiveView('home');
    setMessage('');
    setUploadedFiles([]);
    setError('');
  };

  const handleNavigate = (view: SidebarView) => {
    setActiveView(view);
    setActiveChatId(null);
  };

  const handleSelectChat = (id: string | number) => {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    setActiveChatId(numId);
    setActiveView('chat');
    setMessage('');
    setUploadedFiles([]);
    setError('');
  };

  const handleDeleteChat = async (id: number) => {
    try {
      await api.deleteChat(id);
      setChats(prev => prev.filter(c => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
        setActiveView('home');
      }
      toast.success('Chat deleted');
    } catch (err: any) {
      toast.error('Failed to delete chat');
    }
  };

  // ── Files ─────────────────────────────────────────────────────────────────
  const processFiles = useCallback((files: FileList | File[]) => {
    setError('');
    const incoming = Array.from(files);
    if (uploadedFiles.length + incoming.length > MAX_FILES) {
      setError(`You can attach a maximum of ${MAX_FILES} files at a time.`);
      return;
    }
    for (const file of incoming) {
      if (!ACCEPTED_TYPES.includes(file.type)) { setError(`"${file.name}" is not a supported file type.`); return; }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { setError(`"${file.name}" exceeds ${MAX_FILE_SIZE_MB} MB.`); return; }
    }
    setUploadedFiles(prev => [...prev, ...incoming.map(file => ({
      id: makeId(), file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))]);
  }, [uploadedFiles]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const f = prev.find(f => f.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || (!message.trim() && uploadedFiles.length === 0)) return;

    setIsLoading(true);
    try {
      let currentChatId = activeChatId;

      // 1. Upload files first if any
      let docIds: number[] = [];
      if (uploadedFiles.length > 0) {
        const uploadResponse = await api.uploadFiles(uploadedFiles.map(f => f.file));
        docIds = uploadResponse.map((d: any) => d.id);
      }

      // 2. Create chat if it's a new one
      if (!currentChatId) {
        const title = message.trim().slice(0, 42) || uploadedFiles[0]?.file.name || 'New chat';
        const newChat = await api.createChat(title);
        currentChatId = newChat.id;
        setActiveChatId(currentChatId);
        setActiveView('chat');
        setChats(prev => [newChat, ...prev]);
      }

      // 3. Send message
      const response = await api.sendMessage(currentChatId!, message.trim(), docIds);
      
      // Refresh messages for this chat
      loadMessages(currentChatId!);
      loadChats(); // Refresh message counts in sidebar

      setMessage('');
      uploadedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
      setUploadedFiles([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const canSend = (message.trim().length > 0 || uploadedFiles.length > 0) && !isOverLimit;

  // ── Active chat title ─────────────────────────────────────────────────────
  const headerTitle = () => {
    if (activeView === 'chat' && activeChatId) return chats.find(c => c.id === activeChatId)?.title ?? 'Chat';
    if (activeView === 'search') return 'Search';
    if (activeView === 'chats')  return 'All Chats';
    return 'DocuMind';
  };

  const showInputBar = activeView === 'home' || activeView === 'chat';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-cream-50 overflow-hidden">
      <AppSidebar
        chats={chats}
        activeChatId={activeChatId}
        activeView={activeView}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-ink-10 shadow-soft shrink-0">
          <div className="px-6 h-[60px] flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-ink truncate">{headerTitle()}</h1>
            {activeView === 'chat' && activeChatId && (
              <span className="text-xs text-ink-40 font-mono shrink-0 ml-4">
                {activeMessages.length} message{activeMessages.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </header>

        {/* Body */}
        <div
          className={`flex-1 flex flex-col min-h-0 transition-colors duration-200 ${dragOver ? 'bg-cobalt-light/30' : ''}`}
          onDragOver={showInputBar ? handleDragOver : undefined}
          onDragLeave={showInputBar ? handleDragLeave : undefined}
          onDrop={showInputBar ? handleDrop : undefined}
        >
          {/* Drag overlay */}
          {dragOver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="card px-10 py-8 flex flex-col items-center gap-3 shadow-float border-2 border-cobalt animate-pop">
                <Paperclip className="w-8 h-8 text-cobalt" />
                <p className="font-display text-lg font-bold text-ink">Drop files here</p>
              </div>
            </div>
          )}

          {/* ── Home ── */}
          {activeView === 'home' && (
            <HomeView />
          )}

          {/* ── Search ── */}
          {activeView === 'search' && (
            <SearchView chats={chats} chatMessages={chatMessages} onSelectChat={handleSelectChat} />
          )}

          {/* ── Chats list ── */}
          {activeView === 'chats' && (
            <ChatsView
              chats={chats}
              chatMessages={chatMessages}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
              onDeleteChat={handleDeleteChat}
            />
          )}

          {/* ── Active chat ── */}
          {activeView === 'chat' && (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-ink-40">
                  <MessageSquare className="w-8 h-8 mb-2 text-ink-20" />
                  <p className="text-sm">Send a message to start the conversation.</p>
                </div>
              )}
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-cobalt text-primary-foreground rounded-br-md'
                      : 'bg-card border border-ink-10 text-ink rounded-bl-md'}`}
                  >
                    {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                    {msg.files && msg.files.length > 0 && (
                      <div className={`flex flex-wrap gap-1.5 ${msg.text ? 'mt-2' : ''}`}>
                        {msg.files.map((file: any) => (
                          <span key={file.id || file.name} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-white/15 text-primary-foreground/80 font-mono">
                            <FileText className="w-3 h-3" />{file.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-primary-foreground/50' : 'text-ink-40'}`}>
                      {timeAgo(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── Input bar (home + chat only) ── */}
          {showInputBar && (
            <ChatInputBar
              message={message} setMessage={setMessage}
              uploadedFiles={uploadedFiles} processFiles={processFiles} removeFile={removeFile}
              handleSend={handleSend} canSend={canSend} isOverLimit={isOverLimit} charsLeft={charsLeft}
              dragOver={dragOver} handleDragOver={handleDragOver} handleDragLeave={handleDragLeave} handleDrop={handleDrop}
              fileInputRef={fileInputRef}
              error={error} setError={setError}
            />
          )}
        </div>
      </div>
    </div>
  );
}