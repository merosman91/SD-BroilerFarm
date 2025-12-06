// components/SplashScreen.jsx
import React, { useState, useEffect } from 'react';
import { Bird, Code } from 'lucide-react';

const SplashScreen = ({ onFinish, duration = 5000 }) => {
    const [progress, setProgress] = useState(0);
    const [show, setShow] = useState(true);
    const [skip, setSkip] = useState(false);

    useEffect(() => {
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100 || skip) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + (100 / (duration / 300));
            });
        }, 300);

        const timer = setTimeout(() => {
            if (!skip) {
                setShow(false);
                setTimeout(() => onFinish(), 500);
            }
        }, duration);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(timer);
        };
    }, [onFinish, duration, skip]);

    const handleSkip = () => {
        setSkip(true);
        setShow(false);
        setTimeout(() => onFinish(), 300);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 z-50 flex flex-col items-center justify-center">
            <button 
                onClick={handleSkip}
                className="absolute top-4 left-4 text-white/70 hover:text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-white/20"
            >
                تخطي ✕
            </button>
            
            <div className="animate-bounce mb-6">
                <Bird size={80} className="text-white drop-shadow-lg" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-lg">
                دواجني
            </h1>
            <p className="text-white/80 mb-8 text-center">
                نظام إدارة مزارع الدواجن الذكي
            </p>
            
            <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden mb-12">
                <div 
                    className="h-full bg-white rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            
            <div className="text-center">
                <div className="text-white/70 text-sm mb-3">التطوير بواسطة</div>
                <div className="flex items-center justify-center space-x-2 space-x-reverse bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-lg">م</span>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-bold">ميرغني أبوالقاسم</div>
                        <div className="text-white/80 text-xs">مطور نظم معلومات</div>
                    </div>
                </div>
                
                <div className="mt-6 text-white/60 text-xs">
                    <p>الإصدار 2.0.0 • © {new Date().getFullYear()}</p>
                    <p className="mt-1">جميع الحقوق محفوظة</p>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
