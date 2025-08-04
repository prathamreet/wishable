// Shared constants and configurations
export const SCRAPING_DEFAULTS = {
  timeout: 25000,
  retries: 2,
  delayBetweenRequests: 2000,
  allowPartialResults: true
};

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

export const COMMON_IMAGE_ATTRIBUTES = ['src', 'data-src', 'data-original', 'data-lazy-src', 'data-zoom-image', 'data-large-image'];

export const SUPPORTED_SITES = [
  'amazon',
  'flipkart', 
  'myntra',
  'ajio',
  'nykaa',
  'zara',
  'steam',
  'epicgames'
];
