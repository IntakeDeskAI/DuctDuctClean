import { Metadata } from "next";
import HeroSection from "@/components/layout/HeroSection";
import ServicesSection from "@/components/layout/ServicesSection";
import HowItWorksSection from "@/components/layout/HowItWorksSection";
import WhyChooseUsSection from "@/components/layout/WhyChooseUsSection";
import ReviewsSection from "@/components/layout/ReviewsSection";
import ContactSection from "@/components/layout/QuoteCTASection";
import FAQSection from "@/components/layout/FAQSection";

export const metadata: Metadata = {
  title:
    "Professional Air Duct Cleaning in Idaho Falls, ID | DuctDuctClean",
  description:
    "Breathe easier with expert air duct cleaning in Idaho Falls, ID. Residential and commercial duct cleaning, dryer vent cleaning, and window washing. Call (208) 701-5502 for a free quote.",
  keywords: [
    "air duct cleaning Idaho Falls",
    "duct cleaning near me",
    "HVAC cleaning Idaho Falls",
    "dryer vent cleaning Idaho Falls",
    "window washing Idaho Falls",
    "air duct cleaning Ammon ID",
    "air duct cleaning Rexburg",
    "air duct cleaning Pocatello",
    "commercial duct cleaning Idaho Falls",
    "residential duct cleaning Idaho",
  ],
  openGraph: {
    title:
      "Professional Air Duct Cleaning in Idaho Falls, ID | DuctDuctClean",
    description:
      "Breathe easier with expert air duct cleaning. Serving Idaho Falls, Ammon, and surrounding areas since 2023. Free quotes. Call (208) 701-5502.",
    type: "website",
    locale: "en_US",
    siteName: "DuctDuctClean",
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseUsSection />
      <ReviewsSection />
      <ContactSection />
      <FAQSection />
    </main>
  );
}
