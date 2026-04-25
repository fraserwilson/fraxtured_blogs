/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? "http://api:5000";
    return [
      {
        source: "/api/:path*",
        destination: `${target}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
