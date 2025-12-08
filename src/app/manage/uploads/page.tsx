'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFileUploads, getFileUploadsCount } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { PictureInPicture, ChevronLeft, ChevronRight, ExternalLink, FileIcon } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FileUpload } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function UploadsLibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fileItems, setFileItems] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]);

  // Get current page from URL, default to 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    async function fetchCount() {
      const count = await getFileUploadsCount();
      setTotalCount(count);
    }
    fetchCount();
  }, []);

  useEffect(() => {
    async function fetchUploads() {
      setIsLoading(true);
      try {
        const lastDocId = pageHistory[currentPage - 1];
        const result = await getFileUploads({
          limit: ITEMS_PER_PAGE,
          lastDocId
        });
        setFileItems(result.uploads);
        setHasMore(result.hasMore);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching uploads:', error);
        setIsLoading(false);
      }
    }
    fetchUploads();
  }, [currentPage, pageHistory]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToNextPage = () => {
    if (hasMore && fileItems.length > 0) {
      const lastDocId = fileItems[fileItems.length - 1].id;
      setPageHistory(prev => [...prev, lastDocId]);
      router.push(`/manage/uploads?page=${currentPage + 1}`);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setPageHistory(prev => prev.slice(0, -1));
      router.push(`/manage/uploads?page=${currentPage - 1}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
          <p className="text-muted-foreground mt-2">
            {totalCount} {totalCount === 1 ? 'file' : 'files'} uploaded
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 mb-8">
          {/* Skeleton Cards */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg bg-card animate-pulse"
            >
              {/* Skeleton Preview */}
              <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0"></div>

              {/* Skeleton Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>

              {/* Skeleton Button */}
              <div className="h-9 w-20 bg-muted rounded flex-shrink-0"></div>
            </div>
          ))}
        </div>
      ) : fileItems.length > 0 ? (
        <>
          {/* List of Upload Cards */}
          <div className="space-y-4 mb-8">
            {fileItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
              >
                {/* Preview */}
                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {item.fileType?.startsWith('image/') ? (
                    <Image
                      src={item.url}
                      alt={item.fileName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                      <FileIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate mb-1" title={item.fileName}>
                    {item.fileName}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.userId}
                    </Badge>
                    <span>
                      {item.uploadedAt ? formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true }) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <Button asChild variant="ghost" size="sm" className="flex-shrink-0">
                  <Link href={item.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          <PictureInPicture className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">No Files Uploaded</h3>
          <p>Uploaded files will appear here as they are added.</p>
        </div>
      )}
    </div>
  );
}