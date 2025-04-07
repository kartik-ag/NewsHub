'use client';

import { useState } from 'react';
import { getAuthToken } from '@/utils/nhost';
import toast from 'react-hot-toast';
import { saveArticle } from '@/utils/actions';

type Article = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentExplanation?: string;
};

type ArticleCardProps = {
  article: Article;
  summarizedView?: boolean;
  initialSaved?: boolean;
  onRemove?: () => void;
  darkMode?: boolean;
};

export default function ArticleCard({ 
  article, 
  summarizedView = false, 
  initialSaved = false,
  onRemove,
  darkMode = false
}: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);

  const getSentimentColor = (sentiment?: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'negative':
        return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      case 'neutral':
      default:
        return darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleSave = async () => {
    setIsLoading(true);
    try {
      if (isSaved && onRemove) {
        // If we have an onRemove handler and the article is saved, use that
        onRemove();
        setIsSaved(false);
      } else {
        // Use our saveArticle action which is connected to the API
        await saveArticle(article.id);
        
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Article removed from saved' : 'Article saved');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setIsLoading(false);
    }
  };

  const truncateSummary = (summary?: string) => {
    if (!summary) return '';
    return showFullSummary ? summary : `${summary.slice(0, 120)}${summary.length > 120 ? '...' : ''}`;
  };

  return (
    <div className={`rounded-lg shadow-sm border transition-shadow ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:shadow-gray-700/20' 
        : 'bg-white border-gray-100 hover:shadow'
    } ${summarizedView ? 'p-4 overflow-hidden' : 'p-6'}`}>
      <div className="flex justify-between items-start">
        <h3 className={`${summarizedView ? 'text-base' : 'text-lg'} font-semibold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>{article.title}</h3>
        <button
          onClick={toggleSave}
          disabled={isLoading}
          className={`${isSaved ? 'text-indigo-600' : darkMode ? 'text-gray-400 hover:text-indigo-500' : 'text-gray-400 hover:text-indigo-600'}`}
          aria-label={isSaved ? 'Unsave article' : 'Save article'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isSaved ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`${summarizedView ? 'w-4 h-4' : 'w-5 h-5'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
            />
          </svg>
        </button>
      </div>
      
      <div className={`flex items-center text-sm mt-1 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span>{article.source}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>
      
      {summarizedView ? (
        // Summarized view
        <div>
          {article.summary ? (
            <p className={`text-xs leading-relaxed line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {article.summary}
            </p>
          ) : (
            <p className={`text-xs italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No summary available</p>
          )}
          
          <div className="flex justify-between items-center mt-3">
            {article.sentiment && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getSentimentColor(
                  article.sentiment
                )}`}
              >
                {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
              </span>
            )}
            
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
            >
              Read article
            </a>
          </div>
        </div>
      ) : (
        // Regular view
        <>
          {article.summary && (
            <div className="mb-3">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {truncateSummary(article.summary)}
                {article.summary.length > 120 && (
                  <button
                    onClick={() => setShowFullSummary(!showFullSummary)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm ml-1 font-medium"
                  >
                    {showFullSummary ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}
          
          {article.sentiment && (
            <div className="mt-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSentimentColor(
                  article.sentiment
                )}`}
              >
                {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
              </span>
              {article.sentimentExplanation && showFullSummary && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{article.sentimentExplanation}</p>
              )}
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Read full article
            </a>
            
            <div className="flex space-x-2">
              <button
                className={`${darkMode ? 'text-gray-400 hover:text-indigo-500' : 'text-gray-400 hover:text-indigo-600'}`}
                aria-label="Share article"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 0"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 