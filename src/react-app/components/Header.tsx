import { MapPin, Plus, List, Map, User } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface HeaderProps {
  activeView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  onAddClick: () => void;
}

export function Header({ activeView, onViewChange, onAddClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Saha Günlüğü</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Restoran Keşif Platformu</p>
            </div>
          </div>

          {/* Center - View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            <Button
              variant={activeView === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("list")}
              className={`rounded-lg px-4 ${activeView === "list" ? "bg-card shadow-sm" : ""}`}
            >
              <List size={16} className="mr-2" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
            <Button
              variant={activeView === "map" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onViewChange("map")}
              className={`rounded-lg px-4 ${activeView === "map" ? "bg-card shadow-sm" : ""}`}
            >
              <Map size={16} className="mr-2" />
              <span className="hidden sm:inline">Harita</span>
            </Button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddClick}
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Plus size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Restoran Ekle</span>
            </Button>
            
            <div className="hidden md:flex items-center gap-2 ml-2 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground leading-none">Ahmet Y.</p>
                <p className="text-xs text-muted-foreground">Satış Temsilcisi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
