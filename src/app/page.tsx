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
    <>
      <HeroSection />
      <div className="bg-secondary">
        <FavoriteDestinations />
      </div>
      <FeaturedTours />
      <div className="bg-secondary">
        <PopularPackages />
      </div>
      <WhyUs />
      <div className="bg-secondary">
        <Testimonials />
      </div>
      <RecentBlogs />
      <div className="bg-secondary">
        <OurPartners />
      </div>
      <CustomizeTrip />
    </>
  );
}
