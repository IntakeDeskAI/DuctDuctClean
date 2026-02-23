import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";
import PhoneLink from "@/components/ui/PhoneLink";

const footerLinks = {
  services: [
    { label: "Residential Duct Cleaning", href: "/services#residential" },
    { label: "Commercial HVAC Vent Cleaning", href: "/services#commercial" },
    { label: "Dryer Vent Cleaning", href: "/services#dryer-vent" },
    { label: "Window Washing", href: "/services#window-washing" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/images/logo.png"
                alt="DuctDuctClean"
                width={40}
                height={40}
                className="h-10 w-auto brightness-200"
              />
              <span className="text-lg font-bold font-display text-white">
                DuctDuctClean
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-2 leading-relaxed">
              Professional air duct cleaning services you can trust. Breathe
              cleaner, healthier air in your home or business.
            </p>
            <p className="text-sm text-accent-400 font-medium mb-6">
              Family-Owned in Idaho Falls since {siteConfig.established}
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <PhoneLink
                href={`tel:${siteConfig.contact.phoneTel}`}
                location="footer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-brand-400" />
                {siteConfig.contact.phone}
              </PhoneLink>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 text-brand-400" />
                {siteConfig.contact.email}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-400 mt-0.5" />
                <span>{siteConfig.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} DuctDuctClean. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Licensed &amp; Insured | Serving Idaho Falls, Ammon, Rexburg,
            Pocatello &amp; Eastern Idaho
          </p>
        </div>
      </div>
    </footer>
  );
}
