import { PAGINATION } from './constants.js';

/**
 * Normalises raw query parameters into safe pagination options.
 *
 * @param {Record<string, unknown>} query
 * @returns {{ page: number, limit: number, skip: number }}
 */
export const parsePagination = (query = {}) => {
  const rawPage = Number(query.page);
  const rawLimit = Number(query.limit);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : PAGINATION.DEFAULT_PAGE;

  let limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : PAGINATION.DEFAULT_LIMIT;
  limit = Math.min(limit, PAGINATION.MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Builds the pagination metadata block returned alongside list responses.
 */
export const buildPaginationMeta = ({ page, limit, total }) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
