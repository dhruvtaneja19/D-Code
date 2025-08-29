// Use direct API URL in production, proxy in development
// This ensures we're using the right approach in each environment
export const api_base_url = import.meta.env.PROD 
  ? "/api"  // Use proxy routes in production for Vercel
  : "http://localhost:3000"; // Direct URL in development

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    // Extra-careful URL handling to prevent double slashes
    // First normalize the endpoint by removing any leading/trailing slashes
    let normalizedEndpoint = endpoint;
    while (normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = normalizedEndpoint.substring(1);
    }
    
    // Then construct the URL properly
    let url;
    if (import.meta.env.PROD) {
      // In production, use proxy URL with careful path construction
      url = `/api/${normalizedEndpoint}`;
    } else {
      // In development, use direct URL to backend
      url = `${api_base_url}/${normalizedEndpoint}`;
    }
    
    console.log("Making API call to:", url);
    console.log("Environment:", import.meta.env.PROD ? "PRODUCTION" : "DEVELOPMENT");
    
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
    
    // Set the body correctly, avoiding double-serialization
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
