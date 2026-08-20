import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Send, Bot, Loader2, Globe } from 'lucide-react'

const chatTranslations = {
  en: {
    headerTitle: "Agri AI Assistant",
    headerStatus: "Online & Ready",
    welcomeTitle: "Hello Farmer 👋",
    welcomeSubtitle: "Upload your crop image for real-time analysis or ask any agricultural questions below.",
    typing: "AI is thinking...",
    placeholder: "Ask or provide feedback...",
    errorBrain: "Sorry, I'm having trouble connecting to my brain right now.",
    errorServer: "Error: Could not connect to the AI server. Make sure your FastAPI backend is running on port 8000.",
    labelClassification: "Crop Category",
    labelDiagnosis: "Diagnosis Summary",
    labelTreatment: "Actionable Treatment",
    labelRejected: "Upload Rejected",
    cropText: "Analyzing uploaded crop image.",
    feedbackLogged: "System Note: Thank you for the feedback! Your correction has been logged to help train our local models."
  },
  hi: {
    headerTitle: "एग्री एआई सहायक",
    headerStatus: "ऑनलाइन",
    welcomeTitle: "नमस्कार किसान भाई 👋",
    welcomeSubtitle: "तस्वीर अपलोड करें या खेती से संबंधित कोई भी सवाल नीचे पूछें।",
    typing: "एआई सोच रहा है...",
    placeholder: "सवाल पूछें या प्रतिक्रिया दें...",
    errorBrain: "क्षма करें, मुझे इस समय प्रतिक्रिया देने में समस्या हो रही है।",
    errorServer: "त्रुटि: एआई सर्वर से कनेक्ट नहीं हो सका। सुनिश्चित करें कि आपका FastAPI बैकएंड पोर्ट 8000 पर चल रहा है।",
    labelClassification: "फसल की श्रेणी",
    labelDiagnosis: "रोग का निदान",
    labelTreatment: "उपचार के उपाय",
    labelRejected: "अस्वीकृत",
    cropText: "अपलोड की गई फसल की छवि का विश्लेषण किया जा रहा है।",
    feedbackLogged: "सिस्टम नोट: प्रतिक्रिया के लिए धन्यवाद! हमारे स्थानीय मॉडल को बेहतर बनाने के लिए आपका सुधार दर्ज कर लिया गया है।"
  },
  bn: {
    headerTitle: "এগ্রি এআই অ্যাসিস্ট্যান্ট",
    headerStatus: "অনলাইন",
    welcomeTitle: "হ্যালো কৃষক ভাই 👋",
    welcomeSubtitle: "বিশ্লেষণের জন্য ফসলের ছবি আপলোড করুন অথবা নিচে কৃষিকাজ সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞেস করুন।",
    typing: "এআই চিন্তা করছে...",
    placeholder: "প্রশ্ন জিজ্ঞাসা করুন বা সংশোধন করুন...",
    errorBrain: "দুঃখিত, এই মুহূর্তে উত্তর দিতে কিছুটা সমস্যা হচ্ছে।",
    errorServer: "ত্রুটি: এআই সার্ভারের সাথে সংযোগ করা যায়নি। আপনার FastAPI ব্যাকএন্ড ৮০০০ পোর্টে চলছে কিনা তা নিশ্চিত করুন।",
    labelClassification: "ফসলের শ্রেণী",
    labelDiagnosis: "রোগ নির্ণয়",
    labelTreatment: "প্রস্তাবিত সমাধান",
    labelRejected: "প্রত্যাখ্যাত",
    cropText: "আপলোড করা ফসলের ছবি বিশ্লেষণ করা হচ্ছে。",
    feedbackLogged: "সিস্টেম নোট: মতামতের জন্য ধন্যবাদ! আমাদের স্থানীয় মডেলকে উন্নত করতে আপনার সংশোধনটি সংরক্ষণ করা হয়েছে।"
  },
  ta: {
    headerTitle: "அக்ரி AI உதவியாளர்",
    headerStatus: "ஆன்லைனில் உள்ளது",
    welcomeTitle: "வணக்கம் விவசாயி 👋",
    welcomeSubtitle: "பகுப்பாய்விற்காக உங்கள் பயிர் படத்தை பதிவேற்றவும் அல்லது விவசாயம் சார்ந்த கேள்விகளை கேட்கவும்.",
    typing: "AI யோசித்துக்கொண்டிருக்கிறது...",
    placeholder: "கேள்விகளைக் கேளுங்கள் அல்லது திருத்தங்களை கூறவும்...",
    errorBrain: "மன்னிக்கவும், தற்போது இணைப்பதில் சிக்கல் உள்ளது.",
    errorServer: "பிழை: AI சர்வரோடு இணைக்க முடியவில்லை. உங்கள் FastAPI பேக்எண்ட் போர்ட் 8000-இல் இயங்குவதை உறுதிப்படுத்தவும்.",
    labelClassification: "பயிர் வகை",
    labelDiagnosis: "நோயறிதல் விவரம்",
    labelTreatment: "சிகிச்சை தீர்வுகள்",
    labelRejected: "நிராகரிக்கப்பட்டது",
    cropText: "பதிவேற்றப்பட்ட பயிர் படம் பகுப்பாய்வு செய்யப்படுகிறது.",
    feedbackLogged: "கணினி குறிப்பு: உங்கள் கருத்துக்கு நன்றி! உள்ளூர் மாடல்களுக்குப் பயிற்சியளிக்க உங்கள் திருத்தம் பதிவு செய்யப்பட்டுள்ளது."
  },
  pa: {
    headerTitle: "ਐਗਰੀ AI ਸਹਾਇਕ",
    headerStatus: "ਔਨਲਾਈਨ",
    welcomeTitle: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ 👋",
    welcomeSubtitle: "ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਆਪਣੀ ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ ਜਾਂ ਖੇਤੀਬਾੜੀ ਸਬੰਧੀ ਕੋਈ ਵੀ ਸਵਾਲ ਹੇਠਾਂ ਪੁੱਛੋ।",
    typing: "AI ਸੋਚ ਰਿਹਾ ਹੈ...",
    placeholder: "ਸਵਾਲ ਪੁੱਛੋ ਜਾਂ ਆਪਣੀ ਰਾਏ ਦਿਓ...",
    errorBrain: "ਮਾਫ਼ ਕਰਨਾ, ਇਸ ਵੇਲੇ ਮੈਨੂੰ ਜਵਾਬ ਦੇਂਣ ਵਿੱਚ ਦਿੱਕਤ ਆ ਰਹੀ ਹੈ।",
    errorServer: "ਗੜਬੜ: AI ਸਰਵਰ ਨਾਲ ਕਨੈਕਟ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਯਕੀਨੀ ਬਣਾਓ ਕਿ ਤੁਹਾਡਾ FastAPI ਬੈਕਐਂਡ ਪੋਰਟ 8000 'ਤੇ ਚੱਲ ਰਿਹਿਾ ਹੈ।",
    labelClassification: "ਫਸਲ ਦੀ ਸ਼੍ਰੇਣੀ",
    labelDiagnosis: "ਨਿਦਾਨ ਰਿਪੋਰਟ",
    labelTreatment: "ਇਲਾਜ ਦੇ ਕਦਮ",
    labelRejected: "ਰੱਦ ਕੀਤਾ ਗਿਆ",
    cropText: "ਅਪਲੋਡ ਕੀਤੀ ਫਸਲ ਦੀ ਤਸਵੀਰ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।",
    feedbackLogged: "ਸਿਸਟਮ ਨੋਟ: ਫੀਡਬੈਕ ਲਈ ਧੰਨਵਾਦ! ਤੁਹਾਡੇ ਸੁਧਾਰ ਨੂੰ ਸਿਸਟਮ ਵਿੱਚ ਦਰਜ ਕਰ ਲਿਆ ਗਿਆ ਹੈ।"
  }
}

