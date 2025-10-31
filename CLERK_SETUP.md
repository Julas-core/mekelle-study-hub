# Clerk Integration Setup

Your application has been successfully migrated to use Clerk for authentication! Here's what you need to do to complete the setup:

## Configure Clerk JWT Template

To allow Clerk to work with your Supabase backend, you need to create a JWT template in Clerk:

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to **JWT Templates** in the sidebar
3. Click **New template**
4. Select **Supabase** as the template type
5. Configure the template with your Supabase project details:
   - **Name**: `supabase`
   - **Supabase Project URL**: Your project URL (already configured)
   - **Supabase JWT Secret**: Get this from your Supabase project settings

6. The template will automatically include the required claims:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address}}",
     "role": "authenticated"
   }
   ```

7. Save the template

## What's Been Changed

- ✅ Database schema updated to use Clerk's string-based user IDs
- ✅ All RLS policies updated to use Clerk JWT format (`auth.jwt()->>'sub'`)
- ✅ Auth hook updated to use Clerk
- ✅ Sign in/up pages now use Clerk components
- ✅ User profile photos from Clerk are automatically synced to your database

## User Profile Photos

The `ClerkUserSync` component automatically:
- Syncs user data from Clerk to your Supabase profiles table
- Updates the `avatar_url` field with the user's Clerk profile photo
- Keeps the data in sync whenever the user's Clerk profile changes

## Testing

Once you've configured the JWT template:
1. Try signing in with an existing account or creating a new one
2. Your Clerk profile photo should appear in the header
3. All your existing features (uploads, bookmarks, comments, etc.) should work as before
