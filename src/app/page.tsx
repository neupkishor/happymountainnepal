import { FeaturedTours } from "@/components/FeaturedTours";
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteDestinations } from "@/components/FavoriteDestinations";
import { PopularPackages } from "@/components/PopularPackages";

function BlogHighlight() {
  const latestPost = blogPosts[0];
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">From Our Travel Journal</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Tips, stories, and guides to inspire your next Himalayan journey.
          </p>
        </div>
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden md:flex">
          <div className="md:w-1/2">
            <Image
              src={latestPost.image}
              alt={latestPost.title}
              width={800}
              height={500}
              className="w-full h-64 md:h-full object-cover"
              data-ai-hint="travel journal"
            />
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <p className="text-sm text-primary font-semibold uppercase tracking-wide">{latestPost.author} &bull; {latestPost.date}</p>
            <h3 className="text-2xl font-bold !font-headline mt-2 mb-4 hover:text-primary transition-colors">
              <Link href={`/blog/${latestPost.slug}`}>{latestPost.title}</Link>
            </h3>
            <p className="text-muted-foreground mb-6">{latestPost.excerpt}</p>
            <Link href={`/blog/${latestPost.slug}`} className="self-start">
              <Button variant="outline">Read More <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedTours />
      <PopularPackages />
      <FavoriteDestinations />
      <BlogHighlight />
    </>
  );
}
