import { load } from 'cheerio';
import axios from 'axios';

// Site-specific selectors for better accuracy
const siteSpecificSelectors = {
  'amazon': {
    name: ['#productTitle', '.product-title-word-break', '#title'],
    price: ['.a-price .a-offscreen', '#priceblock_ourprice', '#price', '.a-price-whole'],
    image: ['#imgTagWrapperId img', '#landingImage', '.a-dynamic-image']
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
  }
};

function parsePrice(text) {
  if (!text) return null;
  // Match any number format (including those with currency symbols)
  // Support for ₹ (Indian Rupee) and other currency symbols
  const match = text.match(/[₹$€£]?\s*[\d,]+(\.\d+)?/);
  return match ? parseFloat(match[0].replace(/[₹$€£\s,]/g, '')) : null;
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

export async function scrapeProductDetails(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Find matching site configuration
    const siteKey = Object.keys(siteSpecificSelectors).find(key => domain.includes(key));
    const siteConfig = siteKey ? siteSpecificSelectors[siteKey] : null;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000
    });

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
      'h1' // Fallback to first h1
    ];

    // Common selectors for prices
    const priceSelectors = [
      // Schema.org metadata
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="price"]',
      // Common price selectors
      'span[class*="price" i]',
      'div[class*="price" i]',
      'p[class*="price" i]',
      '*[class*="current-price" i]',
      '*[class*="sale-price" i]',
      '*[class*="special-price" i]',
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
      // Fallback to first large image
      'img[width][height]'
    ];

    // Try to get data from structured data first
    let structuredData = null;
    try {
      const jsonLdScript = $('script[type="application/ld+json"]').first().html();
      if (jsonLdScript) {
        const parsedData = JSON.parse(jsonLdScript);
        if (Array.isArray(parsedData)) {
          structuredData = parsedData.find(item => item['@type'] === 'Product');
        } else if (parsedData['@type'] === 'Product') {
          structuredData = parsedData;
        }
      }
    } catch (e) {
      console.error('Failed to parse structured data:', e);
    }

    // Get product name
    let name = null;
    if (structuredData?.name) {
      name = structuredData.name;
    } else {
      // Try meta tags first
      const metaTitle = $('meta[property="og:title"]').attr('content') ||
                       $('meta[name="og:title"]').attr('content') ||
                       $('meta[property="product:title"]').attr('content');
      if (metaTitle) {
        name = metaTitle;
      } else {
        name = findBestMatch(nameSelectors, $, siteConfig?.name || []);
      }
    }

    // Get product price
    let price = null;
    if (structuredData?.offers?.price) {
      price = parseFloat(structuredData.offers.price);
    } else {
      const metaPrice = $('meta[property="product:price:amount"]').attr('content') ||
                       $('meta[property="og:price:amount"]').attr('content');
      if (metaPrice) {
        price = parseFloat(metaPrice);
      } else {
        const priceText = findBestMatch(priceSelectors, $, siteConfig?.price || []);
        price = parsePrice(priceText);
      }
    }

    // Get product image
    let thumbnail = null;
    if (structuredData?.image) {
      thumbnail = Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image;
    } else {
      // Try meta tags first
      const metaImage = $('meta[property="og:image"]').attr('content') ||
                       $('meta[property="og:image:secure_url"]').attr('content');
      if (metaImage) {
        thumbnail = metaImage;
      } else {
        thumbnail = findBestImageMatch(imageSelectors, $, siteConfig?.image || [], urlObj.origin);
      }
    }

    // Validate and clean the data
    if (!name) throw new Error('Failed to extract product name');
    if (!price) throw new Error('Failed to extract product price');
    if (!thumbnail) throw new Error('Failed to extract product image');

    // Clean up the name (remove site name if present)
    name = name.split('|')[0].split('-')[0].trim();

    // Ensure thumbnail URL is absolute
    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = new URL(thumbnail, urlObj.origin).toString();
    }

    return {
      name,
      price,
      thumbnail,
      site: domain,
      scrapedAt: new Date().toISOString(),
      url
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        throw new Error('Access denied by the website. The site might be blocking our requests.');
      } else if (status === 404) {
        throw new Error('Product not found. The URL might be invalid or the product might have been removed.');
      }
      throw new Error(`Failed to fetch page: ${status}`);
    }
    throw error;
  }
}

// Examples of supported URLs:
const urls = [
  'https://www.amazon.com/...',
  'https://www.flipkart.com/...',
  'https://www.myntra.com/...',
  'https://www.bestbuy.com/...',
  'https://www.walmart.com/...',
  'https://www.target.com/...',
  // Any other e-commerce site
];