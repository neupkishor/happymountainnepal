
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PackageManagementCard } from '@/components/manage/PackageTableRow';
import type { Tour } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDebounce } from '@/hooks/use-debounce';

const ITEMS_PER_PAGE = 10;

export default function PackagesListPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchPackages = async (page: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: search,
      });
      const response = await fetch(`/api/packages?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch packages');

      const data = await response.json();
      setTours(data.packages);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages(1, debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
      fetchPackages(page, searchTerm);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Tour Packages</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage your tour packages.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-blue-200/50">
        {/* Create New Package */}
        <Link href="/manage/packages/create" className="block hover:bg-muted/50 transition-colors">
          <div className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-primary">Create New Package</h3>
              <p className="text-sm text-muted-foreground">
                Create, edit, and manage your tour packages.
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Link>
        <Separator />
        {/* Search */}
        <div className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 relative">
            <Input
              placeholder="Search by name..."
              className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : tours.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <h3 className="text-lg font-semibold">No packages found</h3>
              <p>Try adjusting your search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-col">
              {tours.map((tour) => (
                <PackageManagementCard key={tour.id} tour={tour} />
              ))}
            </div>
          </Card>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={i + 1 === pagination.currentPage}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className={pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
