import type { Timestamp } from "firebase/firestore";

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
  departureDates: { date: string | Timestamp; price: number; guaranteed: boolean }[];
  mapImage: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  rating: number;
  author: string;
  comment: string;
  date: string | Timestamp;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string | Timestamp;
  image: string;
  metaInformation?: string;
  status: 'draft' | 'published';
}

export type TeamMember = {
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

export interface Account {
  id: string;
  ipAddress: string;
  createdAt: Timestamp;
}

export interface Activity {
  id: string;
  accountId: string;
  activityName: string;
  activityInfo: Record<string, any>;
  fromIp: string;
  fromLocation?: string; // This would typically require an external service
  activityTime: Timestamp;
}

export interface SiteError {
    id: string;
    message: string;
    stack?: string;
    componentStack?: string;
    pathname: string;
    createdAt: Timestamp;
    context?: Record<string, any>;
}

export interface MediaUpload {
  id: string;
  fileName: string;
  url: string;
  userId: string;
  uploadedAt: Timestamp;
}
