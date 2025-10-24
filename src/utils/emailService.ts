import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

interface SendVerificationEmailParams {
  email: string;
  token: string;
  fullName?: string;
}

export const sendVerificationEmail = async ({
  email,
  token,
  fullName = 'User'
}: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;
    
    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your domain once verified
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome ${fullName}!</h2>
          <p>Thank you for registering with MU Study Hub. Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
               Verify Email
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          
          <p style="margin-top: 30px; color: #888; font-size: 14px;">
            If you didn't create an account with MU Study Hub, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #888; font-size: 12px;">
            MU Study Hub<br>
            Mekelle University
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};