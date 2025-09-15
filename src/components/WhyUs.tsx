import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shield, Leaf, Star } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Experienced Local Guides",
    description: "Our guides are certified, experienced locals who know the mountains like the back of their hand.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "We prioritize your safety with the highest standards, including regular equipment checks and emergency protocols.",
  },
  {
    icon: Leaf,
    title: "Sustainable & Responsible",
    description: "We are committed to eco-friendly practices that protect our beautiful environment and support local communities.",
  },
  {
    icon: Star,
    title: "Tailor-Made Itineraries",
    description: "Your dream adventure is unique. We specialize in creating personalized trips that match your interests and fitness level.",
  },
]

export function WhyUs() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold !font-headline">Why Trek with Us?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Creating unforgettable Himalayan experiences with a personal touch.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-card">
              <CardHeader className="items-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-xl mb-2 !font-headline">{feature.title}</CardTitle>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
