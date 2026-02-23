import { Home, Building2, Flame, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ServiceDetail {
  slug: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  price: string;
  description: string;
  included: string[];
  idealFor: string[];
  localNote: string;
  duration: string;
}

export const servicesDetail: ServiceDetail[] = [
  {
    slug: "residential",
    icon: Home,
    title: "Residential Duct Cleaning",
    tagline: "Breathe cleaner air in your home",
    price: "Starting at $499",
    description:
      "Our residential duct cleaning service thoroughly removes dust, pollen, pet dander, mold spores, and other contaminants from your entire HVAC system. We use industry-leading HEPA-filtered vacuum systems and rotary brush technology to clean every supply and return duct in your home, leaving your air noticeably fresher.",
    included: [
      "Complete cleaning of all supply and return air ducts",
      "HEPA-filtered vacuum system for zero dust escape",
      "Rotary brush cleaning of duct interiors",
      "Vent cover removal, cleaning, and reinstallation",
      "System inspection with before-and-after photos",
      "Sanitization treatment (optional add-on)",
      "Post-cleaning airflow verification",
    ],
    idealFor: [
      "Homes with allergy or asthma sufferers",
      "Properties with pets",
      "Post-renovation or new construction cleanup",
      "Homes that haven't been cleaned in 3+ years",
    ],
    localNote:
      "Idaho Falls' dry climate and seasonal pollen make regular duct cleaning essential for maintaining healthy indoor air. Our team understands the unique challenges of Eastern Idaho homes.",
    duration: "2-3 hours",
  },
  {
    slug: "commercial",
    icon: Building2,
    title: "Commercial HVAC Vent Cleaning",
    tagline: "Professional air quality for your business",
    price: "Custom Quote",
    description:
      "Keep your employees healthy and your HVAC system running efficiently with our commercial duct cleaning service. We work with offices, retail spaces, restaurants, medical facilities, and industrial properties throughout Idaho Falls and surrounding areas. Our flexible scheduling minimizes disruption to your business operations.",
    included: [
      "Full commercial HVAC system assessment",
      "High-capacity vacuum cleaning of all ductwork",
      "Air handler and coil cleaning",
      "Vent and diffuser cleaning throughout the property",
      "NADCA-compliant cleaning procedures",
      "Detailed inspection report with photos",
      "Flexible scheduling including nights and weekends",
      "Compliance documentation for regulatory requirements",
    ],
    idealFor: [
      "Office buildings and coworking spaces",
      "Restaurants and food service establishments",
      "Medical and dental offices",
      "Retail stores and shopping centers",
    ],
    localNote:
      "We serve businesses throughout Idaho Falls, Ammon, Rexburg, and Pocatello with minimal disruption to your daily operations.",
    duration: "4-8 hours (varies by property size)",
  },
  {
    slug: "dryer-vent",
    icon: Flame,
    title: "Dryer Vent Cleaning",
    tagline: "Prevent fire hazards and save energy",
    price: "Starting at $149",
    description:
      "Clogged dryer vents are one of the leading causes of house fires in the United States. Our professional dryer vent cleaning service removes lint buildup, debris, and blockages from your entire dryer vent line, from the dryer connection to the exterior exhaust. This essential maintenance improves dryer performance, reduces energy costs, and most importantly, protects your family.",
    included: [
      "Complete lint and debris removal from vent line",
      "Interior and exterior vent inspection",
      "Airflow measurement before and after cleaning",
      "Dryer connection inspection and reattachment",
      "Exterior vent cap cleaning and inspection",
      "Fire hazard assessment",
    ],
    idealFor: [
      "Homes where drying cycles take longer than normal",
      "Properties with long dryer vent runs",
      "Homes that haven't had vents cleaned in 1+ years",
      "Multi-family properties and laundromats",
    ],
    localNote:
      "Idaho's cold winters mean your dryer works harder and longer. Regular vent cleaning is essential maintenance for every Idaho Falls home.",
    duration: "30-60 minutes",
  },
  {
    slug: "window-washing",
    icon: Droplets,
    title: "Window Washing",
    tagline: "Crystal-clear views, inside and out",
    price: "Starting at $199",
    description:
      "Let the Idaho sunshine in with our professional window washing service. We clean interior and exterior glass surfaces using professional-grade squeegees and eco-friendly cleaning solutions that leave streak-free results every time. Our team handles windows at any height safely and efficiently, including hard-to-reach skylights and multi-story properties.",
    included: [
      "Interior and exterior window cleaning",
      "Screen removal, cleaning, and reinstallation",
      "Window sill and track cleaning",
      "Hard water stain removal",
      "Streak-free professional finish",
      "Skylight cleaning (where accessible)",
    ],
    idealFor: [
      "Homeowners preparing for special events",
      "Spring and fall seasonal cleaning",
      "Properties with hard water staining",
      "Commercial storefronts and offices",
    ],
    localNote:
      "Idaho's hard water and seasonal dust create stubborn buildup on windows. Our professional-grade solutions cut through mineral deposits and leave your glass sparkling.",
    duration: "2-4 hours",
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return servicesDetail.find((s) => s.slug === slug);
}
