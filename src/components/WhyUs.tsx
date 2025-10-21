
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { useSiteProfile } from "@/hooks/use-site-profile";
import Image from "next/image";

export function WhyUs() {
  const { profile, isLoading } = useSiteProfile();
  const features = profile?.whyUs || [];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Why Trek with Us?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Creating unforgettable Himalayan experiences with a personal touch.
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="text-center bg-card">
                <CardHeader className="items-center">
                  <Skeleton className="h-14 w-14 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center bg-card">
                <CardHeader className="items-center">
                  <div className="bg-primary/10 p-3 rounded-full relative h-14 w-14">
                    <Image
                      src={feature.icon}
                      alt={`${feature.title} icon`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-2 !font-headline">{feature.title}</CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
