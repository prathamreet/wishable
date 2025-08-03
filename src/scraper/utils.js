import logger from "../lib/logger";

/**
 * Enhanced price parsing with multi-currency support
 */
export function parsePrice(text) {
  if (!text) return null;

  const cleanText = text.replace(/\s+/g, " ").trim();

  const pricePatterns = [
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /\$\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /€\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /£\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /[₹$€£¥₩₽₴₺₼₸₿]\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /([0-9,]+(?:\.[0-9]{2})?)\s*[₹$€£¥₩₽₴₺₼₸₿]/,
    /([0-9,]+(?:\.[0-9]{2})?)/,
  ];

  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const price = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }

  return null;
}

/**
 * Enhanced element finder with better fallback logic
 */
export function findBestMatch(selectors, $, siteSpecific = []) {
  for (const selector of siteSpecific) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      const text = element.text()?.trim();
      if (text && text.length > 2) {
        return text;
      }
    }
  }

  for (const selector of selectors) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      const text = element.text()?.trim();
      if (text && text.length > 2) {
        return text;
      }
    }
  }

  return null;
}

/**
 * Enhanced image finder with URL resolution
 */
export function findBestImageMatch(
  selectors,
  $,
  siteSpecific = [],
  baseUrl = ""
) {
  const imageAttributes = [
    "src",
    "data-src",
    "data-original",
    "data-lazy-src",
    "data-zoom-image",
    "data-large-image",
  ];

  for (const selector of siteSpecific) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);

      for (const attr of imageAttributes) {
        const imgUrl = element.attr(attr);
        if (
          imgUrl &&
          imgUrl.length > 10 &&
          !imgUrl.includes("data:image/svg")
        ) {
          return resolveImageUrl(imgUrl, baseUrl);
        }
      }
    }
  }

  for (const selector of selectors) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);

      for (const attr of imageAttributes) {
        const imgUrl = element.attr(attr);
        if (
          imgUrl &&
          imgUrl.length > 10 &&
          !imgUrl.includes("data:image/svg")
        ) {
          return resolveImageUrl(imgUrl, baseUrl);
        }
      }
    }
  }

  return null;
}

/**
 * Resolve relative image URLs to absolute URLs
 */
export function resolveImageUrl(imgUrl, baseUrl) {
  if (!imgUrl) return null;

  if (imgUrl.startsWith("http")) {
    return imgUrl;
  }

  if (imgUrl.startsWith("//")) {
    return "https:" + imgUrl;
  }

  if (baseUrl) {
    try {
      return new URL(imgUrl, baseUrl).toString();
    } catch (e) {
      logger.warn("Failed to resolve image URL:", imgUrl, baseUrl);
    }
  }

  return imgUrl;
}

/**
 * Enhanced structured data extraction
 */
export function extractStructuredData($) {
  let structuredData = null;

  try {
    const jsonLdScripts = $('script[type="application/ld+json"]');

    jsonLdScripts.each((i, script) => {
      if (structuredData) return;

      try {
        const scriptContent = $(script).html();
        if (!scriptContent) return;

        const parsedData = JSON.parse(scriptContent);

        if (Array.isArray(parsedData)) {
          structuredData = parsedData.find(
            (item) =>
              ["Product", "VideoGame", "SoftwareApplication"].includes(
                item["@type"]
              ) ||
              (Array.isArray(item["@type"]) &&
                item["@type"].some((type) =>
                  ["Product", "VideoGame", "SoftwareApplication"].includes(type)
                ))
          );
        } else if (
          parsedData["@type"] &&
          (["Product", "VideoGame", "SoftwareApplication"].includes(
            parsedData["@type"]
          ) ||
            (Array.isArray(parsedData["@type"]) &&
              parsedData["@type"].some((type) =>
                ["Product", "VideoGame", "SoftwareApplication"].includes(type)
              )))
        ) {
          structuredData = parsedData;
        } else if (
          parsedData["@graph"] &&
          Array.isArray(parsedData["@graph"])
        ) {
          structuredData = parsedData["@graph"].find(
            (item) =>
              ["Product", "VideoGame", "SoftwareApplication"].includes(
                item["@type"]
              ) ||
              (Array.isArray(item["@type"]) &&
                item["@type"].some((type) =>
                  ["Product", "VideoGame", "SoftwareApplication"].includes(type)
                ))
          );
        }
      } catch (e) {
        // Skip invalid JSON-LD
      }
    });
  } catch (e) {
    logger.error("Failed to parse structured data:", e);
  }

  return structuredData;
}

/**
 * Enhanced URL validation for product pages
 */
export function isLikelyProductUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const domain = urlObj.hostname.replace("www.", "");

    const supportedSites = [
      "amazon",
      "flipkart",
      "myntra",
      "ajio",
      "nykaa",
      "zara",
      "steam",
      "epicgames",
    ];
    const isSupportedSite = supportedSites.some((site) =>
      domain.includes(site)
    );

    const productPatterns = [
      /\/product\//i,
      /\/dp\//i,
      /\/item\//i,
      /\/pd\//i,
      /\/products\//i,
      /\/shop\//i,
      /\/p\//i,
      /\/buy\//i,
      /\/detail\//i,
      /\/app\//i, // Steam
      /\/bundles\//i, // Steam bundles
      /\/game\//i, // Epic Games
    ];

    const matchesPattern = productPatterns.some((pattern) =>
      pattern.test(path)
    );
    const hasProductId = /\/[A-Z0-9]{5,}(?:\/|$)/.test(path);

    const isGamingSite = ["steam", "epicgames"].some((site) =>
      domain.includes(site)
    );

    if (isGamingSite) {
      const gamingPatterns = [
        /\/app\/\d+/i, // Steam app ID
        /\/bundles\/\d+/i, // Steam bundles
        /\/product\//i, // Epic Games
      ];
      if (gamingPatterns.some((pattern) => pattern.test(path))) {
        return true;
      }
    }

    if (isSupportedSite) {
      return matchesPattern || hasProductId || path.split("/").length > 2;
    }

    return false; // Only allow supported sites
  } catch (e) {
    return false;
  }
}
