"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { type ProductWithId } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

type ProductTableProps = {
  products: ProductWithId[];
  onDelete: (productId: string, imageUrls: string[]) => Promise<void>;
  isLoading: boolean;
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || typeof amount === 'undefined') return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function ProductTable({ products, onDelete, isLoading }: ProductTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (product: ProductWithId) => {
    setIsDeleting(product.id);
    await onDelete(product.id, product.imageUrls);
    setIsDeleting(null);
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Product List</CardTitle>
        <CardDescription>A real-time view of all your submitted products.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Regular Price</TableHead>
                <TableHead className="text-right">Sale Price</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.imageUrls && product.imageUrls[0] && (
                        <div className="flex -space-x-4">
                            {product.imageUrls.slice(0, 2).map((url, i) => (
                                <Image
                                    key={i}
                                    src={url}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="rounded-md object-cover border-2 border-white"
                                    data-ai-hint="product image"
                                />
                            ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {product.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.regularPrice)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(product.salePrice)}</TableCell>
                    <TableCell className="text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={isDeleting === product.id}>
                            {isDeleting === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product
                              "{product.name}" and remove its images from storage.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product)}
                              className="bg-destructive hover:bg-destructive/90">
                              Yes, delete it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found. Add one using the form above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
