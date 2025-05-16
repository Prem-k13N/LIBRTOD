
export type NestedTranslations = {
  [key: string]: string | ((...args: any[]) => string) | NestedTranslations;
};

export interface Translations {
  // HomePage
  pageSubtitle: string;
  generalItemsButton: string;
  medicinesButton: string;
  footerCopyright: (year: number) => string;
  footerCraftedWithAI: string;
  english: string;
  marathi: string;
  appDescription: string;

  // ProductScanner
  productScanner: {
    liveCameraFeedTitle: string;
    autoDetectionActive: (mode: string) => string;
    manualDetectionMode: string;
    detectingStatus: string;
    autoButton: string;
    manualButton: string;
    detectManuallyButton: string;
    detectOverrideButton: string;
    autoDetectionHint: string;
    manualDetectionHint: string;
    detectionErrorTitle: string;
    cameraAccessRequiredTitle: string;
    cameraAccessRequiredDescription: string;
    cameraAccessDeniedTitle: string;
    cameraAccessDeniedDescription: string;
    itemScannerTitle: string;
    medicineIdentifierTitle: string;
    formDescription: string;
    detectedProductNameLabel: string;
    detectedMedicineNameLabel: string;
    contextCluesLabel: string;
    productNamePlaceholder: string;
    medicineNamePlaceholder: string;
    contextCluesPlaceholder: string;
    getAIDescriptionButton: string;
    getMedicineInfoButton: string;
    generatingButton: string;
    errorAlertTitle: string;
    aiGeneratedDescriptionLabel: string;
    typicalUsageLabel: string;
    howToUseLabel: string; // New
    commonBrandNamesLabel: string;
    generalPrecautionsLabel: string;
    importantDisclaimerTitle: string;
    importantDisclaimerText: string;
    captureErrorCanvas: string; // New - for canvas error
    captureErrorTitle: string; // New - for canvas error title
    imageProcessingError: string; // New - for data URI error
    imageProcessingErrorTitle: string; // New - for data URI error title
    objectDetectedToastTitle: string; // New
    objectDetectedToastDescription: (name: string) => string; // New
    aiFailedToDetectError: string; // New
    detectionFailedToastTitle: string; // New
    cameraNotSupportedTitle: string; // New
    cameraNotSupportedDescription: string; // New
    usingDefaultCameraTitle: string; // New
    usingDefaultCameraDescription: string; // New
    cameraAccessDeniedToastDescription: string; // New
    failedToGetProductDescriptionError: string; // New
    failedToGetMedicineInfoError: string; // New
  };
}

