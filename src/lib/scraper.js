import { load } from 'cheerio';
import axios from 'axios';

function getSiteFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('flipkart')) return 'flipkart';
    if (hostname.includes('myntra')) return 'myntra';
    return null;
  } catch (error) {
    return null;
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.match(/[\d,]+(\.\d+)?/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : null;
}

export async function scrapeProductDetails(url) {
  // Validate URL
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL provided');
  }

  const site = getSiteFromUrl(url);
  if (!site) throw new Error('Unsupported site');

  try {
    const response = await axios.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });
    
    const html = response.data;
    const $ = load(html);

    let name, price, thumbnail;

    switch (site) {
      case 'amazon':
        name = $('#productTitle').text().trim() || 
               $('.product-title-word-break').text().trim();
        price = parsePrice($('#priceblock_ourprice').text() || 
                $('#price').text() || 
                $('.a-price .a-offscreen').text());
        thumbnail = $('#imgTagWrapperId img').attr('src') || 
                   $('#landingImage').attr('src') || 
                   $('.a-dynamic-image').attr('src');
        break;
      case 'flipkart':
        name = $('.B_NuCI').text().trim() || 
               $('._35KyD6').text().trim();
        price = parsePrice($('._30jeq3').text() || 
                $('._1vC4OE').text());
        thumbnail = $('._396cs4').attr('src') || 
                   $('._3BTv9X img').attr('src');
        break;
      case 'myntra':
        name = $('.pdp-title').text().trim() || 
               $('.pdp-name').text().trim();
        price = parsePrice($('.pdp-price').text() || 
                $('.pdp-mrp').text());
        thumbnail = $('.image-grid-image').attr('src') || 
                   $('.image-grid-imageContainer img').attr('src');
        break;
      default:
        throw new Error('Unsupported site');
    }

    if (!name) throw new Error('Failed to extract product name');
    if (!price) throw new Error('Failed to extract product price');
    if (!thumbnail) throw new Error('Failed to extract product image');

    return { 
      name, 
      price, 
      thumbnail, 
      site,
      scrapedAt: new Date().toISOString()
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`Failed to fetch page: ${error.response.status}`);
    }
    throw error;
  }
}