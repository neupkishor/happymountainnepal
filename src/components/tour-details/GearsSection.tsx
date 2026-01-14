'use client';

import { GearItem } from '@/lib/types';
import { Check, Info, Backpack, CircleCheck } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GearsSectionProps {
    gears: GearItem[];
}

export function GearsSection({ gears }: GearsSectionProps) {
    if (!gears || gears.length === 0) return null;

    const providedGears = gears.filter(g => g.provided);
    const requiredGears = gears.filter(g => !g.provided);

    // State to track item status: 'provided' | 'unchecked' | 'own'
    // For provided items, default is 'provided' (if not in state).
    // For required items, default is 'unchecked'.
    const [gearStates, setGearStates] = useState<Record<string, 'provided' | 'unchecked' | 'own'>>({});

    const handleToggle = (id: string, isDefaultProvided: boolean) => {
        setGearStates(prev => {
            const currentState = prev[id] || (isDefaultProvided ? 'provided' : 'unchecked');

            let nextState: 'provided' | 'unchecked' | 'own';

            if (isDefaultProvided) {
                // Cycle: provided -> unchecked -> own -> provided
                if (currentState === 'provided') nextState = 'unchecked';
                else if (currentState === 'unchecked') nextState = 'own';
                else nextState = 'provided';
            } else {
                // Toggle: unchecked -> own -> unchecked
                nextState = currentState === 'unchecked' ? 'own' : 'unchecked';
            }

            return { ...prev, [id]: nextState };
        });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold !font-headline">Gears & Equipment</h2>
                <p className="text-muted-foreground text-lg">
                    Proper gear is essential for a safe and enjoyable trek. Use the checklist below to prepare.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gears.sort((a, b) => (a.provided === b.provided ? 0 : a.provided ? 1 : -1)).map((gear) => {
                    const isDefaultProvided = gear.provided;
                    const currentState = gearStates[gear.id] || (isDefaultProvided ? 'provided' : 'unchecked');

                    const isProvidedState = currentState === 'provided'; // Visually provided (Primary)
                    const isOwnState = currentState === 'own'; // Visually own (Green)
                    const isUnchecked = currentState === 'unchecked';

                    return (
                        <div
                            key={gear.id}
                            onClick={() => handleToggle(gear.id, isDefaultProvided)}
                            className={cn(
                                "group relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer select-none hover:shadow-md",
                                isProvidedState && "bg-primary/5 border-primary/20",
                                isOwnState && "bg-green-50/50 border-green-500/20",
                                isUnchecked && "bg-card border-border hover:border-primary/50"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted border">
                                    {gear.image ? (
                                        <Image src={gear.image} alt={gear.name} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            {isProvidedState ? (
                                                <Check className="h-8 w-8 text-primary/40" />
                                            ) : (
                                                <Info className="h-8 w-8 text-muted-foreground/30" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="pt-1">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isProvidedState ? "bg-primary border-primary" :
                                            isOwnState ? "bg-green-500 border-green-500" :
                                                "border-muted-foreground/30 group-hover:border-primary"
                                    )}>
                                        {(isProvidedState || isOwnState) && <Check className="h-4 w-4 text-white" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 flex-grow">
                                <h4 className={cn("font-bold text-lg leading-tight",
                                    isProvidedState ? "text-primary" : isOwnState ? "text-green-800" : "text-foreground"
                                )}>
                                    {gear.name}
                                </h4>
                                {gear.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {gear.description}
                                    </p>
                                )}
                            </div>

                            {/* Footer Badge */}
                            {isProvidedState ? (
                                <div className="mt-2 pt-3 border-t border-primary/10 flex items-center text-xs font-medium text-primary uppercase tracking-wide">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                        Provided by Us
                                    </Badge>
                                </div>
                            ) : isOwnState && isDefaultProvided ? (
                                <div className="mt-2 pt-3 border-t border-green-500/20 flex items-center text-xs font-medium text-green-700 uppercase tracking-wide">
                                    <span className="flex items-center gap-1">
                                        <CircleCheck className="h-3 w-3" /> Bringing my own
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
