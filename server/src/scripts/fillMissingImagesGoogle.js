import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import google from 'googlethis';

initializeApp({
  credential: applicationDefault(),
  projectId: 'trend-tech-2-c174c'
});
const db = getFirestore();

async function run() {
  console.log('Starting FREE Google Image scraper...');
  
  const snapshot = await db.collection('products').get();
  const products = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.image || !data.image.startsWith('http') || data.image.includes('placeholder')) {
      // Don't search for completely unverified/unknown placeholders
      if (!data.name.includes('UNVERIFIED') && !data.name.includes('UNRESOLVED')) {
        products.push({ id: doc.id, ...data });
      }
    }
  });

  console.log(`Found ${products.length} verified products needing real images.`);

  let updatedCount = 0;
  for (const product of products.slice(0, 3)) {
    const query = `${product.brand || ''} ${product.name} official high res`.trim();
    console.log(`Searching Google Images for: ${query}`);
    
    try {
      const images = await google.image(query, { safe: false });
      if (images && images.length > 0) {
        const bestImage = images[0].url; // Gets the original image URL
        console.log(` -> Found: ${bestImage}`);
        await db.collection('products').doc(product.id).update({ image: bestImage });
        updatedCount++;
      } else {
        console.log(` -> No image found on Google.`);
      }
    } catch(e) {
      console.log(` -> Error searching Google: ${e.message}`);
    }

    // Wait 2 seconds to act like a human and avoid Google Captcha
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log(`\nFinished! Successfully added Google Images to ${updatedCount} products for FREE.`);
}

run();
