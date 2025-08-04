export default {
  name: 'zara',
  domains: ['zara.com'],
  selectors: {
    name: [
      '.product-detail-info h1',
      '.product-name',
      '.title',
      'h1.product-title',
      '.product-detail-name',
      '.zds-text--display-small',
      '.product-info h1'
    ],
    price: [
      '.price',
      '.product-price',
      '.current-price',
      '.price-current',
      '.money-amount',
      '.zds-text--body-s',
      '.product-detail-price'
    ],
    image: [
      '.media-image',
      '.product-image',
      '.gallery-image',
      '.product-detail-image img',
      '.image-container img',
      '.zds-image img'
    ]
  },
  urlPatterns: [
    /\/p\//i,
    /\/product\//i,
    /\/share\//i
  ]
};
