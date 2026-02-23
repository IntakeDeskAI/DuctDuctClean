import { MapPin, Cog, ThumbsUp, Leaf } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const reasons = [
  {
    icon: MapPin,
    title: "Local Experts",
    description:
      "Based right here in Idaho Falls, we understand local HVAC challenges. We're your neighbors, not a franchise.",
  },
  {
    icon: Cog,
    title: "State-of-the-Art Equipment",
    description:
      "We use industry-leading HEPA-filtered vacuum systems and rotary brush technology for the deepest clean possible.",
  },
  {
    icon: ThumbsUp,
    title: "Satisfaction Guaranteed",
    description:
      "Not happy with our work? We'll come back and re-clean at no extra charge. 100% satisfaction or your money back.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Methods",
    description:
      "Our cleaning products are non-toxic and safe for your family, pets, and the environment. Green cleaning, real results.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title="Idaho Falls' Trusted Duct Cleaning Team"
          description="Combat Idaho's dust and pollen with a team that knows your home and your community."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
            >
              <div className="mx-auto h-14 w-14 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                <reason.icon className="h-7 w-7 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold font-display text-gray-900 mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Local Pain Point Callout */}
        <div className="mt-12 bg-brand-600 rounded-2xl p-8 text-center">
          <p className="text-lg font-semibold font-display text-white">
            Combat Idaho&apos;s Dust and Pollen Season
          </p>
          <p className="mt-2 text-brand-100 max-w-2xl mx-auto">
            Eastern Idaho&apos;s dry climate means dust, pollen, and debris
            constantly circulate through your HVAC system. Regular duct cleaning
            keeps your family breathing easy year-round.
          </p>
        </div>
      </div>
    </section>
  );
}
