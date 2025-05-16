
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
import { useLanguage } from '@/contexts/LanguageContext'; // Import useLanguage

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
  howToUse?: string;
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
  const { language, t } = useLanguage(); // Get language and translation function
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
  }, [mode, form, language]); // Add language to reset dependencies


  const handleAutoDetectObject = useCallback(async () => {
    if (!videoRef.current || hasCameraPermission !== true || !navigator.mediaDevices || isDetectingObject) {
      return;
    }

    setIsDetectingObject(true);
    setDetectionError(null);

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
      const errMsg = t('productScanner.captureErrorCanvas');
      setDetectionError(errMsg);
      toast({ variant: 'destructive', title: t('productScanner.captureErrorTitle'), description: errMsg });
      setIsDetectingObject(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageDataUri: string;
    try {
      imageDataUri = canvas.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      console.error("Error converting canvas to data URI:", e);
      const errMsg = t('productScanner.imageProcessingError');
      setDetectionError(errMsg);
      toast({ variant: 'destructive', title: t('productScanner.imageProcessingErrorTitle'), description: errMsg });
      setIsDetectingObject(false);
      return;
    }

    const result = await detectObjectAction({ imageDataUri, language }); // Pass language here

    if (result.success && result.data) {
      form.setValue('itemName', result.data.objectName, { shouldValidate: true });
      form.setValue('contextClues', result.data.contextualClues || '', { shouldValidate: true });
      toast({
        title: t('productScanner.objectDetectedToastTitle'),
        description: t('productScanner.objectDetectedToastDescription', result.data.objectName),
      });
      setDetectionError(null);
    } else {
      const errorMessage = result.error || t('productScanner.aiFailedToDetectError');
      setDetectionError(errorMessage);
      if (detectionBehavior === 'manual') {
        toast({
            variant: 'destructive',
            title: t('productScanner.detectionFailedToastTitle'),
            description: errorMessage,
        });
      }
    }
    setIsDetectingObject(false);
  }, [hasCameraPermission, form, toast, isDetectingObject, detectionBehavior, mode, t, language]); // Added t and language

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Camera API not supported by this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('productScanner.cameraNotSupportedTitle'),
          description: t('productScanner.cameraNotSupportedDescription'),
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
              title: t('productScanner.usingDefaultCameraTitle'),
              description: t('productScanner.usingDefaultCameraDescription'),
            });
        } catch (fallbackErr) {
             console.error('Error accessing fallback camera:', fallbackErr);
             setHasCameraPermission(false);
             toast({
                variant: 'destructive',
                title: t('productScanner.cameraAccessDeniedTitle'),
                description: t('productScanner.cameraAccessDeniedToastDescription'),
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
  }, [toast, t]); 

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
        setError(result.error || t('productScanner.failedToGetProductDescriptionError'));
      }
    } else if (mode === 'medicine') {
      const result = await getMedicineInfoAction({ medicineName: data.itemName, language: language });
      if (result.success && result.data) {
        setScanResult({
          type: 'medicine',
          name: result.data.medicineName,
          usage: result.data.usage,
          howToUse: result.data.howToUse,
          commonBrands: result.data.commonBrands,
          precautions: result.data.precautions,
          disclaimer: t('productScanner.importantDisclaimerText')
        });
      } else {
        setError(result.error || t('productScanner.failedToGetMedicineInfoError'));
      }
    }
    setIsLoading(false);
  };

  const formLabel = mode === 'medicine' ? t('productScanner.detectedMedicineNameLabel') : t('productScanner.detectedProductNameLabel');
  const buttonText = mode === 'medicine' ? t('productScanner.getMedicineInfoButton') : t('productScanner.getAIDescriptionButton');
  const formPlaceholder = mode === 'medicine' ? t('productScanner.medicineNamePlaceholder') : t('productScanner.productNamePlaceholder');

  return (
    <div className="grid md:grid-cols-5 gap-8 items-start">
      <Card className="md:col-span-2 shadow-xl border-border/80 rounded-lg overflow-hidden">
        <CardHeader className="bg-card/50 border-b border-border/60 p-4">
          <div className="flex justify-between items-center mb-1">
            <CardTitle className="flex items-center text-lg">
              <Video className="mr-2 h-5 w-5 text-primary" />
              {t('productScanner.liveCameraFeedTitle')}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={detectionBehavior === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDetectionBehavior('auto')}
                disabled={hasCameraPermission !== true || isDetectingObject}
                className="text-xs px-3 py-1 h-auto"
                suppressHydrationWarning={true}
              >
                {t('productScanner.autoButton')}
              </Button>
              <Button
                variant={detectionBehavior === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDetectionBehavior('manual')}
                disabled={hasCameraPermission !== true || isDetectingObject}
                className="text-xs px-3 py-1 h-auto"
                suppressHydrationWarning={true}
              >
                {t('productScanner.manualButton')}
              </Button>
            </div>
          </div>
          <CardDescription className="text-sm !mt-1">
            {detectionBehavior === 'auto'
              ? t('productScanner.autoDetectionActive', mode)
              : t('productScanner.manualDetectionMode')}
            {isDetectingObject && <span className="italic text-primary"> {t('productScanner.detectingStatus')}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="aspect-[4/3] bg-muted/50 rounded-md flex items-center justify-center overflow-hidden border border-dashed border-border/70 relative">
            {hasCameraPermission === null && <Skeleton className="w-full h-full aspect-[4/3]" />}
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4 text-center">
                    <CameraOff className="h-12 w-12 text-destructive mb-2" />
                    <p className="font-semibold text-destructive">{t('productScanner.cameraAccessDeniedTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('productScanner.cameraAccessDeniedDescription')}</p>
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
            suppressHydrationWarning={true}
          >
            <Camera className="mr-2 h-4 w-4" />
            {detectionBehavior === 'auto' ? t('productScanner.detectOverrideButton') : t('productScanner.detectManuallyButton')}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {detectionBehavior === 'auto'
                ? t('productScanner.autoDetectionHint')
                : t('productScanner.manualDetectionHint')
            }
          </p>
          {detectionError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('productScanner.detectionErrorTitle')}</AlertTitle>
              <AlertDescription>{detectionError}</AlertDescription>
            </Alert>
          )}
          {hasCameraPermission === false && !detectionError && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('productScanner.cameraAccessRequiredTitle')}</AlertTitle>
                <AlertDescription>{t('productScanner.cameraAccessRequiredDescription')}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-3 space-y-6">
        <Card className="shadow-xl border-border/80 rounded-lg">
          <CardHeader className="bg-card/50 border-b border-border/60 p-4">
            <CardTitle className="flex items-center text-lg">
              {mode === 'medicine' ? <Pill className="mr-2 h-5 w-5 text-primary" /> : <ScanSearch className="mr-2 h-5 w-5 text-primary" />}
              {mode === 'medicine' ? t('productScanner.medicineIdentifierTitle') : t('productScanner.itemScannerTitle')}
            </CardTitle>
            <CardDescription className="text-sm !mt-1">{t('productScanner.formDescription')}</CardDescription>
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
                        <Input placeholder={formPlaceholder} {...field} className="text-base" readOnly={isDetectingObject} suppressHydrationWarning={true} />
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
                        {t('productScanner.contextCluesLabel')}
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('productScanner.contextCluesPlaceholder')} {...field} className="text-base min-h-[80px]" readOnly={isDetectingObject} suppressHydrationWarning={true} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full text-base py-3 h-11" disabled={isLoading || isDetectingObject || !form.getValues("itemName")} suppressHydrationWarning={true}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('productScanner.generatingButton')}
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
            <AlertTitle className="font-semibold">{t('productScanner.errorAlertTitle')}</AlertTitle>
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
              <h3 className="font-semibold mb-2 text-base text-muted-foreground">{t('productScanner.aiGeneratedDescriptionLabel')}</h3>
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
                <h3 className="font-semibold mb-1 text-base text-muted-foreground">{t('productScanner.typicalUsageLabel')}</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.usage}</p>
              </div>
              {scanResult.howToUse && (
                <div>
                  <h3 className="font-semibold mb-1 text-base text-muted-foreground">{t('productScanner.howToUseLabel')}</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.howToUse}</p>
                </div>
              )}
              {scanResult.commonBrands && (
                <div>
                  <h3 className="font-semibold mb-1 text-base text-muted-foreground">{t('productScanner.commonBrandNamesLabel')}</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.commonBrands}</p>
                </div>
              )}
              {scanResult.precautions && (
                <div>
                  <h3 className="font-semibold mb-1 text-base text-muted-foreground">{t('productScanner.generalPrecautionsLabel')}</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{scanResult.precautions}</p>
                </div>
              )}
              {scanResult.disclaimer && (
                <Alert variant="default" className="mt-4 border-blue-500/50 bg-blue-100/70 dark:bg-blue-900/30">
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">{t('productScanner.importantDisclaimerTitle')}</AlertTitle>
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

