import type { TrustStat } from "@/lib/types";

export function StatCard({ value, label, accentGold = false }: TrustStat & { accentGold?: boolean }) {
  return (
    <div className="bg-navy px-[22px] py-6">
      <div className={`font-display text-[30px] ${accentGold ? "text-gold" : "text-white"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[12.5px] text-white/65">{label}</div>
    </div>
  );
}
