'use client';

import { useState, useEffect } from 'react';
import { useUserData } from '@nhost/nextjs';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import ArticleCard from '@/components/ArticleCard';
import Header from '@/components/Header';
import { getSavedArticles, removeSavedArticle } from '@/utils/actions';
import Link from 'next/link';
import { useDarkMode } from '@/context/DarkModeContext';

type Article = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentExplanation?: string;
  saved_id?: string; // ID from the saved_articles table
};

export default function SavedArticles() {
  const user = useUserData();
  const { darkMode } = useDarkMode();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await getSavedArticles();
        
        if (result && result.articles) {
          setArticles(result.articles);
        } else {
          setArticles([]);
        }
      } catch (err: any) {
        console.error('Error fetching saved articles:', err);
        setError(err.message || 'Failed to load saved articles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedArticles();
  }, [user]);

  const handleRemoveArticle = async (savedId: string) => {
    try {
      await removeSavedArticle(savedId);
      // Remove article from the list
      setArticles(prevArticles => prevArticles.filter(article => article.saved_id !== savedId));
    } catch (err: any) {
      console.error('Error removing article:', err);
    }
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Saved Articles</h1>
            <Link 
              href="/dashboard" 
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          
          {isLoading ? (
            <div className="py-10">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className={`py-10 text-center rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
              </svg>
              <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No Saved Articles</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>You haven't saved any articles yet.</p>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
              >
                Browse Articles
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <div key={article.id} className="relative">
                  <ArticleCard 
                    article={article} 
                    initialSaved={true}
                    onRemove={() => article.saved_id && handleRemoveArticle(article.saved_id)}
                    darkMode={darkMode}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
} 