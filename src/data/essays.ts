/**
 * Essays data layer
 *
 * Re-exports the Substack helpers under the names the pages already use.
 * All functions fetch at build time; no client-side network calls are made.
 */

export type { SubstackPost as Essay } from '../utils/substack';
export { getAllPosts, getRecentPosts, getPostBySlug } from '../utils/substack';
