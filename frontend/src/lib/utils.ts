import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatDateRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}
