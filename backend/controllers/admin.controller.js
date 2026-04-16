const User = require('../models/User.model');
const Post = require('../models/Post.model');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStudents, totalPosts, recentUsers] = await Promise.all([
  User.countDocuments({ isActive: true }),
  User.countDocuments({ isActive: true, role: 'student' }),
  Post.countDocuments({ isActive: true }),
  User.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email role createdAt'),
]);

const recentPosts = await Post.find({
  isActive: true,
  author: { $ne: null }
})
  .sort({ createdAt: -1 })
  .limit(5)
  .populate({
    path: 'author',
    select: 'username',
    options: { strictPopulate: false }
  })
  .select('title category createdAt author likes');

    // Posts per category
    const categoryStats = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalAdmins: totalUsers - totalStudents,
        totalPosts,
        recentUsers,
        recentPosts,
        categoryStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Soft delete: deactivate user and all their posts
    user.isActive = false;
    await user.save();
    await Post.updateMany({ author: user._id }, { isActive: false });

    res.json({ success: true, message: `User ${user.username} has been deactivated.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/posts
const getAllPostsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Post.countDocuments(query),
    ]);

    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/posts/:id
const deletePostAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.isActive = false;
    await post.save();

    res.json({ success: true, message: 'Post has been removed.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    if (!user.isActive) {
      await Post.updateMany({ author: user._id }, { isActive: false });
    }

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getAllUsers, deleteUser, getAllPostsAdmin, deletePostAdmin, toggleUserStatus };
