/**
 * Convert a string to a URL-safe slug.
 * Example: "The Practice of Attention" → "the-practice-of-attention"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/'/g, '')           // remove apostrophes
    .replace(/[\s_]+/g, '-')     // spaces/underscores → hyphens
    .replace(/[^\w-]+/g, '')     // remove non-word chars except hyphens
    .replace(/--+/g, '-')        // collapse repeated hyphens
    .replace(/^-+|-+$/g, '');    // strip leading/trailing hyphens
}
