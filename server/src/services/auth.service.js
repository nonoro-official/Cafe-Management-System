import { User } from '../models/user.model.js';
import { ApiError } from '../utilities/apiError.js';
import { signToken } from '../utilities/token.js';
import { ROLES } from '../utilities/constants.js';

class AuthService {
  /**
   * Registers a new customer account. Registration is always scoped to the
   * customer role; administrators are provisioned through the admin user API.
   */
  async register({ name, email, password, phone }) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: ROLES.CUSTOMER,
    });

    return this.#withToken(user);
  }

  /**
   * Authenticates a user by email + password.
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('This account has been deactivated');
    }

    return this.#withToken(user);
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async updateProfile(userId, { name, phone }) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    return user;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  #withToken(user) {
    const token = signToken({ id: user.id, role: user.role });
    // Re-serialise through toJSON to strip the password field.
    return { user: user.toJSON(), token };
  }
}

export const authService = new AuthService();
