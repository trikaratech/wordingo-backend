import Post from '../models/Post.js';
import mongoose from 'mongoose';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Use $ne: false instead of true to catch undefined values too
    const posts = await Post.find({ 
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } } // Include posts without isPublished field
      ]
    })
      .populate('user', 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ 
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } }
      ]
    });

    // Add user-specific data if authenticated
    const postsWithUserData = posts.map(post => {
      const postObj = post.toObject();
      if (req.user) {
        postObj.isLiked = post.isLikedBy(req.user.id);
        postObj.isSaved = post.isSavedBy(req.user.id);
      } else {
        postObj.isLiked = false;
        postObj.isSaved = false;
      }
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithUserData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total
        }
      }
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const postObj = post.toObject();
    if (req.user) {
      postObj.isLiked = post.isLikedBy(req.user.id);
      postObj.isSaved = post.isSavedBy(req.user.id);
    } else {
      postObj.isLiked = false;
      postObj.isSaved = false;
    }

    res.json({
      success: true,
      data: { post: postObj }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      category,
      tags,
      user: req.user.id,
      isPublished: true
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar bio');

    res.status(201).json({
      success: true,
      data: { post: populatedPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
export const togglePostLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex === -1) {
      // Add like
      post.likes.push({ user: req.user.id });
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likeCount: post.likeCount,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save/Unsave post
// @route   PUT /api/posts/:id/save
// @access  Private
export const togglePostSave = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const saveIndex = post.saves.findIndex(
      save => save.user.toString() === req.user.id
    );

    if (saveIndex === -1) {
      // Add save
      post.saves.push({ user: req.user.id });
    } else {
      // Remove save
      post.saves.splice(saveIndex, 1);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        saveCount: post.saveCount,
        isSaved: saveIndex === -1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's saved posts
// @route   GET /api/posts/user/saved
// @access  Private
export const getSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ 
      'saves.user': req.user.id,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } }
      ]
    })
      .populate('user', 'name avatar bio')
      .sort({ 'saves.createdAt': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ 
      'saves.user': req.user.id,
      $or: [
        { isPublished: true },
        { isPublished: { $exists: false } }
      ]
    });

    // Add user-specific data
    const postsWithUserData = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.isLikedBy(req.user.id);
      postObj.isSaved = post.isSavedBy(req.user.id);
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithUserData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's own posts
// @route   GET /api/posts/user/my-posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: req.user.id })
      .populate('user', 'name avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ user: req.user.id });

    // Add user-specific data
    const postsWithUserData = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.isLikedBy(req.user.id);
      postObj.isSaved = post.isSavedBy(req.user.id);
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithUserData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name avatar bio');

    res.json({
      success: true,
      data: { post: updatedPost }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Fix existing posts without isPublished field
// @route   POST /api/posts/fix-published
// @access  Public (temporary)
export const fixPublishedField = async (req, res) => {
  try {
    const result = await Post.updateMany(
      { isPublished: { $exists: false } },
      { $set: { isPublished: true } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} posts to set isPublished: true`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
