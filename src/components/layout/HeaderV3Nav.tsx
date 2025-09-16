
'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface NavLink {
  title: string;
  href?: string;
  description?: string;
  children?: NavLink[];
}

interface HeaderV3NavProps {
  links: NavLink[];
}

const hasChildren = (item: NavLink): item is Required<Pick<NavLink, 'children'>> & NavLink => {
    return Array.isArray(item.children) && item.children.length > 0;
}

export const HeaderV3Nav = ({ links }: HeaderV3NavProps) => {
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
    const [activeSubMenu, setActiveSubMenu] = React.useState<NavLink | null>(null);

    const handleMouseEnter = (title: string, item: NavLink) => {
        setHoveredItem(title);
        if (hasChildren(item)) {
            setActiveSubMenu(item);
        } else {
            setActiveSubMenu(null);
        }
    };
    
    const handleMouseLeave = () => {
        setHoveredItem(null);
        setActiveSubMenu(null);
    };

    return (
        <div className="relative" onMouseLeave={handleMouseLeave}>
            <nav className="flex items-center">
                {links.map(link => (
                    <div
                        key={link.title}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(link.title, link)}
                    >
                        <Link
                            href={link.href || '#'}
                            className={cn(
                                "relative px-3 py-2 text-sm font-medium transition-colors duration-300",
                                hoveredItem === link.title ? "text-primary" : "text-foreground/70 hover:text-foreground"
                            )}
                        >
                            {link.title}
                            {hoveredItem === link.title && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    layoutId="underline"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                />
                            )}
                        </Link>
                    </div>
                ))}
            </nav>

            <AnimatePresence>
                {activeSubMenu && (
                    <motion.div
                        className="absolute top-full w-screen bg-background/80 backdrop-blur-lg shadow-lg border-t left-[calc(50%-50vw)]"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                         <div className="container mx-auto py-8">
                            <motion.div
                                className="grid grid-cols-4 gap-8"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                {activeSubMenu.children?.map(child => (
                                    <div key={child.title}>
                                        {hasChildren(child) ? (
                                            <>
                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">{child.title}</h3>
                                                <ul className="space-y-2">
                                                    {child.children?.map(subItem => (
                                                        <li key={subItem.title}>
                                                            <Link href={subItem.href || '#'} className="group flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
                                                                <span>{subItem.title}</span>
                                                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        ) : (
                                             <Link href={child.href || '#'} className="group block">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{child.title}</h3>
                                                {child.description && <p className="text-sm text-muted-foreground mt-1">{child.description}</p>}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
