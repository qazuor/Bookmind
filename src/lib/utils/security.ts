/**
 * Security Utilities (P9-005)
 *
 * URL sanitization, HTML escaping, and XSS prevention utilities.
 */

/**
 * Allowed URL protocols
 */
const ALLOWED_PROTOCOLS = ["http:", "https:"];

/**
 * Dangerous URL patterns to block
 */
const DANGEROUS_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
  /^ftp:/i,
];

/**
 * Check if a URL is safe
 *
 * @param url - URL to validate
 * @returns true if URL is safe, false otherwise
 */
export function isUrlSafe(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmed = url.trim();

  // Check for empty string
  if (!trimmed) {
    return false;
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  try {
    const parsed = new URL(trimmed);

    // Check protocol is allowed
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return false;
    }

    // Check for valid hostname (not empty, not localhost in production)
    if (!parsed.hostname) {
      return false;
    }

    return true;
  } catch {
    // URL parsing failed - could be relative URL which is OK
    // Check it doesn't start with dangerous patterns
    return !DANGEROUS_PATTERNS.some((p) => p.test(trimmed));
  }
}

/**
 * Sanitize a URL by validating and normalizing it
 *
 * @param url - URL to sanitize
 * @returns Sanitized URL or null if unsafe
 */
export function sanitizeUrl(url: string): string | null {
  if (!isUrlSafe(url)) {
    return null;
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    // Reconstruct URL to normalize it
    // This removes any potentially malicious encoding
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Return trimmed version for relative URLs
    return trimmed;
  }
}

/**
 * Sanitize URL for use in href attributes
 * Returns '#' for unsafe URLs to prevent XSS
 *
 * @param url - URL to sanitize
 * @returns Safe URL or '#' fallback
 */
export function sanitizeHref(url: string): string {
  return sanitizeUrl(url) ?? "#";
}

/**
 * Escape HTML special characters
 *
 * @param str - String to escape
 * @returns Escaped string safe for HTML insertion
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Escape string for use in HTML attributes
 *
 * @param str - String to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeAttribute(str: string): string {
  return escapeHtml(str).replace(/\n/g, "&#10;").replace(/\r/g, "&#13;");
}

/**
 * Strip HTML tags from a string
 *
 * @param str - String containing HTML
 * @returns String with HTML tags removed
 */
export function stripHtml(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  // Remove HTML tags
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

/**
 * Sanitize user input for display
 * Escapes HTML and trims whitespace
 *
 * @param input - User input to sanitize
 * @param maxLength - Optional maximum length
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, maxLength?: number): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  let sanitized = input.trim();

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return escapeHtml(sanitized);
}

/**
 * Validate and sanitize a domain name
 *
 * @param domain - Domain to validate
 * @returns true if valid domain
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== "string") {
    return false;
  }

  // Basic domain validation regex
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

  return domainRegex.test(domain.trim());
}

/**
 * Extract domain from URL
 *
 * @param url - URL to extract domain from
 * @returns Domain string or null if invalid
 */
export function extractDomain(url: string): string | null {
  if (!isUrlSafe(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}
