/**
 * Substack RSS utilities
 *
 * Fetches and parses the Substack RSS feed at build time.
 * All exports are async; call them from Astro frontmatter so the
 * fetch runs during `astro build`, not in the browser.
 */

import { slugify } from './slugify';

export interface SubstackPost {
  title:       string;
  slug:        string;
  date:        string;       // ISO date string, e.g. "2025-04-15"
  pubDate:     string;       // raw pubDate from RSS
  content:     string;       // cleaned HTML (content:encoded or description)
  excerpt:     string;       // plain-text excerpt, ≤160 chars
  readingTime: string;       // e.g. "5 MIN READ"
  substackUrl: string;       // canonical Substack link
}

const FEED_URL = 'https://rjgrunau.substack.com/feed';

// ─── Public API ────────────────────────────────────────────────────────────────

/** Fetch all posts, newest first. */
export async function getAllPosts(): Promise<SubstackPost[]> {
  return fetchSubstackPosts();
}

/** Fetch only the most recent `count` posts (default 3). */
export async function getRecentPosts(count = 3): Promise<SubstackPost[]> {
  const posts = await fetchSubstackPosts();
  return posts.slice(0, count);
}

/** Look up a single post by its slug. */
export async function getPostBySlug(slug: string): Promise<SubstackPost | null> {
  const posts = await fetchSubstackPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

// ─── Core fetch + parse ────────────────────────────────────────────────────────

async function fetchSubstackPosts(feedUrl = FEED_URL): Promise<SubstackPost[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
    }
    const xml = await response.text();
    return parseRSSFeed(xml);
  } catch (err) {
    console.error('[substack] Error fetching feed:', err);
    return [];
  }
}

function parseRSSFeed(xml: string): SubstackPost[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const items = [...xml.matchAll(itemRegex)];

  const posts = items.map((match) => {
    const item = match[1];

    const title   = extractTag(item, 'title');
    const link    = extractTag(item, 'link');
    const guid    = extractTag(item, 'guid');
    const pubDate = extractTag(item, 'pubDate');
    const desc    = extractTag(item, 'description');

    const rawContent = extractTag(item, 'content:encoded') || desc;
    const content    = cleanHTML(rawContent);
    const excerpt    = generateExcerpt(desc || content);
    const readingTime = calcReadingTime(content);
    const slug        = slugify(title);
    const date        = new Date(pubDate).toISOString().split('T')[0];

    return {
      title,
      slug,
      date,
      pubDate,
      content,
      excerpt,
      readingTime,
      substackUrl: link || guid,
    };
  });

  // Newest first
  return posts.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

// ─── XML helpers ───────────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';

  let content = match[1].trim();
  content = decodeEntities(content);
  // Strip CDATA wrapper
  content = content.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1');
  return content;
}

function decodeEntities(text: string): string {
  const map: Record<string, string> = {
    '&amp;':  '&',
    '&lt;':   '<',
    '&gt;':   '>',
    '&quot;': '"',
    '&#39;':  "'",
    '&apos;': "'",
  };
  return text.replace(/&[#\w]+;/g, (entity) => map[entity] ?? entity);
}

// ─── Content helpers ──────────────────────────────────────────────────────────

function cleanHTML(html: string): string {
  return html.trim().replace(/\s+/g, ' ');
}

function generateExcerpt(content: string, maxLength = 160): string {
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const cut = text.substring(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.substring(0, lastSpace) : cut) + '…';
}

function calcReadingTime(content: string): string {
  const text  = content.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  const mins  = Math.ceil(words / 225);
  return `${mins} min read`;
}
