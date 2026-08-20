import { useEffect, useRef, useState } from "react";
import { Star, User, X, MessageCircle, Send } from "lucide-react";
import { fetchReviews, fetchUsers, postReply, Review, TaggableUser } from "@/data/restaurants";
import { useAuth } from "@/react-app/context/AuthContext";

interface ReviewsListModalProps {
  open: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  highlightReviewId?: string | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderCommentWithMentions(comment: string, users: TaggableUser[]) {
  const knownNames = users.map((u) => u.name).sort((a, b) => b.length - a.length);
  const pattern = knownNames.length
    ? new RegExp(`(@(?:${knownNames.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))`, "g")
    : /(@[\p{L}0-9]+)/gu;
  const parts = comment.split(pattern);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-primary font-medium">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function ReviewsListModal({
  open,
  onClose,
  restaurantId,
  restaurantName,
  highlightReviewId,
}: ReviewsListModalProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<TaggableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const highlightRef = useRef<HTMLDivElement>(null);

  const [replyOpenFor, setReplyOpenFor] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    try {
      const reply = await postReply(reviewId, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, replies: [...(r.replies ?? []), reply] } : r))
      );
      setReplyText("");
      setReplyOpenFor(null);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Yanıt gönderilirken bir hata oluştu.");
    } finally {
      setReplySubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchReviews(restaurantId)
      .then(setReviews)
      .finally(() => setLoading(false));
    fetchUsers().then(setUsers);
  }, [open, restaurantId]);

  useEffect(() => {
    if (!loading && highlightReviewId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, highlightReviewId]);

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
                ref={r.id === highlightReviewId ? highlightRef : undefined}
                className={`border rounded-xl p-4 space-y-2 transition-colors ${
                  r.id === highlightReviewId
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border"
                }`}
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
                  "{renderCommentWithMentions(r.comment, users)}"
                </p>
                {r.photoUrl && (
                  <img
                    src={r.photoUrl}
                    alt="Yorum fotoğrafı"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground/70">
                    {formatDate(r.createdAt)}
                  </p>
                  {user && (
                    <button
                      onClick={() => {
                        setReplyOpenFor(replyOpenFor === r.id ? null : r.id);
                        setReplyText("");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <MessageCircle size={12} />
                      Yanıtla
                    </button>
                  )}
                </div>

                {(r.replies?.length ?? 0) > 0 && (
                  <div className="pl-4 border-l-2 border-border space-y-2 mt-1">
                    {r.replies!.map((rep) => (
                      <div key={rep.id} className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{rep.addedBy}</span>
                          <span className="text-[11px] text-muted-foreground/70">{formatDate(rep.createdAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {renderCommentWithMentions(rep.comment, users)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {replyOpenFor === r.id && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      autoFocus
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleReplySubmit(r.id);
                        }
                      }}
                      placeholder="Bir yanıt yaz..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <button
                      onClick={() => handleReplySubmit(r.id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary/90 transition-colors"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
