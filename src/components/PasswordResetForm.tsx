'use client';

import { useState, useEffect } from 'react';
import { nhost } from '@/utils/nhost';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';

export default function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { darkMode } = useDarkMode();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  
  // Get ticket and hash from URL
  const ticket = searchParams?.get('ticket') || '';
  const hash = searchParams?.get('hash') || '';
  
  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!ticket || !hash) {
        setIsTokenValid(false);
        setIsTokenChecked(true);
        return;
      }
      
      try {
        // Just check if the tokens exist, actual validation happens during password reset
        setIsTokenValid(true);
      } catch (error) {
        console.error('Error validating reset token:', error);
        setIsTokenValid(false);
      } finally {
        setIsTokenChecked(true);
      }
    };
    
    checkToken();
  }, [ticket, hash]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // The resetPassword method in Nhost is actually used to send the reset email
      // For changing the password after clicking the reset link, we need to manually do an API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_NHOST_URL}/auth/password/reset/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: password,
          ticket,
          hash
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      toast.success('Password has been reset successfully');
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isTokenChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!isTokenValid) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center px-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className={`max-w-md w-full rounded-lg shadow-sm p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold text-center mb-6">Invalid or Expired Link</h2>
          <p className={`mb-6 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This password reset link is invalid or has expired. Please request a new password reset link.
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
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 ${
                darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
              }`}
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/auth/login')}
            className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
} 