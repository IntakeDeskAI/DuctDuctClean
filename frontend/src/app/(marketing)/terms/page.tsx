import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for DuctDuctClean air duct cleaning services in Idaho Falls, ID.",
};

export default function TermsPage() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: January 1, 2025
        </p>

        <div className="prose prose-gray max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Agreement to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using the DuctDuctClean website and services, you
              agree to be bound by these Terms of Service. If you do not agree
              with any part of these terms, please do not use our website or
              services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Services
            </h2>
            <p className="text-gray-600 leading-relaxed">
              DuctDuctClean provides air duct cleaning, dryer vent cleaning,
              commercial HVAC cleaning, and window washing services in the Idaho
              Falls, ID area. All services are subject to availability and
              scheduling. Quotes provided are estimates and final pricing may
              vary based on the actual scope of work required.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Scheduling and Cancellation
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We request at least 24 hours&apos; notice for cancellations or
              rescheduling. Appointments cancelled with less than 24 hours&apos;
              notice may be subject to a cancellation fee. We will make every
              effort to arrive within the scheduled time window, but delays may
              occur due to weather or other circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Payment
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Payment is due upon completion of services unless otherwise agreed
              upon in writing. We accept major credit cards, checks, and cash.
              Prices are subject to change without notice, but quoted prices will
              be honored for the agreed-upon service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Satisfaction Guarantee
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We stand behind the quality of our work. If you are not satisfied
              with our service, please contact us within 7 days and we will
              return to address any concerns at no additional charge.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              DuctDuctClean is fully licensed and insured. Our liability is
              limited to the cost of the services provided. We are not
              responsible for pre-existing conditions or damage to duct systems
              that are already in a state of disrepair. We will inform you of
              any issues discovered during our inspection before proceeding with
              work.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Website Use
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The content on this website is for general informational purposes
              only. We make reasonable efforts to keep the information accurate
              and up to date, but we make no warranties about the completeness
              or accuracy of this information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting to this page. Your
              continued use of our website and services constitutes acceptance of
              any changes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please
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
