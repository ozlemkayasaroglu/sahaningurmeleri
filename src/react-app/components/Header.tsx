import { Plus, List, Map } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@/react-app/context/AuthContext";
import { useNavigate } from "react-router";

interface HeaderProps {
  activeView: "list" | "map";
  onViewChange: (view: "list" | "map") => void;
  onAddClick: () => void;
}

export function Header({ activeView, onViewChange, onAddClick }: HeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name?.split(" ")[0] ?? "";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/hakanlogo.png"
              alt="Hakan Makina"
              className="h-16 w-auto"
            />
            <div className="hidden lg:block w-px h-8 bg-border" />
            <div className="hidden lg:block">
              <p className="text-md font-semibold text-foreground leading-none">
                Saha Günlüğü
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Restoran Keşif Platformu
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
            <button
              onClick={() => onViewChange("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === "list"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List size={15} />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => onViewChange("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === "map"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map size={15} />
              <span className="hidden sm:inline">Harita</span>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onAddClick}
              size="sm"
              className="hm-gradient text-white hover:opacity-90 shadow-md border-0 rounded-lg font-medium"
            >
              <Plus size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Restoran Ekle</span>
            </Button>

            <button
              onClick={() => navigate("/profile")}
              className="hidden md:flex items-center gap-2.5 pl-3 border-l border-border hover:opacity-75 transition-opacity"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full hm-gradient flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground leading-none">
                  {firstName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Profilim</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
