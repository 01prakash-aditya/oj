import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import problemRoutes from './routes/problem.route.js';
import communityRoutes from './routes/community.route.js';
import cookieParser from 'cookie-parser';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

mongoose.connect(process.env.MONGO).then(() => {
    console.log('MongoDB connected!');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});
 
const app = express();

app.set('trust proxy', 1); 

app.use(cors({
    origin: true, 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/community", communityRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode,
    });
});

const PORT = process.env.PORT || 3000;

// HTTPS Configuration
try {
    const privateKey = fs.readFileSync(path.join(__dirname, '..', 'ssl', 'privatekey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, '..', 'ssl', 'certificate.pem'), 'utf8');
    
    const credentials = {
        key: privateKey,
        cert: certificate
    };
    
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(PORT, () => {
        console.log(`HTTPS Server is running on port ${PORT}!`);
        console.log(`Server URL: https://localhost:${PORT}`);
    });
    
} catch (error) {
    console.error('Error loading SSL certificates:', error.message);
    console.log('Falling back to HTTP server...');
    
    // Fallback to HTTP if SSL certificates are not found
    app.listen(PORT, () => {
        console.log(`HTTP Server is running on port ${PORT}!`);
        console.log(`Server URL: http://localhost:${PORT}`);
    });
}