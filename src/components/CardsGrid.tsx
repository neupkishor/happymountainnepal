import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardsGridProps = {
  children: ReactNode;
  className?: string;
};

export function CardsGrid({ children, className }: CardsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
      {children}
    </div>
  );
}