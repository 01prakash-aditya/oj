import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifytoken = (req, res, next) => {
  let token = req.cookies.access_token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); 
    }
  }
  
  if (!token) {
    return next(errorHandler(401, 'Access denied. No token provided.'));
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return next(errorHandler(401, 'Invalid token.'));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));
    
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const token = jwt.sign({
      id: validUser._id,
      role: validUser.role
    }, process.env.JWT_SECRET);

    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    
    res
      .cookie('access_token', token, { 
        httpOnly: true, 
        expires: expiryDate,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      })
      .status(200)
      .json({
        success: true,
        token: token, 
        ...rest
      });
      
  } catch (error) {
    next(error);
  }
};