import { NextResponse } from 'next/server';

/**
 * Image proxy API route
 * Fetches images from external domains and serves them through our domain
 * This allows us to use Next.js Image component without domain configuration
 */
export async function GET(request) {
  try {
    // Get the URL from the query parameter
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl || imageUrl.trim() === '') {
      // Redirect to placeholder image instead of returning an error
      return Response.redirect(new URL('/images/placeholder.svg', request.url));
    }
    
    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl);
    
    let imageData, contentType;
    
    try {
      // Fetch the image from the external domain
      const imageResponse = await fetch(decodedUrl, {
        headers: {
          // Set a user agent to avoid being blocked by some servers
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        // Set a timeout to avoid hanging requests
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!imageResponse.ok) {
        // Redirect to placeholder image instead of returning an error
        return Response.redirect(new URL('/images/placeholder.svg', request.url));
      }
      
      // Get the image data and content type
      imageData = await imageResponse.arrayBuffer();
      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    } catch (error) {
      console.error('Error fetching image:', error);
      // Redirect to placeholder image for any fetch errors
      return Response.redirect(new URL('/images/placeholder.svg', request.url));
    }
    
    // Return the image with the appropriate content type
    return new NextResponse(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Error processing image: ${error.message}`, { status: 500 });
  }
}