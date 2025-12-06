// components/DeveloperInfo.jsx
import React, { useState } from 'react';
import { Code, Mail, Phone, Share2 } from 'lucide-react';
import { Modal } from '../UI';

const DeveloperInfo = () => {
    const [showDev, setShowDev] = useState(false);
    
    return (
        <>
            <div className="py-6 text-center">
                <button 
                    onClick={() => setShowDev(true)} 
                    className="text-[10px] text-gray-400 hover:text-orange-600 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                    <Code size={12}/> تم التطوير بواسطة 
                    <span className="font-bold border-b border-gray-300 pb-[1px]">ميرغني أبوالقاسم</span> v1.0
                </button>
            </div>

            <Modal isOpen={showDev} onClose={() => setShowDev(false)} title="عن المطور">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
                        <Code size={32}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">ميرغني أبوالقاسم</h3>
                        <p className="text-xs text-gray-500">مطور نظم معلومات وتطبيقات ويب</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-sm space-y-2 text-right">
                        <p className="text-xs text-gray-400 text-center mb-2">لطلب نسخ خاصة أو دعم فني:</p>
                        <a 
                            href="tel:+249000000000" 
                            className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors"
                        >
                            <div className="bg-green-100 p-1.5 rounded text-green-600">
                                <Phone size={16}/>
                            </div>
                            <span className="font-bold text-gray-700">اتصال هاتفي</span>
                        </a>
                        <a 
                            href="https://wa.me/249000000000" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors"
                        >
                            <div className="bg-emerald-100 p-1.5 rounded text-emerald-600">
                                <Share2 size={16}/>
                            </div>
                            <span className="font-bold text-gray-700">واتساب</span>
                        </a>
                        <a 
                            href="mailto:dev@example.com" 
                            className="flex items-center gap-3 p-2 bg-white border rounded-lg hover:border-orange-300 transition-colors"
                        >
                            <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                                <Mail size={16}/>
                            </div>
                            <span className="font-bold text-gray-700">بريد إلكتروني</span>
                        </a>
                    </div>
                    <p className="text-[10px] text-gray-300 pt-2">
                        جميع الحقوق محفوظة © {new Date().getFullYear()}
                    </p>
                </div>
            </Modal>
        </>
    );
};

export default DeveloperInfo;
