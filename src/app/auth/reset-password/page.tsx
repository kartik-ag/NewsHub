'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nhost } from '@/utils/nhost';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';

export default function RequestPasswordReset() {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await nhost.auth.resetPassword({ email });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setIsEmailSent(true);
      toast.success('Password reset link has been sent to your email');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isEmailSent) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className={`max-w-md w-full rounded-lg shadow-sm p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold text-center mb-6">Check Your Email</h2>
          <div className="text-center mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 mx-auto text-indigo-600 mb-4" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <p className={`mb-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We've sent a password reset link to <span className="font-semibold">{email}</span>. Check your email and click the link to reset your password.
          </p>
          <p className={`mb-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            If you don't see the email, check your spam folder. The link will expire in 24 hours.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-sm p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>
        <p className={`mb-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
} 