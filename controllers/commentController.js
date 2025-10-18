import Comment from '../models/Comment.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const comment = await Comment.create({
      content,
      post: req.params.postId,
      author: req.user.id
    });
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: { comment: populatedComment }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
