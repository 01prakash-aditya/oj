import { GoogleGenAI } from "@google/genai";
import { config } from 'dotenv';

config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const chatBot = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Give appropriate answer to the query " + prompt,
    });
    return response.text;
};

