export interface Restaurant {
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

export const foodTypes = [
  "Kebap",
  "Ev Yemekleri",
  "Fast Food",
  "Balık",
  "Pide & Lahmacun",
  "Kahvaltı",
  "Tatlı",
  "Cafe",
  "Dünya Mutfağı",
  "Diğer"
] as const;

export const turkishCities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
  "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
  "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne",
  "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun",
  "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri",
  "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya",
  "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde",
  "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak",
  "Van", "Yalova", "Yozgat", "Zonguldak"
] as const;

export async function fetchRestaurants(): Promise<Restaurant[]> {
  try {
    const response = await fetch('/api/restaurants');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
}
