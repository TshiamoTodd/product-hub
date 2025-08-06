"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { type ProductWithId, type ProductFormValues } from '@/lib/types';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

export default function ProductManager() {
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: ProductWithId[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as ProductWithId);
      });
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products. Please try again later.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleAddProduct = async (data: ProductFormValues) => {
    console.log("ProductManager received data:", data);
    console.log("Images received:", data.images);
    console.log("Images count:", data.images?.length);
    
    setIsSubmitting(true);
    setUploadProgress(20);

    try {
      // Images are already URLs from UploadThing, no need to upload them
      const imageUrls = data.images;
      
      setUploadProgress(80);

      await addDoc(collection(db, 'products'), {
        name: data.name,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        regularPrice: data.regularPrice,
        salePrice: data.salePrice,
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        imageUrls: imageUrls,
        createdAt: new Date(),
      });

      setUploadProgress(100);

      toast({
        title: "Success!",
        description: "Your product has been added successfully.",
      });

    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error adding your product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  const handleDeleteProduct = useCallback(async (productId: string, imageUrls: string[]) => {
    try {
      // Note: UploadThing images are handled automatically by UploadThing
      // We only need to delete the Firestore document
      await deleteDoc(doc(db, 'products', productId));
      
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      });
    }
  }, [toast]);

  return (
    <div className="space-y-12">
      <ProductForm onSubmit={handleAddProduct} isSubmitting={isSubmitting} uploadProgress={uploadProgress} />
      <ProductTable products={products} onDelete={handleDeleteProduct} isLoading={isLoading} />
    </div>
  );
}
