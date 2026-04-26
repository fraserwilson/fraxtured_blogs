/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" }
        ]
      }
    ];
  },
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://api:5000";
    return [
      {
        source: "/api/:path((?!auth|upload).*)",
        destination: `${target}/api/:path`
      }
    ];
  }
};

export default nextConfig;
