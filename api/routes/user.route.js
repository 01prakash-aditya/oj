import express from 'express';
import {deleteUser, test, updateUser, submitSolution, getUserSolvedProblems} from '../controllers/user.controller.js';
import { verifytoken } from '../utils/verifyUser.js';
import User from '../models/user.model.js';

const router = express.Router();

router.get('/', test);
router.post("/update/:id", verifytoken, updateUser);
router.delete("/delete/:id", verifytoken, deleteUser);
router.post("/submit-solution", verifytoken, submitSolution);

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

router.get('/solved-problems', verifytoken, async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id).select('solvedProblems');
    
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const solvedProblemIds = userDoc.solvedProblems.map(
      solved => solved.problemId.toString()
    );

    res.status(200).json({
      success: true,
      solvedProblems: solvedProblemIds 
    });
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch solved problems'
    });
  }
});

router.post('/update-rating', verifytoken, async (req, res, next) => {
  try {
    const { problemId, difficulty, isFirstSolve } = req.body;
    
    const userDoc = await User.findById(req.user.id);
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

router.get('/stats', verifytoken, async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id).select('solvedProblems rating createdAt questionCount');
    
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

router.get('/rank', verifytoken, async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id);
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