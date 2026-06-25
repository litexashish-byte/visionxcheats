const axios = require('axios');

const DEFAULT_SHORTENER_API_URL = 'https://indianshortner.com/api';

function getShortenerConfig(settings = {}) {
  return {
    apiKey: settings.shortenerApiKey || process.env.INDIAN_SHORTNER_API_KEY || process.env.SHORTENER_API_KEY || '',
    apiUrl: settings.shortenerApiUrl || process.env.INDIAN_SHORTNER_API_URL || DEFAULT_SHORTENER_API_URL,
  };
}

function makeAlias(value) {
  const base = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  const rand = Math.random().toString(36).substring(2, 6);
  return base ? `${base}-${rand}` : rand;
}

/**
 * Generate a short URL using the configured India Shortener API
 * @param {string} longUrl - The original URL to shorten
 * @param {object} settings - Site settings containing shortenerApiKey and shortenerApiUrl
 * @param {string} alias - Optional custom alias
 * @returns {Promise<string>} The shortened URL
 */
async function shortenUrl(longUrl, settings, alias = '') {
  const { apiKey, apiUrl } = getShortenerConfig(settings);

  if (!longUrl) return '';
  if (!apiKey) {
    throw new Error('Indian Shortner API key is not configured');
  }

  try {
    const res = await axios.get(apiUrl, {
      timeout: 10000,
      params: {
        api: apiKey,
        url: longUrl,
        ...(alias ? { alias: makeAlias(alias) } : {}),
      },
    });

    if (res.data?.status === 'error') {
      throw new Error(res.data.message || 'Indian Shortner returned an error');
    }

    if (res.data?.shortenedUrl) {
      return res.data.shortenedUrl;
    }

    if (typeof res.data === 'string' && res.data.startsWith('http')) {
      return res.data.trim();
    }

    throw new Error(`Unexpected Indian Shortner response: ${JSON.stringify(res.data).substring(0, 200)}`);
  } catch (error) {
    throw new Error(`Indian Shortner failed: ${error.message}`);
  }
}

module.exports = { DEFAULT_SHORTENER_API_URL, makeAlias, shortenUrl };
