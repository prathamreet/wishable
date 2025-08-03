import { load } from 'cheerio';
import axios from 'axios';
import logger from './logger';

// Enhanced site-specific selectors with comprehensive fallbacks
const siteSpecificSelectors = {
  // Major e-commerce platforms - ENHANCED
  'amazon': {
    name: [
      '#productTitle',
      '.product-title-word-break',
      '#title',
      'span#productTitle',
      'h1.a-size-large',
      'h1[data-feature-name="title"]',
      '.a-size-large.product-title-word-break',
      '[data-asin] h1',
      '.a-text-normal h1'
    ],
    price: [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '#price',
      '.a-price-whole',
      '.a-color-price',
      '.a-price.a-text-price.a-size-medium.apexPriceToPay',
      '.a-price-current .a-offscreen',
      '.a-price.a-text-price .a-offscreen',
      '[data-asin-price]',
      '.a-price-range .a-offscreen',
      '#corePrice_feature_div .a-price .a-offscreen'
    ],
    image: [
      '#imgTagWrapperId img',
      '#landingImage',
      '.a-dynamic-image',
      '#main-image',
      '#imgBlkFront',
      '[data-a-dynamic-image]',
      '#ebooksImgBlkFront img',
      '.a-main-image img',
      '#img-canvas img'
    ]
  },
  'flipkart': {
    name: [
      '.B_NuCI',
      '._35KyD6',
      '.product-title',
      'h1._6EBuvT',
      'h1 span',
      '.yhZ71d',
      'span.B_NuCI',
      'h1[data-testid="product-title"]',
      '._2cLu-l'
    ],
    price: [
      '._30jeq3',
      '._1vC4OE',
      '.product-price',
      '._3I9_wc._2p6lqe',
      '._16Jk6d',
      '._3qQ9m1',
      'div._25b18c span',
      'div[data-testid="price-current"]',
      '._1_WHN1'
    ],
    image: [
      '._396cs4',
      '._3BTv9X img',
      '._2r_T1I',
      'img._396cs4',
      'div._1BweB8 img',
      '._2UKpph img',
      'img[data-testid="product-image"]',
      '._1BweB8._2UKpph img'
    ]
  },
  'myntra': {
    name: [
      '.pdp-title',
      '.pdp-name',
      '.product-title',
      'h1.pdp-title',
      'h1[data-testid="product-title"]'
    ],
    price: [
      '.pdp-price',
      '.pdp-mrp',
      '.product-price',
      'span.pdp-price',
      '.price-info strong'
    ],
    image: [
      '.image-grid-image',
      '.image-grid-imageContainer img',
      '.pdp-image img'
    ]
  },
  'ajio': {
    name: ['.prod-name', '.product-title', '.title-wrap'],
    price: ['.prod-sp', '.price-value', '.sale-price'],
    image: ['.product-image', '.zoom-wrap img', '.preview-image']
  },
  'nykaa': {
    name: ['.product-title', '.css-1gc4x7i', '.product-name'],
    price: ['.css-1jczs19', '.price-info', '.post-card__content-price-offer'],
    image: ['.css-11gn9r4', '.product-image', '.nykaa-carousel img']
  },
  'snapdeal': {
    name: ['.pdp-e-i-head', '.product-title', '.title-wrap-left'],
    price: ['.payBlkBig', '.product-price', '.price'],
    image: ['.cloudzoom', '.product-image']
  },
  // Electronics retailers
  'bestbuy': {
    name: ['.sku-title h1', '.heading-5', '.product-title'],
    price: ['.priceView-customer-price span', '.priceView-hero-price span', '.price-box'],
    image: ['.primary-image', '.picture-wrapper img', '.product-image']
  },
  'walmart': {
    name: ['.prod-ProductTitle', '[data-testid="product-title"]', '.product-title'],
    price: ['.prod-PriceSection [aria-hidden="true"]', '[data-testid="price"]', '.price-characteristic'],
    image: ['.prod-hero-image-carousel img', '.image-wrapper img', '.product-image']
  },
  'target': {
    name: ['[data-test="product-title"]', '.styles__StyledHeading-sc-1y8ufhc-0', '.product-name'],
    price: ['[data-test="product-price"]', '.styles__PriceFontSize-sc-17wlxvr-0', '.product-price'],
    image: ['[data-test="product-image"]', '.styles__ImageWrapper-sc-1y8ufhc-1 img', '.product-image']
  },
  'newegg': {
    name: ['.product-title', '.product-name', '.title'],
    price: ['.price-current', '.product-price', '.price'],
    image: ['.product-view-img-original', '.product-image', '.gallery-image']
  },
  // Gaming platforms - ONLY Steam and Epic Games
  'steam': {
    name: [
      '.apphub_AppName',
      '.game_title',
      '.title',
      'div.apphub_AppName_row .apphub_AppName',
      'div.game_title h1',
      '#appHubAppName'
    ],
    price: [
      '.game_purchase_price',
      '.discount_final_price',
      '.price',
      '.game_area_purchase_game .game_purchase_price',
      'div.discount_final_price',
      '.discount_block .discount_final_price'
    ],
    image: [
      '.game_header_image_full',
      '.main-image',
      'img.game_header_image_full',
      '.page_header_image img'
    ]
  },
  'epicgames': {
    name: [
      '.css-rgqwpc',
      '.product-title',
      '.title',
      'h1[data-testid="product-title"]',
      'div[data-component="ProductTitle"] span'
    ],
    price: [
      '.css-119zqif',
      '.product-price',
      '.price',
      '[data-testid="purchase-price"]',
      'span[data-testid="price-display"]'
    ],
    image: [
      '.css-1twnz4g',
      '.product-image',
      'img[data-testid="fallback-image-picture"]',
      '.css-1q7guxb img'
    ]
  },
  // Fashion retailers
  'asos': {
    name: ['h1[data-testid="product-title"]', '.product-title', '.title'],
    price: ['[data-testid="current-price"]', '.product-price', '.price'],
    image: ['[data-testid="image-wrapper"] img', '.product-image', '.gallery-image']
  },
  'zara': {
    name: ['.product-detail-info h1', '.product-name', '.title'],
    price: ['.price', '.product-price', '.current-price'],
    image: ['.media-image', '.product-image', '.gallery-image']
  },
  'hm': {
    name: ['.product-name', '.product-title', '.title'],
    price: ['.product-price', '.price', '.current-price'],
    image: ['.product-detail-main-image-container img', '.product-image', '.gallery-image']
  }
};

