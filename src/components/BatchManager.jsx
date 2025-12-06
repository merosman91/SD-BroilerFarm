import React, { useState, useEffect } from 'react';
import { 
    Plus, Info, TrendingUp, Scale, Shield, 
    Thermometer, Egg, Activity, Calendar,
    Users, Target, DollarSign, Package, 
    AlertCircle, CheckCircle, XCircle,
    Filter, Search, BarChart3, Home
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import { 
    addDays, 
    formatDate, 
    getDaysDifference, 
    generateDefaultSchedule,
    calculateMortalityRate,
    calculateLivability,
    formatNumber,
    formatCurrency,
    calculateBirdCost,
    calculateTotalBiomass,
    calculateFCR,
    calculateEPEF
} from '../utils/helpers';
import { CHICKEN_BREEDS, BREED_CATEGORIES } from '../utils/breeds';

const BatchManager = ({ 
    batches, 
    setBatches, 
    vaccinations, 
    setVaccinations, 
    dailyLogs, 
    sales, 
    expenses, 
    inventoryItems,
    setInventoryItems,
    showNotify, 
    shareViaWhatsapp,
    handleDelete
}) => {
    const [view, setView] = useState('list');
    const [newBatch, setNewBatch] = useState({ 
        name: '', 
        startDate: new Date().toISOString().split('T')[0], 
        initialCount: '', 
        breed: '', 
        breedId: '',
        notes: '',
        targetWeight: '',
        breedType: '',
        batchType: 'دورة تسمين'
    });
    const [selectedBatchReport, setSelectedBatchReport] = useState(null);
    const [showBreedInfo, setShowBreedInfo] = useState(null);
    const [searchBreed, setSearchBreed] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showActiveModal, setShowActiveModal] = useState(false);
    const [batchToActivate, setBatchToActivate] = useState(null);
    const [showBatchDetails, setShowBatchDetails] = useState(null);

    // فلترة السلالات
    const filteredBreeds = CHICKEN_BREEDS.filter(breed => {
        const matchesSearch = breed.name.toLowerCase().includes(searchBreed.toLowerCase()) ||
                            breed.arabicName.toLowerCase().includes(searchBreed.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                               breed.category === (selectedCategory === 'broiler' ? 'لاحم' : 
                                                   selectedCategory === 'layer' ? 'بياض' : 'مزدوج');
        return matchesSearch && matchesCategory;
    });

    const startBatch = () => {
        const errors = [];
        
        if (!newBatch.name.trim()) errors.push("اسم الدورة مطلوب");
        if (!newBatch.initialCount || isNaN(newBatch.initialCount) || newBatch.initialCount <= 0) 
            errors.push("العدد الأولي يجب أن يكون رقم موجب");
        if (!newBatch.breed) errors.push("اختيار السلالة مطلوب");
        
        if (errors.length > 0) {
            errors.forEach(error => showNotify(`✗ ${error}`));
            return;
        }

        // إغلاق الدورة النشطة إذا كانت موجودة
        const updatedBatches = batches.map(b => 
            b.status === 'active' ? 
            { ...b, 
                status: 'closed', 
                endDate: new Date().toISOString().split('T')[0],
                daysActive: getDaysDifference(b.startDate)
            } : b
        );
        
        const batchId = Date.now();
        const breed = CHICKEN_BREEDS.find(b => b.id === newBatch.breedId);
        
        const newBatchData = { 
            ...newBatch,
            id: batchId,
            status: 'active',
            startDate: newBatch.startDate,
            initialCount: Number(newBatch.initialCount),
            breedType: breed?.category || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        setBatches([...updatedBatches, newBatchData]);
        
        // إنشاء جدول تحصينات افتراضي
        const defaultVaccinations = generateDefaultSchedule(batchId, newBatch.startDate, addDays);
        setVaccinations([...vaccinations, ...defaultVaccinations]);
        
        // إنشاء مخزون علف خاص بالدورة الجديدة
        const batchFeedInventory = createBatchFeedInventory(batchId, breed);
        setInventoryItems(prev => [...prev, ...batchFeedInventory]);
        
        showNotify(`✓ تم بدء الدورة الجديدة: ${newBatch.name}`);
        resetForm();
        setView('list');
    };

    const createBatchFeedInventory = (batchId, breed) => {
        const feedTypes = [
            { name: 'بادي 23%', initialStock: breed?.category === 'لاحم' ? 1500 : 1000 },
            { name: 'نامي 21%', initialStock: breed?.category === 'لاحم' ? 2000 : 1500 },
            { name: 'ناهي 19%', initialStock: breed?.category === 'لاحم' ? 2000 : 1000 }
        ];
        
        return feedTypes.map(feed => ({
            id: Date.now() + Math.random(),
            name: feed.name,
            category: 'أعلاف',
            unit: 'كجم',
            currentStock: feed.initialStock,
            minStock: 200,
            costPerUnit: getFeedPrice(feed.name),
            supplier: 'شركة الأعلاف الوطنية',
            notes: `علف ${feed.name} مخصص للدورة`,
            batchId: batchId,
            lastUpdated: new Date().toISOString().split('T')[0],
            isFeed: true
        }));
    };

    const getFeedPrice = (feedName) => {
        const prices = {
            'بادي 23%': 3.02,
            'نامي 21%': 2.85,
            'ناهي 19%': 2.70,
            'بياض 17%': 2.55
        };
        return prices[feedName] || 2.80;
    };

    const activateBatch = (batch) => {
        setBatchToActivate(batch);
        setShowActiveModal(true);
    };

    const confirmActivateBatch = () => {
        if (!batchToActivate) return;

        const updated = batches.map(b => ({ 
            ...b, 
            status: b.id === batchToActivate.id ? 'active' : 'closed', 
            endDate: b.id === batchToActivate.id ? null : 
                    (b.status === 'active' ? new Date().toISOString().split('T')[0] : b.endDate),
            daysActive: b.id === batchToActivate.id ? getDaysDifference(b.startDate) : b.daysActive
        }));
        
        setBatches(updated);
        showNotify("✓ تم تفعيل الدورة");
        setShowActiveModal(false);
        setBatchToActivate(null);
    };

    const closeBatch = (batch) => {
        if (!confirm(`هل أنت متأكد من إغلاق الدورة "${batch.name}"؟`)) return;
        
        const updated = batches.map(b => 
            b.id === batch.id ? { 
                ...b, 
                status: 'closed', 
                endDate: new Date().toISOString().split('T')[0],
                daysActive: getDaysDifference(b.startDate)
            } : b
        );
        
        setBatches(updated);
        showNotify("✓ تم إغلاق الدورة");
    };

    const getReportStats = (batch) => {
        const bLogs = dailyLogs.filter(l => l.batchId === batch.id);
        const bSales = sales.filter(s => s.batchId === batch.id)
            .reduce((sum, s) => sum + Number(s.total || 0), 0);
        const bExp = expenses.filter(e => e.batchId === batch.id)
            .reduce((sum, e) => sum + Number(e.cost || 0), 0);
        const dead = bLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
        const totalFeed = bLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
        const lastWt = [...bLogs].sort((a,b)=>new Date(b.date)-new Date(a.date))
            .find(l=>l.avgWeight)?.avgWeight || 0;
        
        const currentCount = batch.initialCount - dead;
        const totalWeight = totalFeed > 0 ? totalFeed * 1.8 : 0; // تقدير
        const fcr = calculateFCR(totalFeed, totalWeight);
        const mortalityRate = calculateMortalityRate(dead, batch.initialCount);
        const livability = calculateLivability(dead, batch.initialCount);
        const age = batch.endDate ? getDaysDifference(batch.startDate, batch.endDate) : 
                                 getDaysDifference(batch.startDate);
        const epef = calculateEPEF(lastWt, livability, fcr, age);
        const birdCost = calculateBirdCost(bExp, batch.initialCount);
        const totalBiomass = calculateTotalBiomass(lastWt, currentCount);
        
        return { 
            bSales, 
            bExp, 
            profit: bSales - bExp,
            profitMargin: bSales > 0 ? ((bSales - bExp) / bSales * 100).toFixed(1) : 0,
            dead, 
            totalFeed, 
            lastWt,
            currentCount,
            mortalityRate,
            livability,
            fcr,
            epef,
            birdCost,
            totalBiomass,
            age
        };
    };

    const handleBreedSelect = (breed) => {
        setNewBatch({
            ...newBatch,
            breed: breed.arabicName,
            breedId: breed.id,
            breedType: breed.category,
            targetWeight: breed.category === 'لاحم' ? '2000' : 
                         breed.category === 'بياض' ? '1500' : '1800'
        });
        setShowBreedInfo(breed);
    };

    const resetForm = () => {
        setNewBatch({ 
            name: '', 
            startDate: new Date().toISOString().split('T')[0], 
            initialCount: '', 
            breed: '', 
            breedId: '',
            notes: '',
            targetWeight: '',
            breedType: '',
            batchType: 'دورة تسمين'
        });
    };

    const getPerformanceStatus = (epef) => {
        if (epef >= 350) return { color: 'text-green-600', status: 'ممتاز', icon: '⭐' };
        if (epef >= 300) return { color: 'text-blue-600', status: 'جيد جداً', icon: '👍' };
        if (epef >= 250) return { color: 'text-yellow-600', status: 'جيد', icon: '✅' };
        return { color: 'text-red-600', status: 'يحتاج تحسين', icon: '⚠️' };
    };

    const activeBatch = batches.find(b => b.status === 'active');

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* الدورة النشطة الحالية */}
            {activeBatch && view === 'list' && (
                <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-4 text-white">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-lg font-bold">الدورة النشطة</h3>
                            <p className="text-xs opacity-80">تحت التربية حالياً</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowBatchDetails(activeBatch)}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                                title="تفاصيل الدورة"
                            >
                                <Info size={18} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg">{activeBatch.name}</h4>
                                <p className="text-xs opacity-80">
                                    {activeBatch.breed} • {getDaysDifference(activeBatch.startDate)} يوم
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs opacity-80">العدد المتبقي</p>
                                <p className="font-bold text-2xl">
                                    {formatNumber(activeBatch.initialCount)}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <p className="text-xs opacity-80">بدء الدورة</p>
                                <p className="font-bold">{formatDate(activeBatch.startDate)}</p>
                            </div>
                            <div className="bg-white/10 p-2 rounded-lg">
                                <p className="text-xs opacity-80">نوع الدورة</p>
                                <p className="font-bold">{activeBatch.batchType || 'تسمين'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* التبويبات */}
            <div className="flex bg-gray-200 p-1 rounded-xl">
                <button 
                    onClick={() => setView('list')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${
                        view === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
                    }`}
                >
                    <Home size={14} /> الدورات
                </button>
                <button 
                    onClick={() => { setView('new'); resetForm(); }} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${
                        view === 'new' ? 'bg-white shadow text-green-600' : 'text-gray-500'
                    }`}
                >
                    <Plus size={14} /> دورة جديدة
                </button>
            </div>

            {/* قائمة الدورات */}
            {view === 'list' && (
                <div className="space-y-3">
                    {batches.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Users size={48} className="mx-auto mb-3 opacity-30" />
                            <p>لا توجد دورات حتى الآن</p>
                            <button 
                                onClick={() => setView('new')}
                                className="mt-3 text-green-500 text-sm font-bold"
                            >
                                + بدء أول دورة
                            </button>
                        </div>
                    ) : (
                        batches.map(b => {
                            const isActive = b.status === 'active';
                            const stats = getReportStats(b);
                            const performance = getPerformanceStatus(stats.epef);
                            
                            return (
                                <Card key={b.id} className={`p-4 ${isActive ? 'border-green-300 bg-green-50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold ${isActive ? 'text-green-800' : 'text-gray-800'}`}>
                                                    {b.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {isActive ? 'نشطة' : 'مغلقة'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {formatDate(b.startDate)} • {formatNumber(b.initialCount)} طائر
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                                    {b.breed || 'غير محدد'}
                                                </span>
                                                <button 
                                                    onClick={() => setShowBatchDetails(b)}
                                                    className="text-xs text-blue-500 hover:text-blue-600"
                                                >
                                                    تفاصيل →
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {!isActive ? (
                                                <>
                                                    <button 
                                                        onClick={() => activateBatch(b)} 
                                                        className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                                                    >
                                                        تفعيل
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete('دورة', () => {
                                                            setBatches(batches.filter(batch => batch.id !== b.id));
                                                            // حذف البيانات المرتبطة بالدورة
                                                            setVaccinations(vaccinations.filter(v => v.batchId !== b.id));
                                                        })}
                                                        className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200"
                                                    >
                                                        حذف
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => closeBatch(b)}
                                                        className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200"
                                                    >
                                                        إغلاق الدورة
                                                    </button>
                                                    <div className="text-xs text-center">
                                                        <div className={`font-bold ${performance.color}`}>
                                                            {performance.icon} {performance.status}
                                                        </div>
                                                        <div className="text-gray-500">EPEF: {stats.epef}</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* معلومات سريعة */}
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-500">العمر</p>
                                            <p className="font-bold text-gray-700">{stats.age} يوم</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-50 rounded">
                                            <p className="text-xs text-gray-500">النفوق</p>
                                            <p className="font-bold text-red-600">{stats.dead} ({stats.mortalityRate}%)</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* إنشاء دورة جديدة */}
            {view === 'new' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">بدء دورة جديدة</h3>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">اسم الدورة *</label>
                            <input
                                type="text"
                                value={newBatch.name}
                                onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="مثال: دورة ربيع 2024"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">تاريخ البدء *</label>
                                <input
                                    type="date"
                                    value={newBatch.startDate}
                                    onChange={e => setNewBatch({...newBatch, startDate: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">العدد الأولي *</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={newBatch.initialCount}
                                    onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="عدد الطيور"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">نوع الدورة</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                value={newBatch.batchType}
                                onChange={e => setNewBatch({...newBatch, batchType: e.target.value})}
                            >
                                <option value="دورة تسمين">دورة تسمين</option>
                                <option value="دورة بياض">دورة بياض</option>
                                <option value="دورة أمهات">دورة أمهات</option>
                                <option value="دورة فروج">دورة فروج</option>
                            </select>
                        </div>
                        
                        {/* اختيار السلالة */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">
                                السلالة * {newBatch.breed && `(المختارة: ${newBatch.breed})`}
                            </label>
                            
                            {/* شريط البحث */}
                            <div className="flex gap-2 mb-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="بحث في السلالات..."
                                        value={searchBreed}
                                        onChange={(e) => setSearchBreed(e.target.value)}
                                        className="w-full p-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                >
                                    {BREED_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* قائمة السلالات */}
                            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                                {filteredBreeds.length === 0 ? (
                                    <div className="p-3 text-center text-gray-400">
                                        لم يتم العثور على سلالات
                                    </div>
                                ) : (
                                    filteredBreeds.map(breed => (
                                        <div
                                            key={breed.id}
                                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                                newBatch.breedId === breed.id ? 'bg-blue-50 border-blue-200' : ''
                                            }`}
                                            onClick={() => handleBreedSelect(breed)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-800">{breed.arabicName}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500">{breed.name}</span>
                                                        <span className={`text-xs px-1 py-0.5 rounded ${
                                                            breed.category === 'لاحم' ? 'bg-red-100 text-red-600' :
                                                            breed.category === 'بياض' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                            {breed.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowBreedInfo(breed);
                                                        }}
                                                        className="text-gray-400 hover:text-blue-500"
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                    {newBatch.breedId === breed.id && (
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {/* السلالة المختارة */}
                            {newBatch.breed && (
                                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-700 font-bold">{newBatch.breed}</p>
                                            <p className="text-xs text-green-600">
                                                {newBatch.breedType} • الوزن المستهدف: {newBatch.targetWeight} جرام
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setNewBatch({
                                                    ...newBatch,
                                                    breed: '',
                                                    breedId: '',
                                                    breedType: '',
                                                    targetWeight: ''
                                                });
                                            }}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">ملاحظات</label>
                            <textarea
                                value={newBatch.notes}
                                onChange={e => setNewBatch({...newBatch, notes: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="ملاحظات إضافية عن الدورة..."
                                rows="2"
                            />
                        </div>
                        
                        <Button 
                            onClick={startBatch} 
                            className="w-full bg-green-500 hover:bg-green-600"
                            disabled={!newBatch.breed}
                        >
                            حفظ وبدء الدورة
                        </Button>
                    </div>
                </Card>
            )}

            {/* نافذة تأكيد التفعيل */}
            <Modal 
                isOpen={showActiveModal} 
                onClose={() => setShowActiveModal(false)} 
                title="تفعيل الدورة"
            >
                {batchToActivate && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-center text-blue-700">
                                هل أنت متأكد من تفعيل الدورة:
                            </p>
                            <p className="text-center font-bold text-xl text-blue-800 mt-2">
                                {batchToActivate.name}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">تاريخ البدء:</span>
                                <span className="font-bold">{formatDate(batchToActivate.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">السلالة:</span>
                                <span className="font-bold">{batchToActivate.breed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">العدد:</span>
                                <span className="font-bold">{formatNumber(batchToActivate.initialCount)}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={confirmActivateBatch} 
                                className="flex-1 bg-blue-500 hover:bg-blue-600"
                            >
                                نعم، تفعيل
                            </Button>
                            <Button 
                                onClick={() => setShowActiveModal(false)} 
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* نافذة تقرير الدورة */}
            <Modal 
                isOpen={selectedBatchReport} 
                onClose={() => setSelectedBatchReport(null)} 
                title={`تقرير الدورة: ${selectedBatchReport?.name}`}
                size="lg"
            >
                {selectedBatchReport && (() => {
                    const stats = getReportStats(selectedBatchReport);
                    const performance = getPerformanceStatus(stats.epef);
                    
                    return (
                        <div className="space-y-4">
                            {/* معلومات الدورة */}
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-blue-700 font-bold">{selectedBatchReport.name}</p>
                                        <p className="text-xs text-blue-600">
                                            {selectedBatchReport.breed} • {selectedBatchReport.batchType}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                                        selectedBatchReport.status === 'active' ? 
                                        'bg-green-100 text-green-600' : 
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {selectedBatchReport.status === 'active' ? 'نشطة' : 'مغلقة'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* الإحصائيات الرئيسية */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-green-800 font-bold mb-1">صافي الربح</p>
                                            <p className={`text-lg font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatNumber(stats.profit)} ج
                                            </p>
                                        </div>
                                        <DollarSign className="text-green-500" size={20} />
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-blue-800 font-bold mb-1">مؤشر الأداء</p>
                                            <div className="flex items-center gap-2">
                                                <p className={`text-lg font-bold ${performance.color}`}>
                                                    {performance.icon}
                                                </p>
                                                <p className="text-sm text-gray-700">{stats.epef}</p>
                                            </div>
                                        </div>
                                        <Target className="text-blue-500" size={20} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* إحصائيات تفصيلية */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">العمر</p>
                                    <p className="font-bold text-gray-700">{stats.age} يوم</p>
                                </div>
                                
                                <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">العدد الحالي</p>
                                    <p className="font-bold text-gray-700">{formatNumber(stats.currentCount)}</p>
                                </div>
                                
                                <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">النفوق</p>
                                    <p className="font-bold text-red-600">{stats.dead} ({stats.mortalityRate}%)</p>
                                </div>
                                
                                <div className="p-2 bg-gray-50 rounded">
                                    <p className="text-xs text-gray-500">معدل التحويل</p>
                                    <p className="font-bold text-blue-600">{stats.fcr}</p>
                                </div>
                            </div>
                            
                            {/* المبيعات والمصروفات */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-bold text-gray-700 text-sm mb-2">الملخص المالي</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي المبيعات:</span>
                                        <span className="font-bold text-green-600">{formatNumber(stats.bSales)} ج</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي المصروفات:</span>
                                        <span className="font-bold text-red-600">{formatNumber(stats.bExp)} ج</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-sm font-bold text-gray-700">هامش الربح:</span>
                                        <span className="font-bold text-blue-600">{stats.profitMargin}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => shareViaWhatsapp(
                                    `تقرير الدورة: ${selectedBatchReport.name}\n` +
                                    `─────────────\n` +
                                    `📅 العمر: ${stats.age} يوم\n` +
                                    `🐔 العدد: ${formatNumber(stats.currentCount)} طائر\n` +
                                    `⚰️ النفوق: ${stats.dead} (${stats.mortalityRate}%)\n` +
                                    `⚖️ الوزن: ${stats.lastWt} جرام\n` +
                                    `🌾 العلف: ${stats.totalFeed} كجم\n` +
                                    `📊 FCR: ${stats.fcr}\n` +
                                    `⭐ EPEF: ${stats.epef}\n` +
                                    `💰 الربح: ${formatNumber(stats.profit)} ج\n` +
                                    `─────────────\n` +
                                    `#دواجني #تقرير #${selectedBatchReport.breed}`
                                )} 
                                className="w-full bg-green-500 hover:bg-green-600"
                            >
                                مشاركة عبر واتساب
                            </Button>
                        </div>
                    );
                })()}
            </Modal>

            {/* نافذة تفاصيل الدورة */}
            <Modal 
                isOpen={showBatchDetails} 
                onClose={() => setShowBatchDetails(null)} 
                title={showBatchDetails?.name || 'تفاصيل الدورة'}
                size="lg"
            >
                {showBatchDetails && (() => {
                    const stats = getReportStats(showBatchDetails);
                    const performance = getPerformanceStatus(stats.epef);
                    
                    return (
                        <div className="space-y-4">
                            {/* معلومات الدورة */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold">{showBatchDetails.name}</h3>
                                        <p className="text-xs opacity-80">
                                            {showBatchDetails.breed} • {showBatchDetails.batchType}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                                        showBatchDetails.status === 'active' ? 
                                        'bg-green-300 text-green-800' : 
                                        'bg-gray-300 text-gray-800'
                                    }`}>
                                        {showBatchDetails.status === 'active' ? 'نشطة' : 'مغلقة'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* المعلومات الأساسية */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">تاريخ البدء</p>
                                    <p className="font-bold text-gray-700">{formatDate(showBatchDetails.startDate)}</p>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">العدد الأولي</p>
                                    <p className="font-bold text-gray-700">{formatNumber(showBatchDetails.initialCount)}</p>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">عمر الدورة</p>
                                    <p className="font-bold text-gray-700">{stats.age} يوم</p>
                                </div>
                                
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">أداء الدورة</p>
                                    <p className={`font-bold ${performance.color}`}>
                                        {performance.icon} {performance.status}
                                    </p>
                                </div>
                            </div>
                            
                            {/* ملاحظات الدورة */}
                            {showBatchDetails.notes && (
                                <div className="bg-yellow-50 p-3 rounded-lg">
                                    <h4 className="font-bold text-yellow-700 text-sm mb-1">ملاحظات الدورة</h4>
                                    <p className="text-sm text-yellow-600">{showBatchDetails.notes}</p>
                                </div>
                            )}
                            
                            {/* الإحصائيات */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <h4 className="font-bold text-gray-700 text-sm mb-2">إحصائيات الدورة</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">العدد الحالي:</span>
                                        <span className="font-bold text-gray-700">{formatNumber(stats.currentCount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي النفوق:</span>
                                        <span className="font-bold text-red-600">{stats.dead} ({stats.mortalityRate}%)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي استهلاك العلف:</span>
                                        <span className="font-bold text-amber-600">{stats.totalFeed} كجم</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">متوسط الوزن:</span>
                                        <span className="font-bold text-blue-600">{stats.lastWt} جرام</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">معدل التحويل (FCR):</span>
                                        <span className="font-bold text-blue-600">{stats.fcr}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">مؤشر EPEF:</span>
                                        <span className="font-bold text-green-600">{stats.epef}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* الأداء المالي */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                <h4 className="font-bold text-gray-700 text-sm mb-2">الأداء المالي</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي المبيعات:</span>
                                        <span className="font-bold text-green-600">{formatNumber(stats.bSales)} ج</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">إجمالي المصروفات:</span>
                                        <span className="font-bold text-red-600">{formatNumber(stats.bExp)} ج</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="text-sm font-bold text-gray-700">صافي الربح:</span>
                                        <span className={`font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatNumber(stats.profit)} ج ({stats.profitMargin}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">التكلفة لكل طائر:</span>
                                        <span className="font-bold text-blue-600">{stats.birdCost} ج</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* نافذة معلومات السلالة */}
            <Modal isOpen={showBreedInfo} onClose={() => setShowBreedInfo(null)} title={showBreedInfo?.arabicName || 'معلومات السلالة'} size="lg">
                {showBreedInfo && (
                    <div className="space-y-4">
                        {/* العنوان */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${
                                showBreedInfo.category === 'لاحم' ? 'bg-red-100 text-red-600' :
                                showBreedInfo.category === 'بياض' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                {showBreedInfo.category === 'لاحم' ? <Scale size={24} /> :
                                 showBreedInfo.category === 'بياض' ? <Egg size={24} /> :
                                 <Activity size={24} />
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{showBreedInfo.arabicName}</h3>
                                <p className="text-sm text-gray-500">{showBreedInfo.name} • {showBreedInfo.category}</p>
                            </div>
                        </div>
                        
                        {/* الوصف */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-700 mb-2">الوصف</h4>
                            <p className="text-gray-600">{showBreedInfo.description}</p>
                        </div>
                        
                        {/* الخصائص */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-bold text-blue-700 mb-2">الخصائص الرئيسية</h4>
                            <ul className="list-disc mr-4 space-y-1">
                                {showBreedInfo.characteristics.map((char, index) => (
                                    <li key={index} className="text-blue-600 text-sm">{char}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* مؤشرات الأداء */}
                        <div className="bg-green-50 p-4 rounded-xl">
                            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                <TrendingUp size={16} /> مؤشرات الأداء
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(showBreedInfo.performance).map(([key, value]) => (
                                    <div key={key} className="bg-white p-2 rounded">
                                        <p className="text-xs text-gray-500">{key}</p>
                                        <p className="font-bold text-green-600">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* المميزات */}
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <h4 className="font-bold text-purple-700 mb-2">المميزات</h4>
                            <ul className="list-disc mr-4 space-y-1">
                                {showBreedInfo.advantages.map((adv, index) => (
                                    <li key={index} className="text-purple-600 text-sm">{adv}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* العيوب */}
                        {showBreedInfo.disadvantages && showBreedInfo.disadvantages.length > 0 && (
                            <div className="bg-orange-50 p-4 rounded-xl">
                                <h4 className="font-bold text-orange-700 mb-2">العيوب</h4>
                                <ul className="list-disc mr-4 space-y-1">
                                    {showBreedInfo.disadvantages.map((dis, index) => (
                                        <li key={index} className="text-orange-600 text-sm">{dis}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* المعلومات الإضافية */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">ملائمة لـ</p>
                                <p className="font-bold text-indigo-600">{showBreedInfo.suitableFor}</p>
                            </div>
                            <div className="bg-teal-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">الطلب بالسوق</p>
                                <p className="font-bold text-teal-600">{showBreedInfo.marketDemand}</p>
                            </div>
                        </div>
                        
                        {/* زر التحديد */}
                        <Button 
                            onClick={() => {
                                handleBreedSelect(showBreedInfo);
                                setShowBreedInfo(null);
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                            اختيار هذه السلالة
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BatchManager;
