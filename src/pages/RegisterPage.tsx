import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationEmail } from '../utils/emailService';
import { supabase } from '@/integrations/supabase/client';
import { mockCreateVerificationToken } from '../utils/mockVerificationService';

interface RegisterFormData {
  email: string;
  password: string;
  fullName: string;
  department: string;
  studentId?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    fullName: '',
    department: '',
    studentId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // Sign up the user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            department: formData.department,
            student_id: formData.studentId
          },
          emailRedirectTo: `${window.location.origin}/auth/callback` // This will be used for email confirmation
        }
      });
      
      if (authError) throw authError;
      
      const user = data.user;
      if (!user) {
        setMessage('Registration successful but no user object returned');
        setMessageType('error');
        return;
      }
      
      // Create a profile entry in the profiles table if it doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          department: formData.department,
          student_id: formData.studentId
        });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Don't fail the registration if profile creation fails, but log it
      }
      
      // Create a verification token for this user (using mock service for testing)
      const tokenResult = await mockCreateVerificationToken({
        userId: user.id,
        email: formData.email
      });
      
      if (tokenResult.error) {
        setMessage(`Error creating verification token: ${tokenResult.error}`);
        setMessageType('error');
        return;
      }
      
      // Send the verification email using Resend
      const emailResult = await sendVerificationEmail({
        email: formData.email,
        token: tokenResult.token,
        fullName: formData.fullName
      });
      
      if (emailResult.success) {
        setMessage('Registration successful! Please check your email to verify your account.');
        setMessageType('success');
        // Optionally clear the form
        setFormData({
          email: '',
          password: '',
          fullName: '',
          department: '',
          studentId: '',
        });
      } else {
        setMessage(`Error sending verification email: ${emailResult.error}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div 
              className={`mb-4 px-4 py-3 rounded relative ${
                messageType === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : messageType === 'error' 
                  ? 'bg-red-100 border border-red-400 text-red-700' 
                  : 'bg-blue-100 border border-blue-400 text-blue-700'
              }`}
            >
              {message}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <div className="mt-1">
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                Student ID (Optional)
              </label>
              <div className="mt-1">
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="/auth" 
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;