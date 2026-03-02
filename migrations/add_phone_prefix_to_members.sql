-- Migration: Add PhonePrefix to Members table
-- Created: 2026-03-02
-- Description: Adds PhonePrefix field to store phone dial code separately from the phone number

ALTER TABLE public."Members"
ADD COLUMN IF NOT EXISTS "PhonePrefix" character varying(10);

COMMENT ON COLUMN "Members"."PhonePrefix" IS 'Dial code prefix for member phone numbers (e.g. +598, +55).';

