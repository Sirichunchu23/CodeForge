const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

// GET /api/users/:id/profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { bio, skills, github, website, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (github !== undefined) user.github = github;
    if (website !== undefined) user.website = website;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserProfile, updateProfile, changePassword };
