// Mock verification service for testing without database
interface MockCreateVerificationTokenParams {
  userId: string;
  email: string;
}

// In-memory storage for mock tokens (for testing only)
let mockTokens: Record<string, { userId: string; email: string; expiresAt: Date }> = {};

export const mockCreateVerificationToken = async ({
  userId,
  email
}: MockCreateVerificationTokenParams): Promise<{ token: string; error?: string }> => {
  try {
    // Generate a unique token
    const token = `mock-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store in mock storage
    mockTokens[token] = { userId, email, expiresAt };
    
    return { token };
  } catch (error) {
    console.error('Error in mockCreateVerificationToken:', error);
    return { token: '', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const mockVerifyEmailToken = async (token: string): Promise<{ success: boolean; userId?: string; userEmail?: string; error?: string }> => {
  try {
    // Find the token in mock storage
    const tokenData = mockTokens[token];
    
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired verification token' };
    }
    
    // Check if the token has expired
    const now = new Date();
    
    if (now > tokenData.expiresAt) {
      // Token has expired, delete it
      delete mockTokens[token];
      return { success: false, error: 'Verification token has expired' };
    }
    
    // Get the user's email from the token
    const userEmail = tokenData.email;
    const userId = tokenData.userId;
    
    // Delete the used token
    delete mockTokens[token];
    
    return { success: true, userId, userEmail };
  } catch (error) {
    console.error('Error in mockVerifyEmailToken:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// For testing purposes, clear mock tokens
export const clearMockTokens = () => {
  mockTokens = {};
};