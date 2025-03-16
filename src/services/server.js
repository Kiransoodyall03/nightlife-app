const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const EXCLUDED_TYPES = ['convenience_store', 'grocery_or_supermarket','home_goods_store','shopping_mall','shopping mall','home goods store','grocery or supermarket'];

// Helper function to process type parameters (for single-type requests)
const processTypeParam = (types) => {
  if (!types) return undefined;
  
  // Google Places API works best with a single type parameter.
  // For multiple types, we'll use the first one as primary.
  const typeArray = types.split('|');
  return typeArray[0]; // Return the first type
};

// Helper function to filter out excluded types
const filterExcluded = (results) => {
  if (!results || !Array.isArray(results)) return [];
  return results.filter(place => {
    if (place.types && Array.isArray(place.types)) {
      return !place.types.some(type => EXCLUDED_TYPES.includes(type));
    }
    return true;
  });
};

// Create a route to proxy requests to Google Places Nearby Search
app.get('/api/places', async (req, res) => {
  // Extract query parameters
  const { location, radius, types, key, pagetoken } = req.query;
  
  try {
    // If a pagetoken is provided, handle that request separately.
    if (pagetoken) {
      // Delay slightly when using pagetoken (Google API sometimes requires this)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: { key, pagetoken }
      });
      // Filter out places that have excluded types
      response.data.results = filterExcluded(response.data.results);
      return res.json(response.data);
    }
    
    // --- OR (Multiple Filter) Handling ---
    // If 'types' contains multiple filter words separated by '|',
    // perform an OR search by making separate requests for each filter word.
    if (types && types.includes('|')) {
      const filterWords = types.split('|');
      const commonParams = {
        location,
        radius: Math.min(parseInt(radius) || 1000, 50000),
        key
      };
      
      // For each filter word, use it as the keyword parameter.
      const requests = filterWords.map(word => {
        return axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: { ...commonParams, keyword: word }
        });
      });
      
      const responses = await Promise.all(requests);
      
      let combinedResults = [];
      responses.forEach(response => {
        if (response.data && Array.isArray(response.data.results)) {
          combinedResults = combinedResults.concat(response.data.results);
        }
      });
      
      // Deduplicate results by place_id.
      const uniqueResultsMap = {};
      combinedResults.forEach(place => {
        uniqueResultsMap[place.place_id] = place;
      });
      let uniqueResults = Object.values(uniqueResultsMap);
      
      // Filter out excluded types.
      uniqueResults = filterExcluded(uniqueResults);
      
      console.log(`Collected ${uniqueResults.length} unique venues from OR search`);
      return res.json({ results: uniqueResults });
    }
    
    // --- Single-type Request ---
    const type = processTypeParam(types);
    const params = {
      location,
      radius: Math.min(parseInt(radius) || 1000, 50000),
      type,
      key
    };
    
    // Optionally, if a single type is provided, set keyword as well.
    if (types && !types.includes('|')) {
      params.keyword = types;
    }
    
    console.log('Sending request to Google Places API with params:', {
      ...params,
      key: 'API_KEY_HIDDEN'
    });
    
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', { 
      params,
      timeout: 10000
    });
    
    // Filter out excluded types from the results.
    response.data.results = filterExcluded(response.data.results);
    
    console.log(`Places API response received with ${response.data?.results?.length || 0} results`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching from Google API:', error.toString());
    
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
    
    res.status(500).json({ 
      error: 'Error fetching data from Google API',
      message: error.message
    });
  }
});

// Health check endpoint
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
