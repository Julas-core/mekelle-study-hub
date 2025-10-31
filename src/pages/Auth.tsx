import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <SignIn 
            routing="path" 
            path="/auth"
            signUpUrl="/auth"
            afterSignInUrl="/"
          />
        ) : (
          <SignUp 
            routing="path" 
            path="/auth"
            signInUrl="/auth"
            afterSignUpUrl="/"
          />
        )}
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
