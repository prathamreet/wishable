import { NextResponse } from 'next/server';
import { getUnknownDomains } from '../../../../utils/domain-logger';
import { specificDomains } from '../../../../config/image-domains';

/**
 * Development API route to help manage image domains
 * This route is only available in development mode
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('This API is only available in development mode', { status: 403 });
  }
  
  return NextResponse.json({
    configuredDomains: specificDomains,
    unknownDomains: getUnknownDomains(),
  });
}