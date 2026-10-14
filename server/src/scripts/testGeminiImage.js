import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Find a real, working CDN image URL of the front view of the Apple iPhone 17 Pro Max. Provide ONLY the URL and nothing else.',
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  console.log(response.text);
}
run();
