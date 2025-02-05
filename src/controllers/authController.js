const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, phone1, phone2, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }

    // Only admin can create approvers
    if (role === 'approver') {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized to create approver account'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const adminUser = await User.findByPk(decoded.id);
      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Only admins can create approver accounts'
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone1,
      phone2,
      role: role || 'user'
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is frozen
    if (user.isFrozen) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is frozen. Please contact admin.'
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

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    // Update last login device if provided
    if (req.headers['user-agent']) {
      await user.update({
        lastLoginDevice: req.headers['user-agent']
      });
    }

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'subscribers',
          attributes: ['id', 'username']
        }
      ]
    });

    res.json({
      status: 'success',
      data: user
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
    const { username, phone1, phone2, selectedCategoryId } = req.body;
    const user = await User.findByPk(req.user.id);

    await user.update({
      username,
      phone1,
      phone2,
      selectedCategoryId
    });

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        username: user.username,
        phone1: user.phone1,
        phone2: user.phone2,
        selectedCategoryId: user.selectedCategoryId
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