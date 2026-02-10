// Common UI component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// Card component props
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

// Input component props
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

// Textarea component props
export interface TextareaProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

// Outline Number component props
export interface OutlineNumberProps extends BaseComponentProps {
  number: string | number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

// Property types
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  currency: string;
  images: string[] | never[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  description: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  host: User;
  available: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  minStayDays?: number;
  maxStayDays?: number;
  leadTimeDays?: number;
  bufferDays?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
  created_at?: string;
}

export interface Booking {
  id: string;
  property: Property;
  user: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  property: Property;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Review {
  id: string;
  property: Property;
  user: User;
  rating: number;
  comment: string;
  createdAt: string;
}

// Date availability types
export interface DateAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'blocked';
}

export interface PropertyBookingRules {
  minStayDays?: number;
  maxStayDays?: number;
  leadTimeDays?: number;
  bufferDays?: number;
}

// Message types for property Q&A
export interface PropertyMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  body: string;
  snippet: string;
  createdAt: string;
  inReplyToMessageId?: string;
  replies?: PropertyMessage[];
  isOwnerReply?: boolean;
}

export interface PropertyThread {
  id: string;
  subject: string;
  propertyId: string;
  messages: PropertyMessage[];
  lastMessageAt: string;
}

// MFA types
export interface MFAFactor {
  id: string;
  type: 'totp';
  friendlyName: string;
  status: 'verified' | 'unverified';
  createdAt: string;
}

export interface MFAEnrollment {
  id: string;
  type: 'totp';
  totp: {
    qr_code: string;
    secret: string;
    uri: string;
  };
}

export interface MFAChallenge {
  id: string;
  factorId: string;
  expiresAt: number;
}
