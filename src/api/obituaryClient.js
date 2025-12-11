const axios = require('axios');

const API_BASE_URLS = {
  dev: 'https://h8j5wx2ek8.execute-api.us-east-1.amazonaws.com/dev',
  stage: 'https://osw92dhpje.execute-api.us-east-1.amazonaws.com/stage',
  prod: 'https://eqvuex5md7.execute-api.us-east-1.amazonaws.com/prod'
};

const API_ENDPOINT = '/v1/obituaries/';

/**
 * Publish an obituary to the Legacy.com API
 * @param {Object} params - Publishing parameters
 * @param {string} params.apiKey - API key for authentication
 * @param {string} params.environment - Environment: 'dev', 'stage', or 'prod'
 * @param {Object} params.payload - The obituary data payload
 * @returns {Promise<Object>} Response with obituary_id and redirector_url
 */
async function publishObituary({ apiKey, environment, payload }) {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!payload) {
    throw new Error('Payload is required');
  }

  const baseUrl = API_BASE_URLS[environment] || API_BASE_URLS.prod;
  const url = `${baseUrl}${API_ENDPOINT}`;

  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    // Enhance error with response data if available
    if (error.response) {
      const enhancedError = new Error(
        error.response.data?.message || 
        error.response.data?.errors?.join(', ') || 
        `HTTP ${error.response.status}: ${error.response.statusText}`
      );
      enhancedError.response = error.response;
      enhancedError.statusCode = error.response.status;
      throw enhancedError;
    }
    throw error;
  }
}

module.exports = {
  publishObituary
};

