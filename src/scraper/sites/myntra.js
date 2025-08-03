export default {
  name: 'myntra',
  domains: ['myntra.com'],
  selectors: {
    name: [
      '.pdp-title',
      '.pdp-name',
      '.product-title',
      'h1.pdp-title',
      'h1[data-testid="product-title"]',
      '.pdp-product-title-text',
      '.product-brand-name + h1',
      '.pdp-title-container h1'
    ],
    price: [
      '.pdp-price',
      '.pdp-mrp',
      '.product-price',
      'span.pdp-price',
      '.price-info strong',
      '.discount-price',
      '.pdp-price .price-value',
      '.current-price'
    ],
    image: [
      '.image-grid-image',
      '.image-grid-imageContainer img',
      '.pdp-image img',
      '.product-image-main img',
      '.hero-image img',
      '.image-carousel img'
    ]
  },
  urlPatterns: [
    /\/p\//i,
    /\/product\//i,
    /\/buy\//i
  ]
};
