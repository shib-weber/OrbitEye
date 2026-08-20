import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Leaf,
  Upload,
  MapPin,
  Send,
  ShieldCheck,
  Bug,
  Wifi,
  Bot,
  Loader2,
  Globe,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Comprehensive translation dictionary updated for Wheat Field & Wheat Disease context
const translations = {
  en: {
    selectLang: "Select Language",
    continue: "Continue",
    assistantTitle: "Agri AI Assistant",
    online: "Online & Ready",
    history: "History",
    botWelcome: "Hello farmer 👋 Upload your crop image and I will analyze diseases, pests and nutrient deficiencies.",
    userMockMsg: "My wheat crop is showing yellow powdery stripes on the leaves.",
    diagnosisComplete: "AI Diagnosis Complete",
    confidence: "Confidence",
    diagnosisResult: "The crop appears affected by Wheat Yellow Rust (Puccinia striiformis). Recommended treatment includes spraying propiconazole fungicide and using rust-resistant seed varieties.",
    inputPlaceholder: "Ask about your crops...",
    navTitle: "AgriVision AI",
    navSub: "Smart Crop Intelligence",
    btnStart: "Start Analysis",
    heroBadge: "AI Powered Crop Diagnostics",
    heroTitlePre: "Detect Crop ",
    heroTitleHighlight: "Diseases ",
    heroTitlePost: "& Pests Instantly",
    heroDesc: "Upload crop photos, detect diseases and pests using AI, and get smart recommendations.",
    btnUpload: "Upload Crop Image",
    btnDemo: "Watch Demo",
    aiActive: "AI Detection Active",
    detectedDisease: "Wheat Yellow Rust Detected",
    recommendationLabel: "Recommendation",
    recommendationAction: "Apply Triazole Fungicide",
    uploadSectionTitle: "Upload Crop Image",
    uploadDropText: "Drag & Drop Crop Images",
    uploadSubText: "Upload high quality crop photos for AI analysis.",
    locationTitle: "Enable Location Access",
    locationSub: "Get region-specific agricultural insights.",
    locationBtn: "Allow Location Access",
    locationAccessing: "Accessing...",
    locationSaved: "Location Saved",
    advIntelTitle: "Advanced Agricultural Intelligence",
    advIntelSub: "Built with computer vision and AI-powered diagnostics.",
    feat1Title: "Disease Detection",
    feat1Desc: "Detect crop diseases from leaf images instantly.",
    feat2Title: "Pest Analysis",
    feat2Desc: "Identify insects and pest infestations accurately.",
    feat3Title: "Location Intelligence",
    feat3Desc: "Weather and region-aware crop recommendations.",
    feat4Title: "Offline AI",
    feat4Desc: "Run AI inference even without internet access.",
  },
  hi: {
    selectLang: "भाषा चुनें",
    continue: "आगे बढ़ें",
    assistantTitle: "एग्री एआई सहायक",
    online: "ऑनलाइन और तैयार",
    history: "इतिहास",
    botWelcome: "नमस्कार किसान भाई 👋 अपनी फसल की तस्वीर अपलोड करें और मैं बीमारियों, कीटों और पोषक तत्वों की कमी का विश्लेषण करूँगा।",
    userMockMsg: "मेरी गेहूं की फसल की पत्तियों पर पीले रंग की धारियां दिख रही हैं।",
    diagnosisComplete: "एआई निदान पूरा हुआ",
    confidence: "सटीकता",
    diagnosisResult: "फसल गेहूं के पीले रतुआ (Yellow Rust) रोग से प्रभावित लग रही है। अनुशंसित उपचार में प्रोपिकोनाज़ोल कवकनाशी का छिड़काव और रतुआ-प्रतिरोधी बीजों का उपयोग शामिल है।",
    inputPlaceholder: "अपनी फसलों के बारे में पूछें...",
    navTitle: "एग्रीविज़न एआई",
    navSub: "स्मार्ट फसल इंटेलिजेंस",
    btnStart: "विश्लेषण शुरू करें",
    heroBadge: "एआई संचालित फसल निदान",
    heroTitlePre: "फसल की ",
    heroTitleHighlight: "बीमारियों ",
    heroTitlePost: "और कीटों का तुरंत पता लगाएं",
    heroDesc: "फसल की तस्वीरें अपलोड करें, एआई का उपयोग करके बीमारियों और कीटों का पता लगाएं, और स्मार्ट समाधान पाएं।",
    btnUpload: "फसल की छवि अपलोड करें",
    btnDemo: "डेमो देखें",
    aiActive: "एआई डिटेक्शन सक्रिय",
    detectedDisease: "गेहूं का पीला रतुआ रोग मिला",
    recommendationLabel: "सिफारिश",
    recommendationAction: "ट्रायज़ोल कवकनाशी लगाएं",
    uploadSectionTitle: "फसल की छवि अपलोड करें",
    uploadDropText: "फसल की छवियों को खींचें और छोड़ें",
    uploadSubText: "एआई विश्लेषण के लिए उच्च गुणवत्ता वाली फसल की तस्वीरें अपलोड करें।",
    locationTitle: "स्थान पहुंच सक्षम करें",
    locationSub: "क्षेत्र-विशिष्ट कृषि अंतर्दृष्टि प्राप्त करें।",
    locationBtn: "स्थान पहुंच की अनुमति दें",
    locationAccessing: "पहुंच की जा रही है...",
    locationSaved: "स्थान सुरक्षित किया गया",
    advIntelTitle: "उन्नत कृषि इंटेलिजेंस",
    advIntelSub: "कंप्यूटर विज़न और एआई-संचालित निदान के साथ निर्मित।",
    feat1Title: "रोग का पता लगाना",
    feat1Desc: "पत्तियों की छवियों से तुरंत फसल रोगों का पता लगाएं।",
    feat2Title: "कीट विश्लेषण",
    feat2Desc: "कीड़ों और कीटों के प्रकोप की सटीक पहचान करें।",
    feat3Title: "स्थान इंटेलिजेंस",
    feat3Desc: "मौसम और क्षेत्र के प्रति जागरूक फसल सिफारिशें।",
    feat4Title: "ऑफलाइन एआई",
    feat4Desc: "बिना इंटरनेट एक्सेस के भी एआई इनफ्रेंस चलाएं।",
  },
  bn: {
    selectLang: "ভাষা নির্বাচন করুন",
    continue: "এগিয়ে যান",
    assistantTitle: "এগ্রি এআই অ্যাসিস্ট্যান্ট",
    online: "অনলাইন এবং প্রস্তুত",
    history: "ইতিহাস",
    botWelcome: "হ্যালো কৃষক ভাই 👋 আপনার ফসলের ছবি আপলোড করুন এবং আমি রোগ, পোকামাকড় এবং পুষ্টির ঘাটতি বিশ্লেষণ করব।",
    userMockMsg: "আমার গম গাছের পাতায় হলুদ গুঁড়ো দাগ দেখা যাচ্ছে।",
    diagnosisComplete: "এআই রোগ নির্ণয় সম্পন্ন",
    confidence: "নির্ভুলতা",
    diagnosisResult: "ফসলটি গমের হলুদ মরিচা (Yellow Rust) রোগে আক্রান্ত বলে মনে হচ্ছে। প্রস্তাবিত চিকিৎসার মধ্যে রয়েছে প্রোপিকোনাজল ছত্রাকনাশক স্প্রে করা এবং মরিচা-প্রতিরোধী বীজের জাত ব্যবহার করা।",
    inputPlaceholder: "আপনার ফসল সম্পর্কে জিজ্ঞাসা করুন...",
    navTitle: "এগ্রিভিশন এআই",
    navSub: "স্মার্ট ক্রপ ইন্টেলিজেন্স",
    btnStart: "বিশ্লেষণ শুরু করুন",
    heroBadge: "এআই চালিত ফসল রোগ নির্ণয়",
    heroTitlePre: "ফসলের ",
    heroTitleHighlight: "রোগ ",
    heroTitlePost: "ও পোকা মাকড় সনাক্ত করুন মুহূর্তে",
    heroDesc: "ফসলের ছবি আপলোড করুন, এআই ব্যবহার করে রোগ এবং কীটপতঙ্গ সনাক্ত করুন এবং স্মার্ট পরামর্শ পান।",
    btnUpload: "ফসলের ছবি আপলোড করুন",
    btnDemo: "ডেমো দেখুন",
    aiActive: "এআই সনাক্তকরণ সক্রিয়",
    detectedDisease: "গমের হলুদ মরিচা রোগ সনাক্ত",
    recommendationLabel: "পরামর্শ",
    recommendationAction: "ট্রায়াজোল ছত্রাকনাশক ব্যবহার করুন",
    uploadSectionTitle: "ফসলের ছবি আপলোড করুন",
    uploadDropText: "ফসলের ছবি ড্র্যাগ এবং ড্রপ করুন",
    uploadSubText: "এআই বিশ্লেষণের জন্য উচ্চ মানের ফসলের ছবি আপলোড করুন।",
    locationTitle: "লোকেশন অ্যাক্সেস সক্ষম করুন",
    locationSub: "অঞ্চল-নির্দিষ্ট কৃষি তথ্য ও পরামর্শ পান।",
    locationBtn: "লোকেশন অ্যাক্সেস মঞ্জুর করুন",
    locationAccessing: "অ্যাক্সেস করা হচ্ছে...",
    locationSaved: "লোকেশন সংরক্ষিত হয়েছে",
    advIntelTitle: "উন্নত কৃষি বুদ্ধিমত্তা",
    advIntelSub: "কম্পিউটার ভিশন এবং এআই-চালিত ডায়াগনস্টিকস দিয়ে তৈরি।",
    feat1Title: "রোগ সনাক্তকরণ",
    feat1Desc: "পাতার ছবি থেকে তাৎক্ষণিকভাবে ফসলের রোগ সনাক্ত করুন।",
    feat2Title: "কীটপতঙ্গ বিশ্লেষণ",
    feat2Desc: "পোকামাকড় এবং কীটপতঙ্গের আক্রমণ সঠিকভাবে সনাক্ত করুন।",
    feat3Title: "আঞ্চলিক বুদ্ধিমত্তা",
    feat3Desc: "আবহাওয়া এবং অঞ্চল-সচেতন ফসলের সুপারিশ।",
    feat4Title: "অফলাইন এআই",
    feat4Desc: "ইন্টারনেট সংযোগ ছাড়াই এআই ইনফারেন্স চালান।",
  },
  ta: {
    selectLang: "மொழியைத் தேர்ந்தெடுக்கவும்",
    continue: "தொடரவும்",
    assistantTitle: "அக்ரி AI உதவியாளர்",
    online: "ஆன்லைனில் தயார்",
    history: "வரலாறு",
    botWelcome: "வணக்கம் விவசாயி 👋 உங்கள் பயிர் படத்தை பதிவேற்றவும், நான் நோய்கள், பூச்சிகள் এবং ஊட்டச்சத்து குறைபாடுகளை பகுப்பாய்வு செய்வேன்.",
    userMockMsg: "எனது கோதுமை பயிரின் இலைகளில் மஞ்சள் நிற பொடி கோடுகள் காணப்படுகின்றன.",
    diagnosisComplete: "AI நோயறிதல் முடிந்தது",
    confidence: "நம்பகத்தன்மை",
    diagnosisResult: "பயிர் கோதுமை மஞ்சள் துரு நோயால் (Yellow Rust) பாதிக்கப்பட்டுள்ளது போல் தெரிகிறது. பரிந்துரைக்கப்பட்ட சிகிச்சையில் புரோபிகோனசோல் பூஞ்சைக் கொல்லி தெளித்தல் மற்றும் துரு எதிர்ப்பு விதை ரகங்களைப் பயன்படுத்துதல் ஆகியவை அடங்கும்.",
    inputPlaceholder: "உங்கள் பயிர்களைப் பற்றி கேளுங்கள்...",
    navTitle: "அக்ரிவிஷன் AI",
    navSub: "ஸ்மார்ட் பயிர் நுண்ணறிவு",
    btnStart: "பகுப்பாய்வைத் தொடங்கு",
    heroBadge: "AI மூலம் இயங்கும் பயிர் நோயறிதல்",
    heroTitlePre: "பயிர் ",
    heroTitleHighlight: "நோய்கள் ",
    heroTitlePost: "& பூச்சிகளை உடனே கண்டறியவும்",
    heroDesc: "பயிர் புகைப்படங்களைப் பதிவேற்றவும், AI ஐப் பயன்படுத்தி நோய்கள் மற்றும் பூச்சிகள்கண்டறியவும் மற்றும் ஸ்மார்ட் பரிந்துரைகளைப் பெறவும்.",
    btnUpload: "பயிர் படத்தை பதிவேற்றவும்",
    btnDemo: "டெமோ காண்க",
    aiActive: "AI கண்டறிதல் செயலில் உள்ளது",
    detectedDisease: "கோதுமை மஞ்சள் துரு நோய் கண்டறியப்பட்டது",
    recommendationLabel: "பரிந்துரை",
    recommendationAction: "டிரையாசோல் பூஞ்சைக் கொல்லியைப் பயன்படுத்துங்கள்",
    uploadSectionTitle: "பயிர் படத்தை பதிவேற்றவும்",
    uploadDropText: "பயிர் படங்களை இங்கே இழுத்து விடவும்",
    uploadSubText: "AI பகுப்பாய்விற்கு உயர்தர பயிர் புகைப்படங்களைப் பதிவேற்றவும்.",
    locationTitle: "இருப்பிட அணுகலை அனுமதிக்கவும்",
    locationSub: "வட்டாரம் சார்ந்த விவசாய நுண்ணறிவுகளைப் பெறுங்கள்.",
    locationBtn: "இருப்பிட அணுகலை அனுமதி",
    locationAccessing: "அணுகுகிறது...",
    locationSaved: "இருப்பிடம் சேமிக்கப்பட்டது",
    advIntelTitle: "மேம்பட்ட விவசாய நுண்ணறிவு",
    advIntelSub: "கம்ப்யூட்டர் விஷன் மற்றும் AI-ஆல் இயங்கும் நோயறிதல்களுடன் உருவாக்கப்பட்டது.",
    feat1Title: "நோய் கண்டறிதல்",
    feat1Desc: "இலை படங்களிலிருந்து பயிர் நோய்களை உடனடியாகக் கண்டறியவும்.",
    feat2Title: "பூச்சி பகுப்பாய்வு",
    feat2Desc: "பூச்சிகள் மற்றும் பூச்சித் தாக்குதல்களைத் துல்லியமாக அடையாளம் காணவும்.",
    feat3Title: "இருப்பிட நுண்ணறிவு",
    feat3Desc: "வானிலை மற்றும் பிராந்தியம் சார்ந்த பயிர் பரிந்துரைகள்.",
    feat4Title: "ஆஃப்லைன் AI",
    feat4Desc: "இணைய அணுகல் இல்லாமலும் AI அனுமானத்தை இயக்கவும்.",
  },
  pa: {
    selectLang: "ਭਾਸ਼ਾ ਚੁਣੋ",
    continue: "ਅੱਗੇ ਵਧੋ",
    assistantTitle: "ਐਗਰੀ AI ਸਹਾਇਕ",
    online: "ਔਨਲਾਈਨ ਅਤੇ ਤਿਆਰ",
    history: "ਇਤਿਹਾਸ",
    botWelcome: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ 👋 ਆਪਣੀ ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਮੈਂ ਬਿਮਾਰੀਆਂ, ਕੀੜਿਆਂ ਅਤੇ ਪੌਸ਼ਟਿਕ ਤੱਤਾਂ ਦੀ ਕਮੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਾਂਗਾ।",
    userMockMsg: "ਮੇਰੀ ਕਣਕ ਦੀ ਫ਼ਸਲ ਦੇ ਪੱਤਿਆਂ ਉੱਤੇ ਪੀਲੀਆਂ ਧਾਰੀਆਂ ਦਿਖਾਈ ਦੇ ਰਹੀਆਂ ਹਨ।",
    diagnosisComplete: "AI ਨਿਦਾਨ ਪੂਰਾ ਹੋਇਆ",
    confidence: "ਭਰੋਸੇਯੋਗਤਾ",
    diagnosisResult: "ਫਸਲ ਕਣਕ ਦੇ ਪੀਲੇ ਕੁੰਗੀ ਰੋਗ (Yellow Rust) ਤੋਂ ਪ੍ਰਭਾਵਿਤ ਜਾਪਦੀ ਹੈ। ਸਿਫਾਰਸ਼ ਕੀਤੇ ਇਲਾਜ ਵਿੱਚ ਪ੍ਰੋਪੀਕੋਨਾਜ਼ੋਲ ਉੱਲੀਨਾਸ਼ਕ ਦਾ ਛਿੜਕਾਅ ਅਤੇ ਕੁੰਗੀ-ਰੋਧਕ ਬੀਜਾਂ ਦੀ ਵਰਤੋਂ ਸ਼ਾਮਲ ਹੈ।",
    inputPlaceholder: "ਆਪਣੀ ਫਸਲ ਬਾਰੇ ਪੁੱਛੋ...",
    navTitle: "ਐਗਰੀਵਿਜ਼ਨ AI",
    navSub: "ਸਮਾਰਟ ਫਸਲ ਇੰਟੈਲੀਜੈਂਸ",
    btnStart: "ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ",
    heroBadge: "AI ਸੰਚਾਲਿਤ ਫਸਲ ਨਿਦਾਨ",
    heroTitlePre: "ਫਸਲ ਦੀਆਂ ",
    heroTitleHighlight: "ਬਿਮਾਰੀਆਂ ",
    heroTitlePost: "ਅਤੇ ਕੀੜਿਆਂ ਦਾ ਤੁਰੰਤ ਪਤਾ ਲਗਾਓ",
    heroDesc: "ਫਸਲ ਦੀਆਂ ਫੋਟੋਆਂ ਅਪਲੋਡ ਕਰੋ, AI ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਬਿਮਾਰੀਆਂ ਅਤੇ ਕੀੜਿਆਂ ਦਾ ਪਤਾ ਲਗਾਓ, ਅਤੇ ਸਮਾਰਟ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।",
    btnUpload: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    btnDemo: "ਡੈਮੋ ਦੇਖੋ",
    aiActive: "AI ਖੋਜ ਸਰਗਰਮ ਹੈ",
    detectedDisease: "ਕਣਕ ਦਾ ਪੀਲਾ ਕੁੰਗੀ ਰੋਗ ਮਿਲਿਆ",
    recommendationLabel: "ਸਿਫਾਰਸ਼",
    recommendationAction: "ਟ੍ਰਾਈਆਜ਼ੋਲ ਉੱਲੀਨਾਸ਼ਕ ਦੀ ਵਰਤੋਂ ਕਰੋ",
    uploadSectionTitle: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    uploadDropText: "ਫਸਲ ਦੀਆਂ ਤਸਵੀਰਾਂ ਨੂੰ ਇੱਥੇ ਖਿੱਚੋ ਅਤੇ ਛੱਡੋ",
    uploadSubText: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਉੱਚ ਗੁਣਵੱਤਾ ਵਾਲੀਆਂ ਫਸਲਾਂ ਦੀਆਂ ਫੋਟੋਆਂ ਅਪਲੋਡ ਕਰੋ।",
    locationTitle: "ਸਥਾਨ ਦੀ ਪਹੁੰਚ ਚਾਲੂ ਕਰੋ",
    locationSub: "ਖੇਤਰ-ਵਿਸ਼ੇਸ਼ ਖੇਤੀਬਾੜੀ ਸੰਬੰਧੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।",
    locationBtn: "ਸਥਾਨ ਦੀ ਪਹੁੰਚ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ",
    locationAccessing: "ਪਹੁੰਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
    locationSaved: "ਸਥਾਨ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਗਿਆ",
    advIntelTitle: "ਉੱਨਤ ਖੇਤੀਬਾੜੀ ਇੰਟੈਲੀਜੈਂਸ",
    advIntelSub: "ਕੰਪਿਊਟਰ ਵਿਜ਼ਨ ਅਤੇ AI-ਸੰਚਾਲਿਤ ਨਿਦਾਨ ਨਾਲ ਬਣਾਇਆ ਗਿਆ।",
    feat1Title: "ਬਿਮਾਰੀ ਦੀ ਖੋਜ",
    feat1Desc: "ਪੱਤਿਆਂ ਦੀਆਂ ਤਸਵੀਰਾਂ ਤੋਂ ਤੁਰੰਤ ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਪਤਾ ਲਗਾਓ।",
    feat2Title: "ਕੀੜਿਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    feat2Desc: "ਕੀੜੇ-ਮਕੌੜਿਆਂ ਅਤੇ ਕੀੜਿਆਂ ਦੇ ਹਮਲੇ ਦੀ ਸਹੀ ਪਛਾਣ ਕਰੋ।",
    feat3Title: "ਸਥਾਨਕ ਇੰਟੈਲੀਜੈਂਸ",
    feat3Desc: "ਮੌਸਮ ਅਤੇ ਖੇਤਰ ਦੇ ਅਨੁਕੂਲ ਫਸਲਾਂ ਦੀਆਂ ਸਿਫ਼ਾਰਸ਼ਾਂ।",
    feat4Title: "ਔਫਲਾਈਨ AI",
    feat4Desc: "ਇੰਟਰਨੈਟ ਪਹੁੰਚ ਤੋਂ ਬਿਨਾਂ ਵੀ AI ਇਨਫਰੈਂਸ ਚਲਾਓ।",
  }
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' }
]

