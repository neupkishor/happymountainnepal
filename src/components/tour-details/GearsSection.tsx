import { GearItem } from '@/lib/types';
import { Check, X, Info } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GearsSectionProps {
    gears: GearItem[];
}

export function GearsSection({ gears }: GearsSectionProps) {
    if (!gears || gears.length === 0) return null;

    const providedGears = gears.filter(g => g.provided);
    const requiredGears = gears.filter(g => !g.provided);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold !font-headline mb-6">Gears & Equipment</h2>
            <p className="text-muted-foreground mb-6">
                Proper gear is essential for a safe and enjoyable trek. Here is a list of what we provide and what you need to bring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Provided Section */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Check className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Provided by Us</h3>
                                <p className="text-sm text-muted-foreground">We have got you covered with these items.</p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {providedGears.map((gear) => (
                                <li key={gear.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-background/50 transition-colors">
                                    {gear.image ? (
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border bg-background">
                                            <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-md bg-background border flex items-center justify-center flex-shrink-0">
                                            <Check className="h-6 w-6 text-primary/40" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-foreground">{gear.name}</p>
                                        {gear.description && <p className="text-sm text-muted-foreground mt-1">{gear.description}</p>}
                                    </div>
                                </li>
                            ))}
                            {providedGears.length === 0 && (
                                <li className="text-sm text-muted-foreground italic">No items listed in this category.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>

                {/* Required Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-destructive/10 rounded-full">
                                <Info className="h-6 w-6 text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Bring Yourself</h3>
                                <p className="text-sm text-muted-foreground">You need to pack these items.</p>
                            </div>
                        </div>

                        <ul className="space-y-4">
                            {requiredGears.map((gear) => (
                                <li key={gear.id} className="flex gap-4 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    {gear.image ? (
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border bg-background">
                                            <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-md bg-muted border flex items-center justify-center flex-shrink-0">
                                            <Info className="h-6 w-6 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-foreground">{gear.name}</p>
                                            <Badge variant="outline" className="text-[10px] h-5">Required</Badge>
                                        </div>
                                        {gear.description && <p className="text-sm text-muted-foreground mt-1">{gear.description}</p>}
                                    </div>
                                </li>
                            ))}
                            {requiredGears.length === 0 && (
                                <li className="text-sm text-muted-foreground italic">No items listed in this category.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
