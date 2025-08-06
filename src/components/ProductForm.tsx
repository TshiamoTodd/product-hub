"use client";

import { useState } from 'react';
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

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const productFormSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long."),
  shortDescription: z.string().min(10, "Short description is required.").max(120, "Short description must be 120 characters or less."),
  fullDescription: z.string().min(10, "Full description is required."),
  regularPrice: z.coerce.number({ invalid_type_error: "Price must be a number."}).positive("Price must be positive."),
  salePrice: z.coerce.number().optional().nullable(),
  tags: z.string().optional(),
  images: z.custom<FileList>().refine(files => files && files.length > 0, 'At least one image is required.')
    .refine(files => files && files.length <= MAX_IMAGES, `You can upload a maximum of ${MAX_IMAGES} images.`)
    .refine(files => Array.from(files).every(file => file.size <= MAX_FILE_SIZE), `Each file size should be less than 5MB.`)
});

type ProductFormProps = {
  onSubmit: SubmitHandler<ProductFormValues>;
  isSubmitting: boolean;
  uploadProgress: number;
};

export default function ProductForm({ onSubmit, isSubmitting, uploadProgress }: ProductFormProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      fullDescription: '',
      regularPrice: 0,
      salePrice: null,
      tags: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentPreviews = previews.length;
      const filesToAdd = Array.from(files).slice(0, MAX_IMAGES - currentPreviews);
      
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);

      const dataTransfer = new DataTransfer();
      const existingFiles = form.getValues('images');
      if (existingFiles) {
        Array.from(existingFiles).forEach(file => dataTransfer.items.add(file));
      }
      filesToAdd.forEach(file => dataTransfer.items.add(file));

      form.setValue('images', dataTransfer.files, { shouldValidate: true });
    }
  };

  const removePreview = (index: number) => {
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]); // Clean up object URL
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    const currentFiles = form.getValues('images');
    if(currentFiles) {
      const newFiles = new DataTransfer();
      Array.from(currentFiles).forEach((file, i) => {
        if(i !== index) newFiles.items.add(file);
      });
      form.setValue('images', newFiles.files, { shouldValidate: true });
    }
  };
  
  const internalSubmit: SubmitHandler<z.infer<typeof productFormSchema>> = (data) => {
    onSubmit(data);
    if (!form.formState.isSubmitting) {
        // Wait for next tick to reset form, allows isSubmitting to propagate
        setTimeout(() => {
            if (!form.formState.isSubmitSuccessful) return;
            form.reset();
            setPreviews([]);
            // Clean up any remaining object URLs
            previews.forEach(p => URL.revokeObjectURL(p));
        }, 0);
    }
  };

  const handleFormReset = () => {
    form.reset();
    previews.forEach(p => URL.revokeObjectURL(p)); // Clean up object URLs
    setPreviews([]);
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Add a New Product</CardTitle>
        <CardDescription>Fill in the details below to add a new product to your catalog.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(internalSubmit)} onReset={handleFormReset} className="space-y-8">
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
                      <div className="flex flex-col items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 5MB each)</p>
                          </div>
                          <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*" disabled={previews.length >= MAX_IMAGES}/>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {previews.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm font-medium">Image Previews <Badge variant="secondary">{previews.length} / {MAX_IMAGES}</Badge></div>
                    <div className="grid grid-cols-3 gap-4">
                    {previews.map((src, index) => (
                        <div key={index} className="relative group">
                        <Image src={src} alt={`Preview ${index + 1}`} width={100} height={100} className="rounded-md object-cover w-full aspect-square" />
                        <button type="button" onClick={() => removePreview(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-75 group-hover:opacity-100 transition-opacity">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Product...</> : 'Add Product'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
