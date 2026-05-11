import { Star, MapPin, Navigation, User, Clock } from "lucide-react";
import { Card, CardContent } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import type { Restaurant } from "@/data/restaurants";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= rating
              ? "fill-warning text-warning"
              : "fill-muted text-muted"
          }
        />
      ))}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`;

  return (
    <Card className="group overflow-hidden border-border/50 bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      {/* Image Section */}
      {restaurant.photoUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={restaurant.photoUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <Badge 
            className="absolute top-3 left-3 bg-white/90 text-foreground hover:bg-white/90 font-medium"
          >
            {restaurant.foodType}
          </Badge>
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
              {restaurant.name}
            </h3>
            <StarRating rating={restaurant.rating} />
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin size={14} className="shrink-0" />
            <span>{restaurant.district}, {restaurant.city}</span>
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          "{restaurant.comment}"
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={12} className="text-primary" />
              </div>
              <span className="font-medium">{restaurant.addedBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{formatDate(restaurant.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full mt-2 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation size={14} className="mr-2" />
            Yol Tarifi Al
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
