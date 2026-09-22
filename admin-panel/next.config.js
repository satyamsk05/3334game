/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://3.7.73.109:5050'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

