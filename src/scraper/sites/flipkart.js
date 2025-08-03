export default {
  name: 'flipkart',
  domains: ['flipkart.com'],
  selectors: {
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
  urlPatterns: [
    /\/p\//i,
    /\/product\//i
  ]
};
