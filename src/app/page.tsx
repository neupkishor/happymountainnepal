import { FeaturedTours } from "@/components/FeaturedTours";
import { HeroSection } from "@/components/HeroSection";
import { PopularPackages } from "@/components/PopularPackages";
import { WhyUs } from "@/components/WhyUs";
import { Testimonials } from "@/components/Testimonials";
import { RecentBlogs } from "@/components/RecentBlogs";
import { CustomizeTrip } from "@/components/CustomizeTrip";
import { FavoriteDestinations } from "@/components/FavoriteDestinations";

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="bg-secondary">
        <FavoriteDestinations />
      </div>
      <FeaturedTours />
      <PopularPackages />
      <div className="bg-secondary">
        <WhyUs />
      </div>
      <Testimonials />
      <div className="bg-secondary">
        <RecentBlogs />
      </div>
      <CustomizeTrip />
    </>
  );
}
