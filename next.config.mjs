/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript type checking - consider enabling for production
  typescript: {
    ignoreBuildErrors: false,
  },
  // Images are unoptimized for static export compatibility
  images: {
    unoptimized: true,
  },
}

export default nextConfig