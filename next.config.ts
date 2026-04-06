import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {


  /* config options here */

  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        hostname: 'plus.unsplash.com',
        protocol: 'https',
        port: "",

      },
       {
    // hostname: 'insightful-dachshund-91.convex.cloud',
    hostname: 'https://grandiose-meadowlark-349.convex.cloud',
    protocol: 'https',
    port: "",
    pathname: '/api/storage/**',
  },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Set your desired limit here
    },
  },

 
};

export default nextConfig;
