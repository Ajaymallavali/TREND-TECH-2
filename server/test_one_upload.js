import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
  const testFile = "C:\\Users\\ajaym\\Downloads\\img's\\- Samsung Samsung Odyssey OLED G9 49.jpg";
  try {
    console.log('Testing upload of:', testFile);
    const result = await cloudinary.uploader.upload(testFile, {
      folder: 'trend-tech/products',
      overwrite: true
    });
    console.log('UPLOAD SUCCESSFUL!');
    console.log('URL:', result.secure_url);
  } catch (err) {
    console.error('Upload failed with .env secret:', err);
    console.log('Trying with alternate secret: YjWeeF7BB71h_CZuop9IiEm8pM8');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: 'YjWeeF7BB71h_CZuop9IiEm8pM8'
    });
    try {
      const result2 = await cloudinary.uploader.upload(testFile, {
        folder: 'trend-tech/products',
        overwrite: true
      });
      console.log('UPLOAD SUCCESSFUL with alternate secret!');
      console.log('URL:', result2.secure_url);
    } catch (err2) {
      console.error('Upload failed with alternate secret too:', err2);
    }
  }
}

testUpload();
