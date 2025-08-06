import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      new URL('https://placehold.co/**'),
      new URL('https://firebasestorage.googleapis.com/**'),
      new URL('https://utfs.io/**'),
    ],
  },
};

export default nextConfig;
