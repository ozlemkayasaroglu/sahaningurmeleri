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
    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-2">
          <s.icon className="w-4 h-4 text-white/80 shrink-0" />
          <div>
            <p className="text-base font-bold text-white leading-none">{s.value}</p>
            <p className="text-xs text-white/70 leading-none mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
