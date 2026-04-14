const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, deleteUser, getAllPostsAdmin, deletePostAdmin, toggleUserStatus } = require('../controllers/admin.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/posts', getAllPostsAdmin);
router.delete('/posts/:id', deletePostAdmin);

module.exports = router;
