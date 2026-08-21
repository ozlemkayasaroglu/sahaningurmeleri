import { Compass, Map, Plus, Bell, User as UserIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/react-app/context/AuthContext";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user || location.pathname === "/login") return null;

  const params = new URLSearchParams(location.search);
  const isHome = location.pathname === "/";
  const isMap = isHome && params.get("view") === "map";
  const isKesfet = isHome && !isMap;
  const isBildirimler = location.pathname === "/notifications";
  const isProfil = location.pathname === "/profile";

  const tabCls = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium transition-colors ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch h-14 max-w-2xl mx-auto">
        <button className={tabCls(isKesfet)} onClick={() => navigate("/")}>
          <Compass size={20} />
          Keşfet
        </button>
        <button className={tabCls(isMap)} onClick={() => navigate("/?view=map")}>
          <Map size={20} />
          Harita
        </button>
        {user.role === "staff" && (
          <button
            className="flex flex-col items-center justify-center flex-1 h-full"
            onClick={() => navigate("/?add=1")}
          >
            <span className="w-10 h-10 -mt-4 rounded-full hm-gradient shadow-md flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </span>
          </button>
        )}
        <button className={tabCls(isBildirimler)} onClick={() => navigate("/notifications")}>
          <Bell size={20} />
          Bildirimler
        </button>
        <button className={tabCls(isProfil)} onClick={() => navigate("/profile")}>
          <UserIcon size={20} />
          Profil
        </button>
      </div>
    </nav>
  );
}
