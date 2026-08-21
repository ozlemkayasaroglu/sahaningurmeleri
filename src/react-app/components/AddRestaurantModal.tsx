import { useRef, useState } from "react";
import { X, MapPin, Camera, Loader2 } from "lucide-react";
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
    comment: "",
    addedBy: autoName,
    lat: 0,
    lng: 0,
    photoUrl: "",
  };

  const [form, setForm] = useState<CreateRestaurantInput>({ ...initialForm, addedBy: autoName });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRestaurantInput, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setForm({ name: "", city: "", district: "", foodType: "", comment: "", addedBy: autoName, lat: 0, lng: 0, photoUrl: "" });
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

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Yükleme başarısız");
      }
      set("photoUrl", data.url);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
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
              <p className="text-xs text-muted-foreground">Yeni bir keşif paylaş. Puanlama, ekibin bırakacağı yorumların ortalamasıyla oluşur.</p>
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

          {/* Fotoğraf */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Fotoğraf <span className="text-muted-foreground text-xs font-normal">(isteğe bağlı)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            {form.photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={form.photoUrl} alt="Seçilen fotoğraf" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => set("photoUrl", "")}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-3 py-4 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Fotoğraf çek veya galeriden seç
                  </>
                )}
              </button>
            )}
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
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
              disabled={loading || uploading}
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
