import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search, Send, MoreVertical, Check, CheckCheck,
  MessageSquare, Clock, Loader2, ArrowLeft
} from 'lucide-react';
import { messagesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useSocketContext } from '@/context/SocketContext';
import { formatDistanceToNow, cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Message } from '@/types';

export function Messages() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    sendMessage,
    markConversationAsRead,
    startTyping,
    stopTyping,
    checkPresence,
    typingUsers,
    presenceState,
    on,
  } = useSocketContext();

  const activeUserId = searchParams.get('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
  });

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeUserId],
    queryFn: () => messagesApi.getConversation(activeUserId!),
    enabled: !!activeUserId,
  });

  const messages = messagesData?.data || [];

  const activeConversation = conversations?.find(
    (c) => c.user.id === activeUserId
  );

  // check presence for all conversation partners
  useEffect(() => {
    if (conversations?.length) {
      checkPresence(conversations.map((c) => c.user.id));
    }
  }, [conversations, checkPresence]);

  // listen for new messages via WebSocket
  useEffect(() => {
    const unsubscribe = on<Message>('message:new', (msg) => {
      queryClient.invalidateQueries({ queryKey: ['messages', msg.sender?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return unsubscribe;
  }, [on, queryClient]);

  // listen for sent message confirmation
  useEffect(() => {
    const unsubscribe = on<Message>('message:sent', () => {
      setIsSending(false);
      queryClient.invalidateQueries({ queryKey: ['messages', activeUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return unsubscribe;
  }, [on, queryClient, activeUserId]);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // mark messages as read via WebSocket
  useEffect(() => {
    if (activeUserId) {
      markConversationAsRead(activeUserId);
    }
  }, [activeUserId, markConversationAsRead]);

  const handleTyping = useCallback(() => {
    if (!activeUserId) return;
    startTyping(activeUserId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (activeUserId) stopTyping(activeUserId);
    }, 2000);
  }, [activeUserId, startTyping, stopTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUserId || isSending) return;
    setIsSending(true);
    sendMessage(activeUserId, newMessage.trim());
    setNewMessage('');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(activeUserId);
  };

  const filteredConversations = conversations?.filter((c) =>
    `${c.user.firstName} ${c.user.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
          {/* Conversations list - hidden on mobile when chat is active */}
          <div className={cn(
            'border-r border-gray-200 flex flex-col',
            activeUserId ? 'hidden md:flex' : 'flex'
          )}>
            {/* Search */}
            <div className="p-4 border-b">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                </div>
              ) : filteredConversations?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations?.map((conversation) => (
                    <button
                      key={conversation.user.id}
                      onClick={() => setSearchParams({ user: conversation.user.id })}
                      className={cn(
                        'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                        activeUserId === conversation.user.id && 'bg-primary-50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                            {getInitials(conversation.user.firstName, conversation.user.lastName)}
                          </div>
                          {presenceState[conversation.user.id]?.status === 'online' && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">
                              {conversation.user.firstName}{' '}
                              {conversation.user.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          {conversation.lastMessage.booking && (
                            <div className="text-xs text-primary-600 truncate">
                              {conversation.lastMessage.booking.listing.title}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            {typingUsers[conversation.user.id] ? (
                              <p className="text-sm text-primary-600 italic">En train d'écrire...</p>
                            ) : (
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.sender.id === user?.id && 'Vous: '}
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat area - full width on mobile when active */}
          <div className={cn(
            'md:col-span-2 flex flex-col',
            activeUserId ? 'flex' : 'hidden md:flex'
          )}>
            {!activeUserId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm">Choisissez une conversation pour voir les messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                      onClick={() => setSearchParams({})}
                      className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {getInitials(
                          activeConversation?.user.firstName || null,
                          activeConversation?.user.lastName || null
                        )}
                      </div>
                      {activeUserId && presenceState[activeUserId]?.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activeConversation?.user.firstName}{' '}
                        {activeConversation?.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeUserId && typingUsers[activeUserId] ? (
                          <span className="text-primary-600 italic">En train d'écrire...</span>
                        ) : activeUserId && presenceState[activeUserId]?.status === 'online' ? (
                          <span className="text-green-600">En ligne</span>
                        ) : activeConversation?.lastMessage.booking ? (
                          activeConversation.lastMessage.booking.listing.title
                        ) : (
                          <span className="text-gray-400">Hors ligne</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                    </div>
                  ) : (
                    <>
                      {messages?.map((message: Message) => {
                        const isOwn = message.sender.id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              'flex',
                              isOwn ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2',
                                isOwn
                                  ? 'bg-primary-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              )}
                            >
                              <p>{message.content}</p>
                              <div
                                className={cn(
                                  'flex items-center gap-1 mt-1 text-xs',
                                  isOwn ? 'text-primary-200' : 'text-gray-500'
                                )}
                              >
                                <Clock className="h-3 w-3" />
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {isOwn && (
                                  message.isRead ? (
                                    <CheckCheck className="h-3 w-3 ml-1" />
                                  ) : (
                                    <Check className="h-3 w-3 ml-1" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message input */}
                <form onSubmit={handleSend} className="p-4 border-t">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
