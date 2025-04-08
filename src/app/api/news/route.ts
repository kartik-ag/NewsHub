import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'News API key not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const country = searchParams.get('country') || 'us';

    // Build the News API URL
    let newsApiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    if (category) {
      newsApiUrl += `&category=${category}`;
    }
    
    // Forward the request to News API
    const response = await fetch(newsApiUrl);
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News API request failed: ${errorText}`);
    }
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying request to News API:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || 'Failed to process request',
        // Return mock data as fallback
        articles: Array.from({ length: 3 }, (_, i) => ({
          source: {
            id: null,
            name: ['BBC News', 'CNN', 'The Verge', 'Wired', 'Reuters'][i % 5]
          },
          author: `Author ${i + 1}`,
          title: `News Article ${i + 1}`,
          description: `This is a description for news article ${i + 1}.`,
          url: 'https://example.com/article',
          urlToImage: null,
          publishedAt: new Date(Date.now() - (i * 3600000)).toISOString(),
          content: `This is the full content of article ${i + 1}.`
        }))
      },
      { status: 500 }
    );
  }
} 