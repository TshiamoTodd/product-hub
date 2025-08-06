"use client";

import { useState, useEffect, useCallback } from 'react';
import { db, storage } from '@/lib/firebase/config';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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
    setIsSubmitting(true);
    setUploadProgress(0);

    const imageUrls: string[] = [];
    const imageFiles = Array.from(data.images);
    const totalFiles = imageFiles.length;
    let filesUploaded = 0;

    try {
      for (const file of imageFiles) {
        const productId = doc(collection(db, 'products')).id;
        const storageRef = ref(storage, `products/${productId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress = ((filesUploaded + (progress / 100)) / totalFiles) * 100;
              setUploadProgress(overallProgress);
            },
            (error) => {
              console.error("Upload failed", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              imageUrls.push(downloadURL);
              filesUploaded++;
              resolve();
            }
          );
        });
      }

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
      // Delete images from Storage
      for (const url of imageUrls) {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef).catch((error) => {
          // It's okay if file doesn't exist, maybe it was already deleted.
          if (error.code !== 'storage/object-not-found') {
            throw error;
          }
        });
      }

      // Delete document from Firestore
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
