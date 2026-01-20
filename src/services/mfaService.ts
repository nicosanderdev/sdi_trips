import { supabase } from '../lib/supabase';
import type { MFAFactor, MFAEnrollment, MFAChallenge } from '../types';

/**
 * MFA Service - Handles Multi-Factor Authentication using Supabase Auth
 */

/**
 * Initiates TOTP MFA enrollment for the current user
 * Returns enrollment data with QR code and secret
 */
export async function enrollMFA(friendlyName: string = 'Authenticator App'): Promise<MFAEnrollment> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });

  if (error) {
    console.error('Error enrolling MFA:', error);
    throw new Error('Failed to initiate MFA enrollment');
  }

  return data as MFAEnrollment;
}

/**
 * Verifies MFA enrollment with a TOTP code
 * For enrollment, we need to create a challenge first, then verify
 */
export async function verifyMFAEnrollment(factorId: string, code: string): Promise<void> {
  // Create a challenge for the enrollment
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (challengeError) {
    console.error('Error creating MFA challenge for enrollment:', challengeError);
    throw new Error('Failed to create verification challenge. Please try again.');
  }

  // Verify the enrollment with the challenge
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  if (error) {
    console.error('Error verifying MFA enrollment:', error);
    throw new Error('Invalid verification code. Please try again.');
  }
}

/**
 * Lists all MFA factors enrolled for the current user
 */
export async function listMFAFactors(): Promise<MFAFactor[]> {
  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    console.error('Error listing MFA factors:', error);
    throw new Error('Failed to retrieve MFA factors');
  }

  return data.all.map(factor => ({
    id: factor.id,
    type: factor.factor_type,
    friendlyName: factor.friendly_name || 'Authenticator App',
    status: factor.status,
    createdAt: factor.created_at,
  })) as MFAFactor[];
}

/**
 * Unenrolls an MFA factor
 */
export async function unenrollMFA(factorId: string): Promise<void> {
  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  });

  if (error) {
    console.error('Error unenrolling MFA factor:', error);
    throw new Error('Failed to disable MFA factor');
  }
}

/**
 * Creates an MFA challenge for a specific factor (used during login)
 */
export async function challengeMFA(factorId: string): Promise<MFAChallenge> {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (error) {
    console.error('Error creating MFA challenge:', error);
    throw new Error('Failed to create MFA challenge');
  }

  return {
    id: data.id,
    factorId,
    expiresAt: data.expires_at,
  };
}

/**
 * Verifies an MFA challenge with a code (used during login)
 */
export async function verifyMFAChallenge(
  factorId: string,
  challengeId: string,
  code: string
): Promise<void> {
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    console.error('Error verifying MFA challenge:', error);
    throw new Error('Invalid authentication code. Please try again.');
  }
}

/**
 * Checks if the current user has MFA enabled
 */
export async function hasMFAEnabled(): Promise<boolean> {
  try {
    const factors = await listMFAFactors();
    return factors.length > 0;
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return false;
  }
}

/**
 * Updates the TwoFactorEnabled flag in the Members table
 * to keep it in sync with Supabase Auth MFA status
 */
export async function syncMFAStatusToDatabase(userId: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('Members')
    .update({
      TwoFactorEnabled: enabled,
      LastModified: new Date().toISOString(),
    })
    .eq('UserId', userId);

  if (error) {
    console.error('Error syncing MFA status to database:', error);
    throw new Error('Failed to update MFA status');
  }
}

/**
 * Gets the primary MFA factor for the user (first verified TOTP factor)
 */
export async function getPrimaryMFAFactor(): Promise<MFAFactor | null> {
  try {
    const factors = await listMFAFactors();
    const verifiedFactors = factors.filter(factor => factor.status === 'verified');
    return verifiedFactors.length > 0 ? verifiedFactors[0] : null;
  } catch (error) {
    console.error('Error getting primary MFA factor:', error);
    return null;
  }
}

/**
 * Validates a TOTP code format (6 digits)
 */
export function isValidTOTPSecret(code: string): boolean {
  return /^\d{6}$/.test(code);
}