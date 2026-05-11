import { useState } from "react";
import { X, Star, MapPin } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { foodTypes, turkishCities, Restaurant } from "@/data/restaurants";
import { CreateRestaurantInput } from "@/shared/types";
import { useAuth } from "@/react-app/context/AuthContext";

interface AddRestaurantModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (restaurant: Restaurant) => void;
}

export function AddRestaurantModal({ open, onClose, onSuccess }: AddRestaurantModalProps) {
  const { user } = useAuth();
  const autoName = user?.name || user?.email || "";

  const initialForm: CreateRestaurantInput = {
    name: "",
    city: "",
    district: "",
    foodType: "",
    rating: 5,
    comment: "",
    addedBy: autoName,
    lat: 0,
    lng: 0,
    photoUrl: "",
  };

  const [form, setForm] = useState<CreateRestaurantInput>({ ...initialForm, addedBy: autoName });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRestaurantInput, string>>>({});

  if (!open) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRestaurantInput, string>> = {};
    if (!form.name.trim()) newErrors.name = "Restoran adı zorunludur";
    if (!form.city) newErrors.city = "Şehir seçiniz";
    if (!form.district.trim()) newErrors.district = "İlçe zorunludur";
    if (!form.foodType) newErrors.foodType = "Yemek türü seçiniz";
    if (!form.comment.trim()) newErrors.comment = "Yorum zorunludur";
    if (!form.addedBy.trim()) newErrors.addedBy = "İsminizi giriniz";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        photoUrl: form.photoUrl?.trim() || undefined,
      };
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Sunucu hatası");
      }

      const created: Restaurant = await response.json();
      onSuccess(created);
      setForm({ name: "", city: "", district: "", foodType: "", rating: 5, comment: "", addedBy: autoName, lat: 0, lng: 0, photoUrl: "" });
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
      alert("Restoran eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const set = <K extends keyof CreateRestaurantInput>(key: K, value: CreateRestaurantInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg hm-gradient flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Restoran Ekle</h2>
              <p className="text-xs text-muted-foreground">Yeni bir keşif paylaş</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Restoran Adı */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Restoran Adı <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="örn. Beyti Restaurant"
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.name ? "border-destructive" : "border-border"
              }`}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Şehir & İlçe */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Şehir <span className="text-destructive">*</span>
              </label>
              <select
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                  errors.city ? "border-destructive" : "border-border"
                }`}
              >
                <option value="">Seçiniz</option>
                {turkishCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                İlçe <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                placeholder="örn. Kadıköy"
                className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                  errors.district ? "border-destructive" : "border-border"
                }`}
              />
              {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
            </div>
          </div>

          {/* Yemek Türü */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Yemek Türü <span className="text-destructive">*</span>
            </label>
            <select
              value={form.foodType}
              onChange={(e) => set("foodType", e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.foodType ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">Seçiniz</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.foodType && <p className="text-xs text-destructive">{errors.foodType}</p>}
          </div>

          {/* Puan */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Puan</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => set("rating", star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= form.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{form.rating}/5</span>
            </div>
          </div>

          {/* Yorum */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Yorum <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
              placeholder="Bu restoranı neden öneriyorsunuz?"
              rows={3}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${
                errors.comment ? "border-destructive" : "border-border"
              }`}
            />
            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
          </div>

          {/* Fotoğraf URL */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Fotoğraf URL <span className="text-muted-foreground text-xs font-normal">(isteğe bağlı)</span>
            </label>
            <input
              type="url"
              value={form.photoUrl ?? ""}
              onChange={(e) => set("photoUrl", e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Ekleyen */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Adınız <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.addedBy}
              onChange={(e) => set("addedBy", e.target.value)}
              placeholder="örn. Ahmet Yılmaz"
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                errors.addedBy ? "border-destructive" : "border-border"
              }`}
            />
            {errors.addedBy && <p className="text-xs text-destructive">{errors.addedBy}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl hm-gradient text-white hover:opacity-90 border-0 shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Ekleniyor...
                </span>
              ) : (
                "Restoran Ekle"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
