const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { JWT_SECRET } = require('../config/env');
const logger = require('../utils/logger');


// 1. Register
// 2. Login
// 3. Get Profile (protected)


/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, name, role = 'faculty' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required', message: 'Email, password, and name are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if user exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered', message: 'This email is already registered. Please log in.' });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        password: hashedPassword,
        name: normalizedName,
        role,
        created_at: new Date().toISOString(),
      })
      .select('id, email, name, role')
      .single();

    if (error) throw error;

    // Generate token with complete claims for resilient authentication
    const token = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User registered: ${normalizedEmail}`);
    res.status(201).json({ user, token, message: 'Registration successful' });
  } catch (err) {
    logger.error('Registration error:', { message: err.message, code: err.code, details: err.details });
    
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered', message: 'This email address is already in use.' });
    }
    if (err.code === '42P01') {
      return res.status(500).json({ error: 'Database table not found', message: 'The users table does not exist. Run database migrations.' });
    }
    if (err.message) {
      return res.status(500).json({ error: 'Registration failed', message: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/ID and password are required', message: 'Please provide both your email/ID and password' });
    }

    const identifier = email.trim();

    // Search user by email (case-insensitive) or by name/ID
    let query = supabase.from('users').select('*');
    if (identifier.includes('@')) {
      query = query.ilike('email', identifier.toLowerCase());
    } else {
      query = query.or(`email.ilike.${identifier.toLowerCase()},name.ilike.${identifier}`);
    }

    const { data: user, error } = await query.maybeSingle();

    if (error) {
      logger.error('Database error during login:', { message: error.message });
      // If database error, return 500 rather than misleading invalid credentials
      return res.status(500).json({ error: 'Database connection error', message: 'Unable to connect to database. Please try again.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Invalid email/ID or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials', message: 'Invalid email/ID or password' });
    }

    // Generate token with complete claims for resilient authentication
    const token = jwt.sign(
      {
        userId: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${user.email}`);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
      message: 'Login successful',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function getProfile(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getProfile };
