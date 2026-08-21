import { useEffect, useRef, useState } from "react";
import { X, Star, Camera, Loader2, AtSign } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { CreateReviewInput } from "@/shared/types";
import { fetchUsers, type Review, type TaggableUser } from "@/data/restaurants";

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
    photoUrl: "",
  };

  const [form, setForm] = useState<CreateReviewInput>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateReviewInput, string>>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [users, setUsers] = useState<TaggableUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  if (!open) return null;

  const mentionMatches =
    mentionQuery === null
      ? []
      : users.filter((u) => u.name.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursor = e.target.selectionStart ?? value.length;
    setForm((prev) => ({ ...prev, comment: value }));

    const beforeCursor = value.slice(0, cursor);
    const match = beforeCursor.match(/(?:^|\s)@([\p{L}0-9]*)$/u);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[1].length - 1);
    } else {
      setMentionQuery(null);
      setMentionStart(null);
    }
  };

  const insertMention = (name: string) => {
    if (mentionStart === null) return;
    const cursor = textareaRef.current?.selectionStart ?? form.comment.length;
    const before = form.comment.slice(0, mentionStart);
    const after = form.comment.slice(cursor);
    const newValue = `${before}@${name} ${after}`;
    setForm((prev) => ({ ...prev, comment: newValue }));
    setMentionQuery(null);
    setMentionStart(null);
    requestAnimationFrame(() => {
      const pos = before.length + name.length + 2;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos, pos);
    });
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
      setForm((prev) => ({ ...prev, photoUrl: data.url }));
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Fotoğraf yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

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

          <div className="space-y-1.5 relative">
            <label className="text-sm font-medium text-foreground">Yorum <span className="text-destructive">*</span></label>
            <textarea
              ref={textareaRef}
              value={form.comment}
              onChange={handleCommentChange}
              onBlur={() => setTimeout(() => setMentionQuery(null), 150)}
              placeholder="Bu restoran hakkında düşünceleriniz — birini etiketlemek için @ yazın"
              rows={4}
              className={`w-full px-3 py-2 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none ${errors.comment ? "border-destructive" : "border-border"}`}
            />
            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
            {mentionQuery !== null && mentionMatches.length > 0 && (
              <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                {mentionMatches.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMention(u.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors"
                  >
                    <AtSign className="w-3.5 h-3.5 text-primary shrink-0" />
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={loading || uploading}>
              {loading ? "Gönderiliyor..." : "Yorum Gönder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
