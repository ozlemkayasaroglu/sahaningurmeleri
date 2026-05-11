import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Restaurant interface
interface Restaurant {
  id: string;
  name: string;
  city: string;
  district: string;
  foodType: string;
  rating: number;
  comment: string;
  addedBy: string;
  addedByAvatar?: string;
  createdAt: string;
  lat: number;
  lng: number;
  photoUrl?: string;
}

// Stub data for now - later migrate to D1
const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Beyti Restaurant",
    city: "İstanbul",
    district: "Florya",
    foodType: "Kebap",
    rating: 5,
    comment: "Efsanevi Beyti kebabı! Müşteri toplantıları için ideal, servis çok profesyonel. Mangal kokularını yazıya dökemiyorum...",
    addedBy: "Ahmet Yılmaz",
    createdAt: "2024-01-15T10:30:00Z",
    lat: 40.9761,
    lng: 28.7894,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400"
  },
  {
    id: "2",
    name: "Çiya Sofrası",
    city: "İstanbul",
    district: "Kadıköy",
    foodType: "Ev Yemekleri",
    rating: 5,
    comment: "Anadolu mutfağının en iyisi. Her gün değişen menü, ev yapımı tatlar. Saha ziyareti sonrası moralleri düzeltiyor!",
    addedBy: "Elif Kaya",
    createdAt: "2024-01-14T12:00:00Z",
    lat: 40.9903,
    lng: 29.0289,
    photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400"
  },
  {
    id: "3",
    name: "İmam Çağdaş",
    city: "Gaziantep",
    district: "Şahinbey",
    foodType: "Kebap",
    rating: 5,
    comment: "Antep mutfağının kalbi! Lahmacun ve kebap seçenekleri muhteşem. Fıstıklı baklava ile bitirmeden kalkmayın.",
    addedBy: "Mehmet Demir",
    createdAt: "2024-01-12T14:30:00Z",
    lat: 37.0662,
    lng: 37.3833,
    photoUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400"
  },
  {
    id: "4",
    name: "Tarihi Süleymaniye Hamamı Restoran",
    city: "İstanbul",
    district: "Fatih",
    foodType: "Ev Yemekleri",
    rating: 4,
    comment: "Kuru fasulye pilav efsanesi! Hızlı öğle yemeği için mükemmel. Atmosfer tarihi ve samimi.",
    addedBy: "Zeynep Arslan",
    createdAt: "2024-01-10T11:00:00Z",
    lat: 41.0162,
    lng: 28.9639,
  }
];

// API Routes
app.get('/api/restaurants', (c) => {
  return c.json(restaurants);
});

export default app;
