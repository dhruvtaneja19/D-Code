// Set up the API base URL based on environment
// In production, use the backend URL directly rather than through proxy
export const api_base_url = import.meta.env.PROD
  ? "https://d-code-backend.vercel.app" // Direct backend URL in production
  : "http://localhost:3000"; // Direct URL in development

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    // COMPLETELY REWRITTEN URL HANDLING - NO CHANCE OF DOUBLE SLASHES

    // NEW APPROACH: Direct string manipulation with careful checking

    // SUPER SIMPLE URL HANDLING - Direct string joining with fixed format
    // Step 1: Normalize the base URL to ensure it doesn't end with a slash
    const baseStr = api_base_url.endsWith('/')
      ? api_base_url.slice(0, -1)
      : api_base_url;
    
    // Step 2: Normalize the endpoint to ensure it doesn't start with a slash
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.slice(1)
      : endpoint;
    
    // Step 3: Manual string concatenation with a guaranteed single slash
    const finalURL = `${baseStr}/${cleanEndpoint}`;

    console.log("=== API CALL DEBUG INFO ===");
    console.log("Original endpoint:", endpoint);
    console.log("Clean endpoint:", cleanEndpoint);
    console.log("Base URL:", baseStr);
    console.log("Final URL:", finalURL);
    console.log(
      "Environment:",
      import.meta.env.PROD ? "PRODUCTION" : "DEVELOPMENT"
    );
    console.log("=== END DEBUG INFO ===");

    // Parse the body if it's a string (already stringified)
    let requestBody = options.body;
    if (typeof options.body === "string") {
      try {
        requestBody = JSON.parse(options.body);
      } catch (e) {
        // Not JSON, keep as is
      }
    }

    // Create a new options object with the correct structure
    const fetchOptions = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
      ...options,
    };

    // Set the body correctly, avoiding double-serialization
    if (requestBody) {
      fetchOptions.body =
        typeof requestBody === "string"
          ? requestBody
          : JSON.stringify(requestBody);
    }

    const response = await fetch(finalURL, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    console.error("Failed URL:", finalURL);
    throw error;
  }
};
