

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
import { Chatbot } from "@/components/Chatbot"; // Import Chatbot
import { headers } from "next/headers";

export default function Home() {
  const headersList = headers();
  const tempUserId = headersList.get('x-temp-account-id') || 'NotAvailable';

  return (
    <>
      <div className="homepage-sections-wrapper flex flex-col">
        <HeroSection />
        <FavoriteDestinations />
        <RecommendedTours />
        <FeaturedTours />
        <PopularPackages />
        <WhyUs />
        <Testimonials />
        <RecentBlogs />
        <OurPartners />
        <CustomizeTrip />
        <ContactSection />
      </div>
      <Chatbot tempUserId={tempUserId} />
    </>
  );
}
