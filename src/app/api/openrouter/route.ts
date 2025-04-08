import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Get the request body
    const requestData = await request.json();
    
    // Get origin header to pass as referer
    const origin = request.headers.get('origin') || 'https://newshub-subspace.vercel.app';
    
    console.log('Making request to OpenRouter with referer:', origin);
    
    // Forward the request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': origin,
        'X-Title': 'NewsHub',
      },
      body: JSON.stringify(requestData),
    });
    
    // Get the response
    const data = await response.json();
    
    // Log any issues with the response for debugging
    if (!response.ok) {
      console.error('OpenRouter API error:', data);
    }
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error proxying request to OpenRouter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
} 