const langOptions = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'bn', label: 'BN' },
  { code: 'ta', label: 'TA' },
  { code: 'pa', label: 'PA' }
]

export default function Chats() {
  const [selectedLang, setSelectedLang] = useState('en')
  const t = chatTranslations[selectedLang] || chatTranslations.en

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const addMessage = (type, payload) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type, ...payload }
    ])
  }

  const cleanMarkdown = (text) => {
    if (!text) return ''
    return text.replace(/\*\*/g, '').replace(/\*/g, '').trim()
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userText = input
    addMessage('user', { text: userText })
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          lang: selectedLang
        }),
      })

      if (!response.ok) throw new Error('Text Server Unreachable')
      const data = await response.json()
      
      addMessage('ai', { text: cleanMarkdown(data.response) })
    } catch (err) {
      addMessage('ai', { text: t.errorBrain, isError: true })
    } finally {
      setIsTyping(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const conversationalContext = input.trim() || t.cropText;
    const imageUrl = URL.createObjectURL(file)
    
    addMessage('user', { text: conversationalContext, image: imageUrl })
    setInput('') 
    setIsTyping(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_message', conversationalContext) 

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Backend Unreachable')
      const data = await response.json()

      if (data.is_plant) {
        addMessage('ai', {
          isStructured: true,
          classification: data.detected_object,
          diagnosis: cleanMarkdown(data.prediction),
          treatment: cleanMarkdown(data.solution),
          feedbackLogged: data.feedback_logged
        })
      } else {
        addMessage('ai', {
          isRejected: true,
          text: data.message || 'Invalid Crop Target'
        })
      }
    } catch (err) {
      addMessage('ai', { text: t.errorServer, isError: true })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-screen bg-[#031109] text-white flex flex-col overflow-hidden font-sans">
      {/* RESPONSIVE HEADER */}
      <div className="sticky top-0 z-20 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/40 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-y-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-lg leading-tight tracking-tight">{t.headerTitle}</h1>
            <p className="text-[10px] sm:text-xs text-green-300 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {t.headerStatus}
            </p>
          </div>
        </div>

        {/* Scaled-down Language Selector for Mobile */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 sm:p-1 max-w-full overflow-x-auto scrollbar-none">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-1.5 text-green-400 shrink-0" />
          <div className="flex gap-0.5">
            {langOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                  selectedLang === lang.code
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-green-500/20 relative">
        
        {/* CENTER WELCOME BANNER */}
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 max-w-sm sm:max-w-xl mx-auto pointer-events-none select-none z-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 sm:mb-6 shadow-2xl">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
                {t.welcomeTitle}
              </h2>
              <p className="text-xs sm:text-base text-emerald-100/60 leading-relaxed">
                {t.welcomeSubtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex relative z-10 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-full max-w-[92%] sm:max-w-[75%] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border shadow-xl ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-700 border-green-400/20'
                  : msg.isError || msg.isRejected
                    ? 'bg-red-950/30 border-red-500/20 text-red-200'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {msg.image && (
                <div className="overflow-hidden rounded-xl sm:rounded-2xl mb-3 sm:mb-4 border border-white/10">
                  <img
                    src={msg.image}
                    alt="uploaded crop view"
                    className="w-full max-h-[240px] sm:max-h-[350px] object-cover"
                  />
                </div>
              )}

              {/* RENDER STRUCTURAL CROP RESULTS */}
              {msg.isStructured ? (
                <div className="space-y-3 sm:space-y-4 text-xs sm:text-base">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-400 block mb-0.5 sm:mb-1">
                      {t.labelClassification}
                    </span>
                    <p className="font-semibold text-white text-sm sm:text-base">{msg.classification || 'N/A'}</p>
                  </div>
                  
                  <div className="border-t border-white/5 pt-2.5 sm:pt-3">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-400 block mb-0.5 sm:mb-1">
                      {t.labelDiagnosis}
                    </span>
                    <p className="text-emerald-50/90 leading-relaxed">{msg.diagnosis || 'N/A'}</p>
                  </div>

                  <div className="border-t border-white/5 pt-2.5 sm:pt-3">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-green-400 block mb-0.5 sm:mb-1">
                      {t.labelTreatment}
                    </span>
                    <p className="text-emerald-50/90 leading-relaxed whitespace-pre-wrap">{msg.treatment || 'N/A'}</p>
                  </div>

                  {msg.feedbackLogged && (
                    <div className="mt-1.5 sm:mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 sm:p-3 text-[10px] sm:text-xs text-green-300">
                      {t.feedbackLogged}
                    </div>
                  )}
                </div>
              ) : msg.isRejected ? (
                <div className="text-xs sm:text-base">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-red-400 block mb-0.5 sm:mb-1">
                    {t.labelRejected}
                  </span>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ) : (
                <p className="text-xs sm:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.text}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* TYPING INDICATOR */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 animate-spin" />
              <span className="text-xs sm:text-sm text-green-200/70 italic">{t.typing}</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="sticky bottom-0 p-3 sm:p-5 border-t border-white/10 bg-black/40 backdrop-blur-3xl">
        <div className="flex items-center gap-2 sm:gap-4 max-w-5xl mx-auto">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-12 sm:min-w-[56px] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          >
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          </motion.button>

          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3.5 sm:px-5 py-3.5 sm:py-4 text-xs sm:text-base outline-none focus:border-green-400 transition-all placeholder:text-white/20 text-white"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSend}
            className="w-12 sm:min-w-[56px] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-black font-bold" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}