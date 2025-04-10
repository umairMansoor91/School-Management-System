// This file configures the base URL for API requests
// Update this when deploying to production

const API_CONFIG = {
  // Replace with your actual Django backend URL when deploying
  BASE_URL: 'http://localhost:8000',
  
  // Add any global headers needed for authentication
  HEADERS: {
    'Content-Type': 'application/json',
    // Add authorization headers if needed
    // 'Authorization': 'Bearer YOUR_TOKEN'
  }
};

export default API_CONFIG;
