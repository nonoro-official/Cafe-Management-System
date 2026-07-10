import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { setAuthCookie, clearAuthCookie } from '../utilities/cookie.js';
import { authService } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  sendCreated(res, { message: 'Registration successful', data: { user, token } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  sendSuccess(res, { message: 'Login successful', data: { user, token } });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, { message: 'Logout successful' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendSuccess(res, { data: { user } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  sendSuccess(res, { message: 'Profile updated', data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, { message: 'Password changed successfully' });
});
