
import { BlogCard } from '@/components/BlogCard';
import type { BlogPost, GuideItem } from '@/lib/types';

interface GuidesSectionProps {
    guides: GuideItem[];
}

export function GuidesSection({ guides }: GuidesSectionProps) {
    if (!guides || guides.length === 0) return null;

    return (
        <div className='py-8'>
            <h2 className="text-3xl font-bold !font-headline mb-6">Blogs & Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide) => {
                    // Map GuideItem to BlogPost structure compatible with BlogCard
                    // We fill missing specific fields with defaults as they are not used in BlogCard usually or optional
                    const post: BlogPost = {
                        id: guide.id,
                        title: guide.title,
                        slug: guide.slug,
                        excerpt: guide.excerpt,
                        image: guide.image,
                        date: '', // Date not stored in guide item reference
                        author: guide.author,
                        content: '', // Not used by card
                        authorPhoto: '', // Not used by card
                        status: 'published',
                        tags: []
                    };
                    return <BlogCard key={guide.id} post={post} />;
                })}
            </div>
        </div>
    );
}
