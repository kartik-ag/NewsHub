'use client';

import { useState } from 'react';
import { useUserData } from '@nhost/nextjs';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';
import { nhost } from '@/utils/nhost';

export default function Settings() {
  const user = useUserData();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // In a real app, you would call your backend API to save settings
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!confirm('Do you want to reset your password? A reset link will be sent to your email.')) {
      return;
    }
    
    try {
      await nhost.auth.resetPassword({ email: user?.email || '' });
      toast.success('Password reset link has been sent to your email');
      toast.success('Please check your inbox and click the link to set a new password', { duration: 5000 });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset email');
    }
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:justify-between md:items-center mb-8">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          </div>
          
          <div className={`rounded-lg shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="divide-y divide-gray-200">
              {/* App Preferences */}
              <div className="p-6">
                <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Application Preferences</h2>
                
                <form onSubmit={handleSaveSettings}>
                  <div className="space-y-6">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Dark Mode</h3>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enable dark mode for the application</p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                        onClick={toggleDarkMode}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            darkMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Language Selection */}
                    <div>
                      <label htmlFor="language" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Language
                      </label>
                      <select
                        id="language"
                        name="language"
                        className={`mt-1 block w-full rounded-md py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                        }`}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    
                    {/* Email Notifications */}
                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="emailNotifications"
                          name="emailNotifications"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications" className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Email Notifications
                        </label>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive email updates about new content and digests</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Account Settings */}
              <div className="p-6">
                <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                      onClick={handlePasswordReset}
                    >
                      Change Password
                    </button>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800 font-medium"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          toast.success('Account deletion request submitted');
                        }
                      }}
                    >
                      Delete Account
                    </button>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Permanently delete your account and all of your content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 