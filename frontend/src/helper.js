// Set up the API base URL based on environment
// In production, use the backend URL directly rather than through proxy
export const api_base_url = import.meta.env.PROD
  ? "https://d-code-backend.vercel.app" // Direct backend URL in production
  : "http://localhost:3000"; // Direct URL in development

// Helper function for API calls with better error handling
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    // ULTRA-careful URL handling to prevent any possibility of double slashes
    let cleanEndpoint = endpoint;
    
    // Remove ALL leading slashes
    while (cleanEndpoint.startsWith('/')) {
      cleanEndpoint = cleanEndpoint.substring(1);
    }
    
    // Ensure base URL doesn't end with slash
    let cleanBaseUrl = api_base_url;
    while (cleanBaseUrl.endsWith('/')) {
      cleanBaseUrl = cleanBaseUrl.substring(0, cleanBaseUrl.length - 1);
    }

    // Construct the final URL with explicit single slash
    const url = cleanBaseUrl + '/' + cleanEndpoint;
    
    // Final safety check - replace any double slashes with single slash (except for protocol://)
    const safeUrl = url.replace(/([^:]\/)\/+/g, '$1');

    console.log("=== API CALL DEBUG INFO ===");
    console.log("Original endpoint:", endpoint);
    console.log("Clean endpoint:", cleanEndpoint);
    console.log("Base URL:", cleanBaseUrl);
    console.log("Constructed URL:", url);
    console.log("Final safe URL:", safeUrl);
    console.log("Environment:", import.meta.env.PROD ? "PRODUCTION" : "DEVELOPMENT");
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

    const response = await fetch(safeUrl, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    const baseUrl = api_base_url.endsWith("/")
      ? api_base_url.slice(0, -1)
      : api_base_url;
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
    console.error("Failed URL:", baseUrl + cleanEndpoint);
    throw error;
  }
};
