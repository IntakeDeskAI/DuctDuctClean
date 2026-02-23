import {
  Phone,
  ArrowRight,
  Shield,
  Star,
  Clock,
  Percent,
  MapPin,
  Wind,
  Zap,
  Heart,
  AlertTriangle,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import PhoneLink from "@/components/ui/PhoneLink";

const trustBadges = [
  { icon: Shield, text: "Licensed & Insured" },
  { icon: Star, text: "5-Star Rated" },
  { icon: Clock, text: "Same-Day Service" },
];

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Promo Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 border border-accent-400/30 px-4 py-1.5 mb-6">
              <Percent className="h-4 w-4 text-accent-400" />
              <span className="text-sm font-semibold text-accent-300">
                10% Off First Cleaning for Idaho Falls Residents
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white leading-tight">
              Breathe Easier with Expert Air Duct Cleaning in Idaho Falls, ID
            </h1>

            <p className="mt-6 text-lg text-brand-100 leading-relaxed max-w-lg">
              Improve your home&apos;s air quality, reduce allergens, and boost
              HVAC efficiency. Serving Idaho Falls and East Idaho since{" "}
              {siteConfig.established}.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-brand-900 shadow-lg hover:bg-gray-50 transition-colors"
              >
                Get a Free Quote
                <ArrowRight className="h-4 w-4" />
              </a>
              <PhoneLink
                href={`tel:${siteConfig.contact.phoneTel}`}
                location="hero"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-400/30 bg-brand-800/50 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-700/50 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now: {siteConfig.contact.phone}
              </PhoneLink>
            </div>

            {/* Service Area */}
            <div className="mt-8 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-300 flex-shrink-0" />
              <span className="text-sm text-brand-200">
                Proudly Serving Idaho Falls, Ammon, and Surrounding Areas
              </span>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <badge.icon className="h-5 w-5 text-brand-300" />
                  <span className="text-sm text-brand-200">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side — Why Clean Your Ducts Stats */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="h-12 w-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                  <Wind className="h-6 w-6 text-accent-400" />
                </div>
                <p className="text-3xl font-bold text-white">2–5x</p>
                <p className="text-sm text-brand-200 mt-1">
                  Indoor air can be more polluted than outdoor air (EPA)
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="h-12 w-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent-400" />
                </div>
                <p className="text-3xl font-bold text-white">25–40%</p>
                <p className="text-sm text-brand-200 mt-1">
                  Energy wasted by HVAC systems with dirty ducts
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="h-12 w-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-accent-400" />
                </div>
                <p className="text-3xl font-bold text-white">40 lbs</p>
                <p className="text-sm text-brand-200 mt-1">
                  Dust created per year in an average 6-room home
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 p-6">
                <div className="h-12 w-12 rounded-xl bg-accent-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-accent-400" />
                </div>
                <p className="text-3xl font-bold text-white">2,900</p>
                <p className="text-sm text-brand-200 mt-1">
                  Home fires per year caused by clogged dryer vents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
