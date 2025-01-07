const validateRegistration = (req, res, next) => {
  const { username, password, primaryPhone, secondaryPhone } = req.body;

  // Validate username
  if (!username || username.length < 3) {
    return res.status(400).json({
      status: 'error',
      message: 'Username must be at least 3 characters long'
    });
  }

  // Validate password
  if (!password || password.length < 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Password must be at least 6 characters long'
    });
  }

  // Validate phone numbers
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  if (!phoneRegex.test(primaryPhone)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid primary phone number'
    });
  }

  if (secondaryPhone && !phoneRegex.test(secondaryPhone)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid secondary phone number'
    });
  }

  next();
};

module.exports = {
  validateRegistration
}; 