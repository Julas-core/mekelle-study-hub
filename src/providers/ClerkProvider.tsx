import { ClerkProvider as ClerkAuthProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkAuthProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </ClerkAuthProvider>
  );
}
