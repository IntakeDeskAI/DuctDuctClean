"use client";

import { trackPhoneClick } from "@/lib/analytics";

interface PhoneLinkProps {
  href: string;
  children: React.ReactNode;
  location: string;
  className?: string;
}

export default function PhoneLink({
  href,
  children,
  location,
  className,
}: PhoneLinkProps) {
  return (
    <a
      href={href}
      onClick={() => trackPhoneClick(location)}
      className={className}
    >
      {children}
    </a>
  );
}
