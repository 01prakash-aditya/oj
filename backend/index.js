import express from 'express';
const app = express();
import cors from 'cors';
import { generateFile } from './generateFile.js';
import { executeCpp } from './executeCpp.js';
import { executePy } from './executePy.js';
import { executeJava } from './executeJava.js';
import { aiCodeReview } from './aiCodeReview.js';
import { chatBot } from './chatBot.js';

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

// Bind to all network interfaces (0.0.0.0)
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log('Supported languages: C++, Python 3, Java');
});