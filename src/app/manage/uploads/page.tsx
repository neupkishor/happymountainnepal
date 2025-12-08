'use client';

import { useState, useEffect } from 'react';
import { getFileUploads, getFileUploadsCount } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { PictureInPicture, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FileUpload } from '@/lib/types';

const ITEMS_PER_PAGE = 10;

export default function UploadsLibraryPage() {
  const [fileItems, setFileItems] = useState<FileUpload[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageHistory, setPageHistory] = useState<(string | null)[]>([null]); // Track last doc ID for each page

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
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            A log of all files uploaded to the site. Showing {fileItems.length} of {totalCount} files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-4">Loading uploads...</p>
            </div>
          ) : fileItems.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                          {item.fileType?.startsWith('image/') ? (
                            <Image
                              src={item.url}
                              alt={item.fileName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full text-muted-foreground text-xs">
                              {item.fileType?.split('/')[1].toUpperCase() || 'FILE'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-sm truncate">{item.fileName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.userId}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.uploadedAt ? formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={item.url} target="_blank" rel="noopener noreferrer">
                            View File
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalCount > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({totalCount} total files)
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

                    <div className="text-sm font-medium px-4">
                      Page {currentPage}
                    </div>

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
            <div className="text-center py-16 text-muted-foreground">
              <PictureInPicture className="mx-auto h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No Files Uploaded</h3>
              <p>Uploaded files will appear here as they are added.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}