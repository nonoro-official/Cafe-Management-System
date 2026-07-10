import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { userService } from '../services/user.service.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.list(req.query);
  sendSuccess(res, { data: users, meta });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, { data: { user } });
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  sendCreated(res, { message: 'User created', data: { user } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'User updated', data: { user } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id, req.user.id);
  sendSuccess(res, { message: 'User deleted' });
});
