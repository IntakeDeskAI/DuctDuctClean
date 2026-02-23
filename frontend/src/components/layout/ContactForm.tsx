"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import {
  contactSchema,
  type ContactFormData,
} from "@/lib/validations/contact";

const inputStyles =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormData) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSubmitted(true);
      reset();
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-accent-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-display text-gray-900">
          Thank You!
        </h3>
        <p className="mt-2 text-gray-600">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          placeholder="John Smith"
          className={inputStyles}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john@example.com"
            className={inputStyles}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="(208) 555-1234"
            className={inputStyles}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Street Address *
        </label>
        <input
          id="address"
          type="text"
          {...register("address")}
          placeholder="123 Main St, Idaho Falls, ID"
          className={inputStyles}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="serviceType"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Service Needed *
        </label>
        <select
          id="serviceType"
          {...register("serviceType")}
          className={`${inputStyles} text-gray-500`}
          defaultValue=""
        >
          <option value="" disabled>
            Select a service
          </option>
          <option value="residential">Residential Duct Cleaning</option>
          <option value="commercial">Commercial HVAC Vent Cleaning</option>
          <option value="dryer-vent">Dryer Vent Cleaning</option>
          <option value="window-washing">Window Washing</option>
        </select>
        {errors.serviceType && (
          <p className="mt-1 text-xs text-red-600">
            {errors.serviceType.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          {...register("message")}
          placeholder="Tell us about your property or any specific concerns..."
          className={inputStyles}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Request Free Quote
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
