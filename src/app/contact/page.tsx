import { ContactForm } from '@/components/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';
import { AdminPageControl } from '@/components/admin/AdminPageControl';

export default function ContactPage() {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Happy Mountain Nepal",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+977-984-3725521",
          "contactType": "customer service"
        },
        {
          "@type": "ContactPoint",
          "email": "info@happymountainnepal.com",
          "contactType": "customer service"
        }
      ]
    }
  };

  return (
    <div className="bg-background">
      <AdminPageControl editPath="/manage/profile" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <div className="container mx-auto py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold !font-headline">Get In Touch</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have a question or want to plan a custom trip? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold !font-headline mb-6">Send us a Message</h2>
            <ContactForm />
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold !font-headline">Contact Information</h2>
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Our Office</h3>
                <p className="text-muted-foreground">Thamel, Kathmandu, Nepal</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Email Us</h3>
                <a href="mailto:info@happymountainnepal.com" className="text-muted-foreground hover:text-primary">info@happymountainnepal.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold">Call Us</h3>
                <a href="tel:+9779843725521" className="text-muted-foreground hover:text-primary">+977 984-3725521</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
