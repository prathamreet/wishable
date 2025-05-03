import { load } from 'cheerio';
import axios from 'axios';
import cheerio from 'cheerio';
import logger from './logger';

// Site-specific selectors for better accuracy
const siteSpecificSelectors = {
  // Major e-commerce platforms
  'amazon': {
    name: ['#productTitle', '.product-title-word-break', '#title'],
    price: ['.a-price .a-offscreen', '#priceblock_ourprice', '#price', '.a-price-whole', '.a-color-price'],
    image: ['#imgTagWrapperId img', '#landingImage', '.a-dynamic-image', '#main-image']
  },
  'flipkart': {
    name: ['.B_NuCI', '._35KyD6', '.product-title'],
    price: ['._30jeq3', '._1vC4OE', '.product-price'],
    image: ['._396cs4', '._3BTv9X img', '._2r_T1I']
  },
  'myntra': {
    name: ['.pdp-title', '.pdp-name', '.product-title'],
    price: ['.pdp-price', '.pdp-mrp', '.product-price'],
    image: ['.image-grid-image', '.image-grid-imageContainer img']
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
  'croma': {
    name: ['.pd-title', '.product-title', '.main-product-title'],
    price: ['.amount', '.price', '.product-price'],
    image: ['.pd-img', '.product-image']
  },
  'reliancedigital': {
    name: ['.pdp__title', '.product-name', '.title'],
    price: ['.pdp__price', '.product-price', '.price'],
    image: ['.pdp__image', '.product-image']
  },
  
  // Tech brands
  'apple': {
    name: ['.pd-title', '.product-title', '.rs-product-title'],
    price: ['.price-point', '.product-price', '.rs-price'],
    image: ['.pd-img', '.product-image']
  },
  'samsung': {
    name: ['.pd-title', '.product-name', '.product-details__info-title'],
    price: ['.pd-price', '.product-price', '.product-details__info-price'],
    image: ['.pd-img', '.product-image']
  },
  'dell': {
    name: ['.pg-title', '.product-title', '.system-title'],
    price: ['.sale-price', '.product-price', '.price'],
    image: ['.product-image', '.main-image']
  },
  'hp': {
    name: ['.product-title', '.page-title', '.title'],
    price: ['.price-wrapper', '.product-price', '.price'],
    image: ['.product-image', '.gallery-image']
  },
  'lenovo': {
    name: ['.product-title', '.page-title', '.title'],
    price: ['.final-price', '.product-price', '.price'],
    image: ['.product-image', '.gallery-image']
  },
  
  // Gaming platforms
  'gamestheshop': {
    name: ['.product-name', '.page-title', '.title'],
    price: ['.price', '.special-price', '.product-price'],
    image: ['.product-image', '.gallery-image']
  },
  'epicgames': {
    name: ['.css-rgqwpc', '.product-title', '.title'],
    price: ['.css-119zqif', '.product-price', '.price'],
    image: ['.css-1twnz4g', '.product-image']
  },
  'steam': {
    name: ['.apphub_AppName', '.game_title', '.title'],
    price: ['.game_purchase_price', '.discount_final_price', '.price'],
    image: ['.game_header_image_full', '.main-image']
  },
  'gog': {
    name: ['._title-wrapper h1', '.productcard-basics__title', '.title'],
    price: ['._price-container ._price', '.product-actions-price__final-amount', '.price'],
    image: ['.productcard-basics__image', '.product-image']
  },
  'nintendo': {
    name: ['.hero-product-title', '.product-title', '.title'],
    price: ['.product-info-price .sales .price-sales', '.price-sales', '.product-price'],
    image: ['.hero-product-image img', '.product-image-main img', '.product-image']
  },
  'playstation': {
    name: ['.pdp__title', '.product-name', '.title'],
    price: ['.price-display__price', '.product-price', '.price'],
    image: ['.pdp__thumbnail-img', '.product-image-main', '.product-image']
  },
  'xbox': {
    name: ['h1[data-testid="product-title"]', '.ProductDetailsHeader-title', '.title'],
    price: ['div[data-testid="product-price"]', '.Price-module__boldText', '.price'],
    image: ['img[data-testid="product-image"]', '.ProductDetailsHeader-image', '.product-image']
  },
  'humblebundle': {
    name: ['.js-human-name', '.product-title', '.title'],
    price: ['.current-price', '.product-price', '.price'],
    image: ['.game-image', '.product-image']
  },
  'greenmangaming': {
    name: ['.prod-title', '.product-title', '.title'],
    price: ['.current-price', '.product-price', '.price'],
    image: ['.prod-image img', '.product-image']
  },
  'fanatical': {
    name: ['.product-title', '.title'],
    price: ['.product-price', '.price'],
    image: ['.product-image img', '.product-image']
  },
  'cdkeys': {
    name: ['.product-name', '.title'],
    price: ['.price-box .price', '.product-price', '.price'],
    image: ['.product-image-gallery img', '.product-image']
  },
  'gamersgate': {
    name: ['.product-title', '.title'],
    price: ['.current-price', '.product-price', '.price'],
    image: ['.product-image img', '.product-image']
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
  },
  
  // Home goods
  'ikea': {
    name: ['.product-pip-header-section h1', '.product-name', '.title'],
    price: ['.product-pip-price-package .product-price', '.price', '.current-price'],
    image: ['.product-pip-sticky-image img', '.product-image', '.gallery-image']
  },
  'wayfair': {
    name: ['.ProductDetailInfoBlock-header h1', '.product-name', '.title'],
    price: ['.SFPrice', '.price', '.current-price'],
    image: ['.ProductDetailImageCarousel-image img', '.product-image', '.gallery-image']
  },
  
  // Marketplaces
  'etsy': {
    name: ['.wt-text-body-03', '.listing-page-title-component', '.title'],
    price: ['.wt-text-title-03', '.price', '.current-price'],
    image: ['.wt-max-width-full', '.listing-page-image', '.gallery-image']
  },
  'ebay': {
    name: ['#itemTitle', '.product-title', '.title'],
    price: ['#prcIsum', '.product-price', '.price'],
    image: ['#icImg', '.product-image', '.gallery-image']
  },
  
  // Book retailers
  'barnesandnoble': {
    name: ['.pdp-header-title', '.product-name', '.title'],
    price: ['.price', '.product-price', '.current-price'],
    image: ['.pdp-image', '.product-image', '.gallery-image']
  },
  'bookshop': {
    name: ['.book-title', '.product-name', '.title'],
    price: ['.price', '.product-price', '.current-price'],
    image: ['.book-img', '.product-image', '.gallery-image']
  }
};


/**
 * Parse price text to extract numeric value
 * @param {string} text - Price text to parse
 * @returns {number|null} - Parsed price or null if not found
 */
function parsePrice(text) {
  if (!text) return null;
  
  // Try to extract currency symbol for later use
  const currencyMatch = text.match(/([₹$€£¥₩₽₴₺₼₸₿])/);
  const currencySymbol = currencyMatch ? currencyMatch[1] : null;
  
  // Match any number format (including those with currency symbols)
  // Support for various currency symbols
  const match = text.match(/[₹$€£¥₩₽₴₺₼₸₿]?\s*[\d,]+(\.\d+)?/);
  
  if (!match) return null;
  
  // Remove currency symbols and commas, then parse as float
  const price = parseFloat(match[0].replace(/[₹$€£¥₩₽₴₺₼₸₿\s,]/g, ''));
  
  // Store currency info if we implement currency tracking in the future
  // For now, just return the numeric value
  return price;
}

function findBestMatch(selectors, $, siteSpecific = []) {
  // Try site-specific selectors first
  for (const selector of siteSpecific) {
    const element = $(selector);
    if (element.length > 0) {
      const text = element.first().text().trim();
      if (text) return text;
    }
  }
  // Fall back to generic selectors
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const text = element.first().text().trim();
      if (text) return text;
    }
  }
  return null;
}

