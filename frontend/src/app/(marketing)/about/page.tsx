import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Shield,
  Leaf,
  Users,
  MapPin,
  Award,
  Phone,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about DuctDuctClean — a family-owned air duct cleaning company serving Idaho Falls and Eastern Idaho since 2023. Licensed, insured, and NADCA-certified.",
};

const values = [
  {
    icon: Heart,
    title: "Family Values",
    description:
      "As a family-owned business, we treat every customer's home like our own. Your satisfaction is our top priority.",
  },
  {
    icon: Shield,
    title: "Integrity First",
    description:
      "Honest pricing, transparent processes, and no hidden fees. We'll always tell you what your system actually needs.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description:
      "We use environmentally responsible cleaning solutions and HEPA filtration to protect your family and the environment.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "NADCA-certified technicians, state-of-the-art equipment, and ongoing training ensure the highest quality service.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-2">
            Our Story
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white">
            About DuctDuctClean
          </h1>
          <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
            Family-owned, locally operated, and committed to cleaner air for
            every home and business in Eastern Idaho.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">
                Since {siteConfig.established}
              </p>
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-6">
                Built on Trust, Driven by Clean Air
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  DuctDuctClean was founded with a simple mission: help Idaho
                  Falls families breathe cleaner, healthier air. What started as
                  a passion for indoor air quality has grown into Eastern
                  Idaho&apos;s trusted duct cleaning service.
                </p>
                <p>
                  We understand the unique challenges of Idaho&apos;s climate —
                  from dry, dusty summers to long winters that keep HVAC systems
                  running around the clock. That local knowledge, combined with
                  professional training and modern equipment, allows us to
                  deliver results our neighbors can count on.
                </p>
                <p>
                  Every job we take on, whether it&apos;s a single-family home
                  in Ammon or a commercial building in Rexburg, receives the same
                  attention to detail and commitment to quality.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl p-12 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Users className="h-16 w-16 text-brand-600 mx-auto mb-4" />
                <p className="text-2xl font-bold font-display text-brand-800">
                  500+ Happy Customers
                </p>
                <p className="text-brand-600 mt-2">
                  And counting across Eastern Idaho
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Stand For"
            title="Our Core Values"
            description="These principles guide every interaction, every job, and every decision we make."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-8 border border-gray-200"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">
                Proudly Local
              </p>
              <h2 className="text-3xl font-bold font-display text-gray-900 mb-6">
                Serving Eastern Idaho
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We proudly serve homeowners and businesses throughout Eastern
                Idaho. No matter where you are in our service area, you can
                expect the same professional, reliable service.
              </p>
              <div className="flex flex-wrap gap-2">
                {siteConfig.location.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-96 border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46539.36507911498!2d-112.07147565!3d43.49165705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53545a4e63c43ad3%3A0x3b2b5da3eb133ea8!2sIdaho%20Falls%2C%20ID!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DuctDuctClean service area map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-4">
            Let&apos;s Get Started
          </h2>
          <p className="text-brand-200 mb-8">
            Ready to improve your indoor air quality? Contact us today for a
            free, no-obligation quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="rounded-lg bg-accent-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${siteConfig.contact.phoneTel}`}
              className="rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
