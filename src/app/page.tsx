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
import { getLocations, getPosts, getFeaturedToursDB, getPopularToursDB, getReviewsDB } from "@/lib/db/sqlite";
import { getAdminFirestore } from "@/lib/db/firestore-admin";
import type { Tour } from "@/lib/types";

import { getSiteProfileAction } from '@/app/actions/profile';
import { getPartnersAction } from '@/app/actions/partners';

export default async function Home() {
  const headersList = await headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  // Fetch data on server
  const featuredLocations = getLocations({ featured: true });
  const recentPostsData = getPosts({ limit: 3, status: 'published' });
  const featuredTours = getFeaturedToursDB(3) as unknown as Tour[]; 
  
  // Parallel fetch for remaining data
  const [profile, partners] = await Promise.all([
    getSiteProfileAction(),
    getPartnersAction()
  ]);

  const popularPackages = getPopularToursDB(3) as unknown as Tour[]; 
  
  // Fetch reviews from SQLite (5-star, approved)
  const reviews = getReviewsDB({ limit: 10, rating: 5, status: 'approved' });

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
