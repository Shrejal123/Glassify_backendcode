const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwtProvider = require("../config/jwtProvider.js");

const createUser = async (userData) => {
  try {
    let { firstName, lastName, email, password } = userData;
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      throw new Error(`User already exists with email: ${email}`);
    }

    password = await bcrypt.hash(password, 8);
    const user = await User.create({ firstName, lastName, email, password });
    console.log("Created user:", user);
    return user;
  } catch (error) {
    console.error("Error in createUser:", error.message);
    throw new Error(error.message);
  }
};

const findUserById = async (userId) => {
  try {
    console.log("Finding user with ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user;
  } catch (error) {
    console.error("Error in findUserById:", error.message);
    throw new Error(error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User not found with email: ${email}`);
    }
    return user;
  } catch (error) {
    console.error("Error in getUserByEmail:", error.message);
    throw new Error(error.message);
  }
};

const getUserProfileByToken = async (token) => {
  try {
    if (!token) {
      throw new Error("Token is missing");
    }
    const userId = jwtProvider.getUserIdFromToken(token);
    if (!userId) {
      throw new Error("Invalid token: userId not found");
    }
    const user = await findUserById(userId);
    return user;
  } catch (error) {
    console.error("Error in getUserProfileByToken:", error.message);
    throw new Error(error.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getUserProfileByToken,
  getAllUsers,
};
