const Post = require('../models/Post.model');

// GET /api/posts — global feed, latest first
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;

    const query = { isActive: true };
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'username email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Post.countDocuments(query),
    ]);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true })
      .populate('author', 'username email avatar role bio')
      .populate('comments.author', 'username avatar role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, description, tags, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const post = await Post.create({
      title,
      description,
      tags: tags || [],
      category: category || 'other',
      author: req.user._id,
    });

    const populated = await post.populate('author', 'username email avatar role');

    res.status(201).json({ success: true, message: 'Post created successfully!', post: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    // Only author can edit (admin has separate delete-only power)
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own posts.' });
    }

    const { title, description, tags, category } = req.body;
    if (title) post.title = title;
    if (description) post.description = description;
    if (tags !== undefined) post.tags = tags;
    if (category) post.category = category;

    await post.save();
    await post.populate('author', 'username email avatar role');

    res.json({ success: true, message: 'Post updated successfully!', post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post.' });
    }

    post.isActive = false;
    await post.save();

    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex((id) => id.toString() === userId);

    let liked;
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
      liked = true;
    } else {
      post.likes.splice(likeIndex, 1);
      liked = false;
    }

    await post.save();

    res.json({
      success: true,
      message: liked ? 'Post liked!' : 'Post unliked.',
      liked,
      likeCount: post.likes.length,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required.' });
    }

    const post = await Post.findOne({ _id: req.params.id, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    post.comments.push({ author: req.user._id, content: content.trim() });
    await post.save();
    await post.populate('comments.author', 'username avatar role');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({ success: true, message: 'Comment added!', comment: newComment });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isActive: true });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isPostOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isPostOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    comment.deleteOne();
    await post.save();

    res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/user/:userId
const getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ author: req.params.userId, isActive: true })
        .populate('author', 'username email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Post.countDocuments({ author: req.params.userId, isActive: true }),
    ]);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost, toggleLike, addComment, deleteComment, getUserPosts };
