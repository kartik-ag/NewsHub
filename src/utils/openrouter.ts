/**
 * Utility functions for OpenRouter API integration
 * Used for article summarization and sentiment analysis
 */

type OpenRouterMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
};

type OpenRouterResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    index: number;
    finish_reason: string;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type SentimentResult = {
  sentiment: 'positive' | 'negative' | 'neutral';
  explanation: string;
};

/**
 * Gets the appropriate URL for OpenRouter API calls
 * Uses our proxy endpoint in production and direct calls in development
 */
const getOpenRouterUrl = () => {
  // In development, we can call OpenRouter directly
  if (process.env.NODE_ENV === 'development') {
    return 'https://openrouter.ai/api/v1/chat/completions';
  }
  
  // In production, use our proxy endpoint
  return '/api/openrouter';
};

/**
 * Generates a summary of an article using OpenRouter's AI models
 * @param title - Article title
 * @param description - Article description
 * @param content - Article content
 * @returns Promise containing the summary
 */
export const generateArticleSummary = async (
  title: string,
  description: string,
  content: string
): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_OPENROUTER_API_KEY not found in environment variables');
  }
  
  const messages: OpenRouterMessage[] = [
    {
      role: 'user',
      content: `Please provide a concise summary of the following news article in about 3-4 sentences. Focus on the key information, facts, and context:

${title}

${description}

${content}`
    }
  ];
  
  const requestBody = {
    model: 'anthropic/claude-3-haiku',
    messages
  };
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header when calling OpenRouter directly (in development)
  if (process.env.NODE_ENV === 'development') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://newshub-subspace.vercel.app';
    headers['X-Title'] = 'NewsHub';
  }
  
  const response = await fetch(getOpenRouterUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API request failed: ${errorText}`);
  }
  
  const result: OpenRouterResponse = await response.json();
  return result.choices[0].message.content.trim();
};

/**
 * Analyzes the sentiment of an article using OpenRouter's AI models
 * @param title - Article title
 * @param description - Article description
 * @param content - Article content
 * @returns Promise containing sentiment analysis
 */
export const analyzeArticleSentiment = async (
  title: string,
  description: string,
  content: string
): Promise<SentimentResult> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_OPENROUTER_API_KEY not found in environment variables');
  }
  
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: 'You are an AI that analyzes the sentiment of news articles. Always respond with valid JSON in this format: {"sentiment": "positive|negative|neutral", "explanation": "brief explanation of the sentiment"}'
    },
    {
      role: 'user',
      content: `Analyze the sentiment of the following news article as 'positive', 'negative', or 'neutral'. Then provide a brief explanation for your sentiment classification in about 2 sentences.

${title}

${description}

${content}`
    }
  ];
  
  const requestBody = {
    model: 'anthropic/claude-3-haiku',
    messages,
    response_format: { type: 'json_object' }
  };
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Only add Authorization header when calling OpenRouter directly (in development)
  if (process.env.NODE_ENV === 'development') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://newshub-subspace.vercel.app';
    headers['X-Title'] = 'NewsHub';
  }
  
  const response = await fetch(getOpenRouterUrl(), {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API request failed: ${errorText}`);
  }
  
  const result: OpenRouterResponse = await response.json();
  
  try {
    // Get the content from the response
    const content = result.choices[0].message.content;
    
    // For response_format: { type: 'json_object' }, the content should already be JSON
    // No need to parse it again
    let sentimentData;
    
    if (typeof content === 'string') {
      // It's still a string, try to parse it
      try {
        sentimentData = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse sentiment JSON string:', parseError);
        // Extract sentiment information manually
        return extractSentimentManually(content);
      }
    } else {
      // It's already an object
      sentimentData = content;
    }
    
    // Validate the sentiment data
    if (sentimentData && sentimentData.sentiment && sentimentData.explanation) {
      return {
        sentiment: sentimentData.sentiment.toLowerCase(),
        explanation: sentimentData.explanation
      };
    } else {
      console.error('Invalid sentiment data structure:', sentimentData);
      return extractSentimentManually(typeof content === 'string' ? content : JSON.stringify(content));
    }
  } catch (error) {
    console.error('Error processing sentiment analysis result:', error);
    console.log('Raw response:', result.choices[0].message.content);
    
    // Extract sentiment manually as fallback
    return extractSentimentManually(
      typeof result.choices[0].message.content === 'string' 
        ? result.choices[0].message.content 
        : JSON.stringify(result.choices[0].message.content)
    );
  }
};

/**
 * Extracts sentiment information manually from text when JSON parsing fails
 */
function extractSentimentManually(content: string): SentimentResult {
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('positive')) {
    sentiment = 'positive';
  } else if (lowerContent.includes('negative')) {
    sentiment = 'negative';
  }
  
  return {
    sentiment,
    explanation: content.slice(0, 200) // Just take the first 200 chars of the explanation
  };
} 