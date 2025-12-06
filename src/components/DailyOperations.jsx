// components/DailyOperations.jsx
import React, { useState } from 'react';
import { Skull, Wheat, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '../UI';
import { formatDate, FEED_TYPES, DEATH_CAUSES } from '../utils/helpers';

const DailyOperations = ({ 
    activeBatch, 
    dailyLogs, 
    setDailyLogs, 
    showNotify, 
    handleDelete, 
    formatDate: formatDateFunc 
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

    if (!activeBatch) {
        return (
            <p className="text-center text-gray-500 py-10">
                ابدأ دورة أولاً
            </p>
        );
    }

    const saveLog = () => {
        if (log.id) {
            // تعديل سجل موجود
            setDailyLogs(dailyLogs.map(l => 
                l.id === log.id ? { ...log, batchId: activeBatch.id } : l
            ));
            showNotify("تم تعديل السجل ✏️");
        } else {
            // سجل جديد
            setDailyLogs([...dailyLogs, { 
                ...log, 
                id: Date.now(), 
                batchId: activeBatch.id 
            }]);
            showNotify("تم الحفظ ✅");
        }
        resetLogForm();
        setView('list');
    };

    const handleEditLog = (item) => {
        setLog(item);
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

    return (
        <div className="space-y-4 pb-20">
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
                    السجل
                </button>
                <button 
                    onClick={() => setView('new')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                        view === 'new' ? 'bg-white shadow text-orange-600' : 'text-gray-500'
                    }`}
                >
                    {log.id ? 'تعديل' : 'جديد'}
                </button>
            </div>

            {view === 'new' && (
                <Card className="animate-slide-up">
                    <Input 
                        label="التاريخ" 
                        type="date" 
                        value={log.date} 
                        onChange={e => setLog({...log, date: e.target.value})} 
                    />
                    
                    <div className="bg-red-50 p-3 rounded-xl mb-3 border border-red-100">
                        <label className="text-xs font-bold text-red-800 block mb-2 flex items-center gap-1">
                            <Skull size={14}/> النافق
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="flex-1 p-2 rounded border border-red-200" 
                                value={log.dead} 
                                onChange={e => setLog({...log, dead: e.target.value})} 
                                placeholder="العدد" 
                            />
                            <select 
                                className="flex-1 p-2 rounded border border-red-200 text-xs bg-white" 
                                value={log.deadCause} 
                                onChange={e => setLog({...log, deadCause: e.target.value})}
                            >
                                {DEATH_CAUSES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-xl mb-3 border border-amber-100">
                        <label className="text-xs font-bold text-amber-800 block mb-2 flex items-center gap-1">
                            <Wheat size={14}/> العلف
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                className="flex-1 p-2 rounded border border-amber-200" 
                                value={log.feed} 
                                onChange={e => setLog({...log, feed: e.target.value})} 
                                placeholder="كجم" 
                            />
                            <select 
                                className="flex-1 p-2 rounded border border-amber-200 text-xs bg-white" 
                                value={log.feedType} 
                                onChange={e => setLog({...log, feedType: e.target.value})}
                            >
                                {FEED_TYPES.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="الوزن (جم)" 
                            type="number" 
                            value={log.avgWeight} 
                            onChange={e => setLog({...log, avgWeight: e.target.value})} 
                        />
                        <Input 
                            label="الحرارة" 
                            type="number" 
                            value={log.temp} 
                            onChange={e => setLog({...log, temp: e.target.value})} 
                        />
                    </div>
                    
                    <Input 
                        label="ملاحظات" 
                        value={log.notes} 
                        onChange={e => setLog({...log, notes: e.target.value})} 
                    />
                    
                    <Button onClick={saveLog} className="w-full mt-2">
                        {log.id ? 'حفظ التعديلات' : 'حفظ البيانات'}
                    </Button>
                </Card>
            )}

            {view === 'list' && (
                <div className="space-y-2">
                    {currentLogs.map(l => (
                        <div key={l.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-xs">
                            <div className="flex justify-between font-bold text-gray-800 mb-2 border-b pb-1">
                                <span>{formatDateFunc(l.date)}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEditLog(l)} 
                                        className="text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded"
                                    >
                                        <Edit2 size={12}/> تعديل
                                    </button>
                                    <button 
                                        onClick={() => handleDelete('سجل', () => 
                                            setDailyLogs(dailyLogs.filter(d => d.id !== l.id))
                                        )} 
                                        className="text-red-500 bg-red-50 px-2 py-0.5 rounded"
                                    >
                                        <Trash2 size={12}/>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-gray-500">
                                <div>
                                    <p>علف</p>
                                    <p className="font-bold text-amber-600">{l.feed} كجم</p>
                                </div>
                                <div>
                                    <p>وزن</p>
                                    <p className="font-bold text-blue-600">{l.avgWeight || '-'} جم</p>
                                </div>
                                <div>
                                    <p>نافق</p>
                                    <p className="font-bold text-red-600">{l.dead || '-'}</p>
                                </div>
                            </div>
                            {l.notes && (
                                <p className="mt-1 text-gray-400 italic">"{l.notes}"</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyOperations;
