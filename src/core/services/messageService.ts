import { supabase } from '../api/supabaseClient';
import type {
  PropertyMessage,
  Conversation,
  Message,
  User,
  Property,
} from '../models';

interface DatabaseMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  propertyId: string;
  propertyTitle: string;
  subject: string;
  snippet: string;
  fullBody: string;
  createdAt: string;
  isRead: boolean;
  isReplied: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

interface GuestInboxThreadRow {
  threadId: string;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyLocation: string | null;
  otherParticipantId: string | null;
  otherParticipantName: string | null;
  lastMessageSnippet: string | null;
  lastMessageAt: string | null;
  unreadCount: number | null;
}

interface ThreadMessageRow {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  recipientId: string | null;
  propertyId: string | null;
  propertyTitle: string | null;
  subject: string | null;
  snippet: string | null;
  fullBody: string | null;
  createdAt: string;
  isRead: boolean;
  isReplied: boolean;
  isStarred: boolean;
  isArchived: boolean;
}

function mapGuestInboxRowToConversation(row: GuestInboxThreadRow): Conversation {
  const hostUser: User = {
    id: row.otherParticipantId ?? '',
    name: row.otherParticipantName ?? '',
    email: '',
    avatar: undefined,
    phone: undefined,
    verified: false,
  };

  const property: Property = {
    id: row.propertyId ?? '',
    title: row.propertyTitle ?? '',
    location: row.propertyLocation ?? '',
    price: 0,
    currency: 'USD',
    images: [],
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 0,
    description: '',
    amenities: [],
    rating: 0,
    reviewCount: 0,
    host: hostUser,
    available: true,
    coordinates: { lat: 0, lng: 0 },
  };

  const lastMessage: Message | undefined =
    row.lastMessageSnippet && row.lastMessageAt
      ? {
          id: `${row.threadId}-last`,
          conversationId: row.threadId,
          sender: hostUser,
          content: row.lastMessageSnippet,
          timestamp: row.lastMessageAt,
          read: (row.unreadCount ?? 0) === 0,
        }
      : undefined;

  return {
    id: row.threadId,
    participants: [hostUser],
    property,
    lastMessage,
    unreadCount: row.unreadCount ?? 0,
    updatedAt: row.lastMessageAt ?? new Date().toISOString(),
  };
}

function mapThreadRowToMessage(row: ThreadMessageRow, currentUserId: string | undefined): Message {
  const sender: User = {
    id: row.senderId,
    name: row.senderName,
    email: '',
    avatar: undefined,
    verified: false,
  };

  const isRead =
    currentUserId && row.recipientId === currentUserId ? row.isRead : true;

  return {
    id: row.id,
    conversationId: row.threadId,
    sender,
    content: row.fullBody ?? row.snippet ?? '',
    timestamp: row.createdAt,
    read: isRead,
  };
}

export async function getGuestInboxThreads(
  page = 1,
  limit = 50,
): Promise<Conversation[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error getting auth user for inbox:', authError);
    throw authError ?? new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_guest_inbox_threads', {
    p_user_id: user.id,
    p_page: page,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching guest inbox threads:', error);
    throw error;
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return (data as GuestInboxThreadRow[])
    .filter((row) => row.threadId && row.lastMessageAt)
    .map(mapGuestInboxRowToConversation);
}

export async function getThreadMessages(
  threadId: string,
  options?: { page?: number; limit?: number; sortBy?: 'createdAt_asc' | 'createdAt_desc' },
): Promise<Message[]> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 100;
  const sortBy = options?.sortBy ?? 'createdAt_asc';

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error getting auth user for thread messages:', authError);
    throw authError ?? new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('get_messages_by_thread_id', {
    p_thread_id: threadId,
    p_user_id: user.id,
    p_page: page,
    p_limit: limit,
    p_sort_by: sortBy,
  });

  if (error) {
    console.error('Error fetching thread messages:', error);
    throw error;
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return (data as ThreadMessageRow[]).map((row) =>
    mapThreadRowToMessage(row, user.id),
  );
}