/**
 * Enhanced price parsing with multi-currency support
 */
function parsePrice(text) {
  if (!text) return null;
  
  // Clean the text first
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Enhanced regex to match various price formats
  const pricePatterns = [
    // Indian Rupee formats
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,
    // Dollar formats
    /\$\s*([0-9,]+(?:\.[0-9]{2})?)/,
    // Euro formats
    /€\s*([0-9,]+(?:\.[0-9]{2})?)/,
    // Pound formats
    /£\s*([0-9,]+(?:\.[0-9]{2})?)/,
    // Generic number with currency symbol
    /[₹$€£¥₩₽₴₺₼₸₿]\s*([0-9,]+(?:\.[0-9]{2})?)/,
    // Numbers followed by currency
    /([0-9,]+(?:\.[0-9]{2})?)\s*[₹$€£¥₩₽₴₺₼₸₿]/,
    // Pure numbers (last resort)
    /([0-9,]+(?:\.[0-9]{2})?)/
  ];
  
  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const price = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  return null;
}

/**
 * Enhanced element finder with better fallback logic
 */
function findBestMatch(selectors, $, siteSpecific = []) {
  // Try site-specific selectors first with multiple attempts
  for (const selector of siteSpecific) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      const text = element.text()?.trim();
      if (text && text.length > 2) { // Minimum length check
        return text;
      }
    }
  }
  
  // Fall back to generic selectors
  for (const selector of selectors) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      const text = element.text()?.trim();
      if (text && text.length > 2) {
        return text;
      }
    }
  }
  
  return null;
}

