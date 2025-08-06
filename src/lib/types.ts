import { type z } from 'zod';

// Base Product Type
export type Product = {
  name: string;
  shortDescription: string;
  fullDescription: string;
  regularPrice: number;
  salePrice?: number | null;
  tags: string[];
  imageUrls: string[];
  createdAt: Date;
};

// Product with ID from Firestore
export type ProductWithId = Product & {
  id: string;
};

// Type for form values, now using URL strings for images
export type ProductFormValues = {
    name: string;
    shortDescription: string;
    fullDescription: string;
    regularPrice: number;
    salePrice?: number | null;
    tags?: string;
    images: string[]; // Changed from FileList to string[]
}
