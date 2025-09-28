const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUDNAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
  });

module.exports = cloudinary;

// CLOUDINARY_API_KEY = 262959894313486;
// CLOUDINARY_API_SECRET = n161pQqraTiMZu1VqLSAPq4vMCQ;
// CLOUDINARY_CLOUDNAME = djpa4rbye;