/**
 * Enhanced image finder with URL resolution
 */
function findBestImageMatch(selectors, $, siteSpecific = [], baseUrl = '') {
  const imageAttributes = ['src', 'data-src', 'data-original', 'data-lazy-src', 'data-zoom-image', 'data-large-image'];
  
  // Try site-specific selectors first
  for (const selector of siteSpecific) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      
      // Try multiple image attributes
      for (const attr of imageAttributes) {
        const imgUrl = element.attr(attr);
        if (imgUrl && imgUrl.length > 10 && !imgUrl.includes('data:image/svg')) {
          return resolveImageUrl(imgUrl, baseUrl);
        }
      }
    }
  }
  
  // Fall back to generic selectors
  for (const selector of selectors) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      
      for (const attr of imageAttributes) {
        const imgUrl = element.attr(attr);
        if (imgUrl && imgUrl.length > 10 && !imgUrl.includes('data:image/svg')) {
          return resolveImageUrl(imgUrl, baseUrl);
        }
      }
    }
  }
  
  return null;
}

/**
 * Resolve relative image URLs to absolute URLs
 */
function resolveImageUrl(imgUrl, baseUrl) {
  if (!imgUrl) return null;
  
  // If already absolute, return as is
  if (imgUrl.startsWith('http')) {
    return imgUrl;
  }
  
  // Handle protocol-relative URLs
  if (imgUrl.startsWith('//')) {
    return 'https:' + imgUrl;
  }
  
  // Handle relative URLs
  if (baseUrl) {
    try {
      return new URL(imgUrl, baseUrl).toString();
    } catch (e) {
      logger.warn('Failed to resolve image URL:', imgUrl, baseUrl);
    }
  }
  
  return imgUrl;
}

/**
 * Enhanced structured data extraction
 */
function extractStructuredData($) {
  let structuredData = null;
  
  try {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    
    jsonLdScripts.each((i, script) => {
      if (structuredData) return; // Already found data
      
      try {
        const scriptContent = $(script).html();
        if (!scriptContent) return;
        
        const parsedData = JSON.parse(scriptContent);
        
        // Handle different data structures
        if (Array.isArray(parsedData)) {
          structuredData = parsedData.find(item =>
            ['Product', 'VideoGame', 'SoftwareApplication'].includes(item['@type']) ||
            (Array.isArray(item['@type']) && item['@type'].some(type => 
              ['Product', 'VideoGame', 'SoftwareApplication'].includes(type)
            ))
          );
        } else if (parsedData['@type'] && (
          ['Product', 'VideoGame', 'SoftwareApplication'].includes(parsedData['@type']) ||
          (Array.isArray(parsedData['@type']) && parsedData['@type'].some(type => 
            ['Product', 'VideoGame', 'SoftwareApplication'].includes(type)
          ))
        )) {
          structuredData = parsedData;
        } else if (parsedData['@graph'] && Array.isArray(parsedData['@graph'])) {
          structuredData = parsedData['@graph'].find(item =>
            ['Product', 'VideoGame', 'SoftwareApplication'].includes(item['@type']) ||
            (Array.isArray(item['@type']) && item['@type'].some(type => 
              ['Product', 'VideoGame', 'SoftwareApplication'].includes(type)
            ))
          );
        }
      } catch (e) {
        // Skip invalid JSON-LD
      }
    });
  } catch (e) {
    logger.error('Failed to parse structured data:', e);
  }
  
  return structuredData;
}

/**
 * Enhanced product details scraper
 */
