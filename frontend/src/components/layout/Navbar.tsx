"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trackPhoneClick } from "@/lib/analytics";

const navLinks = [
  { label: "Home", href: "/", anchor: "#hero" },
  { label: "Services", href: "/services", anchor: "#services" },
  { label: "About", href: "/about", anchor: "#why-choose-us" },
  { label: "Blog", href: "/blog", anchor: null },
  { label: "Contact", href: "/contact", anchor: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  function getHref(link: (typeof navLinks)[number]) {
    if (isHome && link.anchor) return link.anchor;
    return link.href;
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="DuctDuctClean"
              width={44}
              height={44}
              className="h-11 w-auto"
            />
            <span className="text-xl font-bold font-display text-brand-900 hidden sm:block">
              DuctDuctClean
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              isHome && link.anchor ? (
                <a
                  key={link.label}
                  href={link.anchor}
                  className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-brand-600"
                      : "text-gray-600 hover:text-brand-600"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${siteConfig.contact.phoneTel}`}
              onClick={() => trackPhoneClick("navbar")}
              className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              <Phone className="h-4 w-4" />
              {siteConfig.contact.phone}
            </a>
            {isHome ? (
              <a
                href="#contact"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Get Free Quote
              </a>
            ) : (
              <Link
                href="/contact"
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Get Free Quote
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-6 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => {
                const href = getHref(link);
                const isAnchor = href.startsWith("#");
                return isAnchor ? (
                  <a
                    key={link.label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-3 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-3 text-sm font-medium rounded-lg ${
                      pathname === link.href
                        ? "text-brand-600 bg-brand-50"
                        : "text-gray-700 hover:bg-brand-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 px-3 flex flex-col gap-3">
                <a
                  href={`tel:${siteConfig.contact.phoneTel}`}
                  onClick={() => trackPhoneClick("navbar_mobile")}
                  className="flex items-center gap-2 text-sm font-medium text-brand-700"
                >
                  <Phone className="h-4 w-4" />
                  {siteConfig.contact.phone}
                </a>
                {isHome ? (
                  <a
                    href="#contact"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white text-center shadow-sm hover:bg-brand-700"
                  >
                    Get Free Quote
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white text-center shadow-sm hover:bg-brand-700"
                  >
                    Get Free Quote
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
