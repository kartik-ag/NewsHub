'use client';

import { useUserData } from '@nhost/nextjs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import NewsPreferencesForm from '@/components/NewsPreferencesForm';
import ArticleList from '@/components/ArticleList';
import Header from '@/components/Header';
import { getUserPreferences } from '@/utils/actions';
import { useDarkMode } from '@/context/DarkModeContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const user = useUserData();
  const { darkMode } = useDarkMode();
  const [categories] = useState({
    'Top Stories': [],
    'Technology': [],
    'Business': [],
    'Health': [],
    'Science': [],
  });

  // Default preferences
  const [preferences, setPreferences] = useState({
    topics: ['technology', 'business'],
    keywords: ['AI', 'climate'],
    sources: ['bbc-news', 'the-verge'],
  });
  
  // Loading state for preferences
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user preferences when component mounts
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getUserPreferences();
        
        if (result && result.preferences) {
          setPreferences(result.preferences);
        }
      } catch (error: any) {
        console.error('Error fetching user preferences:', error);
        setError(error.message || 'Failed to load preferences');
        // Keep default preferences on error
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserPreferences();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* News Feed */}
            <div className="lg:col-span-2">
              <div className={`shadow rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Personal News Feed</h2>
                
                <Tab.Group>
                  <Tab.List className={`flex space-x-1 rounded-xl p-1 ${darkMode ? 'bg-gray-700' : 'bg-indigo-100'}`}>
                    {Object.keys(categories).map((category) => (
                      <Tab
                        key={category}
                        className={({ selected }) =>
                          classNames(
                            'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                            selected
                              ? `${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-indigo-700'} shadow`
                              : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-indigo-500 hover:bg-white/[0.12]'} hover:text-indigo-700`
                          )
                        }
                      >
                        {category}
                      </Tab>
                    ))}
                  </Tab.List>
                  <Tab.Panels className="mt-4">
                    {Object.values(categories).map((articles, idx) => (
                      <Tab.Panel
                        key={idx}
                        className={classNames(
                          'rounded-xl p-3',
                          `${darkMode ? 'bg-gray-800' : 'bg-white'}`,
                          'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2'
                        )}
                      >
                        <ArticleList category={Object.keys(categories)[idx]} />
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
            
            {/* Preferences and Profile */}
            <div>
              <div className={`shadow rounded-lg p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Your Profile</h2>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.displayName || 'User'}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className={`shadow rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>News Preferences</h2>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <NewsPreferencesForm 
                    preferences={preferences} 
                    setPreferences={setPreferences} 
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 