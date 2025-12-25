
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { PackageManagementCard } from '@/components/manage/PackageTableRow'; // Re-using and renaming
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
      fetchPackages(page, searchTerm);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Tour Packages</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and manage your tour packages.
          </p>
        </div>
        <Button asChild>
          <Link href="/manage/packages/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Package
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Packages</CardTitle>
          <CardDescription>
            Showing {tours.length} of {pagination.totalCount} packages.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
                placeholder="Search by name..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full" />
              ))
            ) : tours.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No packages found.
              </div>
            ) : (
              tours.map((tour) => (
                <PackageManagementCard key={tour.id} tour={tour} />
              ))
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
        </CardContent>
      </Card>
    </div>
  );
}