export const translations: Record<string, NestedTranslations> = {
  en: {
    pageSubtitle: 'Instantly identify items.',
    generalItemsButton: 'General Items',
    medicinesButton: 'Medicines',
    footerCopyright: (year: number) => `© ${year} LIBRTOD.`,
    footerCraftedWithAI: '',
    english: 'English',
    marathi: 'मराठी',
    appDescription: 'Identify products and get detailed descriptions with LIBRTOD.',

    productScanner: {
      liveCameraFeedTitle: 'Live Camera Feed',
      autoDetectionActive: (mode: string) => `Automatic detection is active for ${mode} items.`,
      manualDetectionMode: 'Manual detection mode. Point camera and use button below.',
      detectingStatus: '(Detecting...)',
      autoButton: 'Auto',
      manualButton: 'Manual',
      detectManuallyButton: 'Capture & Detect Manually',
      detectOverrideButton: 'Detect Now (Override Auto)',
      autoDetectionHint: 'Auto-detection active. Override or wait for next scan.',
      manualDetectionHint: 'Click the button above to detect an object.',
      detectionErrorTitle: 'Detection Error',
      cameraAccessRequiredTitle: 'Camera Access Required',
      cameraAccessRequiredDescription: 'Camera access is needed for detection.',
      cameraAccessDeniedTitle: 'Camera Access Denied',
      cameraAccessDeniedDescription: 'Please enable camera permissions in your browser settings.',
      itemScannerTitle: 'Item Scanner',
      medicineIdentifierTitle: 'Medicine Identifier',
      formDescription: 'Detected details appear below.',
      detectedProductNameLabel: 'Detected Product Name',
      detectedMedicineNameLabel: 'Detected Medicine Name',
      contextCluesLabel: 'Context Clues (from detection)',
      productNamePlaceholder: 'e.g., Smart Coffee Maker',
      medicineNamePlaceholder: 'e.g., Ibuprofen',
      contextCluesPlaceholder: 'e.g., brand, type, visual cues',
      getAIDescriptionButton: 'Get AI Description',
      getMedicineInfoButton: 'Get Medicine Info',
      generatingButton: 'Generating...',
      errorAlertTitle: 'Error',
      aiGeneratedDescriptionLabel: 'AI Generated Description:',
      typicalUsageLabel: 'Typical Usage:',
      howToUseLabel: 'How to Use (General Guidance):',
      commonBrandNamesLabel: 'Common Brand Names:',
      generalPrecautionsLabel: 'General Precautions:',
      importantDisclaimerTitle: 'Important Disclaimer',
      importantDisclaimerText: 'This information is for general knowledge and not a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.',
      captureErrorCanvas: 'Could not get 2D context from canvas for image capture.',
      captureErrorTitle: 'Capture Error',
      imageProcessingError: 'Error converting camera frame to image data.',
      imageProcessingErrorTitle: 'Image Processing Error',
      objectDetectedToastTitle: 'Object Detected',
      objectDetectedToastDescription: (name: string) => `Identified: ${name}. Details populated below.`,
      aiFailedToDetectError: 'AI failed to detect an object in the image.',
      detectionFailedToastTitle: 'Detection Failed',
      cameraNotSupportedTitle: 'Camera Not Supported',
      cameraNotSupportedDescription: 'Your browser does not support camera access or it is disabled.',
      usingDefaultCameraTitle: 'Using Default Camera',
      usingDefaultCameraDescription: 'Could not access environment (back) camera. Switched to default camera.',
      cameraAccessDeniedToastDescription: 'Please enable camera permissions in your browser settings to use this feature.',
      failedToGetProductDescriptionError: 'Failed to get product description from AI.',
      failedToGetMedicineInfoError: 'Failed to get medicine information from AI.',
    },
  },
  mr: {
    pageSubtitle: 'वस्तू त्वरित ओळखा.',
    generalItemsButton: 'सामान्य वस्तू',
    medicinesButton: 'औषधे',
    footerCopyright: (year: number) => `© ${year} लिबर्टोड.`,
    footerCraftedWithAI: '',
    english: 'English',
    marathi: 'मराठी',
    appDescription: 'लिबर्टोडसह उत्पादने ओळखा आणि तपशीलवार माहिती मिळवा.',
    
    productScanner: {
      liveCameraFeedTitle: 'थेट कॅमेरा फीड',
      autoDetectionActive: (mode: string) => `${mode} वस्तूंसाठी स्वयंचलित ओळख सक्रिय आहे.`,
      manualDetectionMode: 'मॅन्युअल ओळख मोड. कॅमेरा निर्देशित करा आणि खालील बटण वापरा.',
      detectingStatus: '(ओळखत आहे...)',
      autoButton: 'स्वयं',
      manualButton: 'मॅन्युअल',
      detectManuallyButton: 'मॅन्युअली कॅप्चर करा आणि ओळखा',
      detectOverrideButton: 'आता ओळखा (स्वयं ओव्हरराइड करा)',
      autoDetectionHint: 'स्वयं-ओळख सक्रिय. ओव्हरराइड करा किंवा पुढील स्कॅनची प्रतीक्षा करा.',
      manualDetectionHint: 'वस्तू ओळखण्यासाठी वरील बटणावर क्लिक करा.',
      detectionErrorTitle: 'ओळख त्रुटी',
      cameraAccessRequiredTitle: 'कॅमेरा प्रवेश आवश्यक',
      cameraAccessRequiredDescription: 'ओळखण्यासाठी कॅमेरा प्रवेश आवश्यक आहे.',
      cameraAccessDeniedTitle: 'कॅमेरा प्रवेश नाकारला',
      cameraAccessDeniedDescription: 'कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये कॅमेरा परवानग्या सक्षम करा.',
      itemScannerTitle: 'वस्तू स्कॅनर',
      medicineIdentifierTitle: 'औषध ओळखकर्ता',
      formDescription: 'ओळखलेले तपशील खाली दिसतील.',
      detectedProductNameLabel: 'ओळखलेल्या उत्पादनाचे नाव',
      detectedMedicineNameLabel: 'ओळखलेल्या औषधाचे नाव',
      contextCluesLabel: 'संदर्भ संकेत (ओळखीतून)',
      productNamePlaceholder: 'उदा. स्मार्ट कॉफी मेकर',
      medicineNamePlaceholder: 'उदा. इबुप्रोफेन',
      contextCluesPlaceholder: 'उदा. ब्रँड, प्रकार, व्हिज्युअल संकेत',
      getAIDescriptionButton: 'AI वर्णन मिळवा',
      getMedicineInfoButton: 'औषधाची माहिती मिळवा',
      generatingButton: 'तयार करत आहे...',
      errorAlertTitle: 'त्रुटी',
      aiGeneratedDescriptionLabel: 'AI व्युत्पन्न वर्णन:',
      typicalUsageLabel: 'ठराविक वापर:',
      howToUseLabel: 'कसे वापरावे (सामान्य मार्गदर्शन):',
      commonBrandNamesLabel: 'सामान्य ब्रँड नावे:',
      generalPrecautionsLabel: 'सामान्य खबरदारी:',
      importantDisclaimerTitle: 'महत्त्वाची सूचना',
      importantDisclaimerText: 'ही माहिती सामान्य ज्ञानासाठी आहे आणि व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही. वैद्यकीय समस्यांसाठी नेहमी आरोग्य सेवा प्रदात्याचा सल्ला घ्या.',
      captureErrorCanvas: 'प्रतिमा कॅप्चरसाठी कॅनव्हासमधून २डी संदर्भ मिळू शकला नाही.',
      captureErrorTitle: 'कॅप्चर त्रुटी',
      imageProcessingError: 'कॅमेरा फ्रेमला प्रतिमा डेटामध्ये रूपांतरित करताना त्रुटी आली.',
      imageProcessingErrorTitle: 'प्रतिमा प्रक्रिया त्रुटी',
      objectDetectedToastTitle: 'वस्तू ओळखली',
      objectDetectedToastDescription: (name: string) => `ओळखले: ${name}. तपशील खाली भरले आहेत.`,
      aiFailedToDetectError: 'AI प्रतिमेतील वस्तू ओळखण्यात अयशस्वी झाले.',
      detectionFailedToastTitle: 'ओळख अयशस्वी',
      cameraNotSupportedTitle: 'कॅमेरा समर्थित नाही',
      cameraNotSupportedDescription: 'तुमचा ब्राउझर कॅमेरा प्रवेशास समर्थन देत नाही किंवा तो अक्षम केला आहे.',
      usingDefaultCameraTitle: 'डीफॉल्ट कॅमेरा वापरत आहे',
      usingDefaultCameraDescription: 'पर्यावरण (मागील) कॅमेरामध्ये प्रवेश करू शकला नाही. डीफॉल्ट कॅमेरावर स्विच केले.',
      cameraAccessDeniedToastDescription: 'हे वैशिष्ट्य वापरण्यासाठी कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये कॅमेरा परवानग्या सक्षम करा.',
      failedToGetProductDescriptionError: 'AI कडून उत्पादनाचे वर्णन मिळविण्यात अयशस्वी.',
      failedToGetMedicineInfoError: 'AI कडून औषधाची माहिती मिळविण्यात अयशस्वी.',
    },
  },
};

