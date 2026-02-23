import { Star, ShieldCheck, FileCheck, Heart } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const reviews = [
  {
    name: "Sarah M.",
    location: "Idaho Falls, ID",
    rating: 5,
    text: "Amazing service! The team was professional, on time, and showed me before-and-after photos. My allergies have already improved since the cleaning.",
  },
  {
    name: "James R.",
    location: "Ammon, ID",
    rating: 5,
    text: "We use DuctDuctClean for all of our managed properties. Consistent quality, fair pricing, and great communication every time.",
  },
  {
    name: "Maria L.",
    location: "Rexburg, ID",
    rating: 5,
    text: "I had no idea how dirty our ducts were until they showed us. The difference in air quality is noticeable. Highly recommend to any homeowner.",
  },
  {
    name: "David K.",
    location: "Pocatello, ID",
    rating: 5,
    text: "They cleaned the ducts in our restaurant after hours without disrupting our business. Professional and thorough. Will use again.",
  },
  {
    name: "Jennifer T.",
    location: "Idaho Falls, ID",
    rating: 5,
    text: "From the initial phone call to the final walkthrough, everything was seamless. The technician explained every step of the process.",
  },
  {
    name: "Robert W.",
    location: "Shelley, ID",
    rating: 5,
    text: "Best investment we\u2019ve made for our home\u2019s air quality. Our energy bill even went down after the cleaning service.",
  },
];

const trustSignals = [
  {
    icon: ShieldCheck,
    title: "NADCA Certified",
    description: "Following industry best practices",
  },
  {
    icon: FileCheck,
    title: "Licensed & Insured",
    description: "Full liability coverage",
  },
  {
    icon: Heart,
    title: "Family-Owned",
    description: "Proudly based in Idaho Falls",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our Customers Say"
          description="Don't just take our word for it. Here's what real customers have to say about their experience."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <StarRating rating={review.rating} />
              <p className="mt-4 text-sm text-gray-700 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {review.name}
                </p>
                <p className="text-xs text-gray-500">{review.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-gray-200 pt-12">
          {trustSignals.map((signal) => (
            <div key={signal.title} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <signal.icon className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{signal.title}</p>
                <p className="text-sm text-gray-600">{signal.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
