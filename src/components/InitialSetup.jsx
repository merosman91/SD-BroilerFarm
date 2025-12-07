import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertTriangle, Database, Settings, Bell } from 'lucide-react';
import { Button, Modal } from '../UI';
import { createInitialFeedInventory, FEED_TYPES } from '../utils/helpers';

const InitialSetup = ({ 
    inventoryItems, 
    setInventoryItems, 
    activeBatch,
    showNotify,
    onSetupComplete 
}) => {
    const [showSetup, setShowSetup] = useState(false);
    const [setupType, setSetupType] = useState('welcome'); // 'welcome', 'inventory', 'batch', 'complete'
    const [setupStep, setSetupStep] = useState(1);
    const [feedItems, setFeedItems] = useState(FEED_TYPES);
    const [selectedBatchType, setSelectedBatchType] = useState('broiler');
    const [initialBirdCount, setInitialBirdCount] = useState('1000');
    const [setupInProgress, setSetupInProgress] = useState(false);

    useEffect(() => {
        // التحقق من الإعداد الأولي للتطبيق
        const hasFeedInventory = inventoryItems.some(item => 
            item.category === 'أعلاف' && FEED_TYPES.some(feed => feed.name === item.name)
        );
        
        // إذا لم يكن هناك مخزون علف، عرض الإعداد الأولي بعد 3 ثواني
        if (!hasFeedInventory && inventoryItems.length === 0) {
            const timer = setTimeout(() => {
                setShowSetup(true);
                setSetupType('welcome');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [inventoryItems]);

    const setupGeneralFeedInventory = () => {
        setSetupInProgress(true);
        
        try {
            // إنشاء مخزون علف عام (غير مرتبط بدورة)
            const newFeedItems = createInitialFeedInventory(); // بدون batchId
            setInventoryItems(prev => {
                const updated = [...prev, ...newFeedItems];
                console.log('تم إنشاء مخزون العلف العام:', updated.length, 'عنصر');
                return updated;
            });
            
            showNotify("✓ تم إعداد مخزون العلف الأساسي");
            
            // التقدم للخطوة التالية
            setTimeout(() => {
                setSetupStep(2);
                setSetupType('inventory');
                setSetupInProgress(false);
            }, 1000);
            
        } catch (error) {
            console.error('خطأ في إعداد المخزون:', error);
            showNotify("✗ حدث خطأ أثناء إعداد المخزون");
            setSetupInProgress(false);
        }
    };

    const setupBatchSpecificInventory = () => {
        if (!activeBatch) {
            showNotify("✗ يجب بدء دورة أولاً");
            return;
        }

        setSetupInProgress(true);
        
        try {
            // إنشاء مخزون علف خاص بالدورة الحالية
            const batchFeedItems = FEED_TYPES.map(feed => ({
                id: Date.now() + Math.random(),
                name: feed.name,
                category: 'أعلاف',
                unit: 'كجم',
                currentStock: selectedBatchType === 'broiler' ? 1500 : 
                            selectedBatchType === 'layer' ? 1000 : 1200,
                minStock: 200,
                costPerUnit: feed.pricePerKg || 2.8,
                supplier: 'شركة الأعلاف الوطنية',
                notes: `علف ${feed.name} للدورة الحالية`,
                code: feed.code,
                isFeed: true,
                batchId: activeBatch.id, // ربط بالدورة الحالية
                lastUpdated: new Date().toISOString().split('T')[0]
            }));

            setInventoryItems(prev => {
                const updated = [...prev, ...batchFeedItems];
                console.log('تم إنشاء مخزون العلف للدورة:', batchFeedItems.length, 'عنصر');
                return updated;
            });
            
            showNotify("✓ تم إعداد مخزون علف للدورة الحالية");
            
            // إكمال الإعداد
            setTimeout(() => {
                setSetupStep(3);
                setSetupType('complete');
                setSetupInProgress(false);
                
                if (onSetupComplete) {
                    onSetupComplete();
                }
            }, 1000);
            
        } catch (error) {
            console.error('خطأ في إعداد مخزون الدورة:', error);
            showNotify("✗ حدث خطأ أثناء إعداد مخزون الدورة");
            setSetupInProgress(false);
        }
    };

    const skipSetup = () => {
        setShowSetup(false);
        showNotify("تم تخطي الإعداد، يمكنك إعداد المخزون لاحقاً");
    };

    const completeSetup = () => {
        setShowSetup(false);
        showNotify("✅ تم إكمال الإعداد الأولي بنجاح");
        
        if (onSetupComplete) {
            onSetupComplete();
        }
    };

    // مراحل الإعداد
    const setupStages = [
        { id: 1, title: 'ترحيب', description: 'مرحباً بك في دواجني' },
        { id: 2, title: 'المخزون', description: 'إعداد مخزون العلف' },
        { id: 3, title: 'الإكمال', description: 'جاهز للبدء' }
    ];

    return (
        <Modal 
            isOpen={showSetup} 
            onClose={setupInProgress ? null : skipSetup} 
            title="الإعداد الأولي"
            size="lg"
            showClose={!setupInProgress}
        >
            <div className="space-y-4">
                {/* مؤشر التقدم */}
                <div className="flex justify-between items-center mb-6">
                    {setupStages.map((stage, index) => (
                        <div key={stage.id} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                ${setupStep >= stage.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {setupStep > stage.id ? '✓' : stage.id}
                            </div>
                            <div className="text-xs mt-1 text-center">
                                <p className={`font-medium ${setupStep >= stage.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {stage.title}
                                </p>
                                <p className="text-gray-400 text-[10px]">{stage.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* مرحلة الترحيب */}
                {setupType === 'welcome' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center">
                            <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
                                <Package size={48} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك في دواجني</h3>
                            <p className="text-gray-600">
                                نظام إدارة مزارع الدواجن الذكي
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <Bell size={16} /> قبل أن نبدأ
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>كل دورة لها مخزونها الخاص</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>متابعة استهلاك العلف تلقائياً</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>تقارير أداء مفصلة</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>إدارة صحية متكاملة</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                            <Button 
                                onClick={() => {
                                    setSetupStep(2);
                                    setSetupType('inventory');
                                }} 
                                className="flex-1 bg-blue-500 hover:bg-blue-600"
                            >
                                بدء الإعداد
                            </Button>
                            <Button 
                                onClick={skipSetup}
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                تخطي الإعداد
                            </Button>
                        </div>
                    </div>
                )}

                {/* مرحلة إعداد المخزون */}
                {setupType === 'inventory' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="text-yellow-600" size={20} />
                                <h3 className="font-bold text-yellow-800">إعداد مخزون العلف</h3>
                            </div>
                            <p className="text-sm text-yellow-700">
                                يحتاج النظام إلى مخزون علف أساسي لمتابعة الاستهلاك في السجلات اليومية.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-700">أنواع العلف المتاحة:</h4>
                            {feedItems.map(feed => (
                                <div key={feed.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${
                                            feed.code === 'starter' ? 'bg-green-100 text-green-600' :
                                            feed.code === 'grower' ? 'bg-blue-100 text-blue-600' :
                                            feed.code === 'finisher' ? 'bg-orange-100 text-orange-600' :
                                            'bg-purple-100 text-purple-600'
                                        }`}>
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{feed.name}</p>
                                            <p className="text-xs text-gray-500">
                                                بروتين {feed.protein} • {feed.pricePerKg} ج/كجم
                                            </p>
                                        </div>
                                    </div>
                                    <CheckCircle className="text-green-500" size={20} />
                                </div>
                            ))}
                        </div>

                        {/* خيارات الإعداد */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-700">اختر نوع الإعداد:</h4>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={setupGeneralFeedInventory}
                                    disabled={setupInProgress}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        setupInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 hover:bg-blue-50'
                                    } ${activeBatch ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Database size={16} className="text-blue-500" />
                                        <span className="font-bold text-blue-700">مخزون عام</span>
                                    </div>
                                    <p className="text-xs text-blue-600">
                                        مخزون علف يمكن استخدامه في جميع الدورات
                                    </p>
                                </button>
                                
                                {activeBatch && (
                                    <button
                                        onClick={setupBatchSpecificInventory}
                                        disabled={setupInProgress}
                                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                                            setupInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-300 hover:bg-green-50'
                                        } border-green-200 bg-green-50`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Settings size={16} className="text-green-500" />
                                            <span className="font-bold text-green-700">مخزون للدورة الحالية</span>
                                        </div>
                                        <p className="text-xs text-green-600">
                                            مخزون مخصص للدورة: {activeBatch.name}
                                        </p>
                                    </button>
                                )}
                            </div>
                            
                            {!activeBatch && (
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 text-center">
                                        يمكنك بدء دورة جديدة أولاً للحصول على مخزون مخصص لها
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-bold">المخزون الافتراضي:</span> 1000 كجم لكل نوع علف<br />
                                <span className="font-bold">الحد الأدنى:</span> 200 كجم<br />
                                <span className="font-bold">السعر:</span> حسب نوع العلف
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            {setupInProgress ? (
                                <div className="flex-1 text-center py-3">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    <p className="text-sm text-gray-500 mt-2">جاري الإعداد...</p>
                                </div>
                            ) : (
                                <>
                                    <Button 
                                        onClick={() => {
                                            setSetupStep(1);
                                            setSetupType('welcome');
                                        }}
                                        className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        رجوع
                                    </Button>
                                    <Button 
                                        onClick={skipSetup}
                                        className="flex-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        تخطي
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* مرحلة الإكمال */}
                {setupType === 'complete' && (
                    <div className="space-y-4 animate-fade-in text-center">
                        <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                            <CheckCircle size={64} className="text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">تم الإعداد بنجاح! 🎉</h3>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <p className="text-green-700 mb-3">
                                تم إعداد النظام وجاهز للاستخدام
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-white rounded">
                                    <p className="font-bold text-green-600">{feedItems.length}</p>
                                    <p className="text-xs text-gray-500">نوع علف</p>
                                </div>
                                <div className="p-2 bg-white rounded">
                                    <p className="font-bold text-green-600">1000+</p>
                                    <p className="text-xs text-gray-500">كجم لكل نوع</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-2">
                            <p className="flex items-center justify-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                <span>مخزون العلف جاهز للاستخدام</span>
                            </p>
                            {activeBatch && (
                                <p className="flex items-center justify-center gap-2">
                                    <CheckCircle size={14} className="text-green-500" />
                                    <span>المخزون مرتبط بالدورة الحالية</span>
                                </p>
                            )}
                            <p className="flex items-center justify-center gap-2">
                                <CheckCircle size={14} className="text-green-500" />
                                <span>يمكنك إضافة سجلات يومية الآن</span>
                            </p>
                        </div>
                        
                        <Button 
                            onClick={completeSetup}
                            className="w-full bg-green-500 hover:bg-green-600"
                        >
                            ابدأ الاستخدام
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default InitialSetup;
