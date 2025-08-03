import { load } from 'cheerio';
import axios from 'axios';
import logger from '../lib/logger';
import { parsePrice, findBestMatch, findBestImageMatch, extractStructuredData, isLikelyProductUrl, resolveImageUrl } from './utils.js';
import { SCRAPING_DEFAULTS, USER_AGENTS } from './constants.js';

// Import all site-specific scrapers
import amazonScraper from './sites/amazon.js';
import flipkartScraper from './sites/flipkart.js';
import myntraScraper from './sites/myntra.js';
import ajioScraper from './sites/ajio.js';
import nykaaScraper from './sites/nykaa.js';
import zaraScraper from './sites/zara.js';
import steamScraper from './sites/steam.js';
import epicgamesScraper from './sites/epicgames.js';

// Site registry
const SITE_SCRAPERS = new Map([
  ['amazon', amazonScraper],
  ['flipkart', flipkartScraper],
  ['myntra', myntraScraper],
  ['ajio', ajioScraper],
  ['nykaa', nykaaScraper],
  ['zara', zaraScraper],
  ['steam', steamScraper],
  ['epicgames', epicgamesScraper]
]);

/**
 * Find the appropriate scraper for a given domain
 */
function findScraper(domain) {
  for (const [key, scraper] of SITE_SCRAPERS) {
    if (scraper.domains.some(d => domain.includes(d)) || domain.includes(key)) {
      return scraper;
    }
  }
  return null;
}

/**
 * Enhanced product details scraper
 */
