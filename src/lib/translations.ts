
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
    commonBrandNamesLabel: string;
    generalPrecautionsLabel: string;
    importantDisclaimerTitle: string;
    importantDisclaimerText: string;
  };
}

export const translations: Record<string, NestedTranslations> = {
  en: {
    pageSubtitle: 'Instantly identify items and get AI-powered information.',
    generalItemsButton: 'General Items',
    medicinesButton: 'Medicines',
    footerCopyright: (year: number) => `© ${year} LIBRTOD.`,
    footerCraftedWithAI: 'Crafted with AI.',
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
      cameraAccessDeniedDescription: 'Please enable camera permissions.',
      itemScannerTitle: 'Item Scanner',
      medicineIdentifierTitle: 'Medicine Identifier',
      formDescription: 'Detected details appear below. Then, get AI-generated information.',
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
      commonBrandNamesLabel: 'Common Brand Names:',
      generalPrecautionsLabel: 'General Precautions:',
      importantDisclaimerTitle: 'Important Disclaimer',
      importantDisclaimerText: 'This information is for general knowledge and not a substitute for professional medical advice. Always consult a healthcare provider for medical concerns.',
    },
  },
  mr: {
    pageSubtitle: 'वस्तू त्वरित ओळखा आणि AI-शक्तीवर आधारित माहिती मिळवा.',
    generalItemsButton: 'सामान्य वस्तू',
    medicinesButton: 'औषधे',
    footerCopyright: (year: number) => `© ${year} लिबर्टोड.`,
    footerCraftedWithAI: 'AI ने तयार केले आहे.',
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
      cameraAccessDeniedDescription: 'कृपया कॅमेरा परवानग्या सक्षम करा.',
      itemScannerTitle: 'वस्तू स्कॅनर',
      medicineIdentifierTitle: 'औषध ओळखकर्ता',
      formDescription: 'ओळखलेले तपशील खाली दिसतील. त्यानंतर, AI-व्युत्पन्न माहिती मिळवा.',
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
      commonBrandNamesLabel: 'सामान्य ब्रँड नावे:',
      generalPrecautionsLabel: 'सामान्य खबरदारी:',
      importantDisclaimerTitle: 'महत्त्वाची सूचना',
      importantDisclaimerText: 'ही माहिती सामान्य ज्ञानासाठी आहे आणि व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही. वैद्यकीय समस्यांसाठी नेहमी आरोग्य सेवा प्रदात्याचा सल्ला घ्या.',
    },
  },
};
