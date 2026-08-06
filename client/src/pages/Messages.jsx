import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { CHATS_QUERY, MESSAGES_QUERY } from '../graphql/chat';
import { getSocket, connectSocket } from '../services/socket';

function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Messages() {
  const { id: activeConversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: chatsData, loading: chatsLoading, error: chatsError, refetch: refetchChats } = useQuery(CHATS_QUERY);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Conversation list */}
      <div className="md:col-span-1 border border-gray-200 dark:border-gray-800 rounded-lg overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold">
          Messages
        </div>
        {chatsLoading && <p className="p-4 text-sm text-gray-400">Loading conversations…</p>}
        {chatsError && (
          <p className="p-4 text-sm text-red-500">Couldn't load conversations: {chatsError.message}</p>
        )}
        {!chatsLoading && !chatsError && chatsData?.chats.length === 0 && (
          <p className="p-4 text-sm text-gray-400">No conversations yet.</p>
        )}
        {chatsData?.chats.map((c) => {
          const other = c.participants.find((p) => p.id !== user.id) || c.participants[0];
          return (
            <button
              key={c.id}
              onClick={() => navigate(`/messages/${c.id}`)}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-3 ${
                activeConversationId === c.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
              }`}
            >
              {other?.profilePicture ? (
                <img src={other.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">{other?.name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.lastMessageAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {c.lastMessage || 'No messages yet'}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="text-[10px] bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center ml-2">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active thread */}
      <div className="md:col-span-2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {activeConversationId ? (
          <ChatThread conversationId={activeConversationId} onMessageSent={refetchChats} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}

function ChatThread({ conversationId, onMessageSent }) {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(MESSAGES_QUERY, {
    variables: { conversationId, limit: 50 },
    fetchPolicy: 'network-only',
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (data?.messages) setMessages(data.messages);
  }, [data]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit('joinConversation', conversationId);
    socket.emit('markAsRead', { conversationId });

    const handleNewMessage = (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, normalizeSocketMessage(msg)]);
      socket.emit('markAsRead', { conversationId });
      onMessageSent?.();
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId === user.id) return;
      setOtherTyping(isTyping);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('typingStatus', handleTyping);

    return () => {
      socket.emit('leaveConversation', conversationId);
      socket.off('newMessage', handleNewMessage);
      socket.off('typingStatus', handleTyping);
    };
  }, [conversationId, user.id, onMessageSent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const normalizeSocketMessage = (msg) => ({
    id: msg.id,
    conversationId: msg.conversationId,
    content: msg.content,
    createdAt: msg.createdAt,
    readBy: msg.readBy,
    attachments: msg.attachments || [],
    sender: { id: msg.senderId, name: '', profilePicture: '' },
  });

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    socket.emit('typing', { conversationId, isTyping: true });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;

    const socket = getSocket();
    socket.emit('sendMessage', { conversationId, content }, (res) => {
      if (res?.error) console.error(res.error);
    });
    setInput('');
    socket.emit('typing', { conversationId, isTyping: false });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-sm text-gray-400">Loading messages…</p>}
        {error && (
          <p className="text-sm text-red-500">Couldn't load messages: {error.message}</p>
        )}
        {messages.map((m) => {
          const isMe = m.sender.id === user.id;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {m.content}
                <div className={`text-[10px] mt-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isMe && m.readBy?.length > 1 && ' · Seen'}
                </div>
              </div>
            </div>
          );
        })}
        {otherTyping && <p className="text-xs text-gray-400">Typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}