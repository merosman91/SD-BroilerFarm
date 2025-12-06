import React from 'react';

// مكونات UI الأساسية
export const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', ...props }) => {
    const baseClasses = 'rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-orange-500 text-white hover:bg-orange-600',
        success: 'bg-emerald-500 text-white hover:bg-emerald-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
        ghost: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50',
        dark: 'bg-gray-800 text-white hover:bg-gray-900'
    };
    
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base'
    };
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const Input = ({ label, type = 'text', value, onChange, placeholder, className = '', ...props }) => {
    return (
        <div className="mb-3">
            {label && (
                <label className="block text-xs font-bold text-gray-400 mb-1">
                    {label}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${className}`}
                {...props}
            />
        </div>
    );
};

export const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md' 
}) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className={`w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl animate-scale-in`}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// مخطط الوزن
export const WeightChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-gray-400">
                <p>لا توجد بيانات للعرض</p>
            </div>
        );
    }
    
    const maxVal = Math.max(...data.map(d => d.val));
    const minVal = Math.min(...data.map(d => d.val));
    
    return (
        <div className="h-40 relative">
            <div className="absolute inset-0 flex items-end">
                {data.map((point, index) => {
                    const height = maxVal > 0 ? (point.val / maxVal) * 100 : 0;
                    return (
                        <div
                            key={index}
                            className="flex-1 flex flex-col items-center justify-end mx-1"
                        >
                            <div
                                className="w-3/4 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg"
                                style={{ height: `${height}%` }}
                            />
                            <div className="text-xs text-gray-500 mt-1">{point.day}</div>
                        </div>
                    );
                })}
            </div>
            
            {/* القيم على المحور الرأسي */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
                <div>{maxVal.toFixed(0)}</div>
                <div>{(maxVal / 2).toFixed(0)}</div>
                <div>{minVal.toFixed(0)}</div>
            </div>
        </div>
    );
};

// دالة تنسيق التاريخ
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// دالة حساب الفرق بالأيام
export const getDaysDifference = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// دالة لإضافة أيام على تاريخ
export const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
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
    
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
    
    .animate-slide-up {
        animation: slide-up 0.4s ease-out;
    }
    
    .animate-scale-in {
        animation: scale-in 0.3s ease-out;
    }
    
    .animate-bounce {
        animation: bounce 0.5s ease-in-out;
    }
`;

// إضافة الأنيميشن إلى head
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = animations;
    document.head.appendChild(style);
}

export default {
    Button,
    Card,
    Input,
    Modal,
    WeightChart,
    formatDate,
    getDaysDifference,
    addDays
};
