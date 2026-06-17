import { useEffect, useRef } from "react";
import type { Restaurant } from "@/data/restaurants";

// Türkiye şehir koordinatları (koordinatsız restoranlar için fallback)
const cityCoords: Record<string, [number, number]> = {
  "Adana": [37.0, 35.3213], "Adıyaman": [37.7648, 38.2786], "Afyonkarahisar": [38.7507, 30.5567],
  "Ağrı": [39.7191, 43.0503], "Aksaray": [38.3687, 34.0370], "Amasya": [40.6499, 35.8353],
  "Ankara": [39.9334, 32.8597], "Antalya": [36.8841, 30.7056], "Ardahan": [41.1105, 42.7022],
  "Artvin": [41.1828, 41.8183], "Aydın": [37.8444, 27.8458], "Balıkesir": [39.6484, 27.8826],
  "Bartın": [41.6344, 32.3375], "Batman": [37.8812, 41.1351], "Bayburt": [40.2552, 40.2249],
  "Bilecik": [40.1506, 29.9792], "Bingöl": [38.8854, 40.4983], "Bitlis": [38.4006, 42.1095],
  "Bolu": [40.7359, 31.6061], "Burdur": [37.7260, 30.2906], "Bursa": [40.1826, 29.0665],
  "Çanakkale": [40.1553, 26.4142], "Çankırı": [40.6013, 33.6134], "Çorum": [40.5506, 34.9556],
  "Denizli": [37.7765, 29.0864], "Diyarbakır": [37.9144, 40.2306], "Düzce": [40.8438, 31.1565],
  "Edirne": [41.6818, 26.5623], "Elazığ": [38.6810, 39.2264], "Erzincan": [39.7500, 39.5000],
  "Erzurum": [39.9043, 41.2679], "Eskişehir": [39.7767, 30.5206], "Gaziantep": [37.0662, 37.3833],
  "Giresun": [40.9128, 38.3895], "Gümüşhane": [40.4386, 39.4814], "Hakkari": [37.5744, 43.7408],
  "Hatay": [36.4018, 36.3498], "Iğdır": [39.9167, 44.0333], "Isparta": [37.7648, 30.5566],
  "İstanbul": [41.0082, 28.9784], "İzmir": [38.4192, 27.1287],
  "Kahramanmaraş": [37.5858, 36.9371], "Karabük": [41.2061, 32.6204],
  "Karaman": [37.1759, 33.2287], "Kars": [40.6167, 43.1000], "Kastamonu": [41.3887, 33.7827],
  "Kayseri": [38.7312, 35.4787], "Kırıkkale": [39.8468, 33.5153], "Kırklareli": [41.7333, 27.2167],
  "Kırşehir": [39.1425, 34.1709], "Kilis": [36.7184, 37.1212], "Kocaeli": [40.8533, 29.8815],
  "Konya": [37.8714, 32.4846], "Kütahya": [39.4167, 29.9833], "Malatya": [38.3552, 38.3095],
  "Manisa": [38.6191, 27.4289], "Mardin": [37.3212, 40.7245], "Mersin": [36.8000, 34.6333],
  "Muğla": [37.2153, 28.3636], "Muş": [38.7432, 41.4914], "Nevşehir": [38.6939, 34.6857],
  "Niğde": [37.9667, 34.6833], "Ordu": [40.9862, 37.8797], "Osmaniye": [37.0742, 36.2464],
  "Rize": [41.0201, 40.5234], "Sakarya": [40.7731, 30.3948], "Samsun": [41.2867, 36.3300],
  "Siirt": [37.9333, 41.9500], "Sinop": [42.0231, 35.1531], "Sivas": [39.7477, 37.0179],
  "Şanlıurfa": [37.1591, 38.7969], "Şırnak": [37.5164, 42.4611], "Tekirdağ": [40.9833, 27.5167],
  "Tokat": [40.3167, 36.5500], "Trabzon": [41.0015, 39.7178], "Tunceli": [39.1079, 39.5480],
  "Uşak": [38.6823, 29.4082], "Van": [38.4891, 43.4089], "Yalova": [40.6500, 29.2667],
  "Yozgat": [39.8181, 34.8147], "Zonguldak": [41.4564, 31.7987],
};

interface RestaurantMapProps {
  restaurants: Restaurant[];
  onMarkerClick?: (restaurant: Restaurant) => void;
}

export function RestaurantMap({ restaurants, onMarkerClick }: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Leaflet'i dynamic import ile yükle (SSR sorunlarını önlemek için)
    import("leaflet").then((L) => {
      // Eğer map zaten oluşturulduysa temizle
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Leaflet default icon fix
      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Haritayı oluştur — Türkiye merkezi
      const map = L.map(mapRef.current!, {
        center: [39.0, 35.0],
        zoom: 6,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap tile layer (ücretsiz)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Özel marker ikonu
      const createIcon = (rating: number) => {
        const color = rating >= 5 ? "#204080" : rating >= 4 ? "#0090c0" : "#64748b";
        return L.divIcon({
          className: "",
          html: `
            <div style="
              background: ${color};
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: 13px;
                font-weight: bold;
                color: white;
                display: block;
                text-align: center;
                line-height: 26px;
              ">${rating}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });
      };

      // Her restoran için marker ekle
      restaurants.forEach((r) => {
        // Koordinat yoksa şehir merkezini kullan
        let lat = r.lat;
        let lng = r.lng;
        if (!lat || !lng || (lat === 0 && lng === 0)) {
          const coords = cityCoords[r.city];
          if (!coords) return; // şehir bulunamazsa atla
          lat = coords[0];
          lng = coords[1];
        }

        const marker = L.marker([lat, lng], { icon: createIcon(r.rating) });

        // Popup içeriği
        const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
        marker.bindPopup(`
          <div style="min-width: 180px; font-family: Inter, sans-serif;">
            ${r.photoUrl ? `<img src="${r.photoUrl}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ""}
            <div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:2px;">${r.name}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:4px;">📍 ${r.district}, ${r.city}</div>
            <div style="font-size:12px;color:#f59e0b;margin-bottom:4px;">${stars} <span style="color:#64748b">(${r.rating}/5)</span></div>
            <div style="font-size:11px;color:#475569;border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px;">
              🍽 ${r.foodType} &nbsp;·&nbsp; 👤 ${r.addedBy}
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
               target="_blank"
               style="display:block;margin-top:8px;padding:6px;background:#204080;color:white;text-align:center;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
              🧭 Yol Tarifi Al
            </a>
          </div>
        `, { maxWidth: 220 });

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(r));
        }

        marker.addTo(map);
      });

      // Eğer marker varsa hepsini gösterecek şekilde zoom yap
      if (restaurants.length > 0) {
        const validCoords: [number, number][] = restaurants
          .map((r) => {
            if (r.lat && r.lng && !(r.lat === 0 && r.lng === 0)) return [r.lat, r.lng] as [number, number];
            return cityCoords[r.city] ?? null;
          })
          .filter(Boolean) as [number, number][];

        if (validCoords.length > 0) {
          map.fitBounds(L.latLngBounds(validCoords), { padding: [40, 40], maxZoom: 12 });
        }
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [restaurants, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl"
      style={{ minHeight: "500px" }}
    />
  );
}
