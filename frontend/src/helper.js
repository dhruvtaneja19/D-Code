// Set up the API base URL based on environment
// In production, use the backend URL directly rather than through proxy
export const api_base_url = import.meta.env.PROD
  ? "https://d-code-backend.vercel.app" // Direct backend URL in production
  : "http://localhost:3000"; // Direct URL in development

// Test function to verify URL construction (remove in production)
export const testUrlConstruction = () => {
  const testCases = [
    "/getProjects",
    "getProjects", 
    "//getProjects",
    "/getProjects/",
    "getProjects/"
  ];
  
  console.log("=== URL CONSTRUCTION TESTS ===");
  testCases.forEach(endpoint => {
    const baseStr = api_base_url.endsWith("/") ? api_base_url.slice(0, -1) : api_base_url;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const finalCleanEndpoint = cleanEndpoint.endsWith("/") ? cleanEndpoint.slice(0, -1) : cleanEndpoint;
    const finalURL = `${baseStr}/${finalCleanEndpoint}`;
    console.log(`${endpoint} -> ${finalURL}`);
  });
  console.log("=== END TESTS ===");
};

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    // COMPLETELY REWRITTEN URL HANDLING - NO CHANCE OF DOUBLE SLASHES

    // NEW APPROACH: Direct string manipulation with careful checking

    // BULLETPROOF URL HANDLING - Handles all edge cases
    // Step 1: Clean the base URL - remove any trailing slashes
    const baseStr = api_base_url.replace(/\/+$/, '');
    
    // Step 2: Clean the endpoint - remove leading AND trailing slashes, and collapse multiple slashes
    let cleanEndpoint = endpoint
      .replace(/^\/+/, '')  // Remove leading slashes
      .replace(/\/+$/, '')  // Remove trailing slashes  
      .replace(/\/+/g, '/'); // Collapse multiple slashes to single slash
    
    // Step 3: Handle empty endpoint case
    if (!cleanEndpoint) {
      cleanEndpoint = '';
    }
    
    // Step 4: Construct final URL with guaranteed single slash separation
    const finalURL = cleanEndpoint ? `${baseStr}/${cleanEndpoint}` : baseStr;

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
