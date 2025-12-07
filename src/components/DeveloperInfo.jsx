import React, { useState } from 'react';
import { 
    Code, Mail, Phone, Share2, Github, 
    Linkedin, Globe, Award, Users, Star,
    Heart, Coffee, Download, BookOpen,
    Zap, Shield, Database, Smartphone
} from 'lucide-react';
import { Modal, Button } from '../UI';

const DeveloperInfo = () => {
    const [showDev, setShowDev] = useState(false);
    const [activeTab, setActiveTab] = useState('about'); // 'about', 'contact', 'features', 'support'
    
    const developerInfo = {
        name: "ميرغني أبوالقاسم",
        title: "مطور نظم معلومات وتطبيقات ويب متخصصة",
        experience: "خبرة أكثر من 8 سنوات في تطوير أنظمة إدارة الأعمال",
        specialties: ["أنظمة المزارع", "إدارة المخزون", "أنظمة المحاسبة", "تطبيقات الهواتف"],
        version: "دواجني v2.0",
        releaseDate: "ديسمبر 2024",
        features: [
            "إدارة متكاملة لمزارع الدواجن",
            "مخزون لكل دورة بشكل مستقل",
            "تقارير أداء مفصلة",
            "دعم اللغة العربية الكامل",
            "تطبيق ويب متجاوب مع الهواتف",
            "نسخ احتياطي تلقائي للبيانات"
        ]
    };

    const contactInfo = [
        {
            id: 'phone',
            icon: Phone,
            title: 'الاتصال الهاتفي',
            value: '+249 91 234 5678',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            action: 'tel:+249912345678'
        },
        {
            id: 'whatsapp',
            icon: Share2,
            title: 'واتساب',
            value: '+249 91 234 5678',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
            action: 'https://wa.me/249912345678'
        },
        {
            id: 'email',
            icon: Mail,
            title: 'البريد الإلكتروني',
            value: 'merghani@example.com',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            action: 'mailto:merghani@example.com'
        },
        {
            id: 'website',
            icon: Globe,
            title: 'الموقع الإلكتروني',
            value: 'www.merghani.dev',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            action: 'https://merghani.dev'
        }
    ];

    const socialLinks = [
        {
            id: 'github',
            icon: Github,
            name: 'GitHub',
            url: 'https://github.com/merghani',
            color: 'text-gray-800',
            bgColor: 'bg-gray-100'
        },
        {
            id: 'linkedin',
            icon: Linkedin,
            name: 'LinkedIn',
            url: 'https://linkedin.com/in/merghani',
            color: 'text-blue-700',
            bgColor: 'bg-blue-100'
        }
    ];

    const supportOptions = [
        {
            id: 'training',
            icon: Users,
            title: 'تدريب على النظام',
            description: 'جلسات تدريبية لاستخدام النظام بكفاءة'
        },
        {
            id: 'customization',
            icon: Code,
            title: 'تخصيص النظام',
            description: 'تعديلات حسب متطلبات مزرعتك الخاصة'
        },
        {
            id: 'hosting',
            icon: Database,
            title: 'استضافة السحابة',
            description: 'استضافة النظام على سحابة آمنة'
        },
        {
            id: 'mobile',
            icon: Smartphone,
            title: 'تطبيق موبايل',
            description: 'تطبيق خاص بمزرعتك للهواتف'
        }
    ];

    return (
        <>
            {/* زر المعلومات في الفوتر */}
            <div className="py-4 text-center border-t border-gray-100">
                <button 
                    onClick={() => setShowDev(true)} 
                    className="text-xs text-gray-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 mx-auto group"
                >
                    <div className="flex items-center gap-1">
                        <Code size={14} className="group-hover:animate-pulse" />
                        <span className="font-bold border-b border-dotted border-gray-300 pb-[1px]">
                            {developerInfo.version}
                        </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>تم التطوير بواسطة {developerInfo.name}</span>
                </button>
            </div>

            {/* نافذة معلومات المطور */}
            <Modal 
                isOpen={showDev} 
                onClose={() => setShowDev(false)} 
                title="عن المطور والنظام"
                size="lg"
            >
                <div className="space-y-4">
                    {/* التبويبات */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 ${
                                activeTab === 'about' 
                                    ? 'border-orange-500 text-orange-600' 
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Award size={16} />
                                عن المطور
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('contact')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 ${
                                activeTab === 'contact' 
                                    ? 'border-orange-500 text-orange-600' 
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Phone size={16} />
                                التواصل
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('features')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 ${
                                activeTab === 'features' 
                                    ? 'border-orange-500 text-orange-600' 
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Star size={16} />
                                المميزات
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 ${
                                activeTab === 'support' 
                                    ? 'border-orange-500 text-orange-600' 
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Shield size={16} />
                                الدعم
                            </div>
                        </button>
                    </div>

                    {/* محتوى التبويب: عن المطور */}
                    {activeTab === 'about' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Code size={36} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-xl">{developerInfo.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{developerInfo.title}</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                                            {developerInfo.version}
                                        </span>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">{developerInfo.releaseDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <Zap size={16} /> الخبرات والتخصصات
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">{developerInfo.experience}</p>
                                <div className="flex flex-wrap gap-2">
                                    {developerInfo.specialties.map((specialty, index) => (
                                        <span 
                                            key={index}
                                            className="text-xs px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full"
                                        >
                                            {specialty}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart size={16} className="text-green-600" />
                                        <p className="text-xs font-bold text-green-700">مفتوح المصدر</p>
                                    </div>
                                    <p className="text-xs text-green-600">نسخ مجانية للاستخدام الشخصي</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Coffee size={16} className="text-blue-600" />
                                        <p className="text-xs font-bold text-blue-700">دعم فني</p>
                                    </div>
                                    <p className="text-xs text-blue-600">دعم فني متواصل</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* محتوى التبويب: التواصل */}
                    {activeTab === 'contact' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                                <h4 className="font-bold text-orange-800 mb-2">للتواصل والدعم الفني</h4>
                                <p className="text-sm text-orange-700">
                                    متاح للرد على استفساراتك وأسئلتك الفنية
                                </p>
                            </div>

                            <div className="space-y-2">
                                {contactInfo.map((contact) => (
                                    <a 
                                        key={contact.id}
                                        href={contact.action}
                                        target={contact.id === 'website' || contact.id === 'whatsapp' ? '_blank' : '_self'}
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all"
                                    >
                                        <div className={`p-2 rounded-lg ${contact.bgColor}`}>
                                            <contact.icon size={20} className={contact.color} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{contact.title}</p>
                                            <p className="text-sm text-gray-500">{contact.value}</p>
                                        </div>
                                        <div className="text-gray-400">
                                            <Share2 size={16} />
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* الروابط الاجتماعية */}
                            <div>
                                <h4 className="font-bold text-gray-700 text-sm mb-2">حسابات التواصل</h4>
                                <div className="flex gap-2">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.id}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 ${social.bgColor} hover:opacity-90 transition-opacity`}
                                        >
                                            <social.icon size={18} className={social.color} />
                                            <span className="font-medium text-gray-700">{social.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* محتوى التبويب: المميزات */}
                    {activeTab === 'features' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-2">مميزات نظام دواجني</h4>
                                <p className="text-sm text-blue-700">
                                    نظام متكامل لإدارة مزارع الدواجن باحترافية
                                </p>
                            </div>

                            <div className="space-y-2">
                                {developerInfo.features.map((feature, index) => (
                                    <div 
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle size={14} className="text-orange-600" />
                                        </div>
                                        <p className="text-sm text-gray-700">{feature}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white border border-green-200 rounded-lg">
                                    <p className="text-xs font-bold text-green-700 mb-1">سحابي</p>
                                    <p className="text-xs text-gray-600">عمل على جميع الأجهزة</p>
                                </div>
                                <div className="p-3 bg-white border border-blue-200 rounded-lg">
                                    <p className="text-xs font-bold text-blue-700 mb-1">آمن</p>
                                    <p className="text-xs text-gray-600">نسخ احتياطي يومي</p>
                                </div>
                                <div className="p-3 bg-white border border-purple-200 rounded-lg">
                                    <p className="text-xs font-bold text-purple-700 mb-1">مجاني</p>
                                    <p className="text-xs text-gray-600">للإصدار الأساسي</p>
                                </div>
                                <div className="p-3 bg-white border border-amber-200 rounded-lg">
                                    <p className="text-xs font-bold text-amber-700 mb-1">عربي</p>
                                    <p className="text-xs text-gray-600">واجهة عربية كاملة</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* محتوى التبويب: الدعم */}
                    {activeTab === 'support' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <h4 className="font-bold text-green-800 mb-2">خدمات الدعم المتاحة</h4>
                                <p className="text-sm text-green-700">
                                    نحن هنا لمساعدتك في تحقيق أقصى استفادة من النظام
                                </p>
                            </div>

                            <div className="space-y-3">
                                {supportOptions.map((option) => (
                                    <div 
                                        key={option.id}
                                        className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
                                    >
                                        <div className="p-2 rounded-lg bg-blue-50">
                                            <option.icon size={20} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800">{option.title}</p>
                                            <p className="text-sm text-gray-600">{option.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                                <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                                    <BookOpen size={16} /> وثائق النظام
                                </h4>
                                <div className="space-y-2">
                                    <a 
                                        href="#" 
                                        className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-orange-50"
                                    >
                                        <span className="text-sm text-gray-700">دليل المستخدم</span>
                                        <Download size={16} className="text-gray-400" />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-orange-50"
                                    >
                                        <span className="text-sm text-gray-700">كيفية البدء</span>
                                        <Download size={16} className="text-gray-400" />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-orange-50"
                                    >
                                        <span className="text-sm text-gray-700">نصائح للاستخدام</span>
                                        <Download size={16} className="text-gray-400" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* زر الإغلاق */}
                    <div className="pt-4 border-t border-gray-200">
                        <Button 
                            onClick={() => setShowDev(false)} 
                            className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                            تم
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            جميع الحقوق محفوظة © {new Date().getFullYear()} • {developerInfo.name}
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
};

// مكون CheckCircle المساعد
const CheckCircle = ({ size = 16, className = '' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default DeveloperInfo;
