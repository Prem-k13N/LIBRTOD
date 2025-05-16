// src/components/scanwise/ProductScanner.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, ScanSearch, Lightbulb, Info, AlertTriangle, Package, Sparkles } from 'lucide-react';
import { getProductDescriptionAction } from '@/app/actions';

const ProductScanSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }).max(100, {message: "Product name must be 100 characters or less."}),
  contextClues: z.string().max(500, {message: "Context clues must be 500 characters or less."}).optional(),
});

type ProductScanFormData = z.infer<typeof ProductScanSchema>;

interface ProductInfo {
  name: string;
  description: string;
}

export default function ProductScanner() {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // Generate timestamp client-side to avoid hydration mismatch for placeholder image
    setCurrentTimestamp(new Date().getTime().toString());
  }, []);


  const form = useForm<ProductScanFormData>({
    resolver: zodResolver(ProductScanSchema),
    defaultValues: {
      productName: '',
      contextClues: '',
    },
  });

  const onSubmit: SubmitHandler<ProductScanFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    // Keep previous productInfo visible while loading new one, or clear it:
    // setProductInfo(null); 

    const result = await getProductDescriptionAction({
      productName: data.productName,
      contextClues: data.contextClues,
    });

    if (result.success && result.data) {
      setProductInfo({ name: data.productName, description: result.data.description });
      // Optionally reset the form or parts of it
      // form.reset({ productName: data.productName, contextClues: '' }); 
    } else {
      setError(result.error || "Failed to get product description.");
      setProductInfo(null); // Clear previous results on error
    }
    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      {/* Simulated Camera View (takes 2/5 width on md screens) */}
      <Card className="md:col-span-2 shadow-xl border-border/80 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/60 p-4">
          <CardTitle className="flex items-center text-lg">
            <Camera className="mr-2 h-5 w-5 text-primary" />
            Camera Simulation
          </CardTitle>
          <CardDescription className="text-sm !mt-1">
            Illustrative live camera feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="aspect-[4/3] bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed border-border/70">
            {currentTimestamp ? (
                 <Image
                    src={`https://placehold.co/600x450.png?t=${currentTimestamp}`} // 4:3 aspect ratio
                    alt="Simulated camera feed"
                    width={600}
                    height={450}
                    className="object-cover w-full h-full"
                    priority // Prioritize loading this image
                    data-ai-hint="retail products" 
                 />
            ) : (
                <Skeleton className="w-full h-full aspect-[4/3]" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            In a full version, objects would be detected and scanned directly from the camera feed.
          </p>
        </CardContent>
      </Card>

      {/* Scanner Controls and Results (takes 3/5 width on md screens) */}
      <div className="md:col-span-3 space-y-6">
        <Card className="shadow-xl border-border/80 rounded-lg">
          <CardHeader className="bg-card/50 border-b border-border/60 p-4">
            <CardTitle className="flex items-center text-lg">
              <ScanSearch className="mr-2 h-5 w-5 text-primary" />
              Product Scanner
            </CardTitle>
            <CardDescription className="text-sm !mt-1">Enter product details for an AI-generated description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        Product Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Smart Coffee Maker" {...field} className="text-base" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contextClues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" />
                        Context Clues (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., brand, features, category like 'kitchen appliance'" {...field} className="text-base min-h-[80px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-base py-3 h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Get AI Description
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && !productInfo && ( // Show skeleton only if no previous data or initial load
          <Card className="shadow-lg border-border/80 rounded-lg animate-pulse">
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive" className="shadow-md border-destructive/50 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Scan Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {productInfo && (
          <Card className="shadow-lg border-border/80 rounded-lg">
            <CardHeader className="bg-card/50 border-b border-border/60 p-4">
              <CardTitle className="flex items-center text-lg">
                <Info className="mr-2 h-5 w-5 text-accent" />
                {productInfo.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 text-base text-muted-foreground">AI Generated Description:</h3>
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{productInfo.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