function findBestImageMatch(selectors, $, siteSpecific = [], baseUrl = '') {
  // Try site-specific selectors first
  for (const selector of siteSpecific) {
    const element = $(selector);
    if (element.length > 0) {
      const imgUrl = element.first().attr('src') || 
                    element.first().attr('data-src') ||
                    element.first().attr('data-original') ||
                    element.first().attr('data-lazy-src');
      if (imgUrl) return imgUrl;
    }
  }
  // Fall back to generic selectors
  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      const imgUrl = element.first().attr('src') || 
                    element.first().attr('data-src') ||
                    element.first().attr('data-original') ||
                    element.first().attr('data-lazy-src');
      if (imgUrl) return imgUrl;
    }
  }
  return null;
}

/**
 * Scrape product details from a URL
 * @param {string} url - Product URL to scrape
 * @param {Object} options - Scraping options
 * @param {boolean} options.allowPartialResults - Whether to return partial results if some fields are missing
 * @param {boolean} options.useProxy - Whether to use a proxy for the request (not implemented yet)
 * @returns {Object} - Scraped product details with status information
 */
export async function scrapeProductDetails(url, options = {}) {
  // Default options
  const {
    allowPartialResults = true,
    useProxy = false,
    timeout = 20000
  } = options;

  // Validate URL
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  try {
    // Parse URL and get domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Find matching site configuration
    const siteKey = Object.keys(siteSpecificSelectors).find(key => domain.includes(key));
    const siteConfig = siteKey ? siteSpecificSelectors[siteKey] : null;

    // Initialize warnings array to track issues
    const warnings = [];
    
    // Log if we don't have site-specific selectors
    if (!siteConfig) {
      logger.info(`No site-specific selectors for domain: ${domain}. Using generic selectors.`);
      warnings.push('Using generic selectors for this website. Results may be less accurate.');
    }

    // Fetch the page with appropriate headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/' // Add referer to reduce blocking
      },
      timeout: timeout,
      // Don't throw on non-200 status codes
      validateStatus: status => status >= 200 && status < 500
    });

    // Check for non-200 status codes
    if (response.status !== 200) {
      if (response.status === 403) {
        throw new Error('Access denied by the website. The site might be blocking our requests.');
      } else if (response.status === 404) {
        throw new Error('Product not found. The URL might be invalid or the product might have been removed.');
      } else if (response.status >= 400) {
        throw new Error(`Failed to fetch page: HTTP ${response.status}`);
      }
    }

    // Parse HTML
    const html = response.data;
    const $ = load(html);

    // Common selectors for product names
    const nameSelectors = [
      // Schema.org metadata
      'meta[property="og:title"]',
      'meta[name="og:title"]',
      'meta[property="product:title"]',
      'meta[name="title"]',
      // Common product title selectors
      'h1[class*="title" i]',
      'h1[class*="name" i]',
      'h1[class*="product" i]',
      'div[class*="title" i]',
      'div[class*="name" i]',
      'span[class*="title" i]',
      'span[class*="name" i]',
      '#title',
      '#product-title',
      '#product-name',
      '.product-title',
      '.product-name',
      '.title',
      'h1', // Fallback to first h1
      'title' // Last resort: page title
    ];

    // Common selectors for prices
    const priceSelectors = [
      // Schema.org metadata
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="price"]',
      // Common price selectors
      'span[class*="price" i]:not([class*="old" i]):not([class*="regular" i]):not([class*="original" i])',
      'div[class*="price" i]:not([class*="old" i]):not([class*="regular" i]):not([class*="original" i])',
      'p[class*="price" i]:not([class*="old" i]):not([class*="regular" i]):not([class*="original" i])',
      '*[class*="current-price" i]',
      '*[class*="sale-price" i]',
      '*[class*="special-price" i]',
      '*[class*="offer-price" i]',
      '*[class*="final-price" i]',
      '#price',
      '.price',
      '[itemprop="price"]'
    ];

    // Common selectors for product images
    const imageSelectors = [
      // Schema.org metadata
      'meta[property="og:image"]',
      'meta[property="og:image:secure_url"]',
      'meta[name="og:image"]',
      // Common image selectors
      'img[class*="product" i]',
      'img[class*="main" i]',
      'img[id*="product" i]',
      'img[id*="main" i]',
      '*[class*="product-image" i] img',
      '*[class*="main-image" i] img',
      '*[class*="gallery" i] img',
      '*[class*="hero" i] img',
      '*[class*="featured" i] img',
      // Fallback to first large image
      'img[width][height]',
      // Last resort: any image
      'img'
    ];

    // Try to get data from structured data first (JSON-LD)
    let structuredData = null;
    try {
      // Look for JSON-LD data
      const jsonLdScripts = $('script[type="application/ld+json"]');
      
      if (jsonLdScripts.length > 0) {
        // Try each script until we find product data
        jsonLdScripts.each((i, script) => {
          if (structuredData) return; // Already found data
          
          try {
            const scriptContent = $(script).html();
            if (!scriptContent) return;
            
            const parsedData = JSON.parse(scriptContent);
            
            // Handle array of objects
            if (Array.isArray(parsedData)) {
              // First look for Product type
              structuredData = parsedData.find(item => 
                item['@type'] === 'Product' || 
                (Array.isArray(item['@type']) && item['@type'].includes('Product'))
              );
              
              // If no Product found, check for VideoGame type (for gaming sites)
              if (!structuredData) {
                structuredData = parsedData.find(item => 
                  item['@type'] === 'VideoGame' || 
                  (Array.isArray(item['@type']) && item['@type'].includes('VideoGame'))
                );
              }
              
              // If no VideoGame found, check for SoftwareApplication type (for gaming and software sites)
              if (!structuredData) {
                structuredData = parsedData.find(item => 
                  item['@type'] === 'SoftwareApplication' || 
                  (Array.isArray(item['@type']) && item['@type'].includes('SoftwareApplication'))
                );
              }
            } 
            // Handle single object
            else if (
              parsedData['@type'] === 'Product' || 
              parsedData['@type'] === 'VideoGame' ||
              parsedData['@type'] === 'SoftwareApplication' ||
              (Array.isArray(parsedData['@type']) && (
                parsedData['@type'].includes('Product') || 
                parsedData['@type'].includes('VideoGame') ||
                parsedData['@type'].includes('SoftwareApplication')
              ))
            ) {
              structuredData = parsedData;
            }
            // Handle nested objects (e.g., in a @graph property)
            else if (parsedData['@graph'] && Array.isArray(parsedData['@graph'])) {
              // First look for Product type
              structuredData = parsedData['@graph'].find(item => 
                item['@type'] === 'Product' || 
                (Array.isArray(item['@type']) && item['@type'].includes('Product'))
              );
              
              // If no Product found, check for VideoGame type
              if (!structuredData) {
                structuredData = parsedData['@graph'].find(item => 
                  item['@type'] === 'VideoGame' || 
                  (Array.isArray(item['@type']) && item['@type'].includes('VideoGame'))
                );
              }
              
              // If no VideoGame found, check for SoftwareApplication type
              if (!structuredData) {
                structuredData = parsedData['@graph'].find(item => 
                  item['@type'] === 'SoftwareApplication' || 
                  (Array.isArray(item['@type']) && item['@type'].includes('SoftwareApplication'))
                );
              }
            }
          } catch (e) {
            // Just skip this script if it's invalid
          }
        });
      }
    } catch (e) {
      logger.error('Failed to parse structured data:', e);
    }

    // Get product name
    let name = null;
    if (structuredData?.name) {
      name = structuredData.name;
    } else {
      // Try meta tags first
      const metaTitle = $('meta[property="og:title"]').attr('content') ||
                       $('meta[name="og:title"]').attr('content') ||
                       $('meta[property="product:title"]').attr('content') ||
                       $('meta[name="title"]').attr('content');
      if (metaTitle) {
        name = metaTitle;
      } else {
        name = findBestMatch(nameSelectors, $, siteConfig?.name || []);
      }
    }

    // Get product price
    let price = null;
    
    // Check for price in structured data
    if (structuredData?.offers?.price) {
      price = parseFloat(structuredData.offers.price);
    } else if (structuredData?.offers && Array.isArray(structuredData.offers) && structuredData.offers[0]?.price) {
      price = parseFloat(structuredData.offers[0].price);
    } else if (structuredData?.offers?.lowPrice) {
      // Some sites use lowPrice for sales or ranges
      price = parseFloat(structuredData.offers.lowPrice);
    } else if (structuredData?.price) {
      // Direct price property (sometimes used in VideoGame type)
      price = parseFloat(structuredData.price);
    } else {
      // Check meta tags
      const metaPrice = $('meta[property="product:price:amount"]').attr('content') ||
                       $('meta[property="og:price:amount"]').attr('content') ||
                       $('meta[name="price"]').attr('content') ||
                       $('meta[itemprop="price"]').attr('content');
      if (metaPrice) {
        price = parseFloat(metaPrice);
      } else {
        // Special handling for gaming sites
        const isGamingSite = [
          'steam', 'epicgames', 'gog', 'nintendo', 'playstation', 'xbox', 
          'humblebundle', 'greenmangaming', 'fanatical', 'cdkeys', 'gamersgate'
        ].some(site => domain.includes(site));
        
        if (isGamingSite) {
          // Try to find discounted price first
          const discountSelectors = [
            '.discount_final_price',
            '.sale-price',
            '.discounted-price',
            '.special-price',
            '.current-price',
            '[data-price-type="finalPrice"]',
            '.price--discounted',
            '.price--sales'
          ];
          
          const discountedPriceText = findBestMatch(discountSelectors, $, []);
          if (discountedPriceText) {
            price = parsePrice(discountedPriceText);
          }
        }
        
        // If no price found yet, try regular selectors
        if (!price) {
          const priceText = findBestMatch(priceSelectors, $, siteConfig?.price || []);
          price = parsePrice(priceText);
        }
        
        // For free games/items
        if (!price) {
          const freeText = findBestMatch([
            '.game_purchase_price:contains("Free")',
            '.price:contains("Free")',
            '.price:contains("$0")',
            '.price:contains("0.00")',
            '.price-display__price:contains("Free")'
          ], $, []);
          
          if (freeText && /free|0\.00|\$0/i.test(freeText)) {
            price = 0;
          }
        }
      }
    }

    // Get product image
    let thumbnail = null;
    if (structuredData?.image) {
      thumbnail = Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image;
    } else {
      // Try meta tags first
      const metaImage = $('meta[property="og:image"]').attr('content') ||
                       $('meta[property="og:image:secure_url"]').attr('content') ||
                       $('meta[name="og:image"]').attr('content');
      if (metaImage) {
        thumbnail = metaImage;
      } else {
        thumbnail = findBestImageMatch(imageSelectors, $, siteConfig?.image || [], urlObj.origin);
      }
    }

    // Clean and validate the data
    let isComplete = true;
    
    // Handle missing name
    if (!name) {
      if (allowPartialResults) {
        name = "Unknown Product";
        warnings.push('Could not extract product name');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product name');
      }
    } else {
      // Clean up the name (remove site name if present)
      name = name.split('|')[0].split('-')[0].trim();
    }
    
    // Handle missing price
    if (!price) {
      if (allowPartialResults) {
        price = 0;
        warnings.push('Could not extract product price');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product price');
      }
    }
    
    // Handle missing thumbnail
    if (!thumbnail) {
      if (allowPartialResults) {
        thumbnail = '';
        warnings.push('Could not extract product image');
        isComplete = false;
      } else {
        throw new Error('Failed to extract product image');
      }
    } else {
      // Ensure thumbnail URL is absolute
      if (!thumbnail.startsWith('http')) {
        thumbnail = new URL(thumbnail, urlObj.origin).toString();
      }
    }

    // Try to extract description if available
    let description = '';
    try {
      if (structuredData?.description) {
        description = structuredData.description;
      } else {
        const metaDescription = $('meta[property="og:description"]').attr('content') ||
                              $('meta[name="description"]').attr('content');
        if (metaDescription) {
          description = metaDescription;
        }
      }
    } catch (e) {
      // Ignore description errors
    }
    
    // Extract additional metadata for games
    let additionalMetadata = {};
    try {
      const isGamingSite = [
        'steam', 'epicgames', 'gog', 'nintendo', 'playstation', 'xbox', 
        'humblebundle', 'greenmangaming', 'fanatical', 'cdkeys', 'gamersgate'
      ].some(site => domain.includes(site));
      
      if (isGamingSite) {
        // Try to extract game-specific metadata
        const gameMetadata = {};
        
        // Extract from structured data first
        if (structuredData) {
          // Game genre
          if (structuredData.genre) {
            gameMetadata.genre = Array.isArray(structuredData.genre) 
              ? structuredData.genre.join(', ') 
              : structuredData.genre;
          }
          
          // Game platform
          if (structuredData.gamePlatform) {
            gameMetadata.platform = Array.isArray(structuredData.gamePlatform) 
              ? structuredData.gamePlatform.join(', ') 
              : structuredData.gamePlatform;
          } else if (structuredData.operatingSystem) {
            gameMetadata.platform = Array.isArray(structuredData.operatingSystem) 
              ? structuredData.operatingSystem.join(', ') 
              : structuredData.operatingSystem;
          }
          
          // Publisher
          if (structuredData.publisher) {
            if (Array.isArray(structuredData.publisher)) {
              gameMetadata.publisher = structuredData.publisher.map(p => p.name || p).join(', ');
            } else if (typeof structuredData.publisher === 'object') {
              gameMetadata.publisher = structuredData.publisher.name || '';
            } else {
              gameMetadata.publisher = structuredData.publisher;
            }
          }
          
          // Developer
          if (structuredData.author) {
            if (Array.isArray(structuredData.author)) {
              gameMetadata.developer = structuredData.author.map(a => a.name || a).join(', ');
            } else if (typeof structuredData.author === 'object') {
              gameMetadata.developer = structuredData.author.name || '';
            } else {
              gameMetadata.developer = structuredData.author;
            }
          }
          
          // Release date
          if (structuredData.datePublished) {
            gameMetadata.releaseDate = structuredData.datePublished;
          }
        }
        
        // If we found any game metadata, add it to the additional metadata
        if (Object.keys(gameMetadata).length > 0) {
          additionalMetadata = { gameMetadata };
        }
      }
    } catch (e) {
      // Ignore game metadata extraction errors
    }

    // Return the scraped data with status information
    return {
      name,
      price,
      thumbnail,
      description: description || '',
      site: domain,
      scrapedAt: new Date().toISOString(),
      url,
      ...additionalMetadata, // Include any additional metadata (like game info)
      scrapingStatus: {
        isComplete,
        warnings,
        siteSupported: !!siteConfig
      }
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        throw new Error('Access denied by the website. The site might be blocking our requests.');
      } else if (status === 404) {
        throw new Error('Product not found. The URL might be invalid or the product might have been removed.');
      } else if (status === 429) {
        throw new Error('Rate limited by the website. Please try again later.');
      }
      throw new Error(`Failed to fetch page: HTTP ${status}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The website might be slow or blocking our requests.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Domain not found. Please check the URL and try again.');
    }
    
    // Rethrow the original error with more context
    logger.error('Scraping error:', error);
    throw error;
  }
}

/**
 * Detect if a URL is likely to be a product page
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is likely a product page
 */
export function isLikelyProductUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const domain = urlObj.hostname.replace('www.', '');
    
    // Check if domain is in our supported sites
    const isSupportedSite = Object.keys(siteSpecificSelectors).some(key => domain.includes(key));
    
    // Common patterns in product URLs
    const productPatterns = [
      // General e-commerce patterns
      /\/product\//i,
      /\/dp\//i,
      /\/item\//i,
      /\/pd\//i,
      /\/products\//i,
      /\/shop\//i,
      /\/p\//i,
      /\/buy\//i,
      /\/detail\//i,
      
      // Gaming-specific patterns
      /\/app\//i,         // Steam
      /\/game\//i,        // GOG, Epic, many others
      /\/games\//i,       // Xbox, PlayStation
      /\/store\/products\//i, // Nintendo
      /\/store\/games\//i,    // Various
      /\/en-us\/games\//i,    // Xbox
      /\/en-us\/product\//i   // PlayStation
    ];
    
    // Check if URL path matches any product patterns
    const matchesPattern = productPatterns.some(pattern => pattern.test(path));
    
    // Check for product IDs in the path
    const hasProductId = /\/[A-Z0-9]{5,}(?:\/|$)/.test(path);
    
    // Special case for gaming platforms
    const isGamingSite = [
      'steam', 'epicgames', 'gog', 'nintendo', 'playstation', 'xbox', 
      'humblebundle', 'greenmangaming', 'fanatical', 'cdkeys', 'gamersgate'
    ].some(site => domain.includes(site));
    
    // Gaming sites often have specific patterns
    if (isGamingSite) {
      // Additional checks for gaming sites
      const gamingPatterns = [
        /\/app\/\d+/i,    // Steam app ID
        /\/game\//i,      // Common game page pattern
        /\/games\/store\//i, // Xbox store
        /\/product\//i    // PlayStation store
      ];
      
      const matchesGamingPattern = gamingPatterns.some(pattern => pattern.test(path));
      
      if (matchesGamingPattern) {
        return true;
      }
    }
    
    // If it's a supported site, be more lenient
    if (isSupportedSite) {
      return matchesPattern || hasProductId || path.split('/').length > 2;
    }
    
    // For unsupported sites, be more strict
    return matchesPattern || hasProductId;
  } catch (e) {
    return false;
  }
}

/**
 * Scrape multiple product URLs in parallel with rate limiting
 * @param {string[]} urls - Array of URLs to scrape
 * @param {Object} options - Scraping options
 * @param {number} options.concurrency - Number of concurrent requests (default: 2)
 * @param {number} options.delayBetweenRequests - Delay between requests in ms (default: 1000)
 * @returns {Promise<Object[]>} - Array of scraped product details
 */
export async function batchScrapeProducts(urls, options = {}) {
  // Default options
  const {
    concurrency = 2,
    delayBetweenRequests = 1000,
    allowPartialResults = true,
    timeout = 20000
  } = options;
  
  // Validate input
  if (!Array.isArray(urls)) {
    throw new Error('URLs must be an array');
  }
  
  // Filter out invalid URLs
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
  
  // Results array
  const results = [];
  
  // Process URLs in batches to control concurrency
  for (let i = 0; i < validUrls.length; i += concurrency) {
    const batch = validUrls.slice(i, i + concurrency);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (url, index) => {
      // Add delay for each request except the first one in the batch
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests * index));
      }
      
      try {
        return await scrapeProductDetails(url, { allowPartialResults, timeout });
      } catch (error) {
        logger.error(`Error scraping ${url}:`, error);
        // Return error result
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
    
    // Wait for all requests in this batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches if there are more URLs to process
    if (i + concurrency < validUrls.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests * concurrency));
    }
  }
  
  return results;
}

/**
 * Usage examples:
 * 
 * 1. Basic scraping:
 * ```
 * import { scrapeProductDetails } from './lib/scraper';
 * 
 * const details = await scrapeProductDetails('https://www.amazon.com/dp/B09JQSLL92/');
 * console.log(details);
 * ```
 * 
 * 2. Scraping with options:
 * ```
 * const details = await scrapeProductDetails(url, {
 *   allowPartialResults: true,
 *   timeout: 20000
 * });
 * ```
 * 
 * 3. Batch scraping:
 * ```
 * import { batchScrapeProducts } from './lib/scraper';
 * 
 * const urls = [
 *   'https://www.amazon.com/dp/B09JQSLL92/',
 *   'https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation-white/4900964.p'
 * ];
 * 
 * const results = await batchScrapeProducts(urls, {
 *   concurrency: 2,
 *   delayBetweenRequests: 1000
 * });
 * ```
 * 
 * 4. URL validation:
 * ```
 * import { isLikelyProductUrl } from './lib/scraper';
 * 
 * const isValid = isLikelyProductUrl('https://www.amazon.com/dp/B09JQSLL92/');
 * // Returns true
 * ```
 */

// Examples of supported URLs:
const exampleUrls = [
  // Major marketplaces
  'https://www.amazon.com/Apple-MacBook-16-inch-10%E2%80%91core-16%E2%80%91core/dp/B09JQSLL92/',
  'https://www.bestbuy.com/site/apple-airpods-pro-2nd-generation-white/4900964.p',
  'https://www.walmart.com/ip/PlayStation-5-Console-Marvel-s-Spider-Man-2-Bundle/1497306699',
  'https://www.target.com/p/nintendo-switch-oled-model-with-white-joy-con/-/A-84616123',
  'https://www.newegg.com/p/N82E16824012018',
  'https://www.ebay.com/itm/266555901427',
  
  // Fashion and apparel
  'https://www.zara.com/us/en/oversized-blazer-p02753154.html',
  'https://www.asos.com/us/nike/nike-club-fleece-joggers-in-black/prd/202695188',
  'https://www.hm.com/us/product/0970817001',
  
  // Electronics brands
  'https://www.apple.com/shop/buy-ipad/ipad-pro',
  'https://www.samsung.com/us/smartphones/galaxy-s23-ultra/buy/',
  'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-9315-laptop',
  
  // Gaming platforms and stores
  'https://store.steampowered.com/app/1551360/Baldurs_Gate_3/',
  'https://store.epicgames.com/en-US/p/alan-wake-2',
  'https://www.gog.com/en/game/cyberpunk_2077',
  'https://www.nintendo.com/us/store/products/the-legend-of-zelda-tears-of-the-kingdom-switch/',
  'https://store.playstation.com/en-us/product/UP9000-PPSA08329_00-GHOSTOFTSUSHIMA2',
  'https://www.xbox.com/en-us/games/store/starfield/9c2gqt9j9552',
  'https://www.humblebundle.com/store/hollow-knight',
  'https://www.greenmangaming.com/games/elden-ring-pc/',
  'https://www.fanatical.com/en/game/stardew-valley',
  'https://www.cdkeys.com/pc/games/minecraft-java-edition-pc',
  
  // And many more e-commerce sites supported
];