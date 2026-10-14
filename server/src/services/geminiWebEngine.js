import { GoogleGenAI } from '@google/genai';
import { buildAutomatedStoreUrl } from '../utils/storeUrlHelper.js';

const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];

async function generateWithModelFallback(ai, contents, config) {
  let lastError = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      if (response && response.text) {
        return response;
      }
    } catch (err) {
      console.warn(`Model ${model} encounter: ${err.message}. Trying next candidate...`);
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error("All Gemini candidate models failed.");
}

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
    const response = await generateWithModelFallback(ai, query, {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json"
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!jsonStr) {
      throw new Error("Empty response received from Gemini after formatting.");
    }

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
    if (result && result.marketplaces && Array.isArray(result.marketplaces)) {
      result.marketplaces = result.marketplaces.map(mp => ({
        ...mp,
        url: buildAutomatedStoreUrl(mp.marketplace, result.product, mp.url)
      }));
    }
    
    return result;
  } catch (error) {
    console.error("Gemini Web Discovery Error:", error);
    throw new Error(error.message || "WEB_ANALYSIS_UNAVAILABLE");
  }
}

export async function analyzeUrlContextViaGemini(url) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Web analysis temporarily unavailable.");
  }

  const cleanUrl = (url || '').trim().replace(/\s+/g, '');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are a real-time e-commerce URL analysis engine.
The user has provided a product URL. Your goal is to analyze the URL, extract the exact product details, price, MRP, and overall product rating. Then, use Google Search to find other marketplaces in India selling the EXACT same product and variant to compare prices.
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
    "watchOuts": ["watch out 1"],
    "rating": 4.5,
    "reviewsCount": 1200
  },
  "sources": ["URL1"]
}
If you can't verify the exact product or prices, do not invent them. For rating and reviewsCount, provide the numbers found on the source URL, or null if not found.`;

  try {
    const response = await generateWithModelFallback(ai, `Analyze this product URL and find cross-marketplace deals: ${cleanUrl}`, {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json"
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!jsonStr) {
      throw new Error("Empty response received from Gemini after formatting.");
    }

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
    if (result && result.marketplaces && Array.isArray(result.marketplaces)) {
      result.marketplaces = result.marketplaces.map(mp => ({
        ...mp,
        url: buildAutomatedStoreUrl(mp.marketplace, result.product, mp.url)
      }));
    }
    
    return result;
  } catch (error) {
    console.error("Gemini URL Analysis Error:", error);
    throw new Error(error.message || "WEB_ANALYSIS_UNAVAILABLE");
  }
}
export async function analyzeReelVideoViaGemini(reelUrl) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured. Web analysis temporarily unavailable.');
  }

  const cleanReelUrl = (reelUrl || '').trim().replace(/\s+/g, '');
  let contextText = cleanReelUrl;
  let reelThumbnail = null;
  try {
    const response = await fetch(cleanReelUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    
    if (titleMatch) contextText += ' | Title: ' + titleMatch[1];
    if (metaMatch) contextText += ' | Description: ' + metaMatch[1];
    if (ogMatch && !metaMatch) contextText += ' | Description: ' + ogMatch[1];
    if (imageMatch) reelThumbnail = imageMatch[1].replace(/&amp;/g, '&'); // Fix escaped ampersands
  } catch (err) {
    console.warn('Failed to fetch reel HTML, falling back to URL only', err);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are an expert AI Shopping Assistant analyzing a short-form video (Reel/Shorts/TikTok) URL promoting a tech product.
We fetched the webpage and extracted its title and description:
${contextText}

Identify the EXACT product, brand, and model being promoted in this video. 
Think DEEPLY to analyze if this product is actually worth the money. Provide a sharp, professional verdict, list the core pros and cons, and estimate the general market rating.
Then provide 2-3 verified marketplace offers (Amazon.in, Flipkart, Croma, etc.) for this exact product in India with estimated realistic prices so the user can easily buy it.

Return a JSON object EXACTLY matching this structure:
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
    "marketplace": "Social Media Video",
    "price": null,
    "mrp": null,
    "url": "${reelUrl}"
  },
  "marketplaces": [
    {
      "marketplace": "Amazon",
      "price": 80999,
      "mrp": 99990,
      "url": "https://www.amazon.in/s?k=product",
      "availability": "Available"
    }
  ],
  "aiAnalysis": {
    "verdict": "Professional analysis of whether the product is worth the money compared to alternatives.",
    "pros": ["Pro 1", "Pro 2"],
    "watchOuts": ["Con 1", "Con 2"],
    "rating": 4.5,
    "reviewsCount": 1000
  }
}`;

  try {
    const response = await generateWithModelFallback(ai, `Analyze this social media video and extract the product details: ${reelUrl}`, {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      responseMimeType: "application/json"
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    let result = JSON.parse(jsonStr);
    
    // Inject the exact Reel/Video thumbnail into the product image
    if (reelThumbnail) {
      if (!result.product) result.product = {};
      result.product.image = reelThumbnail;
    }
    if (result && result.marketplaces && Array.isArray(result.marketplaces)) {
      result.marketplaces = result.marketplaces.map(mp => ({
        ...mp,
        url: buildAutomatedStoreUrl(mp.marketplace, result.product, mp.url)
      }));
    }

    return result;
  } catch (error) {
    console.error("Gemini Reel Analysis Error:", error);
    throw new Error(error.message || "REEL_ANALYSIS_UNAVAILABLE");
  }
}
