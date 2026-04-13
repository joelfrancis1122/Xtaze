/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'e-cdns-images.dzcdn.net',  // Deezer image domain
      'hebbkx1anhila5yf.public.blob.vercel-storage.com', // Your existing domain
      'api.deezer.com'
    ],
  },
}

module.exports = nextConfig 