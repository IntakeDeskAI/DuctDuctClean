import { Home, Building2, Flame, Droplets, CheckCircle } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const services = [
  {
    icon: Home,
    title: "Residential Duct Cleaning",
    description:
      "Complete cleaning of all supply and return air ducts in your home for healthier indoor air.",
    benefits: [
      "Removes dust, pollen, and allergens",
      "Improves HVAC efficiency up to 30%",
      "Reduces energy costs",
    ],
    price: "Starting at $499",
    localNote:
      "Perfect for Idaho Falls homes dealing with seasonal dust and pollen.",
  },
  {
    icon: Building2,
    title: "Commercial HVAC Vent Cleaning",
    description:
      "Professional air duct and vent cleaning for offices, retail, and commercial properties.",
    benefits: [
      "Meets NADCA commercial standards",
      "Minimal disruption to business",
      "Flexible scheduling including after-hours",
    ],
    price: "Custom Quote",
    localNote:
      "Serving Idaho Falls businesses and surrounding commercial properties.",
  },
  {
    icon: Flame,
    title: "Dryer Vent Cleaning",
    description:
      "Prevent fire hazards and improve dryer performance with thorough vent cleaning.",
    benefits: [
      "Reduces fire risk significantly",
      "Improves drying efficiency",
      "Extends dryer lifespan",
    ],
    price: "Starting at $149",
    localNote: "Essential maintenance for every Idaho Falls home.",
  },
  {
    icon: Droplets,
    title: "Window Washing",
    description:
      "Crystal-clear windows inside and out. Professional streak-free results every time.",
    benefits: [
      "Interior and exterior cleaning",
      "Screen cleaning included",
      "Extends window lifespan",
    ],
    price: "Starting at $199",
    localNote:
      "Combat Idaho's hard water spots and seasonal buildup.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Services"
          title="Professional Cleaning Solutions"
          description="From residential homes to large commercial properties, we provide comprehensive cleaning services tailored for Idaho's climate."
        />

        <div className="grid sm:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-gray-200 p-6 hover:border-brand-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                  <service.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-display text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-brand-600 mt-0.5">
                    {service.price}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {service.description}
              </p>

              <ul className="space-y-2 mb-4">
                {service.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-gray-500 italic">{service.localNote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
