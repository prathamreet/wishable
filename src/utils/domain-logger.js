/**
 * Utility to log unknown image domains for future configuration
 * This helps identify new domains that need to be added to the configuration
 */

import { specificDomains } from '../config/image-domains';

// Set to store unique domains we've seen
const seenDomains = new Set();

/**
 * Log an unknown domain that's not in our configuration
 * @param {string} url - The full image URL
 */
export function logUnknownDomain(url) {
  try {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Check if this domain is already in our configuration
    const isKnownDomain = specificDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
    
    // If it's unknown and we haven't logged it yet, log it
    if (!isKnownDomain && !seenDomains.has(hostname)) {
      seenDomains.add(hostname);
      console.warn(`[DOMAIN LOGGER] Unknown image domain detected: ${hostname}`);
      console.warn(`[DOMAIN LOGGER] Consider adding this domain to your image-domains.js configuration`);
    }
  } catch (error) {
    // Silently fail - this is just a logging utility
  }
}

/**
 * Get all unknown domains seen so far
 * @returns {string[]} Array of unknown domains
 */
export function getUnknownDomains() {
  return Array.from(seenDomains);
}