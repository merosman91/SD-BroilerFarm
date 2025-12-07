import React, { useState, useEffect } from 'react';
import { Bird, Code, Feather, Zap, TrendingUp, Shield, Database, Smartphone } from 'lucide-react';

const SplashScreen = ({ onFinish, duration = 4000 }) => {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);
    const [skip, setSkip] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    // ميزات النظام للعرض أثناء التحميل
    const features = [
        {
            icon: Feather,
            title: "إدارة متكاملة",
            description: "إدارة كاملة لمزرعة الدواجن",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: Database,
            title: "مخزون لكل دورة",
            description: "كل دورة لها مخزونها الخاص",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: TrendingUp,
            title: "تقارير ذكية",
            description: "تحليل أداء دقيق",
            color: "from-purple-500 to-violet-500"
        },
        {
            icon: Shield,
            title: "نظام آمن",
            description: "حماية بيانات مزرعتك",
            color: "from-orange-500 to-amber-500"
        },
        {
            icon: Smartphone,
            title: "متجاوب مع الهواتف",
            description: "عمل على جميع الأجهزة",
            color: "from-indigo-500 to-blue-500"
        }
    ];

    useEffect(() => {
        // تبديل الميزات
        const featureInterval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentFeature(prev => (prev + 1) % features.length);
                setFadeIn(true);
            }, 300);
        }, 1000);

        // شريط التقدم
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100 || skip) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + (100 / (duration / 200));
            });
        }, 200);

        // التوقيت الرئيسي
        const timer = setTimeout(() => {
            if (!skip) {
                // تأثير الخروج
                setShow(false);
                setTimeout(() => onFinish(), 500);
            }
        }, duration);

        return () => {
            clearInterval(featureInterval);
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onFinish, duration, skip, features.length]);

    const handleSkip = () => {
        setSkip(true);
        setShow(false);
        setTimeout(() => onFinish(), 300);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* خلفية متحركة */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-2/3 left-1/3 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* زر التخطي */}
            <button 
                onClick={handleSkip}
                className="absolute top-4 left-4 text-white/70 hover:text-white bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-white/20 hover:scale-105 z-10 border border-white/20"
            >
                تخطي ✕
            </button>
            
            {/* الشعار الرئيسي */}
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative animate-bounce mb-2">
                    <Bird size={100} className="text-white drop-shadow-2xl" />
                </div>
            </div>
            
            {/* اسم النظام */}
            <div className="relative mb-6">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center drop-shadow-2xl animate-fade-in">
                    دواجني
                </h1>
                <p className="text-white/80 text-lg text-center font-medium">
                    نظام إدارة مزارع الدواجن الذكي
                </p>
            </div>

            {/* عرض الميزات */}
            <div className="w-full max-w-md mb-10 px-4">
                <div className={`transition-all duration-500 transform ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className={`bg-gradient-to-r ${features[currentFeature].color} p-6 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                {features[currentFeature].icon && 
                                    <features[currentFeature].icon size={28} className="text-white" />
                                }
                            </div>
                            <div className="text-right flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {features[currentFeature].title}
                                </h3>
                                <p className="text-white/90">
                                    {features[currentFeature].description}
                                </p>
                            </div>
                        </div>
                        
                        {/* نقاط الميزات */}
                        <div className="flex justify-center gap-2 mt-4">
                            {features.map((_, index) => (
                                <div 
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        index === currentFeature 
                                            ? 'bg-white w-8' 
                                            : 'bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* شريط التقدم */}
            <div className="w-full max-w-xs mb-12 px-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">جاري التحميل...</span>
                    <span className="text-white font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {/* معلومات المطور */}
            <div className="relative mt-4">
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">م</span>
                        </div>
                        <div className="text-right">
                            <div className="text-white font-bold text-lg mb-1">
                                ميرغني أبوالقاسم
                            </div>
                            <div className="text-white/80 text-sm mb-3">
                                مطور نظم معلومات وتطبيقات ويب
                            </div>
                            <div className="flex gap-3">
                                <div className="text-xs px-3 py-1 bg-white/20 rounded-full text-white/90 backdrop-blur-sm">
                                    الإصدار 2.0.0
                                </div>
                                <div className="text-xs px-3 py-1 bg-white/20 rounded-full text-white/90 backdrop-blur-sm">
                                    © {new Date().getFullYear()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* تلميحة في الأسفل */}
                    <div className="mt-6 text-center text-white/60 text-xs animate-pulse">
                        <p>⚡ تجهيز أفضل تجربة لإدارة مزرعتك</p>
                    </div>
                </div>
            </div>

            {/* تأثيرات إضافية */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="text-white/40 text-xs">
                    تذكر: البيانات المحفوظة تظل على جهازك فقط
                </div>
            </div>
        </div>
    );
};

// CSS مخصص للأنيميشن
const styles = `
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
.animate-shimmer {
    animation: shimmer 2s infinite;
}
`;

// إضافة الأنيميشن للصفحة
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default SplashScreen;
