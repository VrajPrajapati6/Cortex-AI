import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { config } from '../config/env.config.js';

// In-Memory Fallback Storage for smooth local testing if DB is unavailable
const memoryUsers = new Map();

// Helper to auto-create PostgreSQL users table if database is connected
const initUsersTable = async () => {
  if (!config.dbUrl) return;
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
  } catch (err) {
    console.warn('[Auth Controller] Database users table init notice:', err.message);
  }
};

// Initialize table on module load
initUsersTable();

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check PostgreSQL DB if connected
    if (config.dbUrl) {
      try {
        const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (existing.rows.length > 0) {
          return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
          'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
          [username.trim(), normalizedEmail, password_hash]
        );

        const newUser = result.rows[0];
        const token = generateToken(newUser);

        return res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          token,
          user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
      } catch (dbErr) {
        console.warn('[Auth DB Error, using fallback]:', dbErr.message);
      }
    }

    // In-memory fallback handler
    if (memoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: normalizedEmail,
      password_hash
    };

    memoryUsers.set(normalizedEmail, newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check PostgreSQL DB if connected
    if (config.dbUrl) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
          }

          const token = generateToken(user);
          return res.json({
            success: true,
            message: 'Logged in successfully.',
            token,
            user: { id: user.id, username: user.username, email: user.email }
          });
        }
      } catch (dbErr) {
        console.warn('[Auth DB Error, using fallback]:', dbErr.message);
      }
    }

    // In-memory fallback check
    const user = memoryUsers.get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};
