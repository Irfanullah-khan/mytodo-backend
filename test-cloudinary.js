require('dotenv').config();
const cloudinary = require('./config/cloudinaryConfig');

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Cloudinary Error:', error);
    } else {
        console.log('✅ Cloudinary Connection Successful:', result);
    }
});
