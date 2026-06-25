const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route   POST /api/upload/image
// @desc    Upload an image to imgbb and return the URL
// @access  Admin only
router.post('/image', auth, admin, async (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided',
      });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ImgBB API key not configured. Please set IMGBB_API_KEY in your .env file.',
        hint: 'Get a free API key at https://api.imgbb.com/',
      });
    }

    // Forward the image to imgbb
    const formData = new FormData();
    formData.append('key', apiKey);

    // Handle base64 and URL-based images
    if (image.startsWith('data:')) {
      // Base64 data URI from FileReader - strip prefix
      formData.append('image', image.split(',')[1]);
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      // Direct URL - imgbb can fetch it
      formData.append('image', image);
    } else {
      // Raw base64 string
      formData.append('image', image);
    }

    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    if (response.data && response.data.success) {
      const imgData = response.data.data;
      return res.json({
        success: true,
        data: {
          url: imgData.url,
          display_url: imgData.display_url,
          delete_url: imgData.delete_url,
          thumb: imgData.thumb?.url || imgData.url,
          medium: imgData.medium?.url || imgData.url,
        },
        message: 'Image uploaded successfully',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'ImgBB upload failed',
      details: response.data?.error?.message || 'Unknown error',
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error.response?.data?.error?.message
      || error.message
      || 'Upload failed';
    res.status(500).json({
      success: false,
      message,
    });
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload a profile avatar (any authenticated user)
// @access  Authenticated users
router.post('/avatar', auth, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided',
      });
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'ImgBB API key not configured.',
      });
    }

    const formData = new FormData();
    formData.append('key', apiKey);

    if (image.startsWith('data:')) {
      formData.append('image', image.split(',')[1]);
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      formData.append('image', image);
    } else {
      formData.append('image', image);
    }

    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    if (response.data && response.data.success) {
      const imgData = response.data.data;
      return res.json({
        success: true,
        data: {
          url: imgData.url,
          display_url: imgData.display_url,
        },
        message: 'Avatar uploaded successfully',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'ImgBB upload failed',
      details: response.data?.error?.message || 'Unknown error',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    const message = error.response?.data?.error?.message
      || error.message
      || 'Upload failed';
    res.status(500).json({
      success: false,
      message,
    });
  }
});

module.exports = router;
