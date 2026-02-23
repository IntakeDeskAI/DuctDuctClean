"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import ContactForm from "@/components/layout/ContactForm";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-brand-900 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-800/50 rounded-l-[4rem] hidden lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-2">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Schedule Your Free Inspection Today
          </h2>
          <p className="mt-4 text-lg text-brand-200">
            Limited Slots Available &mdash; Book Now!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <ContactForm />
          </div>

          {/* Right: Contact Info + Map */}
          <div className="space-y-8">
            <div className="space-y-6">
              <a
                href={`tel:${siteConfig.contact.phoneTel}`}
                className="flex items-center gap-4 text-white hover:text-brand-200 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-brand-300">Call Us</p>
                  <p className="font-semibold">{siteConfig.contact.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-4 text-white hover:text-brand-200 transition-colors"
              >
                <div className="h-12 w-12 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-brand-300">Email Us</p>
                  <p className="font-semibold">{siteConfig.contact.email}</p>
                </div>
              </a>

              <div className="flex items-center gap-4 text-white">
                <div className="h-12 w-12 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-brand-300">Location</p>
                  <p className="font-semibold">{siteConfig.contact.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white">
                <div className="h-12 w-12 rounded-xl bg-brand-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-brand-300">Business Hours</p>
                  <p className="font-semibold">{siteConfig.hours.display}</p>
                </div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-brand-700/30 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46539.36507911498!2d-112.07147565!3d43.49165705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x53545a4e63c43ad3%3A0x3b2b5da3eb133ea8!2sIdaho%20Falls%2C%20ID!5e0!3m2!1sen!2sus!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DuctDuctClean service area - Idaho Falls, ID"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
