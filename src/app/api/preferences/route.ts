import { NextRequest, NextResponse } from 'next/server';
import { nhost } from '@/utils/nhost';

// Temporary user preferences storage (in production, this would be in a database)
let userPreferences: Record<string, { topics: string[], keywords: string[], sources: string[] }> = {};

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Decode the JWT token to get the user ID (simplified for development)
    // In production, you'd properly verify the token
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const userId = payload['sub'] || payload['user_id'] || payload['x-hasura-user-id'];
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      // Return user preferences if they exist, otherwise return defaults
      return NextResponse.json({
        preferences: userPreferences[userId] || {
          topics: ['technology', 'business'],
          keywords: ['AI', 'climate'],
          sources: ['bbc-news', 'the-verge'],
        }
      });
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error getting preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Decode the JWT token to get the user ID (simplified for development)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const userId = payload['sub'] || payload['user_id'] || payload['x-hasura-user-id'];
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      // Parse the request body
      const { preferences } = await request.json();
      
      if (!preferences || !preferences.topics || !preferences.keywords || !preferences.sources) {
        return NextResponse.json({ error: 'Invalid preferences format' }, { status: 400 });
      }
      
      // Save the preferences
      userPreferences[userId] = {
        topics: preferences.topics,
        keywords: preferences.keywords,
        sources: preferences.sources,
      };
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 