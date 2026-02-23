"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const faqs = [
  {
    question: "How often should I have my air ducts cleaned?",
    answer:
      "The National Air Duct Cleaners Association (NADCA) recommends having your air ducts cleaned every 3 to 5 years. However, if you have pets, allergies, smokers in the home, or have recently completed renovations, more frequent cleaning may be beneficial.",
  },
  {
    question: "How long does a typical duct cleaning take?",
    answer:
      "A standard residential duct cleaning takes about 2 to 3 hours, depending on the size of your home and the number of vents. Commercial properties may take longer. We'll provide a time estimate when you book.",
  },
  {
    question: "Will duct cleaning make a mess in my home?",
    answer:
      "No. Our technicians use professional-grade equipment with HEPA filtration to contain all dust and debris. We protect your floors and furniture, and leave your home just as clean — or cleaner — than when we arrived.",
  },
  {
    question: "Do you offer any guarantees?",
    answer:
      "Yes. We offer a 100% satisfaction guarantee. If you're not completely satisfied with our work, we'll return and re-clean the affected areas at no additional charge.",
  },
  {
    question: "What's included in a free quote?",
    answer:
      "Our free quotes include a visual inspection of your duct system, an assessment of your home or building's needs, and a detailed written estimate with no hidden fees. There's absolutely no obligation.",
  },
  {
    question: "Are your technicians certified?",
    answer:
      "Yes. All of our technicians are NADCA-certified, fully licensed, insured, and undergo thorough background checks. We invest in ongoing training to ensure the highest quality service.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="Have questions? We have answers. Here are the most common things our customers ask."
        />

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
