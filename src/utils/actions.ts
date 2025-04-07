import { nhost, getAuthToken } from './nhost';

// Base function for making authenticated Hasura Action requests
export const hasuraAction = async <T>(
  actionName: string,
  variables: Record<string, any> = {}
): Promise<T> => {
  const authToken = await getAuthToken();
  
  if (!authToken) {
    throw new Error('Authentication required');
  }

  try {
    // For development, we'll use our local API endpoints instead
    if (actionName === 'get_user_preferences') {
      return fetchUserPreferences(authToken) as unknown as T;
    }
    
    if (actionName === 'update_user_preferences') {
      return updatePreferencesApi(variables.preferences, authToken) as unknown as T;
    }
    
    if (actionName === 'get_saved_articles') {
      return fetchSavedArticlesApi(authToken) as unknown as T;
    }
    
    if (actionName === 'save_article') {
      return saveArticleApi(variables.article_id, authToken) as unknown as T;
    }
    
    if (actionName === 'remove_saved_article') {
      return removeSavedArticleApi(variables.saved_id, authToken) as unknown as T;
    }
    
    // Fall back to regular hasura actions for other actions
    const endpoint = `${nhost.graphql.getUrl().replace('/v1/graphql', '')}/actions/v1`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        action: actionName,
        input: variables,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Action request failed');
    }

    return response.json();
  } catch (error) {
    console.error(`Error in hasuraAction (${actionName}):`, error);
    throw error;
  }
};

// Helper function to fetch user preferences from our local API
const fetchUserPreferences = async (token: string) => {
  const response = await fetch('/api/preferences', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch preferences');
  }
  
  return response.json();
};

// Helper function to update user preferences via our local API
const updatePreferencesApi = async (preferences: any, token: string) => {
  const response = await fetch('/api/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      preferences,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }
  
  return { success: true };
};

// Helper function to fetch saved articles from our local API
const fetchSavedArticlesApi = async (token: string) => {
  const response = await fetch('/api/articles/saved', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch saved articles');
  }
  
  return response.json();
};

// Helper function to save an article via our local API
const saveArticleApi = async (articleId: string, token: string) => {
  const response = await fetch('/api/articles/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      articleId,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save article');
  }
  
  return { success: true };
};

// Helper function to remove a saved article via our local API
const removeSavedArticleApi = async (savedId: string, token: string) => {
  // For the local API, we need to fetch the saved article first to get the articleId
  const savedResponse = await fetch('/api/articles/saved', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  
  if (!savedResponse.ok) {
    throw new Error('Failed to fetch saved articles');
  }
  
  const savedData = await savedResponse.json();
  const savedArticle = savedData.articles.find((article: any) => article.saved_id === savedId);
  
  if (!savedArticle) {
    throw new Error('Saved article not found');
  }
  
  const response = await fetch('/api/articles/save', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      articleId: savedArticle.id,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to remove saved article');
  }
  
  return { success: true };
};

// =============== Action-specific functions ===============

// Fetch news articles based on user preferences and category
export const fetchNewsArticles = async (category: string) => {
  return hasuraAction<{
    articles: Array<{
      id: string;
      title: string;
      source: string;
      publishedAt: string;
      url: string;
      summary: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      sentimentExplanation: string;
    }>
  }>('fetch_news_articles', { category });
};

// Get user preferences
export const getUserPreferences = async () => {
  return hasuraAction<{
    preferences: {
      topics: string[];
      keywords: string[];
      sources: string[];
    }
  }>('get_user_preferences', {});
};

// Update user preferences
export const updateUserPreferences = async (preferences: {
  topics: string[];
  keywords: string[];
  sources: string[];
}) => {
  return hasuraAction<{ success: boolean }>('update_user_preferences', {
    preferences,
  });
};

// Get user's saved articles
export const getSavedArticles = async () => {
  return hasuraAction<{
    articles: Array<{
      id: string;
      saved_id: string;
      title: string;
      source: string;
      publishedAt: string;
      url: string;
      summary?: string;
      sentiment?: 'positive' | 'negative' | 'neutral';
      sentimentExplanation?: string;
    }>
  }>('get_saved_articles', {});
};

// Save an article for later reading
export const saveArticle = async (articleId: string) => {
  return hasuraAction<{ success: boolean }>('save_article', {
    article_id: articleId,
  });
};

// Remove a saved article
export const removeSavedArticle = async (savedId: string) => {
  return hasuraAction<{ success: boolean }>('remove_saved_article', {
    saved_id: savedId,
  });
}; 