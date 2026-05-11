import { useState, useMemo, useEffect } from "react";
import { Header } from "@/react-app/components/Header";
import { FilterBar } from "@/react-app/components/FilterBar";
import { RestaurantCard } from "@/react-app/components/RestaurantCard";
import { QuickStats } from "@/react-app/components/QuickStats";
import { fetchRestaurants, Restaurant } from "@/data/restaurants";
import { MapPin } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          r.district.toLowerCase().includes(query) ||
          r.foodType.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity && selectedCity !== "all") {
      result = result.filter((r) => r.city === selectedCity);
    }

    // Rating filter
    if (selectedRating && selectedRating !== "all") {
      const minRating = parseInt(selectedRating);
      result = result.filter((r) => r.rating >= minRating);
    }

    // User filter
    if (selectedUser && selectedUser !== "all") {
      result = result.filter((r) => r.addedBy === selectedUser);
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        break;
    }

    return result;
  }, [searchQuery, selectedCity, selectedRating, selectedUser, sortBy, restaurants]);

  const userOptions = useMemo(
    () => [...new Set(restaurants.map((restaurant) => restaurant.addedBy))],
    [restaurants]
  );

  const handleAddClick = () => {
    // TODO: Open add restaurant modal
    console.log("Add restaurant clicked");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Restoranlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-40 h-40 bg-primary/3 rounded-full blur-2xl" />
      </div>

      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        onAddClick={handleAddClick}
      />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Hoş Geldiniz! 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Ekibimizin keşfettiği en iyi restoranları görün ve paylaşın.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats restaurants={restaurants} />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
            {filteredRestaurants.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Restoran Bulunamadı
                </h3>
                <p className="text-muted-foreground mt-1">
                  Farklı filtreler deneyebilir veya yeni bir restoran ekleyebilirsiniz.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[500px] rounded-2xl border border-border/50 bg-card overflow-hidden flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Harita Yakında Aktif Olacak
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                Türkiye haritası üzerinde tüm restoranları görebilecek ve yol tarifi alabileceksiniz.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Saha Günlüğü — Satış Ekibi İçin
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              İç kullanım için hazırlanmıştır • 2024
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
