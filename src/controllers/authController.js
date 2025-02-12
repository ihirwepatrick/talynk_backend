const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
    try {
        const { username, email, password, phone1, phone2 } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already taken'
            });
        }

        // Check if email exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            phone1,
            phone2
        });

        // Generate token
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                user: {
                    username: user.username,
                    email: user.email,
                    phone1: user.phone1,
                    phone2: user.phone2
                },
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, remember_me } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Update remember_me if provided
        if (remember_me !== undefined) {
            await user.update({ remember_me });
        }

        // Generate token
        const token = jwt.sign(
            { username: user.username },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                user: {
                    username: user.username,
                    email: user.email,
                    phone1: user.phone1,
                    phone2: user.phone2
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, phone1, phone2 } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({
      username,
      phone1,
      phone2
    });

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        username: user.username,
        phone1: user.phone1,
        phone2: user.phone2
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will remove the token
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
      error: error.message
    });
  }
}; 