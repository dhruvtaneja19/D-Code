// Vercel Edge Middleware - Handles CORS preflight and URL cleanup
// Place this in api/_middleware.js for Vercel to automatically use it

const ALLOWED_ORIGINS = [
  "https://d-code-new.vercel.app",
  "http://localhost:5173",
];

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") || "";

  // Determine the allowed origin header value
  const allowOriginValue = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  // Handle CORS preflight (OPTIONS) requests immediately at the edge
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOriginValue,
        ...CORS_HEADERS,
      },
    });
  }

  // Check for double slashes in the path (excluding the protocol://)
  if (url.pathname.includes("//")) {
    // Normalize the path to remove multiple consecutive slashes
    const cleanPath = url.pathname.replace(/\/+/g, "/");

    // Construct new URL with cleaned path
    const newUrl = new URL(url);
    newUrl.pathname = cleanPath;

    // 301 redirect to the cleaned URL
    return Response.redirect(newUrl.toString(), 301);
  }

  // Continue processing the request normally
  return;
}
