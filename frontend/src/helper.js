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
    console.log("Environment mode:", import.meta.env.MODE);
    console.log("Is DEV:", import.meta.env.DEV);
    console.log("Is PROD:", import.meta.env.PROD);
    
    const response = await fetch(url, {
      mode: "same-origin", // Use same-origin since we're using proxy
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

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
