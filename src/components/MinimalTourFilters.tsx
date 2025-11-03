"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface TourFiltersProps {
  filters: {
    search: string;
    region: string;
    hardship: string[]; // ['low','mid','high']
  };
  setFilters: (filters: TourFiltersProps["filters"]) => void;
  regions: string[];
}

export function MinimalTourFilters({ filters, setFilters, regions }: TourFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateQuery = (next: Partial<TourFiltersProps["filters"]>) => {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.search) params.set("search", merged.search);
    if (merged.region) params.set("region", merged.region);
    if (merged.hardship && merged.hardship.length > 0) params.set("hardship", merged.hardship.join(","));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleReset = () => {
    const reset = { search: "", region: "", hardship: [] as string[] };
    setFilters(reset);
    router.replace(pathname);
  };

  const isFiltered = !!filters.search || !!filters.region || (filters.hardship && filters.hardship.length > 0);

  const toggleRegion = (region: string) => {
    const nextRegion = filters.region === region ? "" : region;
    const next = { ...filters, region: nextRegion };
    setFilters(next);
    updateQuery({ region: nextRegion });
  };

  const toggleHardship = (level: "low" | "mid" | "high") => {
    const set = new Set(filters.hardship);
    if (set.has(level)) {
      set.delete(level);
    } else {
      set.add(level);
    }
    const nextHardship = Array.from(set);
    const next = { ...filters, hardship: nextHardship };
    setFilters(next);
    updateQuery({ hardship: nextHardship });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = filters.search.trim();
    if (!term) return;
    const params = new URLSearchParams();
    if (filters.region) params.set("region", filters.region);
    if (filters.hardship && filters.hardship.length > 0) params.set("hardship", filters.hardship.join(","));
    const qs = params.toString();
    router.push(qs ? `/search/${encodeURIComponent(term)}?${qs}` : `/search/${encodeURIComponent(term)}`);
  };

  return (
    <div className="mb-8">
      {/* Full-width search bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <Input
          type="text"
          placeholder="Search for tours, e.g., 'Everest'"
          value={filters.search}
          onChange={(e) => {
            const next = { ...filters, search: e.target.value };
            setFilters(next);
          }}
          className="bg-white/90 text-foreground placeholder:text-muted-foreground w-full rounded-full py-6 pl-6 pr-16 border-2 border-primary/50 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {/* Tags on the same line */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["low", "mid", "high"] as const).map((lvl) => {
          const selected = filters.hardship.includes(lvl);
          return (
            <Button
              key={lvl}
              type="button"
              variant={selected ? "default" : "outline"}
              className={`rounded-full px-4 py-2 ${selected ? "bg-primary text-primary-foreground border-primary" : ""}`}
              onClick={() => toggleHardship(lvl)}
            >
              {lvl === "low" ? "Low" : lvl === "mid" ? "Mid" : "High"}
            </Button>
          );
        })}

        {regions.map((region) => {
          const selected = filters.region === region;
          return (
            <Button
              key={region}
              type="button"
              variant={selected ? "default" : "outline"}
              className={`rounded-full px-4 py-2 ${selected ? "bg-primary text-primary-foreground border-primary" : ""}`}
              onClick={() => toggleRegion(region)}
            >
              {region}
            </Button>
          );
        })}

        {isFiltered && (
          <Button variant="ghost" onClick={handleReset} className="h-10 px-4 rounded-xl hover:bg-muted/50">
            <X className="mr-2 h-4 w-4" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}