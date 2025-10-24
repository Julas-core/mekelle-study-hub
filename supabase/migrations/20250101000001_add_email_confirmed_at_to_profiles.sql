-- Add email_confirmed_at column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE;