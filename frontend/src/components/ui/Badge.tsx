const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  const colors = statusColors[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors}`}
    >
      {status}
    </span>
  );
}
