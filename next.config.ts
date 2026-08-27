import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    'local-origin.dev',
    '*.local-origin.dev',
    '*.ngrok-free.dev',
    '*.makhi-coldturkey-brady.ngrok-free.dev',
    '.makhi-coldturkey-brady.ngrok-free.dev'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      }
    ],
  },
};

export default nextConfig;