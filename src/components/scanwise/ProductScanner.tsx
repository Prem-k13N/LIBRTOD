
// src/components/scanwise/ProductScanner.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import Image from 'next/image'; // Image component no longer needed for camera feed
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, ScanSearch, Lightbulb, Info, AlertTriangle, Package, Sparkles, ScanLine, CameraOff } from 'lucide-react'; // Replaced Camera with Video, Added CameraOff
import { getProductDescriptionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";


const ProductScanSchema = z.object({
  productName: z.string().min(2, { message: "Product name must be at least 2 characters." }).max(100, {message: "Product name must be 100 characters or less."}),
  contextClues: z.string().max(500, {message: "Context clues must be 500 characters or less."}).optional(),
});

type ProductScanFormData = z.infer<typeof ProductScanSchema>;

interface ProductInfo {
  name: string;
  description: string;
}

const mockDetectedObjects = [
  { name: 'Organic Red Apple', clues: 'Fresh fruit, grocery item, healthy snack, produce section' },
  { name: 'Ergonomic Wireless Mouse', clues: 'Computer peripheral, electronics, office accessory, Bluetooth connectivity' },
  { name: 'Handmade Ceramic Mug', clues: 'Kitchenware, beverage container, artisanal, coffee or tea' },
  { name: 'Spiral Bound Notebook', clues: 'Stationery, office supplies, for writing or drawing, A5 size' },
  { name: 'Bluetooth Headphones', clues: 'Audio device, electronics, over-ear, noise-cancelling' },
];

export default function ProductScanner() {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null initially, then true/false
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported by this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Please try a different browser.',
        });
        return;
      }
      try {
        // Requesting the back camera (environment)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCameraPermission(false);
        // Attempt fallback to any camera if environment facing mode fails
        try {
            console.log("Falling back to default camera");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            toast({
              variant: 'default',
              title: 'Using Default Camera',
              description: 'Could not access back camera. Switched to default camera.',
            });
        } catch (fallbackErr) {
             console.error('Error accessing fallback camera:', fallbackErr);
             setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to use ScanWise.',
             });
        }
      }
    };

    getCameraPermission();

    // Cleanup function to stop video stream when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);


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

  const handleSimulateScan = () => {
    setError(null); // Clear previous errors
    setProductInfo(null); // Clear previous product info

    const randomIndex = Math.floor(Math.random() * mockDetectedObjects.length);
    const detectedObject = mockDetectedObjects[randomIndex];

    form.setValue('productName', detectedObject.name, { shouldValidate: true });
    form.setValue('contextClues', detectedObject.clues, { shouldValidate: true });
    
    toast({
      title: "Object Detected (Simulated)",
      description: `Product fields populated with: ${detectedObject.name}`,
    });
  };

  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      {/* Live Camera View (takes 2/5 width on md screens) */}
      <Card className="md:col-span-2 shadow-xl border-border/80 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/60 p-4">
          <CardTitle className="flex items-center text-lg">
            <Video className="mr-2 h-5 w-5 text-primary" />
            Live Camera Feed
          </CardTitle>
          <CardDescription className="text-sm !mt-1">
            Your camera feed is shown below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="aspect-[4/3] bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed border-border/70">
            {hasCameraPermission === null && ( // Still checking permission
                <Skeleton className="w-full h-full aspect-[4/3]" />
            )}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4 text-center">
                    <CameraOff className="h-12 w-12 text-destructive mb-2" />
                    <p className="font-semibold text-destructive">Camera Access Denied</p>
                    <p className="text-xs text-muted-foreground">Please enable camera permissions in your browser settings.</p>
                </div>
            )}
          </div>
          
          <Button 
            type="button" 
            onClick={handleSimulateScan} 
            className="w-full"
            disabled={isLoading || hasCameraPermission === false} // Disable if no camera or loading
          >
            <ScanLine className="mr-2 h-5 w-5" />
            Simulate Object Scan from Feed
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Click "Simulate Object Scan" to auto-fill product details based on a mock detection.
          </p>
          {hasCameraPermission === false && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Camera access is denied or not available. The live feed cannot be displayed. You can still simulate a scan.
                </AlertDescription>
            </Alert>
          )}
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
            <CardDescription className="text-sm !mt-1">Enter product details or use simulated scan for an AI-generated description.</CardDescription>
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

    
