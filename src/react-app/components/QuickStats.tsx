import { Utensils, MapPin, Star, Users } from "lucide-react";
import { Restaurant } from "@/data/restaurants";

interface QuickStatsProps {
  restaurants: Restaurant[];
}

export function QuickStats({ restaurants }: QuickStatsProps) {
  const total = restaurants.length;
  const cities = new Set(restaurants.map((r) => r.city)).size;
  const rated = restaurants.filter((r) => (r.reviewCount ?? 0) > 0);
  const avg =
    rated.length > 0
      ? (
          rated.reduce((a, r) => a + (r.averageRating ?? 0), 0) / rated.length
        ).toFixed(1)
      : "—";
  const members = new Set(restaurants.map((r) => r.addedBy)).size;

  const stats = [
    { icon: Utensils, value: total, label: "Restoran" },
    { icon: MapPin,   value: cities,  label: "Şehir"    },
    { icon: Star,     value: avg,     label: "Ort. Puan" },
    { icon: Users,    value: members, label: "Üye"       },
  ];

  return (
    <div className="flex items-center divide-x divide-white/15">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 px-3 first:pl-0 last:pr-0">
          <s.icon className="w-3.5 h-3.5 text-white/60 shrink-0" />
          <p className="text-sm font-semibold text-white leading-none">{s.value}</p>
          <p className="text-xs text-white/60 leading-none">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
