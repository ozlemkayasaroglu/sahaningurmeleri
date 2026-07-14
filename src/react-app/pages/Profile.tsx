import { useAuth } from "@/react-app/context/AuthContext";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  LogOut,
  Mail,
  Calendar,
  Star,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useState, useEffect, type FormEvent } from "react";
import type { Restaurant } from "@/data/restaurants";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { user, logout, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatar_url ?? "");
    }
  }, [user]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/restaurants");
      if (!response.ok) throw new Error("Restoranlar alınamadı");
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar_url: avatarUrl.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Profil kaydedilemedi");
      }

      await fetchUser();
      setProfileMessage("Profil güncellendi.");
      fetchRestaurants();
    } catch (error) {
      console.error(error);
      setProfileMessage((error as Error).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string) => {
    if (!window.confirm("Bu restoranı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Restoran silinemedi");
      }
      setRestaurants((current) =>
        current.filter((restaurant) => restaurant.id !== restaurantId),
      );
      setProfileMessage("Restoran silindi.");
    } catch (error) {
      console.error(error);
      setProfileMessage((error as Error).message);
    }
  };

  const myRestaurants = restaurants.filter((r) => r.addedBy === user?.name);
  const myRatedRestaurants = myRestaurants.filter(
    (r) => (r.reviewCount ?? 0) > 0,
  );
  const avgRating =
    myRatedRestaurants.length > 0
      ? (
          myRatedRestaurants.reduce((s, r) => s + (r.averageRating ?? 0), 0) /
          myRatedRestaurants.length
        ).toFixed(1)
      : "—";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </button>

            <img
              src="/hakanlogo.png"
              alt="Hakan Makina"
              className="h-16 w-auto"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive hover:text-white hover:border-destructive text-xs"
            >
              {loggingOut ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Çıkış Yap</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="hm-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-5">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/30 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shrink-0">
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <div className="flex items-center gap-1.5 text-white/75 text-sm mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>
              {user?.created_at && (
                <div className="flex items-center gap-1.5 text-white/60 text-xs mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(user.created_at)} tarihinden beri üye</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">
                Profil Bilgileri
              </h2>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Profil Fotoğraf URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                {profileMessage ? (
                  <div className="rounded-xl border border-border p-3 text-sm text-foreground bg-muted/30">
                    {profileMessage}
                  </div>
                ) : null}
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-lg hm-gradient text-white border-0"
                >
                  {savingProfile ? "Kaydediliyor..." : "Profili Güncelle"}
                </Button>
              </form>
            </div>

            {/* My Restaurants — sadece şirket personeli restoran ekleyebildiği için müşterilere gösterilmez */}
            {user?.role === "staff" && (
              <div>
                <h2 className="text-base font-semibold text-foreground mb-3">
                  Eklediğim Restoranlar
                </h2>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl border border-border p-4 animate-pulse"
                      >
                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : myRestaurants.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <UtensilsCrossed className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">
                      Henüz restoran eklemediniz
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Ana sayfadan yeni bir restoran ekleyebilirsiniz.
                    </p>
                    <Button
                      onClick={() => navigate("/")}
                      size="sm"
                      className="mt-4 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg hover:scale-105 border-0 rounded-lg font-semibold"
                    >
                      Restoran Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myRestaurants.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {r.photoUrl ? (
                            <img
                              src={r.photoUrl}
                              alt={r.name}
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-lg hm-gradient-subtle border border-primary/15 flex items-center justify-center shrink-0">
                              <UtensilsCrossed className="w-6 h-6 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground truncate text-sm">
                                {r.name}
                              </h3>
                              {(r.reviewCount ?? 0) > 0 ? (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-semibold text-foreground">
                                    {r.averageRating?.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground shrink-0">
                                  Henüz yorum yok
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {r.district}, {r.city} · {r.foodType}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(r.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRestaurant(r.id)}
                          className="self-start sm:self-auto rounded-lg"
                        >
                          Sil
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {/* Stats — yalnızca şirket personeli restoran ekleyebildiği için müşterilere gösterilmez */}
            {user?.role === "staff" && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: UtensilsCrossed,
                    val: loading ? "—" : myRestaurants.length,
                    lbl: "Eklenen Restoran",
                    color: "text-primary",
                    bg: "bg-primary/8",
                  },
                  {
                    icon: Star,
                    val: loading ? "—" : avgRating,
                    lbl: "Ortalama Puan",
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                  },
                  {
                    icon: MapPin,
                    val: loading
                      ? "—"
                      : new Set(myRestaurants.map((r) => r.city)).size,
                    lbl: "Farklı Şehir",
                    color: "text-accent",
                    bg: "bg-accent/8",
                  },
                ].map((s) => (
                  <div
                    key={s.lbl}
                    className="bg-white rounded-xl border border-border p-4 text-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}
                    >
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {s.val}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.lbl}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-destructive/20 p-5">
              <h3 className="font-semibold text-foreground mb-1">
                Hesap İşlemleri
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Oturumunuzu güvenli bir şekilde sonlandırın.
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
              >
                {loggingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Çıkış yapılıyor...
                  </span>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
