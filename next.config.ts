import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Leaflet needs unsafe-inline for its own markers
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind inline styles + Leaflet inline styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // OpenStreetMap/CartoDB tiles + USGS
      "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.openstreetmap.org https://earthquake.usgs.gov",
      // Leaflet tiles
      "connect-src 'self' https://earthquake.usgs.gov",
      // Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
