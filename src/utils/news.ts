/**
 * Utility functions for fetching news articles directly from News API
 * Can be used as an alternative to the n8n workflow or for development
 */

// Define types for the News API response
type NewsAPIResponse = {
  status: string;
  totalResults: number;
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
  // In a production environment, this should be called from a server-side function
  // to avoid exposing your API key in client-side code
  const apiKey = process.env.NEWS_API_KEY;
  
  // If no API key is found, return mock data for development
  if (!apiKey) {
    console.warn('NEWS_API_KEY not found in environment variables, using mock data');
    return getMockNewsData(category, page, pageSize);
  }
  
  let url = `https://newsapi.org/v2/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
  
  if (category) {
    url += `&category=${category}`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API request failed: ${errorText}`);
    }
    
    return response.json();
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
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEWS_API_KEY not found in environment variables');
  }
  
  let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&apiKey=${apiKey}`;
  
  if (from) {
    url += `&from=${from}`;
  }
  
  if (to) {
    url += `&to=${to}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`News API request failed: ${errorText}`);
  }
  
  return response.json();
}; 