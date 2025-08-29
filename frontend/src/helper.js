// Use proxy for development, direct URL for production
export const api_base_url = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || "https://d-code-backend.vercel.app")  // Production: use direct URL or proxy
  : "/api";  // Development: use Vite proxy

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
      mode: "cors",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    console.error("Failed URL:", api_base_url + endpoint);
    throw error;
  }
};
