/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // Common Squarespace URL patterns
      { source: "/home", destination: "/", permanent: true },
      { source: "/services-1", destination: "/services", permanent: true },
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-1", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/contact-1", destination: "/contact", permanent: true },
      { source: "/blog-1", destination: "/blog", permanent: true },
    ];
  },
};

module.exports = nextConfig;
