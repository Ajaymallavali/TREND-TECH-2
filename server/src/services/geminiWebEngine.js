import { GoogleGenAI } from '@google/genai';

export async function discoverProductViaGemini(query) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Web analysis temporarily unavailable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are a real-time e-commerce product discovery engine.
Your goal is to identify the exact product the user is searching for, and find real verified marketplace offers for it in India (like Amazon.in, Flipkart, Croma, Reliance Digital).
Return a JSON object EXACTLY matching this structure, with no markdown code blocks around it:
{
  "product": {
    "name": "Full official product name",
    "brand": "Brand",
    "model": "Exact model",
    "variant": "Variant (e.g. 256GB, 1.5 Ton)",
    "category": "category",
    "specs": { "key": "value" },
    "image": "a valid image url if found, or null"
  },
  "marketplaces": [
    {
      "marketplace": "Amazon",
      "price": 80999,
      "mrp": 99990,
      "url": "https://www.amazon.in/...",
      "availability": "Available"
    }
  ],
  "aiAnalysis": {
    "verdict": "Why this is the best deal",
    "pros": ["pro1"],
    "watchOuts": ["watch out 1"]
  },
  "sources": ["URL1", "URL2"]
}
Only include marketplaces where you can verify the price and URL. If you can't verify, return an empty array for marketplaces.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        temperature: 0.2
      }
    });

    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);
    
    // Add citation extraction if available in the grounding metadata
    let citations = [];
    if (
      response.candidates && 
      response.candidates[0] && 
      response.candidates[0].groundingMetadata && 
      response.candidates[0].groundingMetadata.groundingChunks
    ) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      chunks.forEach(chunk => {
        if (chunk.web?.uri) {
          citations.push(chunk.web.uri);
        }
      });
    }

    if (citations.length > 0) {
      result.sources = [...new Set([...(result.sources || []), ...citations])];
    }
    
    return result;
  } catch (error) {
    console.error("Gemini Web Discovery Error:", error);
    throw new Error("WEB_ANALYSIS_UNAVAILABLE");
  }
}

export async function analyzeUrlContextViaGemini(url) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Web analysis temporarily unavailable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are a real-time e-commerce URL analysis engine.
The user has provided a product URL. Your goal is to analyze the URL, extract the exact product details, price, and MRP from it. Then, use Google Search to find other marketplaces in India selling the EXACT same product and variant to compare prices.
Return a JSON object EXACTLY matching this structure, with no markdown code blocks around it:
{
  "product": {
    "name": "Full official product name",
    "brand": "Brand",
    "model": "Exact model",
    "variant": "Variant (e.g. 256GB)",
    "category": "category",
    "specs": { "key": "value" },
    "image": "a valid image url if found, or null"
  },
  "sourceMarketplace": {
    "marketplace": "Name of store from URL",
    "price": 1234,
    "mrp": 1500,
    "url": "the original url"
  },
  "marketplaces": [
    {
      "marketplace": "Other Store",
      "price": 1200,
      "mrp": 1500,
      "url": "https://...",
      "availability": "Available"
    }
  ],
  "aiAnalysis": {
    "verdict": "Compare the source store vs the best store.",
    "pros": ["pro1"],
    "watchOuts": ["watch out 1"]
  },
  "sources": ["URL1"]
}
If you can't verify the exact product or prices, do not invent them.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this product URL and find cross-marketplace deals: ${url}`,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
        temperature: 0.2
      }
    });

    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(jsonStr);

    let citations = [];
    if (
      response.candidates && 
      response.candidates[0] && 
      response.candidates[0].groundingMetadata && 
      response.candidates[0].groundingMetadata.groundingChunks
    ) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      chunks.forEach(chunk => {
        if (chunk.web?.uri) {
          citations.push(chunk.web.uri);
        }
      });
    }

    if (citations.length > 0) {
      result.sources = [...new Set([...(result.sources || []), ...citations])];
    }
    
    return result;
  } catch (error) {
    console.error("Gemini URL Analysis Error:", error);
    throw new Error("WEB_ANALYSIS_UNAVAILABLE");
  }
}
