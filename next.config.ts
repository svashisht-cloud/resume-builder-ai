import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   allowedDevOrigins: ["quartered-hydrant-deepen.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
