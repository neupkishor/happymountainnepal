import { FeaturedTours } from "@/components/FeaturedTours";
import { HeroSection } from "@/components/HeroSection";
import { PopularPackages } from "@/components/PopularPackages";
import { WhyUs } from "@/components/WhyUs";
import { Testimonials } from "@/components/Testimonials";
import { RecentBlogs } from "@/components/RecentBlogs";
import { CustomizeTrip } from "@/components/CustomizeTrip";
import { FavoriteDestinations } from "@/components/FavoriteDestinations";
import { OurPartners } from "@/components/OurPartners";

export default function Home() {
  return (
    <div className="homepage-sections-wrapper">
      <HeroSection />
      <FavoriteDestinations />
      <FeaturedTours />
      <PopularPackages />
      <WhyUs />
      <Testimonials />
      <RecentBlogs />
      <OurPartners />
      <CustomizeTrip />
    </div>
  );
}