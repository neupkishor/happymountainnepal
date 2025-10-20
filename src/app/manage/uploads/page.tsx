import { getFileUploads } from '@/lib/db';
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
import { PictureInPicture } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function UploadsLibraryPage() {
  const fileItems = await getFileUploads();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold !font-headline">Uploads Library</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>
            A log of all files uploaded to the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fileItems.length > 0 ? (
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