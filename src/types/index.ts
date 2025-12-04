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
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
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
  images: string[];
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
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
}

export interface Booking {
  id: string;
  property: Property;
  user: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
