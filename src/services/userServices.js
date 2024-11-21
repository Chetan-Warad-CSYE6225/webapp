import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

// Get user by email
export const getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

// Create user
export const createUser = async (userData) => {
  const hashedPassword = bcrypt.hashSync(userData.password, bcrypt.genSaltSync(10));
  const user = await User.create({
    ...userData,
    password: hashedPassword,
    account_created: new Date(),
    account_updated: new Date(),
    is_verified: false,
  });
  if (process.env.APP_ENV == 'test'){
    user.is_verified = true;
    user.save();
  }
  return user;
};

// Update user
export const updateUser = async (email, updates) => {
  const user = await getUserByEmail(email);
  if (!user) return null;

  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, bcrypt.genSaltSync(10));
  }

  Object.assign(user, updates);
  user.account_updated = new Date();
  await user.save();
  return user;
};
