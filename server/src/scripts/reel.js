export async function analyzeReelVideoViaGemini(reelUrl) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured. Web analysis temporarily unavailable.');
  }

  let contextText = reelUrl;
  try {
    const response = await fetch(reelUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const ogMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    
    if (titleMatch) contextText += ' | Title: ' + titleMatch[1];
    if (metaMatch) contextText += ' | Description: ' + metaMatch[1];
    if (ogMatch && !metaMatch) contextText += ' | Description: ' + ogMatch[1];
  } catch (err) {
    console.warn('Failed to fetch reel HTML, falling back to URL only', err);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemPrompt = `You are an AI analyzing a short-form video (Reel/Shorts/TikTok) URL promoting a tech product.
We fetched the webpage and extracted its title and description:
${contextText}

Identify the EXACT product, brand, and model being promoted in this video.
Then, act like a shopping assistant and provide 2-3 verified marketplace offers (Amazon.in, Flipkart, Croma, etc.) for this exact product in India with estimated realistic prices.
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
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: systemPrompt,
    config: { temperature: 0.2 },
  });

  const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(text);
}
