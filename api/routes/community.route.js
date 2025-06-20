import express from 'express';
import Discussion from '../models/discussion.model.js';
import { verifytoken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/discussions', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const discussions = await Discussion.find()
      .populate('author', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDiscussions = await Discussion.countDocuments();

    res.status(200).json({
      success: true,
      discussions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalDiscussions / limit),
        totalDiscussions,
        hasNext: page < Math.ceil(totalDiscussions / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    next(error);
  }
});

router.post('/discussions', verifytoken, async (req, res, next) => {
  try {
    const { title, content, problemId, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 5000 characters'
      });
    }

    const discussion = new Discussion({
      title: title.trim(),
      content: content.trim(),
      problemId: problemId?.trim() || null,
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      author: req.user.id
    });

    await discussion.save();
    await discussion.populate('author', 'username email profilePicture');

    res.status(201).json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    next(error);
  }
});

router.get('/discussions/:id', async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'username email profilePicture');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.status(200).json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    next(error);
  }
});

router.put('/discussions/:id', verifytoken, async (req, res, next) => {
  try {
    const { title, content, problemId, tags } = req.body;
    
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own discussions'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    if (title.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Title must be less than 200 characters'
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Content must be less than 5000 characters'
      });
    }

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim(),
        problemId: problemId?.trim() || null,
        tags: Array.isArray(tags) ? tags.slice(0, 10) : []
      },
      { new: true } 
    ).populate('author', 'username email profilePicture');

    res.status(200).json({
      success: true,
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error('Error updating discussion:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    next(error);
  }
});

router.get('/discussions/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    
    const discussions = await Discussion.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .populate('author', 'username email profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalResults = await Discussion.countDocuments({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    });

    res.status(200).json({
      success: true,
      discussions,
      searchQuery: query,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        hasNext: page < Math.ceil(totalResults / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error searching discussions:', error);
    next(error);
  }
});

router.delete('/discussions/:id', verifytoken, async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    if (discussion.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own discussions'
      });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion ID'
      });
    }
    next(error);
  }
});

export default router;