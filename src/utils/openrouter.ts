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
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://newshub-subspace.vercel.app',
      'X-Title': 'NewsHub'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages
    })
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
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://newshub-subspace.vercel.app',
      'X-Title': 'NewsHub'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages,
      response_format: { type: 'json_object' }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API request failed: ${errorText}`);
  }
  
  const result: OpenRouterResponse = await response.json();
  
  try {
    // Try to parse the JSON
    const sentimentData = JSON.parse(result.choices[0].message.content);
    return {
      sentiment: sentimentData.sentiment.toLowerCase(),
      explanation: sentimentData.explanation
    };
  } catch (error) {
    console.error('Failed to parse sentiment analysis JSON:', error);
    console.log('Raw response:', result.choices[0].message.content);
    
    // Fallback: extract sentiment from text if JSON parsing fails
    const content = result.choices[0].message.content;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (content.toLowerCase().includes('positive')) {
      sentiment = 'positive';
    } else if (content.toLowerCase().includes('negative')) {
      sentiment = 'negative';
    }
    
    return {
      sentiment,
      explanation: content.slice(0, 200) // Just take the first 200 chars of the explanation
    };
  }
}; 