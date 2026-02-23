import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  Phone,
  Clock,
  DollarSign,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { servicesDetail } from "@/data/services-detail";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Professional air duct cleaning, dryer vent cleaning, commercial HVAC cleaning, and window washing services in Idaho Falls, ID. Free quotes available.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-2">
            What We Offer
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white">
            Our Services
          </h1>
          <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
            From residential duct cleaning to commercial HVAC systems, we keep
            the air in Idaho Falls homes and businesses clean and healthy.
          </p>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
          {servicesDetail.map((service, index) => {
            const Icon = service.icon;
            const isEven = index % 2 === 1;
            return (
              <div
                key={service.slug}
                id={service.slug}
                className={`grid lg:grid-cols-2 gap-12 items-start ${
                  isEven ? "lg:direction-rtl" : ""
                }`}
              >
                <div className={isEven ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-brand-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-display text-gray-900">
                        {service.title}
                      </h2>
                      <p className="text-sm text-brand-600 font-medium">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-4 mb-6">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <DollarSign className="h-4 w-4 text-accent-500" />
                      {service.price}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 text-brand-500" />
                      {service.duration}
                    </span>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                  >
                    Get a Free Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className={isEven ? "lg:order-1" : ""}>
                  {/* What's Included */}
                  <div className="bg-gray-50 rounded-2xl p-8 mb-6">
                    <h3 className="text-lg font-bold font-display text-gray-900 mb-4">
                      What&apos;s Included
                    </h3>
                    <ul className="space-y-3">
                      {service.included.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal For */}
                  <div className="bg-brand-50 rounded-2xl p-8">
                    <h3 className="text-lg font-bold font-display text-gray-900 mb-4">
                      Ideal For
                    </h3>
                    <ul className="space-y-2">
                      {service.idealFor.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-brand-500 mt-1">&#8226;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-brand-900 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mb-4">
            Ready to Breathe Cleaner Air?
          </h2>
          <p className="text-brand-200 mb-8">
            Get a free, no-obligation quote for any of our services. We serve
            Idaho Falls and all of Eastern Idaho.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="rounded-lg bg-accent-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-accent-600 transition-colors"
            >
              Request Free Quote
            </Link>
            <a
              href={`tel:${siteConfig.contact.phoneTel}`}
              className="rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Call {siteConfig.contact.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
