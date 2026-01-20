-- Migration: Add TwoFactorEnabled field to Members table
-- Created: 2026-01-20
-- Description: Adds TwoFactorEnabled boolean field to track user's 2FA status

-- Add TwoFactorEnabled column to Members table
ALTER TABLE public."Members"
ADD COLUMN IF NOT EXISTS TwoFactorEnabled BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN "Members".TwoFactorEnabled IS 'Indicates whether the user has two-factor authentication enabled';