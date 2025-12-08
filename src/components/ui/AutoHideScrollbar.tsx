'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface AutoHideScrollbarProps {
    children: ReactNode;
    className?: string;
}

export function AutoHideScrollbar({ children, className = '' }: AutoHideScrollbarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const handleScroll = () => {
            // Add scrolling class
            element.classList.add('scrolling');

            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Remove scrolling class after 500ms of no scrolling
            timeoutRef.current = setTimeout(() => {
                element.classList.remove('scrolling');
            }, 500);
        };

        element.addEventListener('scroll', handleScroll);

        return () => {
            element.removeEventListener('scroll', handleScroll);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div ref={scrollRef} className={`auto-hide-scrollbar ${className}`}>
            {children}
        </div>
    );
}
