'use client';

import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import ArticleCard from './ArticleCard';
import { fetchTopHeadlines } from '@/utils/news';
import { generateArticleSummary, analyzeArticleSentiment } from '@/utils/openrouter';
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
};

type ArticleListProps = {
  category: string;
};

export default function ArticleList({ category }: ArticleListProps) {
  const { darkMode } = useDarkMode();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSummarized, setShowSummarized] = useState(false);
  const articlesPerPage = 3; // Number of articles to load per page

  const fetchArticles = useCallback(async (pageNum: number, isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError('');
    
    try {
      // For demo purposes, we'll fetch directly from News API instead of using n8n
      // In a production application, this would typically come from the Nhost database
      // after being processed by n8n
      
      // Step 1: Fetch articles from News API
      const categoryParam = category === 'Top Stories' ? undefined : category.toLowerCase();
      const response = await fetchTopHeadlines(categoryParam, pageNum, articlesPerPage);
      
      if (response.status !== 'ok') {
        throw new Error('Failed to fetch articles');
      }
      
      // Step 2: Process articles with OpenRouter AI
      // In production, this would be done by n8n, not in the browser
      const processedArticles: Article[] = [];
      
      for (let i = 0; i < Math.min(articlesPerPage, response.articles.length); i++) {
        const article = response.articles[i];
        
        // Generate summary and sentiment analysis in parallel
        const [summary, sentimentResult] = await Promise.all([
          generateArticleSummary(article.title, article.description, article.content || ''),
          analyzeArticleSentiment(article.title, article.description, article.content || '')
        ]);
        
        processedArticles.push({
          id: `article-${pageNum}-${i}-${Date.now()}`,
          title: article.title,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          summary,
          sentiment: sentimentResult.sentiment,
          sentimentExplanation: sentimentResult.explanation
        });
      }
      
      setArticles(prev => isInitialLoad ? processedArticles : [...prev, ...processedArticles]);
      
      // Check if there are more articles to load
      // Always show "Show More" for at least the first page, or if the API returns enough articles
      setHasMore(pageNum === 1 || response.articles.length >= articlesPerPage);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
      
      // Fallback to mock data for demo purposes
      const mockArticles: Article[] = Array.from({ length: articlesPerPage }, (_, i) => {
        const index = (pageNum - 1) * articlesPerPage + i;
        return {
          id: `article-${category}-${index}`,
          title: `${category} News Article ${index + 1}`,
          source: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][Math.floor(Math.random() * 5)],
          publishedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
          url: '#',
          summary: `This is a summary of the ${category.toLowerCase()} article ${index + 1}. It contains key information from the original article processed by AI to be concise and informative.`,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
          sentimentExplanation: `The article ${index + 1} has a ${['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)]} tone because of the language used and the context of the information presented.`,
        };
      });
      
      setArticles(prev => isInitialLoad ? mockArticles : [...prev, ...mockArticles]);
      // Always ensure "Show More" is visible for the first page of mock data
      setHasMore(pageNum === 1 || pageNum < 3);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [category, articlesPerPage]);

  useEffect(() => {
    // Reset pagination when category changes
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [category, fetchArticles]);

  // Make the "Show More" button always visible initially, even before content loads
  useEffect(() => {
    setHasMore(true);
  }, []);

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  };

  const toggleSummarizedView = () => {
    setShowSummarized(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="py-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => fetchArticles(1, true)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No articles found for this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={showSummarized ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-6"}>
        {articles.map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            summarizedView={showSummarized}
            darkMode={darkMode}
          />
        ))}
      </div>
      
      {error && (
        <div className="text-center mt-4">
          <p className="text-red-500 mb-2">{error}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        {/* Always show the button, but disable it when no more content */}
        <button
          onClick={handleShowMore}
          disabled={isLoadingMore || !hasMore}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoadingMore ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></span>
              Loading...
            </span>
          ) : !hasMore ? (
            'No More Articles'
          ) : (
            'Show More Articles'
          )}
        </button>
        
        {articles.length > 0 && (
          <button
            onClick={toggleSummarizedView}
            className={`px-4 py-2 rounded-md transition-colors ${
              darkMode 
                ? 'bg-indigo-800 text-indigo-200 border border-indigo-700 hover:bg-indigo-700' 
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200'
            }`}
          >
            {showSummarized ? 'Show Detailed View' : 'Show Summarized Grid'}
          </button>
        )}
      </div>
    </div>
  );
} 