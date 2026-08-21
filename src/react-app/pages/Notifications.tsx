import { useEffect, useState } from "react";
import { ArrowLeft, AtSign } from "lucide-react";
import { useNavigate } from "react-router";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/data/notifications";

function formatRelative(d: string) {
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((data) => {
        setNotifications(data);
        if (data.some((n) => !n.read)) {
          markAllNotificationsRead();
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleItemClick = async (n: AppNotification) => {
    if (!n.read) {
      await markNotificationRead(n.id);
    }
    if (n.restaurantId) {
      const params = new URLSearchParams({ restaurant: n.restaurantId });
      if (n.reviewId) params.set("review", n.reviewId);
      navigate(`/?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Bildirimler</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-border p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <AtSign className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Henüz bildirimin yok.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`w-full text-left flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors ${
                  n.read ? "" : "bg-primary/5"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <AtSign size={14} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-snug">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelative(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
