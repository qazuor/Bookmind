/**
 * Metadata Extraction Service
 *
 * Extracts metadata (title, description, favicon, OG image) from URLs.
 */

import * as cheerio from "cheerio";

/**
 * URL validation result
 */
export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  error?: string;
}

/**
 * Extracted metadata
 */
export interface ExtractedMetadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
}

/**
 * Validate and normalize a URL
 */
export function validateUrl(url: string): UrlValidationResult {
  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        isValid: false,
        error: "URL must use http or https protocol",
      };
    }

    // Normalize URL
    const normalizedUrl = parsed.href;

    return {
      isValid: true,
      normalizedUrl,
    };
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format",
    };
  }
}

/**
 * Extract favicon from a page
 */
function extractFavicon($: cheerio.CheerioAPI, baseUrl: URL): string | null {
  // Check for explicit icon links
  const iconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ];

  for (const selector of iconSelectors) {
    const href = $(selector).attr("href");
    if (href) {
      return resolveUrl(href, baseUrl);
    }
  }

  // Fallback to /favicon.ico
  return `${baseUrl.origin}/favicon.ico`;
}

/**
 * Extract Open Graph metadata
 */
function extractOpenGraph($: cheerio.CheerioAPI): {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
} {
  const ogTitle = $('meta[property="og:title"]').attr("content") ?? null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content") ?? null;
  const ogImage = $('meta[property="og:image"]').attr("content") ?? null;

  return { ogTitle, ogDescription, ogImage };
}

/**
 * Resolve a relative URL to absolute
 */
function resolveUrl(url: string, baseUrl: URL): string {
  if (!url) return "";

  try {
    // Already absolute
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Protocol-relative
    if (url.startsWith("//")) {
      return `${baseUrl.protocol}${url}`;
    }

    // Absolute path
    if (url.startsWith("/")) {
      return `${baseUrl.origin}${url}`;
    }

    // Relative path
    return new URL(url, baseUrl.href).href;
  } catch {
    return url;
  }
}

/**
 * Extract title from page
 */
function extractTitle($: cheerio.CheerioAPI): string | null {
  // Try <title> tag
  const title = $("title").first().text().trim();
  if (title) return title;

  // Try og:title
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
  if (ogTitle) return ogTitle;

  // Try h1
  const h1 = $("h1").first().text().trim();
  if (h1) return h1;

  return null;
}

/**
 * Extract description from page
 */
function extractDescription($: cheerio.CheerioAPI): string | null {
  // Try meta description
  const metaDesc = $('meta[name="description"]').attr("content")?.trim();
  if (metaDesc) return metaDesc;

  // Try og:description
  const ogDesc = $('meta[property="og:description"]').attr("content")?.trim();
  if (ogDesc) return ogDesc;

  // Try first paragraph
  const firstP = $("p").first().text().trim();
  if (firstP && firstP.length > 20) {
    return firstP.substring(0, 500);
  }

  return null;
}

/**
 * Fetch and extract metadata from a URL
 */
export async function extractMetadata(
  url: string,
  timeoutMs = 5000,
): Promise<ExtractedMetadata> {
  const validation = validateUrl(url);
  if (!(validation.isValid && validation.normalizedUrl)) {
    return {
      title: null,
      description: null,
      favicon: null,
      ogImage: null,
      ogTitle: null,
      ogDescription: null,
    };
  }

  const normalizedUrl = validation.normalizedUrl;
  const baseUrl = new URL(normalizedUrl);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BookMind Bot/1.0 (+https://bookmind.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: null,
        description: null,
        favicon: `${baseUrl.origin}/favicon.ico`,
        ogImage: null,
        ogTitle: null,
        ogDescription: null,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = extractTitle($);
    const description = extractDescription($);
    const favicon = extractFavicon($, baseUrl);
    const { ogTitle, ogDescription, ogImage } = extractOpenGraph($);

    // Resolve relative OG image URL
    const resolvedOgImage = ogImage ? resolveUrl(ogImage, baseUrl) : null;

    return {
      title,
      description,
      favicon,
      ogImage: resolvedOgImage,
      ogTitle,
      ogDescription,
    };
  } catch (error) {
    // Timeout or network error - return minimal info
    // biome-ignore lint/suspicious/noConsole: Intentional error logging for debugging
    console.error(`[Metadata] Failed to extract from ${url}:`, error);

    return {
      title: null,
      description: null,
      favicon: `${baseUrl.origin}/favicon.ico`,
      ogImage: null,
      ogTitle: null,
      ogDescription: null,
    };
  }
}

/**
 * Get Google favicon service URL as fallback
 */
export function getGoogleFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
  } catch {
    return "";
  }
}

/**
 * Extract metadata and update bookmark
 */
export async function extractAndUpdateBookmark(
  bookmarkId: string,
  userId: string,
  url: string,
): Promise<ExtractedMetadata> {
  const metadata = await extractMetadata(url);

  // Import dynamically to avoid circular dependency
  const { updateBookmarkMetadata } = await import("./bookmarks");

  await updateBookmarkMetadata(bookmarkId, userId, {
    title: metadata.ogTitle ?? metadata.title ?? undefined,
    description: metadata.ogDescription ?? metadata.description ?? undefined,
    favicon: metadata.favicon ?? undefined,
    ogImage: metadata.ogImage ?? undefined,
    ogTitle: metadata.ogTitle ?? undefined,
    ogDescription: metadata.ogDescription ?? undefined,
  });

  return metadata;
}
