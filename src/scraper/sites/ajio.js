export default {
  name: 'ajio',
  domains: ['ajio.com'],
  selectors: {
    name: [
      '.prod-name',
      '.product-title',
      '.title-wrap',
      'h1.prod-title',
      '.product-name-section h1',
      '.prod-title-container',
      '.product-brand + .prod-name'
    ],
    price: [
      '.prod-sp',
      '.price-value',
      '.sale-price',
      '.prod-price',
      '.current-price',
      '.discount-price',
      '.price-section .price'
    ],
    image: [
      '.product-image',
      '.zoom-wrap img',
      '.preview-image',
      '.prod-image img',
      '.image-carousel img',
      '.product-gallery img'
    ]
  },
  urlPatterns: [
    /\/p\//i,
    /\/product\//i
  ]
};
