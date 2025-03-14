const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper function to process type parameters
const processTypeParam = (types) => {
  if (!types) return undefined;
  
  // Google Places API works best with a single type parameter
  // For multiple types, we'll use the first one as primary
  const typeArray = types.split('|');
  return typeArray[0]; // Return the first type
};

// Create a route to proxy requests to Google Places Nearby Search
app.get('/api/places', async (req, res) => {
  // Extract query parameters
  const { location, radius, types, key, pagetoken } = req.query;
  
  try {
    // If we have a pagetoken, we need to handle the request differently
    // Google's API sometimes needs a delay when using pagetoken
    if (pagetoken) {
      // Delay slightly when using pagetoken (Google API sometimes needs this)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: { 
          key,
          pagetoken
        }
      });
      return res.json(response.data);
    }
    
    // For regular requests, process types parameter
    const type = processTypeParam(types);
    
    // Build complete params object
    const params = {
      location,
      radius: Math.min(parseInt(radius) || 1000, 50000), // Ensure radius is within limits
      type,
      key
    };
    
    // Add keyword parameter to improve results that match all types
    // This helps when we want multiple types but can only send one
    if (types && types.includes('|')) {
      params.keyword = types.replace(/\|/g, ' ');
    }
    
    console.log('Sending request to Google Places API with params:', {
      ...params,
      key: 'API_KEY_HIDDEN' // Don't log the actual API key
    });
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { 
      params,
      timeout: 10000
    });
    
    // Log success but not the full response (could be large)
    console.log(`Places API response received with ${response.data?.results?.length || 0} results`);
    
    // Return the data to the client
    res.json(response.data);
  } catch (error) {
    // Enhanced error handling
    console.error('Error fetching from Google API:', error.toString());
    
    // Provide more specific error information to the client
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error_message || error.message;
      
      if (status === 400) {
        return res.status(400).json({ 
          error: 'Invalid request parameters', 
          details: message
        });
      } else if (status === 403 || status === 401) {
        return res.status(403).json({ 
          error: 'API key issue or quota exceeded', 
          details: message
        });
      } else if (status === 429) {
        return res.status(429).json({ 
          error: 'Too many requests - rate limit exceeded', 
          details: message
        });
      } else if (status >= 500) {
        return res.status(502).json({ 
          error: 'Google Places API service issue', 
          details: message
        });
      }
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Error fetching data from Google API',
      message: error.message
    });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});