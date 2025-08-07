'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyEuroIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Message, Job, User } from '@/types';
import toast from 'react-hot-toast';

interface Conversation {
  job: Job;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { appUser } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!appUser) {
      router.push('/login');
      return;
    }
    fetchConversations();
  }, [appUser]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.job.id);
      // Set up real-time subscription for messages
      const supabase = createClient();
      const subscription = supabase
        .channel(`messages:${selectedConversation.job.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `job_id=eq.${selectedConversation.job.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
            // Mark as read if message is from other user
            if (newMessage.sender_id !== appUser?.id) {
              markMessageAsRead(newMessage.id);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get all jobs where user is involved (as customer or craftsman)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          customer:users!jobs_customer_id_fkey(*),
          applications:job_applications(
            *,
            craftsman:users!job_applications_craftsman_id_fkey(*)
          )
        `)
        .or(`customer_id.eq.${appUser?.id},job_applications.craftsman_id.eq.${appUser?.id}`);

      if (jobsError) throw jobsError;

      // Get last message for each job
      const conversationsData: Conversation[] = [];
      
      for (const job of jobs || []) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .eq('receiver_id', appUser?.id)
          .is('read_at', null);

        // Determine other user
        let otherUser: User;
        if (job.customer_id === appUser?.id) {
          // User is customer, get craftsman from applications
          const application = job.applications?.[0];
          if (application) {
            otherUser = application.craftsman;
          } else {
            continue; // Skip if no applications
          }
        } else {
          // User is craftsman, get customer
          otherUser = job.customer;
        }

        conversationsData.push({
          job,
          otherUser,
          lastMessage: lastMessage || undefined,
          unreadCount: unreadCount || 0,
        });
      }

      // Sort by last message date
      conversationsData.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Fehler beim Laden der Nachrichten');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (jobId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(first_name, last_name, company_name),
          receiver:users!messages_receiver_id_fkey(first_name, last_name, company_name)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      const unreadMessages = data?.filter(
        (msg) => msg.receiver_id === appUser?.id && !msg.read_at
      );
      if (unreadMessages && unreadMessages.length > 0) {
        for (const message of unreadMessages) {
          await markMessageAsRead(message.id);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Fehler beim Laden der Nachrichten');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('messages')
        .insert({
          job_id: selectedConversation.job.id,
          sender_id: appUser?.id,
          receiver_id: selectedConversation.otherUser.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      toast.success('Nachricht gesendet');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Fehler beim Senden der Nachricht');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Nachrichten</h1>
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700"
            >
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Konversationen</h2>
              </div>
              <div className="overflow-y-auto h-[calc(600px-80px)]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Keine Konversationen vorhanden</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.job.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.job.id === conversation.job.id
                          ? 'bg-primary-50 border-primary-200'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.otherUser.company_name ||
                                `${conversation.otherUser.first_name} ${conversation.otherUser.last_name}`}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.job.title}
                          </p>
                          {conversation.lastMessage && (
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500 truncate flex-1">
                                {conversation.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-400 ml-2">
                                {formatDate(conversation.lastMessage.created_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedConversation.job.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.otherUser.company_name ||
                            `${selectedConversation.otherUser.first_name} ${selectedConversation.otherUser.last_name}`}
                        </p>
                      </div>
                      <Link
                        href={`/jobs/${selectedConversation.job.id}`}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        Auftrag anzeigen
                      </Link>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {selectedConversation.job.location.city}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(selectedConversation.job.created_at)}
                      </div>
                      {selectedConversation.job.budget_min && (
                        <div className="flex items-center">
                          <CurrencyEuroIcon className="h-3 w-3 mr-1" />
                          {selectedConversation.job.budget_min}€
                          {selectedConversation.job.budget_max && ` - ${selectedConversation.job.budget_max}€`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Noch keine Nachrichten</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.sender_id === appUser?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                }`}
                              >
                                {formatMessageDate(message.created_at)}
                                {message.read_at && isOwnMessage && (
                                  <span className="ml-1">✓</span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Nachricht eingeben..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        disabled={sending}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <PaperAirplaneIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Wählen Sie eine Konversation aus</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
