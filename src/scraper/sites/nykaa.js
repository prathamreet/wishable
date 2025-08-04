export default {
  name: 'nykaa',
  domains: ['nykaa.com'],
  selectors: {
    name: [
      '.product-title',
      '.css-1gc4x7i',
      '.product-name',
      'h1.product-title',
      '.pdp-product-name',
      '.product-brand-name + h1',
      '.css-zjk4qz'
    ],
    price: [
      '.css-1jczs19',
      '.price-info',
      '.post-card__content-price-offer',
      '.product-price',
      '.current-price',
      '.discounted-price',
      '.css-f9jzgs'
    ],
    image: [
      '.css-11gn9r4',
      '.product-image',
      '.nykaa-carousel img',
      '.image-gallery img',
      '.product-image-main img',
      '.css-1pdjj7g img'
    ]
  },
  urlPatterns: [
    /\/p\//i,
    /\/product\//i
  ]
};
