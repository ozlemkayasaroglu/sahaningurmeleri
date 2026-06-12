import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { CreateReviewInput } from "@/shared/types";
import type { Review } from "@/data/restaurants";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  onSuccess: (review: Review) => void;
}

export function ReviewModal({ open, onClose, restaurantId, onSuccess }: ReviewModalProps) {
  const initialForm: CreateReviewInput = {
    rating: 5,
    comment: "",
  };

  const [form, setForm] = useState<CreateReviewInput>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateReviewInput, string>>>({});
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateReviewInput, string>> = {};
    if (!form.comment.trim()) newErrors.comment = "Yorum zorunludur";
    if (form.rating < 1 || form.rating > 5) newErrors.rating = "Geçerli bir puan seçiniz";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Yorum kaydedilemedi");
      }

      onSuccess(data as Review);
      setForm(initialForm);
      setErrors({});
      onClose();
    } catch (error) {
      console.error(error);
      alert("Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Restorana Yorum Yap</h2>
            <p className="text-xs text-muted-foreground">Daha önce eklenmiş restoran için puan ve yorum bırakın.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Puan</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: star }))}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${star <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{form.rating}/5</span>
            </div>
            {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Yorum <span className="text-destructive">*</span></label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Bu restoran hakkında düşünceleriniz"
              rows={4}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${errors.comment ? "border-destructive" : "border-border"}`}
            />
            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Yorum Gönder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
