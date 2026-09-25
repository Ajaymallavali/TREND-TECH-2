/**
 * TREND-TECH-2 — Master Catalog Integrity & Guardrail Configuration
 * Centralized threshold definitions and rule severity settings.
 */

export const CATALOG_INTEGRITY_CONFIG = {
  // Maximum allowed threshold of unavailable images in a LIVE_VERIFIED category (10%)
  IMAGE_UNAVAILABLE_THRESHOLD: 0.10,

  // Maximum allowed threshold of identical prices across unrelated products in a category (10%)
  PRICE_REPETITION_THRESHOLD: 0.10,

  // Max repeated price count allowed before flagging suspicious price repetition
  MAX_ALLOWED_REPEATED_PRICE_COUNT: 5,

  // Rule Severity Definitions
  SEVERITIES: {
    CROSS_PRODUCT_IMAGE_COLLISION: 'CRITICAL',
    IMAGE_SHA256_COLLISION: 'CRITICAL',
    IMAGE_UNAVAILABLE_THRESHOLD_EXCEEDED: 'CRITICAL',
    GENERIC_TEMPLATE_NAME: 'CRITICAL',
    TEMPLATE_DESCRIPTION: 'CRITICAL',
    CATEGORY_MISMATCH: 'CRITICAL',
    CATEGORY_CONTAMINATION: 'CRITICAL',
    BRAND_CATEGORY_ISOLATION: 'CRITICAL',
    SUSPICIOUS_PRICE_REPETITION: 'CRITICAL',
    HARDCODED_PRICE_FALLBACK: 'CRITICAL',
    GENERATED_ASIN: 'CRITICAL',
    GENERATED_MARKETPLACE_URL: 'CRITICAL',
    MOCK_DATA_LEAKAGE: 'CRITICAL',
    LEGACY_CATALOG_EXPOSURE: 'CRITICAL',
    BROKEN_MARKETPLACE_RELATION: 'CRITICAL',

    // Warnings (Non-blocking)
    SMALL_UNAVAILABLE_COUNT: 'WARNING',
    AMBIGUOUS_DESCRIPTION_PATTERN: 'WARNING'
  },

  // Forbidden stock photo domains
  FORBIDDEN_STOCK_DOMAINS: [
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'freepik.com',
    'via.placeholder.com',
    'placeholder.com',
    'dummyimage.com'
  ],

  // Forbidden template description patterns
  SUSPICIOUS_DESCRIPTION_PATTERNS: [
    /experience the new/i,
    /cutting-edge technology/i,
    /official commercial/i,
    /designed for modern users/i,
    /perfect for everyday use/i,
    /premium performance/i
  ],

  // Forbidden template product name patterns
  SUSPICIOUS_NAME_PATTERNS: [
    /^Smartphone\s+\w+$/i,
    /^Laptop\s+\w+$/i,
    /^Audio\s+\w+$/i,
    /^Mobile\s+\w+$/i,
    /^Generic\s+\w+$/i,
    /Smartphone Redmi/i,
    /Smartphone Pixel/i,
    /Smartphone Poco/i,
    /Laptop Legion/i,
    /Audio Neckbands/i,
    /Audio Gaming Headsets/i,
    /Mobile Phone Pro/i
  ]
};
