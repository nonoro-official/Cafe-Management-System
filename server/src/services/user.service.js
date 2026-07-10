import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/apiError.js';
import { parsePagination, buildPaginationMeta } from '../utilities/pagination.js';

class UserService {
  async list(query = {}) {
    const { page, limit, skip } = parsePagination(query);

    const filter = {};
    if (query.role) {
      filter.role = query.role;
    }
    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const sort = this.#buildSort(query);

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async getById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async create({ name, email, password, role, phone, isActive }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    return User.create({ name, email, password, role, phone, isActive });
  }

  async update(id, payload) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (payload.email && payload.email !== user.email) {
      const clash = await User.findOne({ email: payload.email });
      if (clash) {
        throw ApiError.conflict('An account with this email already exists');
      }
    }

    ['name', 'email', 'role', 'phone', 'isActive'].forEach((field) => {
      if (payload[field] !== undefined) {
        user[field] = payload[field];
      }
    });

    // Password is set separately so the pre-save hashing hook runs.
    if (payload.password) {
      user.password = payload.password;
    }

    await user.save();
    return user;
  }

  async remove(id, requesterId) {
    if (String(id) === String(requesterId)) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  #buildSort(query) {
    const allowed = ['createdAt', 'name', 'email', 'role'];
    const field = allowed.includes(query.sort) ? query.sort : 'createdAt';
    const direction = query.order === 'asc' ? 1 : -1;
    return { [field]: direction };
  }
}

export const userService = new UserService();
