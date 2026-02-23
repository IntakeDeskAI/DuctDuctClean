import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for DuctDuctClean — how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: January 1, 2025
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Information We Collect
            </h2>
            <p className="text-gray-600 leading-relaxed">
              When you use our website or request a quote, we may collect the
              following information: your name, email address, phone number,
              street address, the type of service you&apos;re interested in, and
              any additional message you provide. We collect this information
              when you voluntarily submit it through our contact form or by
              contacting us directly.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              How We Use Your Information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              We use the information you provide to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Respond to your service inquiries and provide quotes</li>
              <li>Schedule and perform the services you request</li>
              <li>Communicate with you about your service appointments</li>
              <li>Improve our website and services</li>
              <li>Send you service reminders if you opt in</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Information Sharing
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information only with service providers
              who assist us in operating our website or conducting our business,
              and only when those parties agree to keep your information
              confidential.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We implement reasonable security measures to protect your personal
              information. However, no method of transmission over the internet
              or electronic storage is 100% secure. While we strive to use
              commercially acceptable means to protect your information, we
              cannot guarantee its absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Cookies
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our website may use cookies to enhance your browsing experience.
              Cookies are small files stored on your device that help us
              understand how you use our site. You can choose to disable cookies
              through your browser settings, though this may affect some website
              functionality.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Your Rights
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to request access to, correction of, or
              deletion of your personal information. To exercise these rights,
              please contact us using the information below.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="text-brand-600 hover:text-brand-700"
              >
                {siteConfig.contact.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${siteConfig.contact.phoneTel}`}
                className="text-brand-600 hover:text-brand-700"
              >
                {siteConfig.contact.phone}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
