/**
 * Converts an arbitrary string into a URL-friendly slug.
 *
 * @param {string} value
 * @returns {string}
 */
export const slugify = (value = '') =>
  value
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
