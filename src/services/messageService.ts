import { supabase } from '../lib/supabase';
import type { PropertyMessage } from '../types';

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