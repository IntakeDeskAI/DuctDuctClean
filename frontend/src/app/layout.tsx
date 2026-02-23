import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Professional Air Duct Cleaning in Idaho Falls, ID | DuctDuctClean",
    template: "%s | DuctDuctClean",
  },
  description:
    "Breathe easier with expert air duct cleaning in Idaho Falls, ID. Residential and commercial duct cleaning, dryer vent cleaning, and window washing. Call (208) 701-5502 for a free quote.",
  metadataBase: new URL("https://ductductclean.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DuctDuctClean",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://ductductclean.com",
  name: "DuctDuctClean",
  description:
    "Professional air duct cleaning services in Idaho Falls, ID. Residential and commercial duct cleaning, dryer vent cleaning, and window washing.",
  url: "https://ductductclean.com",
  telephone: "+12087015502",
  email: "info@ductductclean.com",
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Idaho Falls",
    addressRegion: "ID",
    postalCode: "83401",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.4917,
    longitude: -112.0339,
  },
  areaServed: [
    { "@type": "City", name: "Idaho Falls" },
    { "@type": "City", name: "Ammon" },
    { "@type": "City", name: "Rexburg" },
    { "@type": "City", name: "Pocatello" },
    { "@type": "City", name: "Blackfoot" },
    { "@type": "City", name: "Rigby" },
    { "@type": "City", name: "Shelley" },
    { "@type": "City", name: "Driggs" },
    { "@type": "City", name: "St. Anthony" },
  ],
  serviceType: [
    "Air Duct Cleaning",
    "Dryer Vent Cleaning",
    "HVAC Cleaning",
    "Commercial Duct Cleaning",
    "Window Washing",
  ],
  priceRange: "$$",
  openingHours: "Mo-Sa 07:00-19:00",
  sameAs: [],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased text-gray-900 bg-white">
        {children}
      </body>
    </html>
  );
}
