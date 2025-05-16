
// src/components/scanwise/ProductScanner.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
import { Video, ScanSearch, Lightbulb, Info, AlertTriangle, Package, Sparkles, CameraOff, Pill, HelpCircle, Camera } from 'lucide-react';
import { getProductDescriptionAction, detectObjectAction, getMedicineInfoAction } from '@/app/actions';
import type { DetectionMode } from '@/app/page';
import { useToast } from "@/hooks/use-toast";

const ItemScanSchema = z.object({
  itemName: z.string().min(2, { message: "Item name must be at least 2 characters." }).max(100, {message: "Item name must be 100 characters or less."}),
  contextClues: z.string().max(500, {message: "Context clues must be 500 characters or less."}).optional(),
});

type ItemScanFormData = z.infer<typeof ItemScanSchema>;

interface GeneralScanResult {
  type: 'general';
  name: string;
  description: string;
}

interface MedicineScanResult {
  type: 'medicine';
  name: string;
  usage: string;
  commonBrands?: string;
  precautions?: string;
  disclaimer?: string;
}

type ScanResult = GeneralScanResult | MedicineScanResult | null;
type DetectionBehavior = 'auto' | 'manual';

const AUTO_DETECT_INTERVAL = 7000;

interface ProductScannerProps {
  mode: DetectionMode;
}

