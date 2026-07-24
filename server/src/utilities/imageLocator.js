import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

/**
 * Resolves servable image locations from files on disk under
 * server/public/images/<subdir>, matched by the item's name (case-insensitive,
 * extension-agnostic). This powers the `imageLoc` virtuals on the Product and
 * Inventory models: nothing is stored in the DB, so dropping a correctly named
 * file makes the image appear on the next fetch.
 *
 * A short-lived cache keeps this to one directory read per folder per window
 * (an O(1) lookup thereafter), so a 100-item menu does not trigger 100 reads.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_ROOT = path.join(__dirname, '../../public/images');

const IMAGE_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif']);

// Instant refresh in dev (so file drops show while editing); brief cache in prod.
const CACHE_TTL_MS = env.isProduction ? 15000 : 0;

/** @type {Map<string, { index: Map<string, string>, expiresAt: number }>} */
const cache = new Map();

const buildIndex = (subdir) => {
  const dir = path.join(IMAGES_ROOT, subdir);
  const index = new Map();
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return index;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!IMAGE_EXTENSIONS.has(ext.toLowerCase())) continue;
    const key = path.basename(entry.name, ext).trim().toLowerCase();
    if (!index.has(key)) index.set(key, entry.name);
  }
  return index;
};

const getIndex = (subdir) => {
  const cached = cache.get(subdir);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.index;
  }
  const index = buildIndex(subdir);
  cache.set(subdir, { index, expiresAt: Date.now() + CACHE_TTL_MS });
  return index;
};

/**
 * Returns a servable URL (e.g. `/api/images/products/Espresso.webp`) for the
 * file whose basename matches `name`, or `''` when no matching file exists.
 *
 * @param {string} subdir - Folder under public/images (e.g. 'products').
 * @param {string} name - Item name to match against filenames.
 * @returns {string}
 */
export const resolveImageLoc = (subdir, name) => {
  if (!name) return '';
  const file = getIndex(subdir).get(String(name).trim().toLowerCase());
  return file ? `/api/images/${subdir}/${encodeURIComponent(file)}` : '';
};
