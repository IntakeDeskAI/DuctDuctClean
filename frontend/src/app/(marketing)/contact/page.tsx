import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import ContactForm from "@/components/layout/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get a free quote for air duct cleaning, dryer vent cleaning, or window washing in Idaho Falls, ID. Call (208) 701-5502 or fill out our contact form.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-2">
            Get In Touch
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
            Ready for cleaner air? Reach out for a free, no-obligation quote.
            We typically respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
                Request a Free Quote
              </h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we&apos;ll get back to you with a
                detailed estimate.
              </p>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <ContactForm />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
                Other Ways to Reach Us
              </h2>
              <p className="text-gray-600 mb-8">
                Prefer to talk? Give us a call or send an email. We&apos;re
                happy to answer any questions.
              </p>

              <div className="space-y-6 mb-10">
                <a
                  href={`tel:${siteConfig.contact.phoneTel}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Call Us</p>
                    <p className="font-semibold text-gray-900">
                      {siteConfig.contact.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                >
                  <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Us</p>
                    <p className="font-semibold text-gray-900">
                      {siteConfig.contact.email}
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
                  <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold text-gray-900">
                      {siteConfig.contact.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200">
                  <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Hours</p>
                    <p className="font-semibold text-gray-900">
                      {siteConfig.hours.display}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-bold font-display text-gray-900 mb-4">
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {siteConfig.location.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 border border-gray-200"
                    >
                      <MapPin className="h-3 w-3 text-brand-500" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-96">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46539.36507911498!2d-112.07147565!3d43.49165705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53545a4e63c43ad3%3A0x3b2b5da3eb133ea8!2sIdaho%20Falls%2C%20ID!5e0!3m2!1sen!2sus!4v1700000000000"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="DuctDuctClean location - Idaho Falls, ID"
        />
      </section>
    </>
  );
}
