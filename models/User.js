const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const config = require('../config/config');

/**
 * User model for handling user-related database operations
 */
class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  static async create(userData) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Insert user into database
    const [user] = await db('users').insert({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      first_name: userData.firstName || null,
      last_name: userData.lastName || null,
      avatar_url: userData.avatarUrl || null
    }).returning(['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at']);

    return user;
  }

  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  static async findById(id) {
    return await db('users')
      .where({ id })
      .first('id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at');
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  static async findByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Object} Updated user
   */
  static async update(id, userData) {
    // Prepare update data
    const updateData = {};
    
    if (userData.username) updateData.username = userData.username;
    if (userData.email) updateData.email = userData.email;
    if (userData.firstName) updateData.first_name = userData.firstName;
    if (userData.lastName) updateData.last_name = userData.lastName;
    if (userData.avatarUrl) updateData.avatar_url = userData.avatarUrl;
    
    updateData.updated_at = db.fn.now();

    // Update user in database
    const [user] = await db('users')
      .where({ id })
      .update(updateData)
      .returning(['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at', 'updated_at']);

    return user;
  }

  /**
   * Update a user's password
   * @param {string} id - User ID
   * @param {string} newPassword - New password
   * @returns {boolean} Success or failure
   */
  static async updatePassword(id, newPassword) {
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await db('users')
      .where({ id })
      .update({
        password: hashedPassword,
        updated_at: db.fn.now()
      });

    return true;
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {boolean} Success or failure
   */
  static async delete(id) {
    await db('users')
      .where({ id })
      .delete();

    return true;
  }

  /**
   * Compare password with hashed password
   * @param {string} password - Plain password
   * @param {string} hashedPassword - Hashed password
   * @returns {boolean} True if passwords match, false otherwise
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token for user
   * @param {string} id - User ID
   * @returns {string} JWT token
   */
  static generateToken(id) {
    return jwt.sign({ id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });
  }
}

module.exports = User;