export function FarmerChatUI({ selectedLang = 'en' }) {
  const t = translations[selectedLang] || translations.en;

  return (
    <div className="min-h-screen bg-[#041108] text-white flex flex-col">
      <div className="sticky top-0 z-20 backdrop-blur-2xl bg-black/30 border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="font-bold text-xl">{t.assistantTitle}</h1>
            <p className="text-xs text-green-300">{t.online}</p>
          </div>
        </div>

        <button className="bg-green-500/10 border border-green-400/20 px-4 py-2 rounded-xl hover:bg-green-500/20 transition-all duration-300">
          {t.history}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[85%] bg-white/5 border border-white/10 rounded-[28px] p-5"
        >
          <p className="text-gray-300 leading-relaxed">{t.botWelcome}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-[80%] ml-auto bg-gradient-to-r from-green-400 to-emerald-600 rounded-[28px] p-5 shadow-xl shadow-green-500/20"
        >
          <p>{t.userMockMsg}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-[90%] bg-white/5 border border-green-400/20 rounded-[28px] p-5 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-green-300" />
            </div>

            <div>
              <h3 className="font-bold">{t.diagnosisComplete}</h3>
              <p className="text-xs text-gray-400">{t.confidence}: 96.4%</p>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop"
            alt="Farmer in Wheat Field"
            className="w-full h-52 object-cover rounded-2xl mb-4"
          />

          <p className="text-gray-300 leading-relaxed">{t.diagnosisResult}</p>
        </motion.div>
      </div>

      <div className="sticky bottom-0 bg-black/40 backdrop-blur-2xl border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <button className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-400/20 flex items-center justify-center hover:scale-110 transition-all duration-300">
            <Upload className="w-6 h-6 text-green-300" />
          </button>

          <input
            type="text"
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-green-400/40 text-white"
          />

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default function AgriAIUI() {
  const navigate = useNavigate()
  const [currentLang, setCurrentLang] = useState(null)
  const [isLangSelected, setIsLangSelected] = useState(false)
  
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getFeatures = (t) => [
    {
      icon: <ShieldCheck className="w-8 h-8 text-green-300" />,
      title: t.feat1Title,
      desc: t.feat1Desc,
    },
    {
      icon: <Bug className="w-8 h-8 text-green-300" />,
      title: t.feat2Title,
      desc: t.feat2Desc,
    },
    {
      icon: <MapPin className="w-8 h-8 text-green-300" />,
      title: t.feat3Title,
      desc: t.feat3Desc,
    },
    {
      icon: <Wifi className="w-8 h-8 text-green-300" />,
      title: t.feat4Title,
      desc: t.feat4Desc,
    },
  ]

  const handleLocationClick = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        console.log("Location captured:", latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setError("Permission denied. Please allow location access.");
        console.error(err);
      }
    );
  };

  const t = translations[currentLang || 'en'];
  const localFeatures = getFeatures(t);

  return (
    <div className="min-h-screen w-full bg-[#06110a] text-white overflow-x-hidden relative">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-green-500/20 blur-3xl rounded-full -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-emerald-400/10 blur-3xl rounded-full bottom-0 right-0 animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {!isLangSelected ? (
          /* LANGUAGE GATEWAY SCREEN */
          <motion.div
            key="lang-gate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-50 flex flex-col items-center justify-center min-h-screen px-4"
          >
            <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 max-w-xl w-full text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-black mb-2">Choose Your Language</h2>
              <p className="text-gray-400 mb-8 text-sm">कृपया आगे बढ़ने ਲਈ ਆਪਣী ਭਾਸ਼ਾ ਦੀ ਚੋਣ ਕਰੋ / மொழியைத் தேர்ந்தெடுக்கவும்</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`p-4 rounded-2xl border text-lg font-medium transition-all duration-300 ${
                      currentLang === lang.code
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-transparent scale-102 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <button
                disabled={!currentLang}
                onClick={() => setIsLangSelected(true)}
                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                {currentLang ? translations[currentLang].continue : "Select a Language"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* MAIN SITE CONTENT */
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Navbar */}
            <nav className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between px-4 sm:px-6 lg:px-10 py-5 border-b border-white/10 backdrop-blur-xl bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{t.navTitle}</h1>
                  <p className="text-sm text-green-200/70">{t.navSub}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                <button 
                  onClick={() => setIsLangSelected(false)} 
                  className="flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-green-400" />
                  <span>{languages.find(l => l.code === currentLang)?.name.split(' ')[0]}</span>
                </button>
                
                <button onClick={() => navigate('/chat')} className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-600 hover:scale-105 transition-all duration-300">
                  {t.btnStart}
                </button>
              </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 grid lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-10 py-12 lg:py-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-400/20 mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                  <span className="text-green-300 text-sm">{t.heroBadge}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 break-words">
                  {t.heroTitlePre}
                  <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {t.heroTitleHighlight}
                  </span>
                  {t.heroTitlePost}
                </h1>

                <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl">
                  {t.heroDesc}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <motion.button
                    onClick={() => navigate('/chat')}
                    whileHover={{ scale: 1.08, y: -4 }}
                    whileTap={{ scale: 0.94 }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0px 0px 20px rgba(34,197,94,0.35)',
                        '0px 0px 45px rgba(34,197,94,0.9)',
                        '0px 0px 20px rgba(34,197,94,0.35)'
                      ],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 text-lg font-semibold transition-all duration-300"
                  >
                    {t.btnUpload}
                  </motion.button>

                  <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300">
                    {t.btnDemo}
                  </button>
                </div>
              </div>

              {/* AI Preview Card Mock featuring Yellow Wheat Field & Farmer */}
              <div className="relative flex items-center justify-center">
                <div className="relative bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[28px] sm:rounded-[40px] p-4 sm:p-6 w-full max-w-xl mx-auto">
                  <img
                    src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1200&auto=format&fit=crop"
                    alt="Farmer in Yellow Wheat Field"
                    className="rounded-3xl w-full h-[220px] sm:h-[320px] object-cover"
                  />

                  <div className="absolute top-4 left-4 sm:top-10 sm:left-10 bg-black/50 backdrop-blur-xl border border-green-400/20 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <p className="text-sm text-green-300">{t.aiActive}</p>
                    <h3 className="font-bold text-xl">{t.detectedDisease}</h3>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-400/20 rounded-2xl p-4">
                      <p className="text-sm text-gray-300">{t.confidence}</p>
                      <h2 className="text-3xl font-bold text-green-300">97%</h2>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-sm text-gray-300">{t.recommendationLabel}</p>
                      <h2 className="text-lg font-semibold">{t.recommendationAction}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Upload & Location Segment */}
            <section className="relative z-10 px-4 sm:px-6 lg:px-10 pb-20">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl">
                  <h2 className="text-3xl font-bold mb-6">{t.uploadSectionTitle}</h2>

                  <div onClick={() => navigate('/chat')} className="border-2 border-dashed border-green-400/30 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-green-500/5 to-transparent cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 6, -6, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <Upload className="w-10 h-10 text-green-300" />
                      </motion.div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">{t.uploadDropText}</h3>
                    <p className="text-gray-400 max-w-md">{t.uploadSubText}</p>
                  </div>

                  <div className="mt-8 bg-black/30 border border-white/10 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 items-start sm:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{t.locationTitle}</h3>
                      <p className="text-gray-400 text-sm mt-1">{t.locationSub}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleLocationClick}
                        disabled={loading}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-green-500/20 border border-green-400/30 hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <MapPin className="w-5 h-5" />
                        )}
                        {loading ? t.locationAccessing : t.locationBtn}
                      </button>

                      {location && (
                        <p className="text-green-400 text-sm">
                          {t.locationSaved}: {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                        </p>
                      )}

                      {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Array Section */}
            <section className="relative z-10 px-4 sm:px-6 lg:px-10 pb-24">
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-5xl font-black mb-4">{t.advIntelTitle}</h2>
                <p className="text-gray-400 text-lg max-w-3xl mx-auto">{t.advIntelSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {localFeatures.map((item, idx) => (
                  <div
                    key={idx}
                    className="group bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 flex items-center justify-center mb-6">
                      {item.icon}
                    </div>

                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}