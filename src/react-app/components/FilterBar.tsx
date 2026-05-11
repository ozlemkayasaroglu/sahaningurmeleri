import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/react-app/components/ui/input";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import { turkishCities } from "@/data/restaurants";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedRating: string;
  onRatingChange: (rating: string) => void;
  selectedUser: string;
  onUserChange: (user: string) => void;
  users: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedRating,
  onRatingChange,
  selectedUser,
  onUserChange,
  users,
  sortBy,
  onSortChange,
  resultCount
}: FilterBarProps) {
  const hasFilters = selectedCity || selectedRating || selectedUser || searchQuery;

  const clearFilters = () => {
    onSearchChange("");
    onCityChange("");
    onRatingChange("");
    onUserChange("");
  };

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Restoran veya şehir ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border/50 rounded-xl h-11"
          />
        </div>

        {/* City Filter */}
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50 rounded-xl h-11">
            <SelectValue placeholder="Şehir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            {turkishCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select value={selectedRating} onValueChange={onRatingChange}>
          <SelectTrigger className="w-full sm:w-36 bg-card border-border/50 rounded-xl h-11">
            <SelectValue placeholder="Puan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Puanlar</SelectItem>
            <SelectItem value="5">⭐ 5 Yıldız</SelectItem>
            <SelectItem value="4">⭐ 4+ Yıldız</SelectItem>
            <SelectItem value="3">⭐ 3+ Yıldız</SelectItem>
          </SelectContent>
        </Select>

        {/* User Filter */}
        <Select value={selectedUser} onValueChange={onUserChange}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50 rounded-xl h-11">
            <SelectValue placeholder="Ekleyen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Ekipler</SelectItem>
            {users.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-44 bg-card border-border/50 rounded-xl h-11">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En Yeni</SelectItem>
            <SelectItem value="rating">En Yüksek Puan</SelectItem>
            <SelectItem value="name">İsme Göre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters and result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span> restoran bulundu
          </span>
          
          {hasFilters && (
            <>
              <span className="text-muted-foreground">•</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <X size={12} className="mr-1" />
                Filtreleri Temizle
              </Button>
            </>
          )}
        </div>

        {/* Active filter badges */}
        <div className="hidden sm:flex items-center gap-2">
          {selectedCity && selectedCity !== "all" && (
            <Badge variant="secondary" className="rounded-lg">
              {selectedCity}
            </Badge>
          )}
          {selectedRating && selectedRating !== "all" && (
            <Badge variant="secondary" className="rounded-lg">
              {selectedRating}+ Yıldız
            </Badge>
          )}
          {selectedUser && selectedUser !== "all" && (
            <Badge variant="secondary" className="rounded-lg">
              {selectedUser}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
