export const api_base_url = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    console.log('Making API call to:', api_base_url + endpoint);
    const response = await fetch(api_base_url + endpoint, {
      mode: "cors",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};