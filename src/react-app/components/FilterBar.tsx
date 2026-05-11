import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/react-app/components/ui/select";
import { turkishCities } from "@/data/restaurants";

interface FilterBarProps {
  searchQuery: string; onSearchChange: (v: string) => void;
  selectedCity: string; onCityChange: (v: string) => void;
  selectedRating: string; onRatingChange: (v: string) => void;
  selectedUser: string; onUserChange: (v: string) => void;
  users: string[];
  sortBy: string; onSortChange: (v: string) => void;
  resultCount: number;
}

export function FilterBar({
  searchQuery, onSearchChange,
  selectedCity, onCityChange,
  selectedRating, onRatingChange,
  selectedUser, onUserChange,
  users, sortBy, onSortChange, resultCount,
}: FilterBarProps) {
  const hasFilters = selectedCity || selectedRating || selectedUser || searchQuery;

  const clearFilters = () => {
    onSearchChange(""); onCityChange(""); onRatingChange(""); onUserChange("");
  };

  const selectCls = "bg-white border-border rounded-lg h-10 text-sm";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Restoran, şehir veya yemek türü ara..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 h-10 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger className={`w-full sm:w-40 ${selectCls}`}>
            <SelectValue placeholder="Şehir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Şehirler</SelectItem>
            {turkishCities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedRating} onValueChange={onRatingChange}>
          <SelectTrigger className={`w-full sm:w-36 ${selectCls}`}>
            <SelectValue placeholder="Puan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Puanlar</SelectItem>
            <SelectItem value="5">⭐ 5 Yıldız</SelectItem>
            <SelectItem value="4">⭐ 4+ Yıldız</SelectItem>
            <SelectItem value="3">⭐ 3+ Yıldız</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedUser} onValueChange={onUserChange}>
          <SelectTrigger className={`w-full sm:w-40 ${selectCls}`}>
            <SelectValue placeholder="Ekleyen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Ekip</SelectItem>
            {users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className={`w-full sm:w-40 ${selectCls}`}>
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">En Yeni</SelectItem>
            <SelectItem value="rating">En Yüksek Puan</SelectItem>
            <SelectItem value="name">İsme Göre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Result info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{resultCount}</span> restoran
          </span>
          {hasFilters && (
            <>
              <span className="text-border">•</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive gap-1">
                <X size={11} /> Temizle
              </Button>
            </>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {selectedCity && selectedCity !== "all" && (
            <Badge variant="secondary" className="text-xs rounded-md">{selectedCity}</Badge>
          )}
          {selectedRating && selectedRating !== "all" && (
            <Badge variant="secondary" className="text-xs rounded-md">{selectedRating}+ ⭐</Badge>
          )}
          {selectedUser && selectedUser !== "all" && (
            <Badge variant="secondary" className="text-xs rounded-md">{selectedUser}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}