export async function markThreadMessagesAsRead(
  threadId: string,
): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      'Error getting auth user for markThreadMessagesAsRead:',
      authError,
    );
    throw authError ?? new Error('User not authenticated');
  }

  const { error } = await supabase.rpc('mark_thread_messages_as_read', {
    p_user_id: user.id,
    p_thread_id: threadId,
  });

  if (error) {
    console.error('Error marking thread messages as read:', error);
    throw error;
  }
}

// Unread counts are kept in sync between the inbox UI and backend
// via the markThreadMessagesAsRead helper and the corresponding
// mark_thread_messages_as_read Supabase RPC.

/**
 * Get all messages for a specific property
 * Messages are organized by threads and include replies
 */
export async function getPropertyMessages(propertyId: string): Promise<PropertyMessage[]> {
  const { data, error } = await supabase.rpc('get_messages_by_property_id', {
    p_property_id: propertyId
  });

  if (error) {
    console.error('Error fetching property messages:', error);
    throw error;
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Transform the raw data into PropertyMessage format
  const messages: PropertyMessage[] = data.map((msg: DatabaseMessage) => ({
    id: msg.id,
    threadId: msg.threadId,
    senderId: msg.senderId,
    senderName: msg.senderName,
    body: msg.fullBody,
    snippet: msg.snippet,
    createdAt: msg.createdAt,
    inReplyToMessageId: undefined, // Will be set when organizing threads
    replies: [],
    isOwnerReply: false // Will be determined when checking property ownership
  }));

  // Get property owner information to identify owner replies
  const { data: propertyData } = await supabase
    .from('EstateProperties')
    .select('OwnerId')
    .eq('Id', propertyId)
    .single();

  const ownerId = propertyData?.OwnerId;

  // Organize messages into threads and set reply relationships
  const messageMap = new Map<string, PropertyMessage>();
  const rootMessages: PropertyMessage[] = [];

  // First pass: create message map and identify root messages
  messages.forEach(message => {
    messageMap.set(message.id, message);
    message.isOwnerReply = message.senderId === ownerId;
  });

  // Second pass: organize replies
  messages.forEach(message => {
    if (message.inReplyToMessageId) {
      const parentMessage = messageMap.get(message.inReplyToMessageId);
      if (parentMessage) {
        if (!parentMessage.replies) {
          parentMessage.replies = [];
        }
        parentMessage.replies.push(message);
      }
    } else {
      rootMessages.push(message);
    }
  });

  // Sort root messages by most recent first
  rootMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Sort replies by creation time within each thread
  rootMessages.forEach(rootMessage => {
    if (rootMessage.replies) {
      rootMessage.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  });

  return rootMessages;
}

/**
 * Send a new question about a property
 * Creates a thread if needed and sends the message
 */
export async function sendPropertyQuestion(
  propertyId: string,
  subject: string,
  body: string
): Promise<void> {
  // First create a thread for this question
  const { data: threadData, error: threadError } = await supabase.rpc('create_property_message_thread', {
    p_property_id: propertyId,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_subject: subject
  });

  if (threadError) {
    console.error('Error creating message thread:', threadError);
    throw threadError;
  }

  // Then send the message
  const { error: messageError } = await supabase.rpc('send_property_question', {
    p_thread_id: threadData,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_body: body
  });

  if (messageError) {
    console.error('Error sending property question:', messageError);
    throw messageError;
  }
}

/**
 * Reply to an existing message
 */
export async function replyToMessage(messageId: string, body: string): Promise<void> {
  const { error } = await supabase.rpc('reply_to_property_message', {
    p_message_id: messageId,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
    p_body: body
  });

  if (error) {
    console.error('Error replying to message:', error);
    throw error;
  }
}