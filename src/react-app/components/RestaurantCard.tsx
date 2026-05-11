import { Star, MapPin, Navigation, User, Clock } from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";
import type { Restaurant } from "@/data/restaurants";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}
        />
      ))}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const hasCoords = restaurant.lat !== 0 && restaurant.lng !== 0;
  const destination = hasCoords
    ? `${restaurant.lat},${restaurant.lng}`
    : encodeURIComponent(`${restaurant.name}, ${restaurant.district}, ${restaurant.city}`);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  return (
    <div className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col">
      {/* Image */}
      {restaurant.photoUrl ? (
        <div className="relative h-40 overflow-hidden shrink-0">
          <img
            src={restaurant.photoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <Badge className="absolute top-2.5 left-2.5 bg-white text-foreground text-xs font-medium shadow-sm border-0">
            {restaurant.foodType}
          </Badge>
        </div>
      ) : (
        <div className="h-20 hm-gradient-subtle border-b border-border flex items-center justify-center shrink-0">
          <Badge className="bg-white text-foreground text-xs font-medium shadow-sm border border-border">
            {restaurant.foodType}
          </Badge>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Name + rating */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <StarRating rating={restaurant.rating} />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin size={11} className="shrink-0" />
            <span>{restaurant.district}, {restaurant.city}</span>
          </div>
        </div>

        {/* Comment */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
          "{restaurant.comment}"
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={10} className="text-primary" />
            </div>
            <span className="font-medium text-foreground">{restaurant.addedBy}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Clock size={10} />
            <span>{formatDate(restaurant.createdAt)}</span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all"
        >
          <Navigation size={12} />
          Yol Tarifi Al
        </a>
      </div>
    </div>
  );
}
