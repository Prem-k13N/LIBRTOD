
// src/components/scanwise/ProductScanner.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, ScanSearch, Lightbulb, Info, AlertTriangle, Package, Sparkles, CameraOff, Aperture } from 'lucide-react'; // Added Aperture
import { getProductDescriptionAction, detectObjectAction } from '@/app/actions'; // Added detectObjectAction
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

export default function ProductScanner() {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For description generation
  const [error, setError] = useState<string | null>(null); // For description generation
  const [isDetectingObject, setIsDetectingObject] = useState(false); // For object detection
  const [detectionError, setDetectionError] = useState<string | null>(null); // For object detection

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
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
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing environment camera:', err);
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

  const onSubmitProductDescription: SubmitHandler<ProductScanFormData> = async (data) => {
    setIsLoading(true);
    setError(null);

    const result = await getProductDescriptionAction({
      productName: data.productName,
      contextClues: data.contextClues,
    });

    if (result.success && result.data) {
      setProductInfo({ name: data.productName, description: result.data.description });
    } else {
      setError(result.error || "Failed to get product description.");
      setProductInfo(null);
    }
    setIsLoading(false);
  };

  const handleDetectObject = async () => {
    if (!videoRef.current || hasCameraPermission !== true) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Ready',
        description: 'Please ensure camera access is enabled and the feed is active.',
      });
      return;
    }

    setIsDetectingObject(true);
    setDetectionError(null);
    // Clear previous product info and form for new detection
    // setProductInfo(null); // Don't clear product info yet, user might want to compare
    form.reset({ productName: '', contextClues: ''}); // Reset form for new detection

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Set canvas dimensions to match video's intrinsic dimensions for best quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      const errMsg = 'Failed to capture image from camera (canvas context error).';
      setDetectionError(errMsg);
      toast({
        variant: 'destructive',
        title: 'Capture Error',
        description: errMsg,
      });
      setIsDetectingObject(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageDataUri: string;
    try {
      imageDataUri = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size, 0.9 quality
    } catch (e) {
      console.error("Error converting canvas to data URI:", e);
      const errMsg = 'Failed to process captured image.';
       setDetectionError(errMsg);
      toast({
        variant: 'destructive',
        title: 'Image Processing Error',
        description: errMsg,
      });
      setIsDetectingObject(false);
      return;
    }
    

    const result = await detectObjectAction({ imageDataUri });

    if (result.success && result.data) {
      form.setValue('productName', result.data.objectName, { shouldValidate: true });
      form.setValue('contextClues', result.data.contextualClues || '', { shouldValidate: true });
      toast({
        title: 'Object Detected!',
        description: `Identified: ${result.data.objectName}. You can now get its AI description.`,
      });
    } else {
      const errorMessage = result.error || 'AI failed to detect object from image.';
      setDetectionError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Detection Failed',
        description: errorMessage,
      });
    }
    setIsDetectingObject(false);
  };


  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      <Card className="md:col-span-2 shadow-xl border-border/80 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/60 p-4">
          <CardTitle className="flex items-center text-lg">
            <Video className="mr-2 h-5 w-5 text-primary" />
            Live Camera Feed
          </CardTitle>
          <CardDescription className="text-sm !mt-1">
            Your camera feed is shown below. Point it at an object.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="aspect-[4/3] bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed border-border/70">
            {hasCameraPermission === null && (
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
            onClick={handleDetectObject} 
            className="w-full"
            disabled={isLoading || hasCameraPermission !== true || isDetectingObject}
          >
            {isDetectingObject ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Detecting...
              </>
            ) : (
              <>
                <Aperture className="mr-2 h-5 w-5" />
                Detect Object
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Point your camera at an object and click "Detect Object" to try and identify it.
          </p>
          {detectionError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detection Error</AlertTitle>
              <AlertDescription>{detectionError}</AlertDescription>
            </Alert>
          )}
          {hasCameraPermission === false && !detectionError && ( // Show only if no other detection error is active
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Camera access is denied or not available. The live feed cannot be displayed.
                </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-3 space-y-6">
        <Card className="shadow-xl border-border/80 rounded-lg">
          <CardHeader className="bg-card/50 border-b border-border/60 p-4">
            <CardTitle className="flex items-center text-lg">
              <ScanSearch className="mr-2 h-5 w-5 text-primary" />
              Product Scanner
            </CardTitle>
            <CardDescription className="text-sm !mt-1">Use the camera to detect an object, then get its AI-generated description.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitProductDescription)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        Detected Product Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Smart Coffee Maker" {...field} className="text-base" readOnly={isDetectingObject} />
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
                        Context Clues (from detection)
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., brand, features, category" {...field} className="text-base min-h-[80px]" readOnly={isDetectingObject}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-base py-3 h-11" disabled={isLoading || isDetectingObject || !form.getValues("productName")}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Description...
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

        {isLoading && !productInfo && (
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

        {error && ( // This is for description generation error
          <Alert variant="destructive" className="shadow-md border-destructive/50 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Description Error</AlertTitle>
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
