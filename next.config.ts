/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['three', 'gsap'],
  },
};

export default nextConfig;
