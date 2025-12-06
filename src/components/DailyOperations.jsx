import React, { useState, useEffect } from 'react';
import { 
    Skull, Wheat, Edit2, Trash2, AlertCircle, 
    Calculator, Thermometer as ThermometerIcon, Scale 
} from 'lucide-react';
import { Button, Card } from '../UI';
import { formatDate, FEED_TYPES, DEATH_CAUSES, checkAndDeductFeed } from '../utils/helpers';

const DailyOperations = ({ 
    activeBatch, 
    dailyLogs, 
    setDailyLogs, 
    inventoryItems, 
    setInventoryItems,
    showNotify, 
    handleDelete 
}) => {
    const [view, setView] = useState('list');
    const [log, setLog] = useState({ 
        id: null, 
        date: new Date().toISOString().split('T')[0], 
        dead: '', 
        deadCause: 'طبيعي', 
        feed: '', 
        feedType: 'بادي 23%', 
        avgWeight: '', 
        temp: '', 
        notes: '' 
    });

    // إعادة تعيين النموذج عند تغيير العرض
    useEffect(() => {
        if (view === 'new' && !log.id) {
            resetLogForm();
        }
    }, [view]);

    if (!activeBatch) {
        return (
            <div className="text-center py-10">
                <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">ابدأ دورة جديدة لإضافة سجلات يومية</p>
            </div>
        );
    }

    const saveLog = () => {
        const errors = [];
        
        if (!log.date) errors.push("التاريخ مطلوب");
        if (log.dead && (isNaN(Number(log.dead)) || Number(log.dead) < 0)) errors.push("عدد النافق يجب أن يكون رقم صحيح موجب");
        if (log.feed && (isNaN(Number(log.feed)) || Number(log.feed) < 0)) errors.push("كمية العلف يجب أن تكون رقم موجب");
        if (log.avgWeight && (isNaN(Number(log.avgWeight)) || Number(log.avgWeight) < 0)) errors.push("الوزن يجب أن يكون رقم موجب");
        if (log.temp && (isNaN(Number(log.temp)) || Number(log.temp) < 0)) errors.push("درجة الحرارة يجب أن تكون رقم موجب");
        
        if (errors.length > 0) {
            errors.forEach(error => showNotify(`✗ ${error}`));
            return;
        }

        // خصم العلف من المخزون إذا تم إدخاله
        let inventoryUpdate = null;
        if (log.feed && Number(log.feed) > 0 && log.feedType) {
            const result = checkAndDeductFeed(inventoryItems, log.feedType, Number(log.feed));
            
            if (!result.success) {
                showNotify(`✗ ${result.message}`);
                return;
            }
            
            inventoryUpdate = result;
            setInventoryItems(result.updatedInventory);
        }

        // حساب اليوم من بداية الدورة
        const dayNumber = Math.ceil((new Date(log.date) - new Date(activeBatch.startDate)) / (1000 * 60 * 60 * 24));
        
        if (log.id) {
            // تعديل سجل موجود
            setDailyLogs(dailyLogs.map(l => 
                l.id === log.id ? { 
                    ...log, 
                    batchId: activeBatch.id,
                    dayNumber: dayNumber,
                    feed: log.feed ? Number(log.feed) : 0,
                    dead: log.dead ? Number(log.dead) : 0,
                    avgWeight: log.avgWeight ? Number(log.avgWeight) : null,
                    temp: log.temp ? Number(log.temp) : null,
                    feedCost: inventoryUpdate?.cost || l.feedCost || 0
                } : l
            ));
            showNotify("تم تحديث السجل ✏️");
        } else {
            // سجل جديد
            const newLog = {
                ...log,
                id: Date.now(),
                batchId: activeBatch.id,
                dayNumber: dayNumber,
                feed: log.feed ? Number(log.feed) : 0,
                dead: log.dead ? Number(log.dead) : 0,
                avgWeight: log.avgWeight ? Number(log.avgWeight) : null,
                temp: log.temp ? Number(log.temp) : null,
                feedCost: inventoryUpdate?.cost || 0
            };
            
            setDailyLogs([...dailyLogs, newLog]);
            
            if (inventoryUpdate) {
                showNotify(`✓ تم حفظ السجل اليومي. ${inventoryUpdate.message}`);
            } else {
                showNotify("تم حفظ السجل اليومي ✅");
            }
        }

        resetLogForm();
        setView('list');
    };

    const handleEditLog = (item) => {
        setLog({
            ...item,
            dead: item.dead || '',
            feed: item.feed || '',
            avgWeight: item.avgWeight || '',
            temp: item.temp || ''
        });
        setView('new');
    };

    const resetLogForm = () => {
        setLog({
            id: null, 
            date: new Date().toISOString().split('T')[0], 
            dead: '', 
            deadCause: 'طبيعي', 
            feed: '', 
            feedType: 'بادي 23%', 
            avgWeight: '', 
            temp: '', 
            notes: ''
        });
    };

    const currentLogs = dailyLogs
        .filter(l => l.batchId === activeBatch.id)
        .sort((a,b) => new Date(b.date) - new Date(a.date));

    // التحقق من مخزون العلف
    const checkFeedStock = (feedType) => {
        const feedItem = inventoryItems.find(item => 
            item.name === feedType && item.category === 'أعلاف'
        );
        return feedItem ? feedItem.currentStock : 0;
    };

    return (
        <div className="space-y-4 pb-20">
            {/* التبويبات */}
            <div className="flex p-1 bg-gray-200 rounded-xl">
                <button 
                    onClick={() => { 
                        setView('list'); 
                        resetLogForm(); 
                    }} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                        view === 'list' ? 'bg-white shadow text-orange-600' : 'text-gray-500'
                    }`}
                >
                    السجلات
                </button>
                <button 
                    onClick={() => setView('new')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                        view === 'new' ? 'bg-white shadow text-orange-600' : 'text-gray-500'
                    }`}
                >
                    {log.id ? 'تعديل السجل' : 'سجل جديد'}
                </button>
            </div>

            {/* نموذج التسجيل الجديد */}
            {view === 'new' && (
                <Card className="animate-slide-up">
                    <div className="space-y-4">
                        {/* التاريخ */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                📅 التاريخ
                            </label>
                            <input
                                type="date"
                                value={log.date}
                                onChange={e => setLog({...log, date: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* قسم النافق - تصميم محسن */}
                        <div className="border border-red-200 rounded-xl p-4 bg-gradient-to-br from-red-50 to-white">
                            <div className="flex items-center gap-2 mb-3">
                                <Skull size={18} className="text-red-600" />
                                <h3 className="font-bold text-red-800 text-sm">النافق</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">عدد النافق</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={log.dead}
                                            onChange={e => setLog({...log, dead: e.target.value})}
                                            placeholder="0"
                                            className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm"
                                        />
                                        {log.dead > 0 && (
                                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                                                <span className="text-xs text-red-500 font-bold">
                                                    {((log.dead / activeBatch.initialCount) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">سبب النفوق</label>
                                    <select
                                        value={log.deadCause}
                                        onChange={e => setLog({...log, deadCause: e.target.value})}
                                        className="w-full p-3 bg-white border border-red-200 rounded-lg text-sm"
                                    >
                                        {DEATH_CAUSES.map(cause => (
                                            <option key={cause} value={cause}>{cause}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {log.dead > 0 && (
                                <div className="mt-3 p-2 bg-red-100 rounded-lg">
                                    <p className="text-xs text-red-700">
                                        <span className="font-bold">{log.dead}</span> طائر نافق بسبب 
                                        <span className="font-bold"> {log.deadCause}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* قسم العلف - تصميم محسن */}
                        <div className="border border-amber-200 rounded-xl p-4 bg-gradient-to-br from-amber-50 to-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Wheat size={18} className="text-amber-600" />
                                    <h3 className="font-bold text-amber-800 text-sm">استهلاك العلف</h3>
                                </div>
                                
                                {log.feedType && (
                                    <div className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                                        المخزون: {checkFeedStock(log.feedType)} كجم
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">الكمية (كجم)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={log.feed}
                                            onChange={e => setLog({...log, feed: e.target.value})}
                                            placeholder="0"
                                            className="w-full p-3 bg-white border border-amber-200 rounded-lg text-sm"
                                        />
                                        {log.feed > 0 && checkFeedStock(log.feedType) > 0 && (
                                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                                                <span className="text-xs text-amber-600 font-bold">
                                                    {((log.feed / checkFeedStock(log.feedType)) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">نوع العلف</label>
                                    <select
                                        value={log.feedType}
                                        onChange={e => setLog({...log, feedType: e.target.value})}
                                        className="w-full p-3 bg-white border border-amber-200 rounded-lg text-sm"
                                    >
                                        {FEED_TYPES.map(feed => {
                                            const stock = checkFeedStock(feed.name);
                                            return (
                                                <option key={feed.code} value={feed.name}>
                                                    {feed.name} {stock < 500 ? `(${stock} كجم)` : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            
                            {log.feed > 0 && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <p className="text-xs text-amber-700">
                                            سيتم خصم <span className="font-bold">{log.feed} كجم</span>
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <p className="text-xs text-green-700">
                                            من <span className="font-bold">{log.feedType}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* الوزن والحرارة */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                                    <Scale size={14} /> متوسط الوزن (جرام)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={log.avgWeight}
                                    onChange={e => setLog({...log, avgWeight: e.target.value})}
                                    placeholder="مثال: 1500"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-1">
                                    <ThermometerIcon size={14} /> درجة الحرارة °م
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={log.temp}
                                    onChange={e => setLog({...log, temp: e.target.value})}
                                    placeholder="مثال: 25"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        {/* الملاحظات */}
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-2">
                                📝 ملاحظات
                            </label>
                            <textarea
                                value={log.notes}
                                onChange={e => setLog({...log, notes: e.target.value})}
                                placeholder="أي ملاحظات أو مشاهدات إضافية..."
                                rows="3"
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                            />
                        </div>

                        {/* أزرار الحفظ والإلغاء */}
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => {
                                    resetLogForm();
                                    setView('list');
                                }} 
                                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                إلغاء
                            </Button>
                            <Button onClick={saveLog} className="flex-1">
                                {log.id ? 'حفظ التعديلات' : 'حفظ السجل اليومي'}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* قائمة السجلات */}
            {view === 'list' && (
                <div className="space-y-3">
                    {currentLogs.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <Calculator className="mx-auto text-gray-300 mb-3" size={32} />
                            <p className="text-gray-500">لا توجد سجلات يومية حتى الآن</p>
                            <p className="text-sm text-gray-400 mt-1">ابدأ بإضافة أول سجل يومي</p>
                        </div>
                    ) : (
                        currentLogs.map(l => (
                            <Card key={l.id} className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{formatDate(l.date)}</h3>
                                        <p className="text-xs text-gray-500">
                                            اليوم {l.dayNumber || Math.ceil((new Date(l.date) - new Date(activeBatch.startDate)) / (1000 * 60 * 60 * 24))}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditLog(l)}
                                            className="text-blue-500 hover:text-blue-600 p-1"
                                            title="تعديل"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete('سجل يومي', () => 
                                                setDailyLogs(dailyLogs.filter(d => d.id !== l.id))
                                            )}
                                            className="text-red-500 hover:text-red-600 p-1"
                                            title="حذف"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* بيانات اليومية */}
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                    {/* العلف */}
                                    <div className="bg-amber-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-amber-600 mb-1">العلف</p>
                                        <div>
                                            <p className="font-bold text-amber-700">{l.feed || 0} كجم</p>
                                            <p className="text-[10px] text-amber-500">{l.feedType || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* النافق */}
                                    <div className="bg-red-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-red-600 mb-1">النافق</p>
                                        <div>
                                            <p className="font-bold text-red-700">{l.dead || 0}</p>
                                            <p className="text-[10px] text-red-500">{l.deadCause || '-'}</p>
                                        </div>
                                    </div>
                                    
                                    {/* الوزن */}
                                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                                        <p className="text-xs text-blue-600 mb-1">متوسط الوزن</p>
                                        <p className="font-bold text-blue-700">{l.avgWeight || '-'} جرام</p>
                                    </div>
                                </div>
                                
                                {/* معلومات إضافية */}
                                <div className="grid grid-cols-2 gap-2">
                                    {l.temp && (
                                        <div className="text-xs text-gray-500">
                                            <span className="font-bold">الحرارة:</span> {l.temp}°م
                                        </div>
                                    )}
                                    {l.feedCost > 0 && (
                                        <div className="text-xs text-gray-500 text-right">
                                            <span className="font-bold">تكلفة العلف:</span> {l.feedCost.toFixed(2)} ج
                                        </div>
                                    )}
                                </div>
                                
                                {l.notes && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-600 italic">"{l.notes}"</p>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyOperations;
