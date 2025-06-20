import express from 'express';
import jwt from 'jsonwebtoken';
import {verifytoken} from '../utils/verifyUser.js';
import Problem from '../models/problem.model.js';
import { errorHandler } from '../utils/error.js';

const router = express.Router();

const debugMiddleware = (req, res, next) => {
  console.log('=== REQUEST DEBUG INFO ===');
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [TOKEN_PRESENT]' : 'NO_AUTH_HEADER',
    'content-type': req.headers['content-type']
  });
  console.log('User from token:', req.user ? {
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    tokenExp: req.user.exp ? new Date(req.user.exp * 1000) : 'No expiration'
  } : 'NO_USER');
  console.log('=========================');
  next();
};

const verifyAdmin = (req, res, next) => {
  console.log('=== ADMIN VERIFICATION ===');
  console.log('User role:', req.user?.role);
  console.log('Role type:', typeof req.user?.role);
  console.log('Is admin check:', req.user?.role === 'admin');
  
  if (!req.user) {
    console.log('No user found in request');
    return next(errorHandler(401, 'Authentication required'));
  }
  
  if (req.user.role !== 'admin') {
    console.log('Access denied - user is not admin:', {
      providedRole: req.user.role,
      expectedRole: 'admin',
      userId: req.user.id
    });
    return next(errorHandler(403, `Admin access required. Current role: ${req.user.role || 'undefined'}`));
  }
  
  console.log('Admin verification passed');
  console.log('==========================');
  next();
};

router.post('/create', verifytoken, async (req, res, next) => {
  try {
    const { title, description, difficulty, rating, tags, defaultCode, testCases } = req.body;
    
    if (!title || !description || !difficulty || !rating || !tags || !defaultCode || !testCases) {
      return next(errorHandler(400, 'All fields are required'));
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return next(errorHandler(400, 'At least one test case is required'));
    }

    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
      return next(errorHandler(400, 'Problem with this title already exists'));
    }

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      rating: parseInt(rating),
      tags: Array.isArray(tags) ? tags : [tags],
      defaultCode,
      testCases,
      createdBy: req.user.id,
      isApproved: req.user.role === 'admin' 
    });

    const savedProblem = await newProblem.save();
    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' ? 'Problem created and approved successfully' : 'Problem submitted for review',
      problem: savedProblem
    });
  } catch (error) {
    next(error);
  }
});

router.get('/approved', async (req, res, next) => {
  try {
    const { difficulty, search } = req.query;
    let query = { isApproved: true };

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const problems = await Problem.find(query)
      .select('-createdBy')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      problems
    });
  } catch (error) {
    next(error);
  }
});

router.get('/all', verifytoken, verifyAdmin, async (req, res, next) => {
  try {
    console.log('=== FETCHING ALL PROBLEMS FOR ADMIN ===');
    console.log('Admin user:', {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    });
    
    const totalProblems = await Problem.countDocuments();
    console.log(`Total problems in database: ${totalProblems}`);
    
    const pendingCount = await Problem.countDocuments({ isApproved: false });
    const approvedCount = await Problem.countDocuments({ isApproved: true });
    console.log(`Pending problems: ${pendingCount}, Approved problems: ${approvedCount}`);

    const problems = await Problem.find({})
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    console.log(`Fetched ${problems.length} problems for admin`);
    
    problems.forEach((problem, index) => {
      console.log(`Problem ${index + 1}: ${problem.title} - Approved: ${problem.isApproved} - Created by: ${problem.createdBy?.username || 'Unknown'}`);
    });

    res.json({
      success: true,
      problems,
      stats: {
        total: totalProblems,
        pending: pendingCount,
        approved: approvedCount,
        fetched: problems.length
      }
    });
  } catch (error) {
    console.error('Error in /all route:', error);
    next(error);
  }
});

router.get('/auth-test', verifytoken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isAdmin: req.user.role === 'admin'
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/debug/:id', verifytoken, verifyAdmin, async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).populate('createdBy', 'username email');
    
    if (!problem) {
      return res.json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      problem,
      debug: {
        id: problem._id,
        title: problem.title,
        isApproved: problem.isApproved,
        createdBy: problem.createdBy
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/update/:id', verifytoken, verifyAdmin, async (req, res, next) => {
  try {
    const { title, description, difficulty, rating, tags, defaultCode, testCases, isApproved } = req.body;
    
    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        difficulty,
        rating: parseInt(rating),
        tags: Array.isArray(tags) ? tags : [tags],
        defaultCode,
        testCases,
        isApproved
      },
      { new: true, runValidators: true }
    );

    if (!updatedProblem) {
      return next(errorHandler(404, 'Problem not found'));
    }

    res.json({
      success: true,
      message: 'Problem updated successfully',
      problem: updatedProblem
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/delete/:id', verifytoken, verifyAdmin, async (req, res, next) => {
  try {
    const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
    
    if (!deletedProblem) {
      return next(errorHandler(404, 'Problem not found'));
    }

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/approve/:id', verifytoken, verifyAdmin, async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!problem) {
      return next(errorHandler(404, 'Problem not found'));
    }

    res.json({
      success: true,
      message: 'Problem approved successfully',
      problem
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id).select('-createdBy');
    
    if (!problem) {
      return next(errorHandler(404, 'Problem not found'));
    }

    if (!problem.isApproved) {
      return next(errorHandler(403, 'Problem not approved'));
    }

    res.json({
      success: true,
      problem
    });
  } catch (error) {
    next(error);
  }
});

export default router;