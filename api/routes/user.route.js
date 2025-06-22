import express from 'express';
import {deleteUser, test, updateUser, submitSolution, getUserSolvedProblems} from '../controllers/user.controller.js';
import User from '../models/user.model.js';

const router = express.Router();

router.get('/', test);

router.post("/update/:id", async (req, res, next) => {
  try {
    // Add the user ID from params to the request object for the controller
    req.user = { id: req.params.id };
    await updateUser(req, res, next);
  } catch (error) {
    console.error('Error in update route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

router.delete("/delete/:id", async (req, res, next) => {
  try {
    // Add the user ID from params to the request object for the controller
    req.user = { id: req.params.id };
    await deleteUser(req, res, next);
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Option 1: Keep the ID parameter route (recommended)
router.post("/submit-solution/:id", async (req, res, next) => {
  try {
    await submitSolution(req, res, next);
  } catch (error) {
    console.error('Error in submit-solution route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message
    });
  }
});

// Option 2: Add a route without ID parameter (alternative solution)
// If you want to support both with and without ID in URL
router.post("/submit-solution", async (req, res, next) => {
  try {
    // Extract userId from request body instead of params
    const { userId, problemId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required in request body'
      });
    }
    
    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID is required'
      });
    }

    // Modify the request to include the userId in params for the controller
    req.params.id = userId;
    await submitSolution(req, res, next);
  } catch (error) {
    console.error('Error in submit-solution route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message
    });
  }
});

router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    
    console.log('Fetching leaderboard data...');
    
    const totalUserCount = await User.countDocuments();
    console.log(`Total users in database: ${totalUserCount}`);
    
    const leaderboard = await User.find({})
    .select('username email profilePicture rating solvedProblems createdAt updatedAt')
    .sort({ 
      rating: -1,          
      createdAt: 1        
    })
    .limit(limit)
    .lean(); 

    console.log(`Leaderboard query returned ${leaderboard.length} users`);
    
    if (leaderboard.length > 0) {
      console.log('Sample user data:', {
        username: leaderboard[0].username,
        rating: leaderboard[0].rating,
        solvedCount: leaderboard[0].solvedProblems?.length || 0,
        hasEmail: !!leaderboard[0].email
      });
    }

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      rating: user.rating || 0,
      solvedProblems: user.solvedProblems || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      rank: index + 1
    }));
    
    res.status(200).json({
      success: true,
      leaderboard: formattedLeaderboard,
      totalUsers: formattedLeaderboard.length,
      totalInDatabase: totalUserCount
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

// Get solved problems by user ID from URL params
router.get('/solved-problems/:id', async (req, res, next) => {
  try {
    await getUserSolvedProblems(req, res, next);
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch solved problems',
      error: error.message
    });
  }
});

// Fixed: Update rating route with proper user ID from params
router.post('/update-rating/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { problemId, difficulty, isFirstSolve } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const alreadySolved = userDoc.solvedProblems.some(
      solved => solved.problemId.toString() === problemId
    );

    if (isFirstSolve && !alreadySolved) {
      
      userDoc.solvedProblems.push({
        problemId: problemId,
        solvedAt: new Date()
      });
      
      let ratingIncrease = 0;
      switch (difficulty) {
        case 'easy':
          ratingIncrease = 10;
          break;
        case 'moderate':
          ratingIncrease = 25;
          break;
        case 'difficult':
          ratingIncrease = 50;
          break;
        default:
          ratingIncrease = 10;
      }
      
      userDoc.rating = (userDoc.rating || 0) + ratingIncrease;
      userDoc.questionCount = (userDoc.questionCount || 0) + 1;
      await userDoc.save();
      
      res.status(200).json({
        success: true,
        newRating: userDoc.rating,
        ratingIncrease,
        totalSolved: userDoc.solvedProblems.length
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'Problem already solved',
        currentRating: userDoc.rating || 0,
        alreadySolved: true
      });
    }
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rating'
    });
  }
});

// Get user stats by user ID from URL params
router.get('/stats/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userDoc = await User.findById(userId).select('solvedProblems rating createdAt questionCount');
    
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = {
      totalSolved: userDoc.solvedProblems ? userDoc.solvedProblems.length : 0,
      currentRating: userDoc.rating || 0,
      memberSince: userDoc.createdAt,
      questionCount: userDoc.questionCount || 0,
      solvedProblems: userDoc.solvedProblems || []
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Get user rank by user ID from URL params
router.get('/rank/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const higherRatedUsers = await User.countDocuments({
      rating: { $gt: userDoc.rating || 0 }
    });

    const totalUsers = await User.countDocuments();
    const userRank = higherRatedUsers + 1;

    res.status(200).json({
      success: true,
      rank: userRank,
      totalUsers,
      percentile: Math.round((1 - (userRank - 1) / totalUsers) * 100)
    });
  } catch (error) {
    console.error('Error fetching rank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rank'
    });
  }
});

export default router;