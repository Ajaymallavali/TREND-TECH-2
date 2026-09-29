import mongoose from 'mongoose';
async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  
  const updates = [
    { id: "6aa06056af8879d815dca934", hash: "9be215fb59122b7ab8f4bdf2bc8adb97743b8a8cf7359a3816e4691a0ee7fe36", url: "https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg", path: "/product-images/apple/6aa06056af8879d815dca934/primary.jpg" },
    { id: "6aa06056af8879d815dca943", hash: "9be215fb59122b7ab8f4bdf2bc8adb97743b8a8cf7359a3816e4691a0ee7fe36", url: "https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg", path: "/product-images/apple/6aa06056af8879d815dca943/primary.jpg" },
    { id: "6aa06056af8879d815dca970", hash: "9be215fb59122b7ab8f4bdf2bc8adb97743b8a8cf7359a3816e4691a0ee7fe36", url: "https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg", path: "/product-images/apple/6aa06056af8879d815dca970/primary.jpg" },
    { id: "6aa06057af8879d815dcad10", hash: "8826f1d162da993a1e5e4a4f3e8076533101d75ca445990390a63a6589079991", url: "https://m.media-amazon.com/images/I/81jqUPkIVRL._SL1500_.jpg", path: "/product-images/apple/6aa06057af8879d815dcad10/primary.jpg" },
    { id: "6aa06057af8879d815dcad1f", hash: "f8cf3c842a7ea815c95ca489f924bc584b931d3109bcaee2d8ff79dfb8078470", url: "https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg", path: "/product-images/apple/6aa06057af8879d815dcad1f/primary.jpg" },
    { id: "6aa06057af8879d815dcad2e", hash: "3b608647b256705700cd0b31c1186d6d9caf952696a908a04e92a42eabd273ca", url: "https://m.media-amazon.com/images/I/615ekapl+pL._SL1500_.jpg", path: "/product-images/apple/6aa06057af8879d815dcad2e/primary.jpg" }
  ];

  for (const up of updates) {
    await Product.updateOne({ _id: up.id }, {
      $set: {
        image: up.path,
        imageStatus: 'VERIFIED_EXACT',
        imageHash: up.hash,
        imageWidth: 1500,
        imageHeight: 1500,
        imageMimeType: 'image/jpeg',
        imageSourceUrl: up.url
      },
      $unset: { recoveryBatch: '', identityStatus: '', identityConfidence: '' }
    });
  }
  
  const verifiedApple = await Product.countDocuments({ brand: 'Apple', imageStatus: 'VERIFIED_EXACT' });
  console.log('Count after restore:', verifiedApple);
  process.exit(0);
}
run();
