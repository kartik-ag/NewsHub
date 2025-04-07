'use client';

import { useState } from 'react';
import { useUserData } from '@nhost/nextjs';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';

export default function Profile() {
  const user = useUserData();
  const { darkMode } = useDarkMode();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // In a real app, you would call your backend API to update the profile
      // For example: await nhost.auth.updateUserEmail({ displayName });
      
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:justify-between md:items-center mb-8">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Profile</h1>
          </div>
          
          <div className={`rounded-lg shadow-sm p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-semibold">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user?.displayName || 'User'}</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              </div>
            </div>
            
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile Information</h3>
              
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      className={`mt-1 block w-full rounded-md shadow-sm px-4 py-2 ${
                        darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-50 text-gray-500 border-gray-300'
                      }`}
                      readOnly
                    />
                    <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email changes require additional verification
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="displayName" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} mt-8 pt-6`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Account Created</p>
                  <p className="mt-1">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Active</p>
                  <p className="mt-1">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 