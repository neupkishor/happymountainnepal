export interface Tour {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: string;
  type: 'Trek' | 'Tour' | 'Peak Climbing';
  difficulty: 'Easy' | 'Moderate' | 'Strenuous' | 'Challenging';
  duration: number; // in days
  price: number;
  mainImage: string;
  images: string[];
  itinerary: { day: number; title: string; description:string }[];
  inclusions: string[];
  exclusions: string[];
  departureDates: { date: string; price: number; guaranteed: boolean }[];
  mapImage: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  author: string;
  comment: string;
  date: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface Destination {
  name: string;
  image: string;
  tourCount: number;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  description: string;
}
