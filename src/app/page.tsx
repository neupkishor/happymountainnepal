import { FeaturedTours } from "@/components/FeaturedTours";
import { HeroSection } from "@/components/HeroSection";
import { PopularPackages } from "@/components/PopularPackages";
import { WhyUs } from "@/components/WhyUs";
import { Testimonials } from "@/components/Testimonials";
import { RecentBlogs } from "@/components/RecentBlogs";
import { CustomizeTrip } from "@/components/CustomizeTrip";
import { FavoriteDestinations } from "@/components/FavoriteDestinations";
import { RecommendedTours } from "@/components/RecommendedTours";
import { OurPartners } from "@/components/OurPartners";
import { ContactSection } from "@/components/ContactSection";
import { Chatbot } from "@/components/Chatbot";
import { headers } from "next/headers";
import { getLocations, getPosts } from "@/lib/db/sqlite";
import { getAdminFirestore } from "@/lib/db/firestore-admin";
import type { Tour } from "@/lib/types";

import { getSiteProfileAction } from '@/app/actions/profile';
import { getPartnersAction } from '@/app/actions/partners';
// Helper to fetch tours from Firestore Admin (Server-side)
async function getFeaturedTours() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('packages')
      .where('status', '==', 'published')
      .limit(3)
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Ensure dates are serialized if necessary, though simple JSON usually works for props
      // Firestore timestamps need conversion
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || null,
    })) as unknown as Tour[];
  } catch (error) {
    console.error("Failed to fetch featured tours on server:", error);
    return [];
  }
}

// Helper to fetch popular packages
async function getPopularPackages() {
  try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('packages')
      .where('status', '==', 'published')
      .orderBy('price', 'desc')
      .limit(3)
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || null,
    })) as unknown as Tour[];
  } catch (error) {
    console.error("Failed to fetch popular packages on server:", error);
    return [];
  }
}

// Helper to fetch reviews
async function getReviews() {
   // Since Testimonials.tsx used a client-side helper `getFiveStarReviews` which likely used Firestore,
   // we need to replicate that logic server-side.
   // Let's assume it fetches from a 'reviews' collection where rating == 5.
   try {
    const db = getAdminFirestore();
    const snapshot = await db.collection('reviews')
      .where('rating', '==', 5)
      .where('status', '==', 'approved') // Assuming there's a status
      .limit(10) // Limit for carousel
      .get();
    
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.().toISOString() || new Date().toISOString(),
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || null,
    }));
  } catch (error) {
    console.error("Failed to fetch reviews on server:", error);
    return [];
  }
}

export default async function Home() {
  const headersList = await headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  // Fetch data on server
  const featuredLocations = getLocations({ featured: true });
  const recentPostsData = getPosts({ limit: 3, status: 'published' });
  const featuredTours = await getFeaturedTours();
  
  // Parallel fetch for remaining data
  const [profile, partners, popularPackages, reviews] = await Promise.all([
    getSiteProfileAction(),
    getPartnersAction(),
    getPopularPackages(),
    getReviews()
  ]);

  return (
    <>
      <div className="homepage-sections-wrapper flex flex-col">
        <HeroSection initialProfile={profile} />
        <FavoriteDestinations initialLocations={featuredLocations} />
        <RecommendedTours />
        <FeaturedTours initialTours={featuredTours} />
        <PopularPackages initialTours={popularPackages} />
        <WhyUs />
        <Testimonials initialReviews={reviews as any[]} initialProfile={profile} />
        <RecentBlogs initialPosts={recentPostsData.posts as any[]} />
        <OurPartners initialPartners={partners} />
        <CustomizeTrip />
        <ContactSection />
      </div>
      <Chatbot tempUserId={tempUserId} />
    </>
  );
}