export async function scrapeProductDetails(url, options = {}) {
  const {
    allowPartialResults = true,
    useProxy = false,
    timeout = 25000, // Increased timeout
    retries = 2, // Increased retries
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
    
    // Find matching site configuration
    const siteKey = Object.keys(siteSpecificSelectors).find(key => domain.includes(key));
    const siteConfig = siteKey ? siteSpecificSelectors[siteKey] : null;
    
    const warnings = [];
    
    if (!siteConfig) {
      logger.info(`No site-specific selectors for domain: ${domain}. Using enhanced generic selectors.`);
      warnings.push('Using enhanced generic selectors for this website.');
      updateStatus(`Using enhanced generic detection for ${domain}`, 'warning');
    } else {
      updateStatus(`Found optimized configuration for ${domain}`, 'success');
    }

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

        // Enhanced request with better headers
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
        ];

        const randomDelay = Math.floor(Math.random() * 2000) + 1000;
        await new Promise(resolve => setTimeout(resolve, randomDelay));
        
        updateStatus('Sending HTTP request with enhanced headers...', 'info');
        
        response = await axios.get(url, {
          headers: {
            'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
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
      name = findBestMatch(enhancedNameSelectors, $, siteConfig?.name || []);
    }

    // Extract price
    let price = null;
    if (structuredData?.offers?.price) {
      price = parseFloat(structuredData.offers.price);
    } else if (structuredData?.offers && Array.isArray(structuredData.offers) && structuredData.offers[0]?.price) {
      price = parseFloat(structuredData.offers[0].price);
    } else {
      const priceText = findBestMatch(enhancedPriceSelectors, $, siteConfig?.price || []);
      price = parsePrice(priceText);
    }

    // Extract image
    let thumbnail = null;
    if (structuredData?.image) {
      thumbnail = Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image;
    } else {
      thumbnail = findBestImageMatch(enhancedImageSelectors, $, siteConfig?.image || [], baseUrl);
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
      // Clean up name
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
        siteSupported: !!siteConfig
      }
    };

  } catch (error) {
    logger.error('Enhanced scraping error:', error);
    throw error;
  }
}

/**
 * Enhanced URL validation for product pages
 */
export function isLikelyProductUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const domain = urlObj.hostname.replace('www.', '');

    // Check if domain is in our supported sites
    const isSupportedSite = Object.keys(siteSpecificSelectors).some(key => domain.includes(key));

    // Enhanced product URL patterns
    const productPatterns = [
      /\/product\//i,
      /\/dp\//i,
      /\/item\//i,
      /\/pd\//i,
      /\/products\//i,
      /\/shop\//i,
      /\/p\//i,
      /\/buy\//i,
      /\/detail\//i,
      // Gaming-specific patterns (only Steam and Epic)
      /\/app\//i, // Steam
      /\/bundles\//i, // Steam bundles
      /\/game\//i, // Epic Games
      /\/product\//i // Epic Games
    ];

    const matchesPattern = productPatterns.some(pattern => pattern.test(path));
    const hasProductId = /\/[A-Z0-9]{5,}(?:\/|$)/.test(path);

    // Special handling for gaming sites (only Steam and Epic)
    const isGamingSite = ['steam', 'epicgames'].some(site => domain.includes(site));
    
    if (isGamingSite) {
      const gamingPatterns = [
        /\/app\/\d+/i, // Steam app ID
        /\/bundles\/\d+/i, // Steam bundles
        /\/product\//i // Epic Games
      ];
      if (gamingPatterns.some(pattern => pattern.test(path))) {
        return true;
      }
    }

    if (isSupportedSite) {
      return matchesPattern || hasProductId || path.split('/').length > 2;
    }

    return matchesPattern || hasProductId;
  } catch (e) {
    return false;
  }
}

/**
 * Enhanced batch scraping with better concurrency control
 */
export async function batchScrapeProducts(urls, options = {}) {
  const {
    concurrency = 2,
    delayBetweenRequests = 2000, // Increased delay
    allowPartialResults = true,
    timeout = 25000
  } = options;

  if (!Array.isArray(urls)) {
    throw new Error('URLs must be an array');
  }

  const validUrls = urls.filter(url => {
    try {
      new URL(url);
      return true;
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
