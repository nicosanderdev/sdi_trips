-- Migration: Create verification_codes table
-- Created: 2026-01-20
-- Description: Table to store verification codes for email and phone changes

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email TEXT,
    phone TEXT,
    code TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email_change', 'phone_change')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_type ON verification_codes(type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- Add RLS (Row Level Security)
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own verification codes
CREATE POLICY "Users can view own verification codes" ON verification_codes
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own verification codes
CREATE POLICY "Users can insert own verification codes" ON verification_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own verification codes
CREATE POLICY "Users can update own verification codes" ON verification_codes
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own verification codes
CREATE POLICY "Users can delete own verification codes" ON verification_codes
    FOR DELETE USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE verification_codes IS 'Stores verification codes for email and phone changes';
COMMENT ON COLUMN verification_codes.user_id IS 'Reference to the user who requested the verification';
COMMENT ON COLUMN verification_codes.email IS 'New email address to be verified (for email_change type)';
COMMENT ON COLUMN verification_codes.phone IS 'New phone number to be verified (for phone_change type)';
COMMENT ON COLUMN verification_codes.code IS 'The verification code';
COMMENT ON COLUMN verification_codes.type IS 'Type of verification (email_change or phone_change)';
COMMENT ON COLUMN verification_codes.expires_at IS 'When the code expires';
COMMENT ON COLUMN verification_codes.used_at IS 'When the code was used';