export default function ProductScanner({ mode }: ProductScannerProps) {
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDetectingObject, setIsDetectingObject] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [detectionBehavior, setDetectionBehavior] = useState<DetectionBehavior>('auto');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const form = useForm<ItemScanFormData>({
    resolver: zodResolver(ItemScanSchema),
    defaultValues: {
      itemName: '',
      contextClues: '',
    },
  });

  useEffect(() => {
    form.reset({ itemName: '', contextClues: '' });
    setScanResult(null);
    setError(null);
    setDetectionError(null);
    // Optionally reset detectionBehavior to 'auto' when mode changes, or persist it.
    // setDetectionBehavior('auto'); 
  }, [mode, form]);


  const handleAutoDetectObject = useCallback(async () => {
    if (!videoRef.current || hasCameraPermission !== true || !navigator.mediaDevices || isDetectingObject) {
      return;
    }

    setIsDetectingObject(true);
    setDetectionError(null); // Clear previous detection error

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log("Video dimensions not yet available for capture.");
        setIsDetectingObject(false);
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const errMsg = 'Failed to capture image from camera (canvas context error).';
      setDetectionError(errMsg);
      toast({ variant: 'destructive', title: 'Capture Error', description: errMsg });
      setIsDetectingObject(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageDataUri: string;
    try {
      imageDataUri = canvas.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      console.error("Error converting canvas to data URI:", e);
      const errMsg = 'Failed to process captured image.';
      setDetectionError(errMsg);
      toast({ variant: 'destructive', title: 'Image Processing Error', description: errMsg });
      setIsDetectingObject(false);
      return;
    }

    const result = await detectObjectAction({ imageDataUri });

    if (result.success && result.data) {
      form.setValue('itemName', result.data.objectName, { shouldValidate: true });
      form.setValue('contextClues', result.data.contextualClues || '', { shouldValidate: true });
      toast({
        title: 'Object Detected!',
        description: `Identified: ${result.data.objectName}. You can now get its AI details.`,
      });
      setDetectionError(null);
    } else {
      const errorMessage = result.error || 'AI failed to detect object from image.';
      setDetectionError(errorMessage);
      // Do not show a toast here for auto-detection failures to avoid spamming, error is shown in alert.
      // Only show toast for manual trigger failures if desired or for consistent feedback.
      if (detectionBehavior === 'manual') { // Or some other condition for when to toast failure
        toast({
            variant: 'destructive',
            title: 'Detection Failed',
            description: errorMessage,
        });
      }
    }
    setIsDetectingObject(false);
  }, [hasCameraPermission, form, toast, isDetectingObject, detectionBehavior, mode]); // Added mode to dependencies

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
                description: 'Please enable camera permissions in your browser settings to use LIBRTOD.',
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let initialDetectionTimeout: NodeJS.Timeout | null = null;

    if (hasCameraPermission === true && !isDetectingObject && detectionBehavior === 'auto') {
      initialDetectionTimeout = setTimeout(() => {
         if (!isDetectingObject && videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_METADATA && detectionBehavior === 'auto') {
            handleAutoDetectObject();
         }
      }, 1500);

      intervalId = setInterval(() => {
        if (!isDetectingObject && videoRef.current && videoRef.current.readyState >= videoRef.current.HAVE_METADATA && detectionBehavior === 'auto') {
           handleAutoDetectObject();
        }
      }, AUTO_DETECT_INTERVAL);
    }
    return () => {
        if (initialDetectionTimeout) clearTimeout(initialDetectionTimeout);
        if (intervalId) clearInterval(intervalId);
    };
  }, [hasCameraPermission, handleAutoDetectObject, isDetectingObject, detectionBehavior]);


  const onSubmitItemInfo: SubmitHandler<ItemScanFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    if (mode === 'general') {
      const result = await getProductDescriptionAction({
        productName: data.itemName,
        contextClues: data.contextClues,
      });
      if (result.success && result.data) {
        setScanResult({ type: 'general', name: data.itemName, description: result.data.description });
      } else {
        setError(result.error || "Failed to get product description.");
      }
    } else if (mode === 'medicine') {
      const result = await getMedicineInfoAction({ medicineName: data.itemName });
      if (result.success && result.data) {
        setScanResult({
          type: 'medicine',
          name: result.data.medicineName,
          usage: result.data.usage,
          commonBrands: result.data.commonBrands,
          precautions: result.data.precautions,
          disclaimer: "This information is for general knowledge and not a substitute for professional medical advice. Always consult a healthcare provider for medical concerns."
        });
      } else {
        setError(result.error || "Failed to get medicine information.");
      }
    }
    setIsLoading(false);
  };

  const formLabel = mode === 'medicine' ? 'Detected Medicine Name' : 'Detected Product Name';
  const buttonText = mode === 'medicine' ? 'Get Medicine Info' : 'Get AI Description';
  const formPlaceholder = mode === 'medicine' ? 'e.g., Ibuprofen' : 'e.g., Smart Coffee Maker';

  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      <Card className="md:col-span-2 shadow-xl border-border/80 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/60 p-4">
          <div className="flex justify-between items-center mb-1">
            <CardTitle className="flex items-center text-lg">
              <Video className="mr-2 h-5 w-5 text-primary" />
              Live Camera Feed
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={detectionBehavior === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDetectionBehavior('auto')}
                disabled={hasCameraPermission !== true || isDetectingObject}
                className="text-xs px-3 py-1 h-auto"
              >
                Auto
              </Button>
              <Button
                variant={detectionBehavior === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDetectionBehavior('manual')}
                disabled={hasCameraPermission !== true || isDetectingObject}
                className="text-xs px-3 py-1 h-auto"
              >
                Manual
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm !mt-1">
            {detectionBehavior === 'auto'
              ? `Automatic detection is active for ${mode} items.`
              : `Manual detection mode. Point camera and use button below.`}
            {isDetectingObject && <span className="italic text-primary"> (Detecting...)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="aspect-[4/3] bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed border-border/70 relative">
            {hasCameraPermission === null && <Skeleton className="w-full h-full aspect-[4/3]" />}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4 text-center">
                    <CameraOff className="h-12 w-12 text-destructive mb-2" />
                    <p className="font-semibold text-destructive">Camera Access Denied</p>
                    <p className="text-xs text-muted-foreground">Please enable camera permissions.</p>
                </div>
            )}
             {isDetectingObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
          </div>
          <Button
            onClick={handleAutoDetectObject}
            disabled={hasCameraPermission !== true || isDetectingObject}
            className="w-full"
            variant="outline"
          >
            <Camera className="mr-2 h-4 w-4" />
            {detectionBehavior === 'auto' ? 'Detect Now (Override Auto)' : 'Capture & Detect Manually'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {detectionBehavior === 'auto'
                ? "Auto-detection active. Override or wait for next scan."
                : "Click the button above to detect an object."
            }
          </p>
          {detectionError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Detection Error</AlertTitle>
              <AlertDescription>{detectionError}</AlertDescription>
            </Alert>
          )}
          {hasCameraPermission === false && !detectionError && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>Camera access is needed for detection.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-3 space-y-6">
        <Card className="shadow-xl border-border/80 rounded-lg">
          <CardHeader className="bg-card/50 border-b border-border/60 p-4">
            <CardTitle className="flex items-center text-lg">
              {mode === 'medicine' ? <Pill className="mr-2 h-5 w-5 text-primary" /> : <ScanSearch className="mr-2 h-5 w-5 text-primary" />}
              {mode === 'medicine' ? 'Medicine Identifier' : 'Item Scanner'}
            </CardTitle>
            <CardDescription className="text-sm !mt-1">Detected details appear below. Then, get AI-generated information.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitItemInfo)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="itemName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center font-semibold">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formLabel}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={formPlaceholder} {...field} className="text-base" readOnly={isDetectingObject} />
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
                        <Textarea placeholder="e.g., brand, type, visual cues" {...field} className="text-base min-h-[80px]" readOnly={isDetectingObject}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-base py-3 h-11" disabled={isLoading || isDetectingObject || !form.getValues("itemName")}>
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
                      <Sparkles className="mr-2 h-5 w-5" /> {buttonText}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && !scanResult && (
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
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {scanResult && scanResult.type === 'general' && (
          <Card className="shadow-lg border-border/80 rounded-lg">
            <CardHeader className="bg-card/50 border-b border-border/60 p-4">
              <CardTitle className="flex items-center text-lg">
                <Info className="mr-2 h-5 w-5 text-accent" />
                {scanResult.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 text-base text-muted-foreground">AI Generated Description:</h3>
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.description}</p>
            </CardContent>
          </Card>
        )}
        
        {scanResult && scanResult.type === 'medicine' && (
          <Card className="shadow-lg border-border/80 rounded-lg">
            <CardHeader className="bg-card/50 border-b border-border/60 p-4">
              <CardTitle className="flex items-center text-lg">
                <Pill className="mr-2 h-5 w-5 text-accent" />
                {scanResult.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-1 text-base text-muted-foreground">Typical Usage:</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.usage}</p>
              </div>
              {scanResult.commonBrands && (
                <div>
                  <h3 className="font-semibold mb-1 text-base text-muted-foreground">Common Brand Names:</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.commonBrands}</p>
                </div>
              )}
              {scanResult.precautions && (
                <div>
                  <h3 className="font-semibold mb-1 text-base text-muted-foreground">General Precautions:</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.precautions}</p>
                </div>
              )}
              {scanResult.disclaimer && (
                <Alert variant="default" className="mt-4 border-blue-500/50 bg-blue-100/70 dark:bg-blue-900/30">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">Important Disclaimer</AlertTitle>
                    <AlertDescription className="text-blue-600/90 dark:text-blue-400/90">
                    {scanResult.disclaimer}
                    </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

