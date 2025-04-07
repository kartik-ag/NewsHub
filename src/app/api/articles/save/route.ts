import { NextRequest, NextResponse } from 'next/server';
import articleStore, { SavedArticle } from '@/utils/articleStore';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract user ID from token (simplified for development)
    const userId = extractUserIdFromToken(token);
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Parse request body
    const { articleId } = await request.json();
    
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    
    // Check if article is already saved
    const existingSave = articleStore.savedArticles.find(
      save => save.articleId === articleId && save.userId === userId
    );
    
    if (existingSave) {
      return NextResponse.json({ error: 'Article already saved' }, { status: 400 });
    }
    
    // Save the article
    const savedArticle: SavedArticle = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      articleId,
      userId,
      createdAt: new Date().toISOString(),
    };
    
    articleStore.savedArticles.push(savedArticle);
    
    return NextResponse.json({ 
      success: true, 
      savedId: savedArticle.id 
    });
  } catch (error: any) {
    console.error('Error saving article:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    
    // Parse request body to get article ID
    const { articleId } = await request.json();
    
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }
    
    // Find and remove the saved article
    const initialLength = articleStore.savedArticles.length;
    articleStore.savedArticles = articleStore.savedArticles.filter(
      save => !(save.articleId === articleId && save.userId === userId)
    );
    
    if (articleStore.savedArticles.length === initialLength) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing saved article:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to extract user ID from token
function extractUserIdFromToken(token: string): string | null {
  try {
    // Simple token parsing for development
    // In production, you would properly verify the JWT
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub || payload.user_id || payload['x-hasura-user-id'] || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
} 