import { FeaturedTours } from "@/components/FeaturedTours";
import { HeroSection } from "@/components/HeroSection";
import { PopularPackages } from "@/components/PopularPackages";
import { WhyUs } from "@/components/WhyUs";
import { Testimonials } from "@/components/Testimonials";
import { RecentBlogs } from "@/components/RecentBlogs";
import { CustomizeTrip } from "@/components/CustomizeTrip";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedTours />
      <PopularPackages />
      <WhyUs />
      <Testimonials />
      <RecentBlogs />
      <CustomizeTrip />
    </>
  );
}
