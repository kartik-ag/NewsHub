/**
 * Utility functions for fetching news articles directly from News API
 * Can be used as an alternative to the n8n workflow or for development
 */

// Define types for the News API response
type NewsAPIResponse = {
  status: string;
  totalResults?: number;
  error?: string;
  articles: Array<{
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }>;
};

/**
 * Gets the appropriate URL for News API calls
 * Uses our proxy endpoint in production and direct calls in development
 */
const getNewsApiUrl = (category?: string, page: number = 1, pageSize: number = 10, country: string = 'us') => {
  // In development, we can call News API directly if we have the key
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_NEWS_API_KEY) {
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`;
    
    if (category) {
      url += `&category=${category}`;
    }
    
    return url;
  }
  
  // In production, use our proxy endpoint
  let url = `/api/news?country=${country}&page=${page}&pageSize=${pageSize}`;
  
  if (category) {
    url += `&category=${category}`;
  }
  
  return url;
};

/**
 * Fetches top headlines from News API
 * @param category - Optional category filter (business, entertainment, general, health, science, sports, technology)
 * @param page - Page number (default 1)
 * @param pageSize - Number of results to return per page (max 100)
 * @param country - Optional country code (us, gb, in, etc.)
 * @returns Promise with news articles
 */
export const fetchTopHeadlines = async (
  category?: string,
  page: number = 1,
  pageSize: number = 10,
  country: string = 'us'
): Promise<NewsAPIResponse> => {
  // Check if we're in development and have no API key
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const isDevelopmentWithoutKey = process.env.NODE_ENV === 'development' && !apiKey;
  
  // If no API key is found in development, return mock data
  if (isDevelopmentWithoutKey) {
    console.warn('NEXT_PUBLIC_NEWS_API_KEY not found in environment variables, using mock data');
    return getMockNewsData(category, page, pageSize);
  }
  
  try {
    const url = getNewsApiUrl(category, page, pageSize, country);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API request failed: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Check if the response contains an error property (from our proxy)
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching from News API:', error);
    // Return mock data on error
    return getMockNewsData(category, page, pageSize);
  }
};

/**
 * Generate mock news data for development and testing
 */
function getMockNewsData(category?: string, page: number = 1, pageSize: number = 10): NewsAPIResponse {
  // Generate a deterministic set of mock articles based on category and page
  const categoryName = category || 'general';
  const startIndex = (page - 1) * pageSize;
  
  const mockArticles = Array.from({ length: pageSize }, (_, i) => {
    const index = startIndex + i;
    return {
      source: {
        id: null,
        name: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][index % 5]
      },
      author: `Author ${index + 1}`,
      title: `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} News Article ${index + 1}`,
      description: `This is a description for ${categoryName} news article ${index + 1}. It provides a brief overview of the content.`,
      url: 'https://example.com/article',
      urlToImage: null,
      publishedAt: new Date(Date.now() - (index * 3600000)).toISOString(),
      content: `This is the full content of the ${categoryName} article ${index + 1}. It contains more detailed information about the topic and expands on what was mentioned in the description.`
    };
  });
  
  return {
    status: 'ok',
    totalResults: 100, // Simulate having 100 total results
    articles: mockArticles
  };
}

/**
 * Searches for news articles matching a query
 * @param query - Search query
 * @param from - Start date in ISO format
 * @param to - End date in ISO format
 * @param pageSize - Number of results to return (max 100)
 * @returns Promise with news articles
 */
export const searchNews = async (
  query: string,
  from?: string,
  to?: string,
  pageSize: number = 10
): Promise<NewsAPIResponse> => {
  // Use mock data in production for search since we don't have a proxy for this endpoint yet
  if (process.env.NODE_ENV !== 'development' || !process.env.NEXT_PUBLIC_NEWS_API_KEY) {
    return {
      status: 'ok',
      totalResults: 10,
      articles: Array.from({ length: pageSize }, (_, i) => ({
        source: {
          id: null,
          name: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][i % 5]
        },
        author: `Author ${i + 1}`,
        title: `Search Result for "${query}" - Article ${i + 1}`,
        description: `This is a description for search result about "${query}" article ${i + 1}.`,
        url: 'https://example.com/article',
        urlToImage: null,
        publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        content: `This is the full content of the article about "${query}". It contains more detailed information about the topic.`
      }))
    };
  }
  
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  
  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&apiKey=${apiKey}`;
  
  if (from) {
    url += `&from=${from}`;
  }
  
  if (to) {
    url += `&to=${to}`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API request failed: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error searching articles:', error);
    // Return mock data on error
    return {
      status: 'ok',
      totalResults: 10,
      articles: Array.from({ length: pageSize }, (_, i) => ({
        source: {
          id: null,
          name: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][i % 5]
        },
        author: `Author ${i + 1}`,
        title: `Search Result for "${query}" - Article ${i + 1}`,
        description: `This is a description for search result about "${query}" article ${i + 1}.`,
        url: 'https://example.com/article',
        urlToImage: null,
        publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
        content: `This is the full content of the article about "${query}". It contains more detailed information about the topic.`
      }))
    };
  }
}; 