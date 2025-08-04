export default {
  name: 'amazon',
  domains: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.fr'],
  selectors: {
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
  urlPatterns: [
    /\/dp\//i,
    /\/product\//i,
    /\/gp\/product\//i
  ]
};