export async function scrapeProductDetails(url, options = {}) {
  const {
    allowPartialResults = SCRAPING_DEFAULTS.allowPartialResults,
    timeout = SCRAPING_DEFAULTS.timeout,
    retries = SCRAPING_DEFAULTS.retries,
    onStatusUpdate = null
  } = options;

  const updateStatus = (message, type = 'info') => {
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(message, type);
    }
  };

  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  try {
    updateStatus('Starting enhanced scraping process...', 'info');
    
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const baseUrl = urlObj.origin;
    
    updateStatus(`Analyzing domain: ${domain}`, 'info');
    
    // Find matching site scraper
    const scraper = findScraper(domain);
    const warnings = [];
    
    if (!scraper) {
      throw new Error(`Unsupported site: ${domain}. Currently supported sites: Amazon, Flipkart, Myntra, Ajio, Nykaa, Zara, Steam, Epic Games.`);
    }

    updateStatus(`Found optimized configuration for ${scraper.name}`, 'success');

    // Enhanced retry logic with exponential backoff
    let lastError = null;
    let response = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          const backoffTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          updateStatus(`Retry attempt ${attempt}/${retries} after ${Math.round(backoffTime)}ms...`, 'warning');
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }

        const randomDelay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        updateStatus('Sending HTTP request with enhanced headers...', 'info');
        
        response = await axios.get(url, {
          headers: {
            'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: timeout,
          maxRedirects: 5,
          validateStatus: () => true
        });

        if (response.status === 200) {
          updateStatus('Successfully retrieved product page', 'success');
          break;
        } else if ([429, 503, 529].includes(response.status)) {
          lastError = new Error('Rate limited by the website. Please try again later.');
          continue;
        } else if (response.status === 403) {
          lastError = new Error('Access denied by the website.');
          continue;
        } else if (response.status === 404) {
          throw new Error('Product not found.');
        } else if (response.status >= 500) {
          lastError = new Error(`Server error (HTTP ${response.status}).`);
          continue;
        } else {
          throw new Error(`Failed to fetch page: HTTP ${response.status}`);
        }
      } catch (err) {
        lastError = err;
        if (attempt === retries) {
          throw lastError;
        }
      }
    }

    if (!response || response.status !== 200) {
      throw lastError || new Error('Failed to fetch the page after all retries');
    }

    updateStatus('Parsing HTML with enhanced extraction...', 'info');
    
    const html = response.data;
    const $ = load(html);
    
    // Enhanced structured data extraction
    const structuredData = extractStructuredData($);
    
    // Enhanced selectors for different data types
    const enhancedNameSelectors = [
      'meta[property="og:title"]',
      'meta[name="og:title"]',
      'meta[property="product:title"]',
      'meta[name="title"]',
      'h1[class*="title" i]',
      'h1[class*="name" i]',
      'h1[class*="product" i]',
      'h1[id*="title" i]',
      'h1[id*="name" i]',
      'h1[id*="product" i]',
      'h1',
      'title'
    ];

    const enhancedPriceSelectors = [
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="price"]',
      '[itemprop="price"]',
      '[data-testid*="price"]',
      '[class*="price"]:not([class*="old"]):not([class*="regular"]):not([class*="original"])',
      '[class*="current-price"]',
      '[class*="sale-price"]',
      '[class*="special-price"]',
      '[class*="offer-price"]',
      '[class*="final-price"]'
    ];

    const enhancedImageSelectors = [
      'meta[property="og:image"]',
      'meta[property="og:image:secure_url"]',
      'meta[name="og:image"]',
      'link[rel="image_src"]',
      'img[class*="product"]',
      'img[class*="main"]',
      'img[id*="product"]',
      'img[id*="main"]',
      'img[data-testid*="image"]'
    ];

    // Extract product name
    let name = null;
    if (structuredData?.name) {
      name = structuredData.name;
    } else {
      name = findBestMatch(enhancedNameSelectors, $, scraper.selectors.name);
    }

    // Extract price
    let price = null;
    if (structuredData?.offers?.price) {
      price = parseFloat(structuredData.offers.price);
    } else if (structuredData?.offers && Array.isArray(structuredData.offers) && structuredData.offers[0]?.price) {
      price = parseFloat(structuredData.offers[0].price);
    } else {
      const priceText = findBestMatch(enhancedPriceSelectors, $, scraper.selectors.price);
      price = parsePrice(priceText);
    }

    // Extract image
    let thumbnail = null;
    if (structuredData?.image) {
      thumbnail = Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image;
    } else {
      thumbnail = findBestImageMatch(enhancedImageSelectors, $, scraper.selectors.image, baseUrl);
    }

    // Enhanced data validation and cleanup
    let isComplete = true;

    if (!name) {
      if (allowPartialResults) {
        name = "Product Name Not Available";
        warnings.push('Could not extract product name');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product name');
      }
    } else {
      name = name.split('|')[0].split('-')[0].split(',')[0].trim();
      name = name.replace(/\s+/g, ' ').trim();
    }

    if (!price || isNaN(price)) {
      if (allowPartialResults) {
        price = 0;
        warnings.push('Could not extract product price');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product price');
      }
    }

    if (!thumbnail) {
      if (allowPartialResults) {
        thumbnail = '';
        warnings.push('Could not extract product image');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product image');
      }
    } else {
      thumbnail = resolveImageUrl(thumbnail, baseUrl);
    }

    // Extract description
    let description = '';
    if (structuredData?.description) {
      description = structuredData.description;
    } else {
      const metaDescription = $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('meta[name="og:description"]').attr('content');
      if (metaDescription) {
        description = metaDescription.trim();
      }
    }

    updateStatus('Product data extraction completed', 'success');

    return {
      name,
      price,
      thumbnail,
      description: description || '',
      site: domain,
      scrapedAt: new Date().toISOString(),
      url,
      scrapingStatus: {
        isComplete,
        warnings,
        siteSupported: true
      }
    };

  } catch (error) {
    logger.error('Enhanced scraping error:', error);
    throw error;
  }
}

/**
 * Enhanced batch scraping with better concurrency control
 */
export async function batchScrapeProducts(urls, options = {}) {
  const {
    concurrency = 2,
    delayBetweenRequests = SCRAPING_DEFAULTS.delayBetweenRequests,
    allowPartialResults = SCRAPING_DEFAULTS.allowPartialResults,
    timeout = SCRAPING_DEFAULTS.timeout
  } = options;

  if (!Array.isArray(urls)) {
    throw new Error('URLs must be an array');
  }

  const validUrls = urls.filter(url => {
    try {
      new URL(url);
      return isLikelyProductUrl(url);
    } catch (e) {
      return false;
    }
  });

  if (validUrls.length === 0) {
    return [];
  }

  const results = [];

  for (let i = 0; i < validUrls.length; i += concurrency) {
    const batch = validUrls.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (url, index) => {
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests * index));
      }

      try {
        return await scrapeProductDetails(url, { allowPartialResults, timeout });
      } catch (error) {
        logger.error(`Error scraping ${url}:`, error);
        return {
          url,
          error: error.message,
          scrapingStatus: {
            isComplete: false,
            warnings: [error.message],
            siteSupported: false
          }
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + concurrency < validUrls.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }

  return results;
}

// Export URL validation function
export { isLikelyProductUrl };
