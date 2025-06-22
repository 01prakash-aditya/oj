import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateFile } from './generateFile.js';
import { executeCpp } from './executeCpp.js';
import { executePy } from './executePy.js';
import { executeJava } from './executeJava.js';
import { aiCodeReview } from './aiCodeReview.js';
import { chatBot } from './chatBot.js';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

function getExecutor(language) {
  const lang = language.toLowerCase();
  switch (lang) {
    case 'cpp':
    case 'c++':
      return executeCpp;
    case 'python':
    case 'python3':
    case 'py':
      return executePy;
    case 'java':
      return executeJava;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

app.post('/run', async (req, res) => {
    const { language = 'cpp', code, input = '' } = req.body;
    
    if (code === undefined || !code) {
        return res.status(400).json({
            message: 'Code is required',
            status: 'error',
        });
    }

    try {
        const filePath = generateFile(language, code);
        const executor = getExecutor(language);
        const output = await executor(filePath, input);
        
        res.json({
            filePath,
            output,
            input: input || 'No input provided',
            language,
            success: true
        });
    }
    catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

app.post("/ai-review", async (req, res) => {
    const { language = 'cpp', code, input = '' } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code!" });
    }
    try {
        const review = await aiCodeReview(code);
        res.json({ "review": review });
        console.log("review:", review);
    } catch (error) {
        res.status(500).json({ error: "Error in AI review, error: " + error.message });
    }
});

app.post("/chat-bot", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }
  try {
    const response = await chatBot(message);
    res.json({ response });
  } catch (error) {
    console.error('Chat bot error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get('/', (req, res) => {
    res.json({
        message: 'Multi-language Code Execution Server',
        status: 'success',
        supportedLanguages: ['cpp', 'c++', 'python', 'python3', 'py', 'java']
    });
});

const PORT = process.env.PORT || 8000;

// HTTPS Configuration
try {
    const privateKey = fs.readFileSync(path.join(__dirname, '..', 'ssl', 'privatekey.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, '..', 'ssl', 'certificate.pem'), 'utf8');
    
    const credentials = {
        key: privateKey,
        cert: certificate
    };
    
    const httpsServer = https.createServer(credentials, app);
    
    httpsServer.listen(PORT, '0.0.0.0', () => {
        console.log(`HTTPS Server is running on https://0.0.0.0:${PORT}`);
        console.log('Supported languages: C++, Python 3, Java');
    });
    
} catch (error) {
    console.error('Error loading SSL certificates:', error.message);
    console.log('Falling back to HTTP server...');
    
    // Fallback to HTTP if SSL certificates are not found
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`HTTP Server is running on http://0.0.0.0:${PORT}`);
        console.log('Supported languages: C++, Python 3, Java');
    });
}