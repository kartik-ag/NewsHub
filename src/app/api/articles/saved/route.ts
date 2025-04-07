import { NextRequest, NextResponse } from 'next/server';
import articleStore from '@/utils/articleStore';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract user ID from token
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get saved articles for this user
    const userSavedArticles = articleStore.savedArticles.filter(save => save.userId === userId);
    
    if (userSavedArticles.length === 0) {
      return NextResponse.json({ articles: [] });
    }
    
    // Fetch article details for the saved article IDs
    // In production, you would fetch these from your database
    // For demo purposes, we'll use mock data
    const articlesWithDetails = await Promise.all(
      userSavedArticles.map(async (savedArticle) => {
        // Generate mock data for the saved article
        // In production, this would come from your database
        return generateMockArticle(savedArticle.articleId, savedArticle.id);
      })
    );
    
    return NextResponse.json({ articles: articlesWithDetails });
  } catch (error: any) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to extract user ID from token
function extractUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || payload.user_id || payload['x-hasura-user-id'] || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

// Helper function to generate a mock article for development
async function generateMockArticle(articleId: string, savedId: string) {
  // Extract any info from the article ID if it follows a pattern
  // For example, if the ID contains category and index like "article-Technology-1"
  const parts = articleId.split('-');
  const category = parts.length > 1 ? parts[1] : 'Technology';
  const index = parts.length > 2 ? parseInt(parts[2]) : Math.floor(Math.random() * 100);
  
  return {
    id: articleId,
    saved_id: savedId,
    title: `${category} News Article ${index}`,
    source: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][index % 5],
    publishedAt: new Date(Date.now() - (index * 3600000)).toISOString(),
    url: 'https://example.com/article',
    summary: `This is a summary of ${category.toLowerCase()} article ${index}. It contains key information from the original article processed by AI to be concise and informative.`,
    sentiment: ['positive', 'negative', 'neutral'][index % 3] as 'positive' | 'negative' | 'neutral',
    sentimentExplanation: `The article ${index} has a ${['positive', 'negative', 'neutral'][index % 3]} tone because of the language used and the context of the information presented.`,
  };
} 