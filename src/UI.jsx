import React from 'react';

// مكونات UI الأساسية
export const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', type = 'button', disabled = false, ...props }) => {
    const baseClasses = 'rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
    
    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
        ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
        dark: 'bg-gray-800 text-white hover:bg-gray-900',
        blue: 'bg-blue-500 text-white hover:bg-blue-600',
        purple: 'bg-purple-500 text-white hover:bg-purple-600'
    };
    
    const sizeClasses = {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base'
    };
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', padding = true, hover = false, ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${
                padding ? 'p-4' : ''
            } ${hover ? 'hover:shadow-md hover:border-gray-200 transition-all duration-300' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const Input = ({ label, type = 'text', value, onChange, placeholder, className = '', error, required = false, ...props }) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full p-3 bg-gray-50 border ${
                    error ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    error ? 'focus:ring-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export const TextArea = ({ label, value, onChange, placeholder, className = '', rows = 3, error, required = false, ...props }) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-3 bg-gray-50 border ${
                    error ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none ${
                    error ? 'focus:ring-red-500' : ''
                } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export const Select = ({ label, value, onChange, options, className = '', error, required = false, placeholder, ...props }) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="block text-xs font-bold text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <select
                value={value}
                onChange={onChange}
                className={`w-full p-3 bg-gray-50 border ${
                    error ? 'border-red-300' : 'border-gray-200'
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    error ? 'focus:ring-red-500' : ''
                } ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="">{placeholder}</option>
                )}
                {options.map((option, index) => (
                    <option key={index} value={option.value || option}>
                        {option.label || option}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showClose = true,
    position = 'center',
    footer
}) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full mx-4'
    };
    
    const positionClasses = {
        center: 'items-center justify-center',
        top: 'items-start justify-center pt-20',
        bottom: 'items-end justify-center',
        right: 'items-center justify-end',
        left: 'items-center justify-start'
    };
    
    return (
        <div className={`fixed inset-0 z-50 flex ${positionClasses[position]} p-4 bg-black/50 animate-fade-in`}>
            <div className={`w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden`}>
                {/* Header */}
                {title && (
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="إغلاق"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                )}
                
                {/* Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
                
                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-gray-100">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// مكون الإعداد الأولي
export const InitialSetup = ({ 
    isOpen, 
    onClose, 
    inventoryItems, 
    setInventoryItems, 
    activeBatch,
    showNotify,
    onSetupComplete 
}) => {
    const handleSetup = () => {
        // إنشاء مخزون علف افتراضي
        const initialFeed = [
            {
                id: Date.now() + 1,
                name: 'بادي 23%',
                category: 'أعلاف',
                unit: 'كجم',
                currentStock: 1000,
                minStock: 200,
                costPerUnit: 3.02,
                supplier: 'شركة الأعلاف الوطنية',
                notes: 'علف بداري - بروتين 23%',
                isFeed: true,
                lastUpdated: new Date().toISOString().split('T')[0],
                batchId: activeBatch?.id || null
            },
            {
                id: Date.now() + 2,
                name: 'نامي 21%',
                category: 'أعلاف',
                unit: 'كجم',
                currentStock: 1000,
                minStock: 200,
                costPerUnit: 2.85,
                supplier: 'شركة الأعلاف الوطنية',
                notes: 'علف نامي - بروتين 21%',
                isFeed: true,
                lastUpdated: new Date().toISOString().split('T')[0],
                batchId: activeBatch?.id || null
            }
        ];
        
        setInventoryItems(prev => [...prev, ...initialFeed]);
        showNotify && showNotify("✓ تم إعداد مخزون العلف الأساسي");
        onSetupComplete && onSetupComplete();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="الإعداد الأولي" size="lg">
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">مرحباً بك في دواجني! 🎉</h4>
                    <p className="text-sm text-blue-700">
                        قبل البدء، يحتاج النظام إلى إعداد مخزون العلف الأساسي لمتابعة الاستهلاك اليومي.
                    </p>
                </div>
                
                <div className="space-y-3">
                    <h4 className="font-bold text-gray-700">سيتم إنشاء:</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold">٢</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">نوعين من العلف</p>
                                <p className="text-xs text-gray-500">بادي 23% و نامي 21%</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold">١٠٠٠</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">كجم لكل نوع</p>
                                <p className="text-xs text-gray-500">مخزون ابتدائي</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 font-bold">٢٠٠</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">كجم حد أدنى</p>
                                <p className="text-xs text-gray-500">لتنبيه إعادة الطلب</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {activeBatch && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700">
                            <span className="font-bold">ملاحظة:</span> المخزون سيتم ربطه بالدورة الحالية: 
                            <span className="font-bold"> {activeBatch.name}</span>
                        </p>
                    </div>
                )}
                
                <div className="flex gap-2 pt-4">
                    <Button 
                        onClick={handleSetup}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                        إعداد المخزون
                    </Button>
                    <Button 
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        تخطي
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// مخطط الوزن
export const WeightChart = ({ data, title = "منحنى الوزن", height = 200 }) => {
    if (!data || data.length === 0) {
        return (
            <div className={`h-${height} flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl p-4`}>
                <p className="text-sm">لا توجد بيانات للعرض</p>
                <p className="text-xs text-gray-400 mt-1">أضف سجلات يومية للبدء</p>
            </div>
        );
    }
    
    const maxVal = Math.max(...data.map(d => d.val));
    const minVal = Math.min(...data.map(d => d.val));
    const range = maxVal - minVal;
    
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
            {title && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
                    <span className="text-xs text-gray-500">
                        {data.length} نقطة • آخر وزن: {data[data.length-1]?.val} جرام
                    </span>
                </div>
            )}
            
            <div className="relative" style={{ height: `${height}px` }}>
                {/* المحور الرأسي */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
                    <div>{maxVal.toLocaleString('ar-SA')}</div>
                    <div>{(minVal + (range * 0.75)).toLocaleString('ar-SA')}</div>
                    <div>{(minVal + (range * 0.5)).toLocaleString('ar-SA')}</div>
                    <div>{(minVal + (range * 0.25)).toLocaleString('ar-SA')}</div>
                    <div>{minVal.toLocaleString('ar-SA')}</div>
                </div>
                
                {/* المحور الأفقي */}
                <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-400">
                    {data.map((point, index) => (
                        <div key={index} className="text-center">
                            {point.day}
                        </div>
                    ))}
                </div>
                
                {/* الخط البياني */}
                <svg width="100%" height="100%" className="absolute top-0 left-10 right-0 bottom-6">
                    {/* خط التوصيل */}
                    <polyline
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        points={data.map((point, index) => {
                            const x = (index / (data.length - 1)) * 100;
                            const y = 100 - ((point.val - minVal) / range) * 100;
                            return `${x}%,${y}%`;
                        }).join(' ')}
                    />
                    
                    {/* النقاط */}
                    {data.map((point, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = 100 - ((point.val - minVal) / range) * 100;
                        
                        return (
                            <g key={index}>
                                <circle
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="4"
                                    fill="#3B82F6"
                                    className="hover:r-6 transition-all"
                                />
                                <title>
                                    اليوم {point.day}: {point.val.toLocaleString('ar-SA')} جرام
                                </title>
                            </g>
                        );
                    })}
                    
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

// دالة تنسيق التاريخ العربية
export const formatDate = (dateString, format = 'full') => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    if (format === 'short') {
        options.month = 'short';
        options.weekday = 'short';
    }
    
    return date.toLocaleDateString('ar-SA', options);
};

// دالة حساب الفرق بالأيام
export const getDaysDifference = (startDate, endDate = null) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// دالة لإضافة أيام على تاريخ
export const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

// مكون التحميل
export const Loader = ({ size = 'md', color = 'orange' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };
    
    const colorClasses = {
        orange: 'text-orange-500',
        blue: 'text-blue-500',
        green: 'text-green-500',
        gray: 'text-gray-500'
    };
    
    return (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        </div>
    );
};

// مكون البطاقة الإحصائية
export const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, className = '' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        gray: 'bg-gray-50 text-gray-600 border-gray-200'
    };
    
    return (
        <div className={`p-4 rounded-xl border ${colorClasses[color]} ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold mb-1">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {trend && (
                        <p className={`text-xs mt-1 ${trend.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-lg ${colorClasses[color].replace('50', '100').replace('600', '600')}`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

// أنيميشن CSS
export const animations = `
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slide-up {
        from { 
            opacity: 0;
            transform: translateY(20px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slide-down {
        from { 
            opacity: 0;
            transform: translateY(-20px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slide-right {
        from { 
            opacity: 0;
            transform: translateX(-20px);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slide-left {
        from { 
            opacity: 0;
            transform: translateX(20px);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scale-in {
        from { 
            opacity: 0;
            transform: scale(0.95);
        }
        to { 
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
    
    .animate-slide-up {
        animation: slide-up 0.4s ease-out;
    }
    
    .animate-slide-down {
        animation: slide-down 0.4s ease-out;
    }
    
    .animate-slide-right {
        animation: slide-right 0.4s ease-out;
    }
    
    .animate-slide-left {
        animation: slide-left 0.4s ease-out;
    }
    
    .animate-scale-in {
        animation: scale-in 0.3s ease-out;
    }
    
    .animate-bounce {
        animation: bounce 0.5s ease-in-out;
    }
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    /* Safe area for mobile */
    .pt-safe-top {
        padding-top: env(safe-area-inset-top);
    }
    
    .pb-safe {
        padding-bottom: env(safe-area-inset-bottom);
    }
    
    /* RTL support */
    [dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
        --tw-space-x-reverse: 1;
    }
    
    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`;

// إضافة الأنيميشن إلى head
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = animations;
    document.head.appendChild(style);
}

// تصدير جميع المكونات
export default {
    Button,
    Card,
    Input,
    TextArea,
    Select,
    Modal,
    InitialSetup,
    WeightChart,
    Loader,
    StatCard,
    formatDate,
    getDaysDifference,
    addDays,
    animations
};
