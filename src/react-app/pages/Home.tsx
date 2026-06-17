import { useState, useMemo, useEffect } from "react";
import { Header } from "@/react-app/components/Header";
import { FilterBar } from "@/react-app/components/FilterBar";
import { RestaurantCard } from "@/react-app/components/RestaurantCard";
import { QuickStats } from "@/react-app/components/QuickStats";
import { AddRestaurantModal } from "@/react-app/components/AddRestaurantModal";
import { RestaurantMap } from "@/react-app/components/RestaurantMap";
import { fetchRestaurants, Restaurant } from "@/data/restaurants";
import { useAuth } from "@/react-app/context/AuthContext";
import { Search } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.foodType.toLowerCase().includes(q)
      );
    }
    if (selectedCity && selectedCity !== "all") result = result.filter((r) => r.city === selectedCity);
    if (selectedRating && selectedRating !== "all") result = result.filter((r) => r.rating >= parseInt(selectedRating));
    if (selectedUser && selectedUser !== "all") result = result.filter((r) => r.addedBy === selectedUser);
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name, "tr")); break;
    }
    return result;
  }, [searchQuery, selectedCity, selectedRating, selectedUser, sortBy, restaurants]);

  const userOptions = useMemo(() => [...new Set(restaurants.map((r) => r.addedBy))], [restaurants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Restoranlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "Hoş Geldiniz";

  return (
    <div className="min-h-screen bg-background">
      <Header activeView={activeView} onViewChange={setActiveView} onAddClick={() => setAddModalOpen(true)} />

      <AddRestaurantModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={(r) => setRestaurants((prev) => [r, ...prev])}
      />

      {/* Hero banner */}
      <div className="hm-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Merhaba, {firstName}! 👋
              </h2>
              <p className="text-white/75 mt-1 text-sm">
                Ekibimizin keşfettiği en iyi restoranları görün ve yeni yerler ekleyin.
              </p>
            </div>
            <QuickStats restaurants={restaurants} />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Filters */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
          users={userOptions}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredRestaurants.length}
        />

        {/* Content */}
        {activeView === "list" ? (
          filteredRestaurants.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Restoran Bulunamadı</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Farklı filtreler deneyin veya yeni bir restoran ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRestaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-xl border border-border overflow-hidden shadow-sm" style={{ height: "560px" }}>
            <RestaurantMap restaurants={filteredRestaurants} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/hakanlogo.png" alt="Hakan Makina" className="h-7 w-auto" />
              <span className="text-sm text-muted-foreground">Saha Günlüğü — Satış Ekibi İçin</span>
            </div>
            <p className="text-xs text-muted-foreground">İç kullanım için hazırlanmıştır • 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
