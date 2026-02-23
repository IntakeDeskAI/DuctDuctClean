import { CalendarCheck, ClipboardCheck, Sparkles, ThumbsUp } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const steps = [
  {
    icon: CalendarCheck,
    step: "01",
    title: "Book Online or Call",
    description:
      "Schedule your appointment online in minutes or give us a call. We offer flexible scheduling including weekends.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Free Inspection",
    description:
      "Our certified technician arrives on time, inspects your duct system, and provides an upfront quote — no hidden fees.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Professional Cleaning",
    description:
      "Using industry-leading equipment, we thoroughly clean your entire duct system. Most jobs completed in 2-3 hours.",
  },
  {
    icon: ThumbsUp,
    step: "04",
    title: "Breathe Easy",
    description:
      "Enjoy cleaner, healthier air immediately. We provide before-and-after photos so you can see the difference.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="Clean Air in 4 Simple Steps"
          description="We make duct cleaning easy. From booking to breathing cleaner air, here's what to expect."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[calc(100%-20%)] h-px bg-brand-200" />
              )}

              <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-600 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-brand-100">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
