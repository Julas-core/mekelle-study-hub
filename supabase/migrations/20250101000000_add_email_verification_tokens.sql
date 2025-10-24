-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- Create index for expired token cleanup
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Row level security
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own verification tokens
CREATE POLICY "Users can read own verification tokens" ON email_verification_tokens
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own verification tokens
CREATE POLICY "Users can insert own verification tokens" ON email_verification_tokens
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run the cleanup function
-- This will run once a day to clean up expired tokens
-- Commenting out for now as this requires the pg_cron extension to be enabled
-- SELECT cron.schedule(
--     'cleanup-expired-verification-tokens', 
--     '0 0 * * *',  -- Run daily at midnight
--     $$SELECT cleanup_expired_verification_tokens()$$
-- );