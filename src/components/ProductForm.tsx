"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { type ProductFormValues } from '@/lib/types';
import { Badge } from './ui/badge';
import { UploadDropzone } from '@/lib/uploadthing';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long."),
  shortDescription: z.string().min(10, "Short description is required.").max(120, "Short description must be 120 characters or less."),
  fullDescription: z.string().min(10, "Full description is required."),
  regularPrice: z.coerce.number({ invalid_type_error: "Price must be a number."}).positive("Price must be positive."),
  salePrice: z.coerce.number().optional().nullable(),
  tags: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL"))
    .min(1, 'At least one image is required.')
    .max(MAX_IMAGES, `You can upload a maximum of ${MAX_IMAGES} images.`)
});

type ProductFormProps = {
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
  uploadProgress: number;
};

export default function ProductForm({ onSubmit, isSubmitting, uploadProgress }: ProductFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      fullDescription: '',
      regularPrice: 0,
      salePrice: null,
      tags: '',
      images: [], // Now an array of URLs
    },
  });

  // Initialize client state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync form images with local state
  useEffect(() => {
    form.setValue('images', imageUrls, { shouldValidate: true });
  }, [imageUrls, form]);

  const removeImage = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
  };
  
  const internalSubmit: SubmitHandler<z.infer<typeof productFormSchema>> = async (data) => {
    console.log("Form data being submitted:", data);
    console.log("Images:", data.images);
    console.log("Images count:", data.images?.length);
    
    try {
      await onSubmit(data);
      
      // Only reset if submission was successful
      form.reset();
      setImageUrls([]);
    } catch (error) {
      console.error("Form submission error:", error);
      // Don't reset form on error
    }
  };

  const handleFormReset = () => {
    form.reset();
    setImageUrls([]);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Add a New Product</CardTitle>
        <CardDescription>Fill in the details below to add a new product to your catalog.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(internalSubmit, (errors) => {
          console.log("Form validation errors:", errors);
        })} onReset={handleFormReset} className="space-y-8">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic Summer T-Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A brief summary for product listings." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Detailed information about materials, fit, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="regularPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="19.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="14.99" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Summer, Casual, Cotton" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imageUrls.length < MAX_IMAGES && (
                          <UploadDropzone
                            endpoint="productImageUploader"
                            onClientUploadComplete={(res) => {
                              console.log("Upload complete:", res);
                              console.log("First file object:", res[0]);
                              console.log("Available properties:", Object.keys(res[0] || {}));
                              // Try different possible properties for the URL
                              const newUrls = res.map(file => {
                                // For UploadThing v7+, construct URL from key if url is not available
                                let url = file.url;
                                if (!url && file.key) {
                                  url = `https://utfs.io/f/${file.key}`;
                                }
                                console.log("Extracted URL:", url);
                                return url;
                              }).filter(Boolean); // Remove any undefined values
                              console.log("New URLs extracted:", newUrls);
                              setImageUrls(prev => {
                                const updated = [...prev, ...newUrls];
                                console.log("Updated imageUrls state:", updated);
                                return updated;
                              });
                            }}
                            onUploadError={(error: Error) => {
                              console.error("Upload error:", error);
                            }}
                            appearance={{
                              container: "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors",
                              uploadIcon: "text-muted-foreground w-8 h-8 mb-4",
                              label: "text-sm text-muted-foreground",
                              allowedContent: "text-xs text-muted-foreground",
                            }}
                          />
                        )}
                        
                        {imageUrls.length >= MAX_IMAGES && (
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">Maximum {MAX_IMAGES} images reached</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {imageUrls.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium">Image Previews <Badge variant="secondary">{imageUrls.length} / {MAX_IMAGES}</Badge></div>
                    <div className="grid grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                        <Image src={url} alt={`Preview ${index + 1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-75 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
              )}
               {isSubmitting && (
                <div className="space-y-2 pt-4">
                  <p className="text-sm font-medium text-center">Uploading product...</p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button type="reset" variant="outline" disabled={isSubmitting}>
              Reset Form
            </Button>
            <Button type="submit" disabled={isSubmitting || !isClient}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Product...</> : 'Add Product'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
