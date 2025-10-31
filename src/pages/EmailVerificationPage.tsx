import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockVerifyEmailToken } from '../utils/mockVerificationService';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await mockVerifyEmailToken(token);
        
        if (result.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          
          // Optionally redirect after a delay
          setTimeout(() => {
            navigate('/login'); // or wherever you want to redirect after verification
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
        console.error('Verification error:', error);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Successful!</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>{message}</p>
                <p className="mt-4 font-medium">
                  Welcome to Mekelle University Study Hub! 
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  We're excited to have you as part of our academic community. 
                  Your contribution matters greatly - if you have any educational materials, 
                  notes, or resources that could benefit fellow students, 
                  we kindly invite you to share them on our platform. 
                  By uploading your materials, you're helping create an environment 
                  where students can proactively access resources and enhance their learning experience 
                  without waiting for traditional distribution methods.
                </p>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Verification Failed</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p>{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;