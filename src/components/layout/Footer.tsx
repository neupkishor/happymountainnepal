import { Link } from '@/components/ui/link';
import { Mountain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Mountain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">Happy Mountain Nepal</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your gateway to Himalayan adventures.
            </p>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Tours</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/tours?region=Everest" className="text-sm text-muted-foreground hover:text-primary">Everest</Link></li>
              <li><Link href="/tours?region=Annapurna" className="text-sm text-muted-foreground hover:text-primary">Annapurna</Link></li>
              <li><Link href="/tours?region=Langtang" className="text-sm text-muted-foreground hover:text-primary">Langtang</Link></li>
              <li><Link href="/tours" className="text-sm text-muted-foreground hover:text-primary">All Tours</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="/about/teams" className="text-sm text-muted-foreground hover:text-primary">Our Team</Link></li>
              <li><Link href="/blogs" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
              <li><Link href="/testimonials" className="text-sm text-muted-foreground hover:text-primary">Testimonials</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/legal/documents" className="text-sm text-muted-foreground hover:text-primary">Legal Documents</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Happy Mountain Nepal Private Limited. All rights reserved.</p>
          <p className="mt-2">
            Developed by <a href="https://neupgroup.com/marketing" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Neup.Marketing</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
