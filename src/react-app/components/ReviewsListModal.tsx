import { useEffect, useState } from "react";
import { Star, User, X } from "lucide-react";
import { fetchReviews, Review } from "@/data/restaurants";

interface ReviewsListModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsListModal({
  open,
  onClose,
  restaurantId,
  restaurantName,
}: ReviewsListModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchReviews(restaurantId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [open, restaurantId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white border border-border rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Yorumlar</h2>
            <p className="text-xs text-muted-foreground">{restaurantName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Henüz yorum yok.
            </p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="border border-border rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User size={13} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {r.addedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{r.comment}"
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {formatDate(r.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
