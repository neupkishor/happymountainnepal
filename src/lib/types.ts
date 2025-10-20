import { Timestamp } from "firebase/firestore";

export interface Tour {
  id: string;
  slug: string;
  name: string;
  description: string;
  region: string[]; // Changed from string to string[]
  type: 'Trek' | 'Tour' | 'Peak Climbing';
  difficulty: 'Easy' | 'Moderate' | 'Strenuous' | 'Challenging';
  duration: number; // in days
  price: number; // Base price
  mainImage: string;
  images: string[];
  itinerary: { day: number; title: string; description:string }[];
  inclusions: string[];
  exclusions: string[];
  departureDates: { date: string | Timestamp; price: number; guaranteed: boolean }[];
  anyDateAvailable?: boolean; // New field for "Any Date" option
  map: string; // URL for an embedded map iframe (renamed from mapImage)
  reviews: Review[]; // This is for embedded reviews on tour pages
  status: 'draft' | 'published' | 'unpublished'; // Added status field
  faq: { question: string; answer: string }[]; // New field for Frequently Asked Questions
  additionalInfoSections?: { title: string; content: string }[]; // New field for additional info sections
  bookingType: 'internal' | 'external'; // New: How the tour is booked
  externalBookingUrl?: string; // New: URL for external booking if bookingType is 'external'
}

// Existing Review interface (for embedded reviews)
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
  authorPhoto: string; // New field for author's photo
  date: string | Timestamp;
  image: string;
  metaInformation?: string; // Keeping as string for keywords/short meta description
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
  fullName: string; // Added
  email: string;    // Added
  phone?: string;   // Added as optional based on backend.json
  ipAddress?: string; // Optional, if you log it
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

export interface FileUpload { // Renamed from MediaUpload
  id: string;
  fileName: string;
  url: string;
  userId: string;
  uploadedAt: string; // Changed from Timestamp to string
  fileSize?: number; // Added: Size of the uploaded file in bytes
  fileType?: string; // Added: MIME type of the uploaded file
  metaInformation?: Record<string, any>; // Added: Any additional metadata
}

// New Review types for the /manage/reviews section
export type ReviewType = 'onSite' | 'offSite';

export interface BaseReview {
  id: string;
  type: ReviewType;
  reviewedOn: Timestamp; // Date of the review
  userName: string;
  userRole?: string; // Added: Optional role/title of the reviewer
  reviewFor?: string | null; // packageId if applicable, can be null
  reviewBody: string;
  reviewMedia?: string[]; // Array of image URLs
  stars: 1 | 2 | 3 | 4 | 5;
}

export interface OnSiteReview extends BaseReview {
  type: 'onSite';
  userId: string; // ID of the user who left the review
  reviewFor: string; // Must be a packageId for on-site reviews
}

export interface OffSiteReview extends BaseReview {
  type: 'offSite';
  originalReviewUrl: string; // URL to the original review on an external platform
}

export type ManagedReview = OnSiteReview | OffSiteReview;