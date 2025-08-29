// Always use proxy route to avoid CORS issues
export const api_base_url = "/api";

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    // Clean up URL to avoid double slashes
    const baseUrl = api_base_url.endsWith('/') ? api_base_url.slice(0, -1) : api_base_url;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = baseUrl + cleanEndpoint;
    
    console.log("Making API call to:", url);
    
    // Parse the body if it's a string (already stringified)
    let requestBody = options.body;
    if (typeof options.body === 'string') {
      try {
        requestBody = JSON.parse(options.body);
      } catch (e) {
        // Not JSON, keep as is
      }
    }
    
    // Create a new options object with the correct structure
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      credentials: 'include',
      ...options
    };
    
    // Set the body correctly
    if (requestBody) {
      fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
    }
    
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    const baseUrl = api_base_url.endsWith('/') ? api_base_url.slice(0, -1) : api_base_url;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    console.error("Failed URL:", baseUrl + cleanEndpoint);
    throw error;
  }
};
