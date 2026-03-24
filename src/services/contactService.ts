import { supabase } from '../lib/supabase';

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export async function sendContactMessage(payload: ContactMessagePayload): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-contact-email', {
    body: payload,
  });

  if (error) {
    console.error('Error sending contact message:', error);
    throw new Error((data as { error?: string } | null)?.error || 'Failed to send message');
  }
}
