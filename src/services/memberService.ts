import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { User } from '../types';

type DbMember = Database['public']['Tables']['Members']['Row'];

export interface UpdateMemberData {
  FirstName?: string;
  LastName?: string;
  Phone?: string;
  AvatarUrl?: string;
  Street?: string;
  Street2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
}

export interface CreateMemberData {
  UserId: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
}

/**
 * Transform database member data to frontend User type
 */
function transformMember(dbMember: DbMember): User {
  return {
    id: dbMember.Id,
    name: `${dbMember.FirstName || ''} ${dbMember.LastName || ''}`.trim() || 'User',
    email: dbMember.Email || '',
    avatar: dbMember.AvatarUrl || undefined,
    verified: true, // TODO: Implement verification status
    created_at: dbMember.Created,
  };
}

/**
 * Get member profile by user ID
 */
export async function getMemberProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('Members')
    .select('*')
    .eq('UserId', userId)
    .eq('IsDeleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No member profile found
      return null;
    }
    console.error('Error fetching member profile:', error);
    throw error;
  }

  return transformMember(data);
}

/**
 * Update member profile
 */
export async function updateMemberProfile(userId: string, updateData: UpdateMemberData): Promise<User> {
  const { data, error } = await supabase
    .from('Members')
    .update({
      ...updateData,
      LastModified: new Date().toISOString(),
    })
    .eq('UserId', userId)
    .eq('IsDeleted', false)
    .select()
    .single();

  if (error) {
    console.error('Error updating member profile:', error);
    throw error;
  }

  return transformMember(data);
}

/**
 * Create new member profile
 */
export async function createMemberProfile(memberData: CreateMemberData): Promise<User> {
  const { data, error } = await supabase
    .from('Members')
    .insert({
      ...memberData,
      Role: 'user',
      IsDeleted: false,
      Created: new Date().toISOString(),
      LastModified: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating member profile:', error);
    throw error;
  }

  return transformMember(data);
}

/**
 * Upload profile picture to Supabase storage
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload file to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading profile picture:', uploadError);
    throw new Error('Failed to upload profile picture');
  }

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  // Update member's avatar URL in database
  await updateMemberAvatar(data.publicUrl);

  return data.publicUrl;
}

/**
 * Request email change verification
 */
export async function requestEmailChange(userId: string, newEmail: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-email-verification', {
    body: { userId, newEmail },
  });

  if (error) {
    console.error('Error requesting email change:', error);
    throw new Error(data?.error || 'Failed to send verification email');
  }
}

/**
 * Verify email change code
 */
export async function verifyEmailChange(userId: string, code: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('verify-email-code', {
    body: { userId, code },
  });

  if (error) {
    console.error('Error verifying email code:', error);
    throw new Error(data?.error || 'Failed to verify email');
  }
}

/**
 * Request phone change verification
 */
export async function requestPhoneChange(userId: string, newPhone: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('send-phone-verification', {
    body: { userId, newPhone },
  });

  if (error) {
    console.error('Error requesting phone change:', error);
    throw new Error(data?.error || 'Failed to send verification SMS');
  }
}

/**
 * Verify phone change code
 */
export async function verifyPhoneChange(userId: string, code: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('verify-phone-code', {
    body: { userId, code },
  });

  if (error) {
    console.error('Error verifying phone code:', error);
    throw new Error(data?.error || 'Failed to verify phone number');
  }
}

/**
 * Update member avatar using the Supabase function
 */
export async function updateMemberAvatar(avatarUrl: string): Promise<boolean> {
  const { error } = await supabase.rpc('update_member_avatar', {
    avatar_url: avatarUrl,
  });

  if (error) {
    console.error('Error updating member avatar:', error);
    throw error;
  }

  return true;
}

/**
 * Get member by ID
 */
export async function getMemberById(memberId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('Members')
    .select('*')
    .eq('Id', memberId)
    .eq('IsDeleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching member by ID:', error);
    throw error;
  }

  return transformMember(data);
}

/**
 * Update MFA status in the Members table
 */
export async function updateMFAStatus(userId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('Members')
    .update({
      TwoFactorEnabled: enabled,
      LastModified: new Date().toISOString(),
    })
    .eq('UserId', userId)
    .eq('IsDeleted', false);

  if (error) {
    console.error('Error updating MFA status:', error);
    throw error;
  }
}
