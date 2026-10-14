import { getAppVariant } from '../core/config/guestSiteListingType';
import { supabase } from '../lib/supabase';

export const CONTACT_MESSAGE_MAX_LENGTH = 4000;

export type ContactOrigin = 'casas' | 'espacios';

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export type ContactSendFailureReason = 'rate_limited' | 'failed';

export class ContactSendError extends Error {
  readonly reason: ContactSendFailureReason;

  constructor(reason: ContactSendFailureReason) {
    super(reason === 'rate_limited' ? 'Too many requests' : 'Failed to send message');
    this.name = 'ContactSendError';
    this.reason = reason;
  }
}

function contactOriginFromVariant(): ContactOrigin {
  return getAppVariant() === 'alt' ? 'espacios' : 'casas';
}

type ContactEmailResponse = {
  success?: boolean;
  mode?: string;
  error?: string;
};

export async function sendContactMessage(payload: ContactMessagePayload): Promise<void> {
  const body = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    message: payload.message.trim(),
    origin: contactOriginFromVariant(),
  };

  const { data, error, response } = await supabase.functions.invoke<ContactEmailResponse>(
    'send-contact-email',
    { body },
  );

  if (!error && data?.success === true) {
    return;
  }

  console.error('Error sending contact message:', error ?? data);
  throw new ContactSendError(response?.status === 429 ? 'rate_limited' : 'failed');
}
