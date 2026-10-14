import mongoose from 'mongoose';

const UPDATES = [
  // Laptops misclassified in television
  { name: 'ASUS VivoBook 15 OLED', category: 'laptop', brand: 'Asus' },
  { name: 'ASUS ZenBook 14 OLED', category: 'laptop', brand: 'Asus' },
  { name: 'ASUS Zenbook 14 OLED', category: 'laptop', brand: 'Asus' },
  { name: 'ASUS Vivobook Pro 15 OLED', category: 'laptop', brand: 'Asus' },
  { name: 'Dell XPS 14 OLED', category: 'laptop', brand: 'Dell' },
  { name: 'Dell XPS 16 OLED', category: 'laptop', brand: 'Dell' },
  { name: 'Acer Swift Go 14 OLED', category: 'laptop', brand: 'Acer' },

  // Laptops in gaming / monitor
  { name: 'Laptop Gigabyte', category: 'laptop', brand: 'Gigabyte' },
  { name: 'Laptop ProArt', category: 'laptop', brand: 'Asus' },
  { name: 'Razer Blade 16 Gaming Laptop', category: 'laptop', brand: 'Razer' },

  // Smartwatches in television
  { name: 'Garmin Fenix 8 Sapphire AMOLED', category: 'smartwatch', brand: 'Garmin' },

  // Monitors in television
  { name: 'AOC AGON PRO 27 240Hz OLED', category: 'monitor', brand: 'AOC' },
  { name: 'ASUS ROG Swift 32 4K OLED (PG32UCDM)', category: 'monitor', brand: 'Asus' },
  { name: 'Dell Alienware 27 360Hz QD-OLED (AW2725DF)', category: 'monitor', brand: 'Dell' },
  { name: 'Dell Alienware 32 4K QD-OLED (AW3225QF)', category: 'monitor', brand: 'Dell' },
  { name: 'LG UltraGear 27 240Hz OLED (27GR95QE)', category: 'monitor', brand: 'LG' },
  { name: 'LG UltraGear 34 Curved OLED (34GS95QE)', category: 'monitor', brand: 'LG' },
  { name: 'Samsung Odyssey OLED G8 32" 4K 240Hz', category: 'monitor', brand: 'Samsung' },
  { name: 'Samsung Odyssey OLED G9 49"', category: 'monitor', brand: 'Samsung' },

  // Peripherals / Accessories
  { name: 'Desktop Studio Display', category: 'monitor', brand: 'Apple' },
  { name: 'Computer Accessories Monitor', category: 'monitor', brand: 'Monitors' },
  { name: 'Accessories Laptop bags', category: 'bags', brand: 'Accessories' },
  { name: 'Computer Accessories Laptop stand', category: 'accessories', brand: 'Accessories' },
  { name: 'Cameras Webcam', category: 'camera', brand: 'Cameras' },
  { name: 'Computer Accessories Webcam', category: 'camera', brand: 'Accessories' },
];

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const collection = mongoose.connection.db.collection('products');

  console.log('Applying targeted realignment to database...');
  let updatedCount = 0;

  for (const item of UPDATES) {
    const res = await collection.updateMany(
      { name: item.name },
      { $set: { category: item.category, brand: item.brand } }
    );
    if (res.matchedCount > 0) {
      console.log(`✓ Updated "${item.name}": category -> ${item.category}, brand -> ${item.brand} (${res.modifiedCount} modified)`);
      updatedCount += res.modifiedCount;
    } else {
      console.log(`- Not found: "${item.name}"`);
    }
  }

  console.log(`\nRealigned ${updatedCount} products successfully.`);
  await mongoose.disconnect();
}

run().catch(console.error);
