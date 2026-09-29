import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  await Product.updateOne({ _id: '6a98d181a6bfd56d867752df' }, {
    $set: {
      image: '/product-images/6a98d181a6bfd56d867752df/primary.jpg',
      imageStatus: 'VERIFIED_EXACT',
      imageHash: 'b95cf127d7507d891c6a4edea8b97160e3cfaeecbd66c974dae6c7f04988a797',
      imageWidth: 1500,
      imageHeight: 1500,
      imageMimeType: 'image/jpeg',
      imageSourceUrl: 'https://m.media-amazon.com/images/I/51w9W4+a-iL._SL1500_.jpg'
    },
    $unset: { identityStatus: '', identityConfidence: '', recoveryBatch: '', recoveryLastAttemptedAt: '', recoveryLastCompletedAt: '' }
  });

  await Product.updateOne({ _id: '6a9904e369652590e0aadc72' }, {
    $set: {
      image: '/product-images/6a9904e369652590e0aadc72/primary.jpg',
      imageStatus: 'VERIFIED_EXACT',
      imageHash: '2739e55c48559c64db64e222efebda549b690f341035f16ed75e0ff40f3334ad',
      imageWidth: 1500,
      imageHeight: 1500,
      imageMimeType: 'image/jpeg',
      imageSourceUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg'
    },
    $unset: { identityStatus: '', identityConfidence: '', recoveryBatch: '', recoveryLastAttemptedAt: '', recoveryLastCompletedAt: '' }
  });

  console.log('Restored the two Apple products');
  process.exit(0);
}
run();
