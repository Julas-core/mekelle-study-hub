import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @deno-types="npm:@types/node"
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: string;
  token?: string;
  token_hash?: string;
  redirect_to?: string;
}

const createEmailTemplate = (type: string, token: string, tokenHash: string, redirectTo: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const verificationLink = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${redirectTo}`;

  const templates = {
    signup: {
      subject: "Verify your email - MU Study Hub",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .content h2 { color: #333; font-size: 24px; margin: 0 0 20px 0; }
              .content p { color: #666; margin: 0 0 20px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
              .code-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center; }
              .code { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; }
              .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
              .footer a { color: #667eea; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MU Study Hub</h1>
              </div>
              <div class="content">
                <h2>Welcome to MU Study Hub!</h2>
                <p>Thank you for joining our academic community. Please verify your email address to complete your registration.</p>
                
                <p style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
                </p>
                
                <p>Or use this verification code:</p>
                <div class="code-box">
                  <div class="code">${token}</div>
                </div>
                
                <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px;">Help Build Our Academic Community</h3>
                  <p style="margin: 0 0 12px 0; color: #555; line-height: 1.6;">We believe education should be accessible to all students. You can make a real difference by sharing your course materials, notes, and resources.</p>
                  <p style="margin: 0 0 12px 0; color: #555; line-height: 1.6;"><strong>Why contribute?</strong></p>
                  <ul style="margin: 0 0 12px 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;">Help fellow students access materials they need without waiting</li>
                    <li style="margin-bottom: 8px;">Build a comprehensive library that benefits everyone</li>
                    <li style="margin-bottom: 8px;">Share knowledge and contribute to academic excellence</li>
                    <li style="margin-bottom: 8px;">Create a lasting resource for future generations of students</li>
                  </ul>
                  <p style="margin: 12px 0 0 0; color: #555; line-height: 1.6;">Every lecture note, textbook, assignment, or study guide you upload helps create an ecosystem where students can learn independently and efficiently. Don't let valuable educational materials sit unused on your device—share them today and be part of something bigger.</p>
                </div>
                
                <p style="color: #999; font-size: 14px; margin-top: 30px;">If you didn't create an account with MU Study Hub, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p><strong>MU Study Hub</strong></p>
                <p style="margin-top: 5px; color: #888;">Mekelle University Academic Material Distribution Platform</p>
                <p style="margin-top: 15px;">Need help? Contact us at <a href="mailto:julasmame@gmail.com">julasmame@gmail.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    magiclink: {
      subject: "Sign in to MU Study Hub",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .content h2 { color: #333; font-size: 24px; margin: 0 0 20px 0; }
              .content p { color: #666; margin: 0 0 20px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
              .footer a { color: #667eea; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MU Study Hub</h1>
              </div>
              <div class="content">
                <h2>Sign In Request</h2>
                <p>Click the button below to sign in to your MU Study Hub account:</p>
                <p style="text-align: center;">
                  <a href="${verificationLink}" class="button">Sign In to MU Study Hub</a>
                </p>
                <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p><strong>MU Study Hub</strong></p>
                <p style="margin-top: 5px; color: #888;">Mekelle University Academic Material Distribution Platform</p>
                <p style="margin-top: 15px;">Need help? Contact us at <a href="mailto:julasmame@gmail.com">julasmame@gmail.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    },
    recovery: {
      subject: "Reset your password - MU Study Hub",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .content h2 { color: #333; font-size: 24px; margin: 0 0 20px 0; }
              .content p { color: #666; margin: 0 0 20px 0; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
              .footer a { color: #667eea; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>MU Study Hub</h1>
              </div>
              <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your MU Study Hub account. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                  <a href="${verificationLink}" class="button">Reset Password</a>
                </p>
                <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                <p><strong>MU Study Hub</strong></p>
                <p style="margin-top: 5px; color: #888;">Mekelle University Academic Material Distribution Platform</p>
                <p style="margin-top: 15px;">Need help? Contact us at <a href="mailto:julasmame@gmail.com">julasmame@gmail.com</a></p>
              </div>
            </div>
          </body>
        </html>
      `
    }
  };

  return templates[type as keyof typeof templates] || templates.signup;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type, token, token_hash, redirect_to }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email}`);

    if (!token || !token_hash) {
      throw new Error("Missing token or token_hash");
    }

    const redirectUrl = redirect_to || `${Deno.env.get("SUPABASE_URL")}/`;
    const emailTemplate = createEmailTemplate(type, token, token_hash, redirectUrl);

    const emailResponse = await resend.emails.send({
      from: "MU Study Hub <onboarding@resend.dev>",
      to: [email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
