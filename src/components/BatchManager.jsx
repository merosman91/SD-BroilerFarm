// components/BatchManager.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import { 
    addDays, 
    formatDate, 
    getDaysDifference, 
    generateDefaultSchedule 
} from '../utils/helpers';

const BatchManager = ({ 
    batches, 
    setBatches, 
    vaccinations, 
    setVaccinations, 
    dailyLogs, 
    sales, 
    expenses, 
    showNotify, 
    shareViaWhatsapp 
}) => {
    const [view, setView] = useState('list');
    const [newBatch, setNewBatch] = useState({ 
        name: '', 
        startDate: new Date().toISOString().split('T')[0], 
        initialCount: '', 
        breed: '' 
    });
    const [selectedBatchReport, setSelectedBatchReport] = useState(null);

    const startBatch = () => {
        if (!newBatch.name || !newBatch.initialCount) {
            return showNotify("البيانات ناقصة");
        }
        
        const batchId = Date.now();
        const updatedBatches = batches.map(b => 
            b.status === 'active' ? 
            {...b, status: 'closed', endDate: new Date().toISOString()} : b
        );
        
        setBatches([...updatedBatches, { 
            ...newBatch, 
            id: batchId, 
            status: 'active' 
        }]);
        
        setVaccinations([...vaccinations, 
            ...generateDefaultSchedule(batchId, newBatch.startDate, addDays)
        ]);
        
        setNewBatch({ name: '', startDate: '', initialCount: '', breed: '' }); 
        setView('list'); 
        showNotify("تم بدء الدورة");
    };

    const activateBatch = (id) => {
        const updated = batches.map(b => ({ 
            ...b, 
            status: b.id === id ? 'active' : 'closed', 
            endDate: b.id === id ? null : (b.status === 'active' ? new Date().toISOString() : b.endDate) 
        }));
        setBatches(updated);
        showNotify("تم تفعيل الدورة ✅");
    };

    const getReportStats = (batch) => {
        const bLogs = dailyLogs.filter(l => l.batchId === batch.id);
        const bSales = sales.filter(s => s.batchId === batch.id)
            .reduce((sum, s) => sum + Number(s.total), 0);
        const bExp = expenses.filter(e => e.batchId === batch.id)
            .reduce((sum, e) => sum + Number(e.cost), 0);
        const dead = bLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
        const feed = bLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
        const lastWt = [...bLogs].sort((a,b)=>new Date(b.date)-new Date(a.date))
            .find(l=>l.avgWeight)?.avgWeight || 0;
        
        return { 
            bSales, 
            bExp, 
            profit: bSales - bExp, 
            dead, 
            feed, 
            lastWt 
        };
    };

    return (
        <div className="space-y-4 pb-20">
            {view === 'list' && (
                <>
                    <Button onClick={() => setView('new')} className="w-full">
                        <Plus size={18}/> بدء دورة جديدة
                    </Button>
                    <div className="space-y-3 mt-4">
                        {batches.map(b => (
                            <div 
                                key={b.id} 
                                onClick={() => setSelectedBatchReport(b)}
                                className={`p-4 rounded-xl border relative cursor-pointer active:scale-95 transition-all ${
                                    b.status === 'active' ? 
                                    'bg-orange-50 border-orange-200 shadow-md' : 
                                    'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{b.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(b.startDate)} • {b.initialCount} طائر
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">{b.breed}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                            b.status === 'active' ? 
                                            'bg-green-100 text-green-700' : 
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {b.status === 'active' ? 'نشطة' : 'مغلقة'}
                                        </span>
                                        {b.status !== 'active' && (
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    activateBatch(b.id); 
                                                }} 
                                                className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                                            >
                                                تفعيل
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'new' && (
                <Card>
                    <h3 className="font-bold mb-4 text-center">دورة جديدة</h3>
                    <Input 
                        label="الاسم" 
                        value={newBatch.name} 
                        onChange={e => setNewBatch({...newBatch, name: e.target.value})} 
                    />
                    <Input 
                        label="التاريخ" 
                        type="date" 
                        value={newBatch.startDate} 
                        onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} 
                    />
                    <div className="flex gap-2">
                        <Input 
                            label="العدد" 
                            type="number" 
                            value={newBatch.initialCount} 
                            onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})} 
                        />
                        <Input 
                            label="السلالة" 
                            value={newBatch.breed} 
                            onChange={e => setNewBatch({...newBatch, breed: e.target.value})} 
                        />
                    </div>
                    <Button onClick={startBatch} className="w-full">
                        حفظ وبدء
                    </Button>
                </Card>
            )}

            {selectedBatchReport && (
                <Modal 
                    isOpen={!!selectedBatchReport} 
                    onClose={() => setSelectedBatchReport(null)} 
                    title={`تقرير: ${selectedBatchReport.name}`}
                >
                    {(() => {
                        const stats = getReportStats(selectedBatchReport);
                        return (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-emerald-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">الربح</p>
                                        <p className={`font-bold ${
                                            stats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {stats.profit.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">الوزن النهائي</p>
                                        <p className="font-bold text-blue-600">{stats.lastWt} جم</p>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">النافق</p>
                                        <p className="font-bold text-red-600">{stats.dead}</p>
                                    </div>
                                    <div className="bg-amber-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">العلف</p>
                                        <p className="font-bold text-amber-600">{stats.feed} كجم</p>
                                    </div>
                                </div>
                                <div className="text-xs space-y-1 bg-gray-50 p-3 rounded text-gray-600">
                                    <p>• إجمالي المبيعات: {stats.bSales.toLocaleString()}</p>
                                    <p>• إجمالي المصاريف: {stats.bExp.toLocaleString()}</p>
                                    <p>• تاريخ البدء: {formatDate(selectedBatchReport.startDate)}</p>
                                </div>
                                <Button 
                                    onClick={() => shareViaWhatsapp(
                                        `تقرير دورة ${selectedBatchReport.name}\n` +
                                        `الربح: ${stats.profit}\n` +
                                        `النافق: ${stats.dead}\n` +
                                        `الوزن: ${stats.lastWt}`
                                    )} 
                                    variant="success" 
                                    className="w-full"
                                >
                                    مشاركة واتساب
                                </Button>
                            </div>
                        );
                    })()}
                </Modal>
            )}
        </div>
    );
};

export default BatchManager;
