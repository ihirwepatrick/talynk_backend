const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin, Approver } = require('../models');
const { Op } = require('sequelize');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during registration'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email, password and role'
            });
        }

        let user;
        // Check role and find user
        if (role === 'admin') {
            user = await Admin.findOne({ where: { email } });
        } else if (role === 'approver') {
            user = await Approver.findOne({ where: { email } });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid role'
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // For testing purposes - replace with proper password check later
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = password === 'admin123' || password === 'approver123';

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                role: role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.json({
            status: 'success',
            data: {
                token,
                user: {
                    email: user.email,
                    role: role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
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