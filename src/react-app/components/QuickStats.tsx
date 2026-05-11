import { Utensils, MapPin, Star, Users } from "lucide-react";
import { Restaurant } from "@/data/restaurants";

interface QuickStatsProps {
  restaurants: Restaurant[];
}

export function QuickStats({ restaurants }: QuickStatsProps) {
  const totalRestaurants = restaurants.length;
  const uniqueCities = new Set(restaurants.map(r => r.city)).size;
  const avgRating = totalRestaurants > 0 ? (restaurants.reduce((acc, r) => acc + r.rating, 0) / totalRestaurants).toFixed(1) : "0.0";
  const activeUsers = new Set(restaurants.map((r) => r.addedBy)).size;

  const stats = [
    {
      icon: Utensils,
      value: totalRestaurants,
      label: "Restoran",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      icon: MapPin,
      value: uniqueCities,
      label: "Şehir",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: Star,
      value: avgRating,
      label: "Ort. Puan",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: Users,
      value: activeUsers,
      label: "Ekip Üyesi",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
