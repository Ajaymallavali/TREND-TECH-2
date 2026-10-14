import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'trend-tech-2-c174c'
});
const db = getFirestore();

async function fetchFreeImageUrl(query) {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " product high res")}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    
    // Extract all image sources
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      if (src && src.startsWith('//external-content') && !src.includes('.ico') && !src.includes('.svg') && !src.includes('duckduckgo.com/assets')) {
        return 'https:' + src;
      }
    }
  } catch(e) {
    // ignore
  }
  return null;
}

async function run() {
  console.log('Starting FREE image population script...');
  
  const snapshot = await db.collection('products').get();
  const products = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.image || !data.image.startsWith('http') || data.image.includes('placeholder')) {
      products.push({ id: doc.id, ...data });
    }
  });

  console.log(`Found ${products.length} products needing images.`);

  let updatedCount = 0;
  // ONLY run for the first 10 for safety testing
  for (const product of products) {
    const query = `${product.brand || ''} ${product.name}`.trim();
    console.log(`Searching for: ${query}`);
    
    const imageUrl = await fetchFreeImageUrl(query);
    
    if (imageUrl) {
      console.log(` -> Found: ${imageUrl}`);
      await db.collection('products').doc(product.id).update({ image: imageUrl });
      updatedCount++;
    } else {
      console.log(` -> No image found.`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log(`\nFinished! Successfully added images to ${updatedCount} products for FREE.`);
}

run();
