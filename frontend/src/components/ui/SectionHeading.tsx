interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""} mb-12`}>
      {eyebrow && (
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold font-display text-gray-900">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
