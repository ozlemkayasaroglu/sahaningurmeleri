import { Star, MapPin, Navigation, User, Clock, MessageCircle } from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";
import { Button } from "@/react-app/components/ui/button";
import type { Restaurant } from "@/data/restaurants";

function AverageRatingBadge({ averageRating, reviewCount }: { averageRating?: number; reviewCount?: number }) {
  if (!reviewCount) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-1 text-[11px] font-semibold text-primary shrink-0">
      <Star size={12} className="fill-primary text-primary" />
      {averageRating?.toFixed(1) ?? "—"}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

export function RestaurantCard({
  restaurant,
  onReview,
  canReview,
}: {
  restaurant: Restaurant;
  onReview?: () => void;
  canReview?: boolean;
}) {
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
            <AverageRatingBadge averageRating={restaurant.averageRating} reviewCount={restaurant.reviewCount} />
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
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={10} className="text-primary" />
              </div>
              <span className="font-medium text-foreground">{restaurant.addedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{formatDate(restaurant.createdAt)}</span>
            </div>
          </div>
          {typeof restaurant.reviewCount === "number" && restaurant.reviewCount > 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/10 px-2 py-1 text-[11px]">
                {restaurant.reviewCount} yorum
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Henüz yorum yok — ilk puanı sen ver!</div>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-2">
          {canReview && onReview ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center gap-2"
              onClick={onReview}
            >
              <MessageCircle size={14} />
              Yorum Yap
            </Button>
          ) : null}
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
    </div>
  );
}
