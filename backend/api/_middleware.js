// URL cleaner middleware for Vercel Edge middleware
// Place this in api/_middleware.js for Vercel to automatically use it

export default async function middleware(request) {
  const url = new URL(request.url);
  
  // Check for double slashes in the path (excluding the protocol://)
  if (url.pathname.includes('//')) {
    // Normalize the path to remove multiple consecutive slashes
    const cleanPath = url.pathname.replace(/\/+/g, '/');
    
    // Construct new URL with cleaned path
    const newUrl = new URL(url);
    newUrl.pathname = cleanPath;
    
    // 301 redirect to the cleaned URL
    return Response.redirect(newUrl.toString(), 301);
  }
  
  // Continue processing the request normally
  return;
}
