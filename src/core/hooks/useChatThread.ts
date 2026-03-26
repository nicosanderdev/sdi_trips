import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import type { Conversation, Message } from '../models';
import {
  getGuestInboxThreads,
  getThreadMessages,
  replyToMessage,
} from '../services/messageService';

interface UseChatThreadResult {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function useChatThread(threadId: string | null): UseChatThreadResult {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!threadId) {
      setConversation(null);
      setMessages([]);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [threads, threadMessages] = await Promise.all([
          getGuestInboxThreads(),
          getThreadMessages(threadId),
        ]);

        if (!isMounted) return;

        const matchedConversation =
          threads.find((th) => th.id === threadId) ?? null;

        setConversation(matchedConversation);
        setMessages(threadMessages);
      } catch (err) {
        console.error('Failed to load chat thread', err);
        if (isMounted) {
          setError(t('common.error.generic'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [threadId, t]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !threadId) {
      return;
    }

    replyToMessage(lastMessage.id, newMessage)
      .then(async () => {
        setNewMessage('');
        const updatedMessages = await getThreadMessages(threadId);
        setMessages(updatedMessages);
      })
      .catch((err) => {
        console.error('Failed to send reply', err);
        setError(t('common.error.generic'));
      });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    conversation,
    messages,
    isLoading,
    error,
    newMessage,
    setNewMessage,
    messagesEndRef,
    handleSendMessage,
    handleKeyPress,
  };
}
