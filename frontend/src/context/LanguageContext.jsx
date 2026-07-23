import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    
    home: 'Home',
    schemes: 'Schemes',
    notices: 'Notices',
    adminPanel: 'Admin Panel',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    brand: 'Smart Panchayat',

    
    heroTagline: 'Notice: Livestock and Poultry scheme registrations are active.',
    heroTitle: 'Empowering Citizens with',
    heroTitleHighlight: 'Smart Panchayat Governance',
    heroSubText: 'Access local welfare schemes, verify your eligibility criteria instantly, download application forms, and stay updated with live Panchayat announcements.',
    exploreSchemes: 'Explore Schemes',
    checkEligibility: 'Check Eligibility',

    
    important: 'Important',
    latestNotices: 'Latest Notices:',
    viewNoticeBoard: 'View Notice Board',
    welfareSchemes: 'Welfare Schemes',
    panchayatNotices: 'Panchayat Notices',
    formsDownloaded: 'Forms Downloaded',
    registeredCitizens: 'Registered Citizens',
    browseByCategory: 'Browse Schemes by Category',
    browseSubText: 'Filter through standard panchayat development schemes to access documents and eligibility criteria.',
    howToApply: 'How to Apply for Welfare Schemes?',
    step1Title: 'Register / Complete Profile',
    step1Desc: 'Provide your age, income, caste category, and occupation to configure your profile.',
    step2Title: 'Check Eligibility Instantly',
    step2Desc: 'Use the interactive screen tool on the Schemes page to find matches based on criteria.',
    step3Title: 'Download Form & Submit',
    step3Desc: 'Download official application forms directly from this system and submit them at the Panchayat desk.',
    needAssistance: 'Need Direct Assistance?',
    assistanceDesc: 'If you require assistance in form filling, document collection, or offline verification, please visit the Panchayat Secretary desk between 10:00 AM and 2:00 PM on weekdays.',
    emailSupport: 'Email Support',

    
    schemesTitle: 'Panchayat Welfare Schemes',
    schemesSubText: 'Explore official welfare assistance schemes, check criteria guidelines, and download forms.',
    interactiveScreening: 'Interactive Screening',
    screeningSubText: 'Input variables to identify which schemes match your eligibility profile.',
    pullProfile: 'Pull profile details',
    verifyBtn: 'Verify Eligibility',
    allCategories: 'All',
    searchPlaceholder: 'Search scheme name or details...',
    searchBtn: 'Search',
    screeningResults: 'Screening Results',
    clearResults: 'Clear Results',
    eligible: 'Eligible',
    notEligible: 'Not Eligible',
    detailsBtn: 'Details',
    getFormBtn: 'Get Form',
    applyOnlineBtn: 'Apply Online',
    eligibilityGuidelines: 'Eligibility Guidelines:',
    ageBracket: 'Age Bracket',
    maxIncome: 'Max Income',
    targetOccupations: 'Target Occupations',
    socialCategories: 'Social Categories',
    requiredDocs: 'Required Documents Enclosures:',
    noDocs: 'No documents listed.',
    closeBtn: 'Close',
    downloadFormBtn: 'Download Application Form',

    
    announcementsTitle: 'Notice Board & Announcements',
    announcementsSubText: 'Official circulars, meeting notices, and updates from the Panchayat Secretary.',
    highPriority: 'High Priority'
  },
  ml: {
    
    home: 'ഹോം',
    schemes: 'പദ്ധതികൾ',
    notices: 'അറിയിപ്പുകൾ',
    adminPanel: 'അഡ്മിൻ പാനൽ',
    login: 'ലോഗിൻ',
    register: 'രജിസ്റ്റർ',
    logout: 'ലോഗ് ഔട്ട്',
    profile: 'പ്രൊഫൈൽ',
    brand: 'സ്മാർട്ട് പഞ്ചായത്ത്',

    
    heroTagline: 'അറിയിപ്പ്: കോഴി വളർത്തൽ, ആട് വളർത്തൽ രജിസ്ട്രേഷൻ ആരംഭിച്ചു.',
    heroTitle: 'ജനങ്ങളിലേക്ക് നേരിട്ട്',
    heroTitleHighlight: 'ഡിജിറ്റൽ പഞ്ചായത്ത് ഭരണസംവിധാനം',
    heroSubText: 'പഞ്ചായത്തിന്റെ വിവിധ ക്ഷേമപദ്ധതികൾ കണ്ടെത്തുക, നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കുക, അപേക്ഷാ ഫോമുകൾ ഡൗൺലോഡ് ചെയ്യുക, അറിയിപ്പുകൾ തത്സമയം അറിയുക.',
    exploreSchemes: 'പദ്ധതികൾ കാണുക',
    checkEligibility: 'യോഗ്യത പരിശോധിക്കാം',

    
    important: 'പ്രധാനം',
    latestNotices: 'അവസാന അറിയിപ്പുകൾ:',
    viewNoticeBoard: 'നോട്ടീസ് ബോർഡ് കാണാം',
    welfareSchemes: 'ക്ഷേമ പദ്ധതികൾ',
    panchayatNotices: 'പഞ്ചായത്ത് അറിയിപ്പുകൾ',
    formsDownloaded: 'ഡൗൺലോഡ് ചെയ്ത ഫോമുകൾ',
    registeredCitizens: 'രജിസ്റ്റർ ചെയ്തവർ',
    browseByCategory: 'വിഭാഗം തിരിച്ചു പദ്ധതികൾ തിരയാം',
    browseSubText: 'കാർഷിക, മൃഗസംരക്ഷണ, ഭവന നിർമ്മാണ പദ്ധതികൾ വളരെ എളുപ്പത്തിൽ കണ്ടെത്താം.',
    howToApply: 'പദ്ധതികൾക്ക് എങ്ങനെ അപേക്ഷിക്കാം?',
    step1Title: 'രജിസ്റ്റർ ചെയ്ത് പ്രൊഫൈൽ പൂരിപ്പിക്കുക',
    step1Desc: 'നിങ്ങളുടെ പ്രായം, വരുമാനം, ജോലി, ജാതി വിഭാഗം എന്നിവ പ്രൊഫൈലിൽ കൃത്യമായി നൽകുക.',
    step2Title: 'യോഗ്യത തത്സമയം പരിശോധിക്കുക',
    step2Desc: 'പദ്ധതികളുടെ യോഗ്യതാ വിവരങ്ങൾ പരിശോധിച്ച് നിങ്ങൾ അർഹനാണോ എന്ന് ഉറപ്പുവരുത്തുക.',
    step3Title: 'ഫോം ഡൗൺലോഡ് ചെയ്തു സമർപ്പിക്കുക',
    step3Desc: 'അപേക്ഷാ ഫോമുകൾ ഓൺലൈനായി ഡൗൺലോഡ് ചെയ്ത് പൂരിപ്പിച്ചു പഞ്ചായത്തിൽ സമർപ്പിക്കുക.',
    needAssistance: 'സഹായം ആവശ്യമുണ്ടോ?',
    assistanceDesc: 'അപേക്ഷകൾ പൂരിപ്പിക്കുന്നതിനോ രേഖകൾ ശേഖരിക്കുന്നതിനോ സഹായം ആവശ്യമുണ്ടെങ്കിൽ പ്രവൃത്തിദിവസങ്ങളിൽ രാവിലെ 10 മുതൽ ഉച്ചയ്ക്ക് 2 വരെ സെക്രട്ടറി ഡെസ്ക് സന്ദർശിക്കുക.',
    emailSupport: 'ഇമെയിൽ ചെയ്യുക',

    
    schemesTitle: 'പഞ്ചായത്ത് ക്ഷേമപദ്ധതികൾ',
    schemesSubText: 'വിവിധ ആനുകൂല്യങ്ങൾ കാണുക, യോഗ്യതകൾ മനസ്സിലാക്കുക, അപേക്ഷാ ഫോമുകൾ ഡൗൺലോഡ് ചെയ്യുക.',
    interactiveScreening: 'യോഗ്യതാ പരിശോധന',
    screeningSubText: 'താഴെ പറയുന്ന വിവരങ്ങൾ നൽകി നിങ്ങളുടെ യോഗ്യത സ്വയം പരിശോധിക്കാം.',
    pullProfile: 'പ്രൊഫൈലിൽ നിന്നുള്ള വിവരങ്ങൾ എടുക്കുക',
    verifyBtn: 'യോഗ്യത പരിശോധിക്കുക',
    allCategories: 'എല്ലാം',
    searchPlaceholder: 'പദ്ധതികളുടെ പേര് ഇവിടെ തിരയാം...',
    searchBtn: 'തിരയുക',
    screeningResults: 'പരിശോധനാ ഫലം',
    clearResults: 'ഫലം ഒഴിവാക്കുക',
    eligible: 'നിങ്ങൾ അർഹനാണ്',
    notEligible: 'നിങ്ങൾ അർഹനല്ല',
    detailsBtn: 'വിവരങ്ങൾ',
    getFormBtn: 'ഫോം ഡൗൺലോഡ്',
    applyOnlineBtn: 'ഓൺലൈനായി അപേക്ഷിക്കുക',
    eligibilityGuidelines: 'ആവശ്യമായ യോഗ്യതകൾ:',
    ageBracket: 'പ്രായപരിധി',
    maxIncome: 'പരമാവധി വരുമാനം',
    targetOccupations: 'അനുവദനീയമായ ജോലികൾ',
    socialCategories: 'സാമൂഹിക വിഭാഗങ്ങൾ',
    requiredDocs: 'ആവശ്യമായ രേഖകൾ:',
    noDocs: 'രേഖകൾ ആവശ്യമില്ല.',
    closeBtn: 'അടയ്ക്കുക',
    downloadFormBtn: 'അപേക്ഷാ ഫോം ഡൗൺലോഡ് ചെയ്യുക',

    
    announcementsTitle: 'നോട്ടീസ് ബോർഡും അറിയിപ്പുകളും',
    announcementsSubText: 'പഞ്ചായത്തിൽ നിന്നുള്ള ഔദ്യോഗിക അറിയിപ്പുകളും ഗ്രാമസഭ വിവരങ്ങളും.',
    highPriority: 'അതിപ്രധാനം'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'ml' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('language', nextLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
