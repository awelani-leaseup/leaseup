import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number | ReactNode;
  description: string;
}

export function StatCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`flex size-10 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <Icon className={`size-5 stroke-1 ${iconColor}`} />
        </div>
        <span className="text-[#7F8C8D]">{title}</span>
      </div>
      <h3 className="text-xl font-bold text-[#2D3436]">{value}</h3>
      <p className="mt-2 text-sm text-[#7F8C8D]">{description}</p>
    </div>
  );
}
