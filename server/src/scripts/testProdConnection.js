import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function run() {
  try {
    console.log('Authentication Status: Attempting ADC Initialization...');
    const app = initializeApp({
      credential: applicationDefault(),
      projectId: 'trend-tech-2-c174c'
    });
    
    console.log('Project ID Detected:', app.options.projectId);
    console.log('Firestore Read Status: Connecting...');

    const db = getFirestore();
    
    // List collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    
    console.log('\n--- Production Collections Found ---');
    if (collectionNames.length === 0) {
      console.log('No collections found (Database might be empty).');
    } else {
      console.log(collectionNames.join(', '));
    }
    
    let totalDocs = 0;
    console.log('\n--- Actual Document Counts ---');
    for (const col of collections) {
      const snapshot = await col.count().get();
      const count = snapshot.data().count;
      console.log(`${col.id}: ${count}`);
      totalDocs += count;
    }
    
    console.log(`\nTotal Documents: ${totalDocs}`);
    console.log('\nFIREBASE PRODUCTION CONNECTION = PASS');
  } catch (err) {
    console.error('\nCONNECTION FAILED');
    console.error('ERROR:', err.message);
  }
}

run();
