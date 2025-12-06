// components/HealthManager.jsx
import React, { useState } from 'react';
import { Syringe, Plus, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, Modal, Input, getDaysDifference } from '../UI';
import { formatDate } from '../utils/helpers';

const HealthManager = ({ 
    activeBatch, 
    vaccinations, 
    setVaccinations, 
    showNotify 
}) => {
    const [showModal, setShowModal] = useState(false);
    const [newVac, setNewVac] = useState({ 
        name: '', 
        type: 'مياه شرب', 
        date: new Date().toISOString().split('T')[0], 
        notes: '' 
    });

    if (!activeBatch) {
        return (
            <p className="text-center text-gray-500 py-10">
                ابدأ دورة لعرض الجدول
            </p>
        );
    }

    const batchVaccines = vaccinations
        .filter(v => v.batchId === activeBatch.id)
        .sort((a,b) => new Date(a.date) - new Date(b.date));

    const toggleStatus = (id) => {
        const updated = vaccinations.map(v => 
            v.id === id ? { 
                ...v, 
                status: v.status === 'done' ? 'pending' : 'done' 
            } : v
        );
        setVaccinations(updated);
    };

    const addCustomVaccine = () => {
        if (!newVac.name) return;
        
        setVaccinations([...vaccinations, { 
            ...newVac, 
            id: Date.now(), 
            batchId: activeBatch.id, 
            status: 'pending' 
        }]);
        
        setNewVac({ 
            name: '', 
            type: 'مياه شرب', 
            date: new Date().toISOString().split('T')[0], 
            notes: '' 
        });
        
        setShowModal(false); 
        showNotify("تمت الإضافة");
    };

    return (
        <div className="space-y-4 pb-20 animate-slide-up">
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Syringe className="text-purple-600"/> جدول التحصينات
                </h2>
                <button 
                    onClick={() => setShowModal(true)} 
                    className="bg-purple-100 text-purple-600 p-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                    <Plus size={14}/> إضافة
                </button>
            </div>

            <div className="space-y-3">
                {batchVaccines.map(v => {
                    const isDone = v.status === 'done';
                    const isDue = !isDone && v.date <= new Date().toISOString().split('T')[0];
                    const ageAtVaccine = getDaysDifference(activeBatch.startDate) - 
                        (getDaysDifference(activeBatch.startDate) - getDaysDifference(v.date));

                    return (
                        <div 
                            key={v.id} 
                            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                                isDone ? 'bg-gray-50 border-gray-200 opacity-60' : 
                                isDue ? 'bg-purple-50 border-purple-300 shadow-md transform scale-[1.02]' : 
                                'bg-white border-gray-100'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${
                                    isDone ? 'bg-gray-200' : 
                                    isDue ? 'bg-purple-500 text-white' : 
                                    'bg-blue-50 text-blue-500'
                                }`}>
                                    {isDone ? <CheckCircle size={20}/> : <Clock size={20}/>}
                                </div>
                                <div>
                                    <p className={`font-bold ${
                                        isDone ? 'text-gray-500 line-through' : 'text-gray-800'
                                    }`}>
                                        {v.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(v.date)} • عمر {v.dayAge || ageAtVaccine} يوم • {v.type}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toggleStatus(v.id)}
                                className={`px-3 py-1 rounded text-xs font-bold border ${
                                    isDone ? 'border-gray-300 text-gray-500' : 
                                    'bg-white border-purple-200 text-purple-600'
                                }`}
                            >
                                {isDone ? 'تراجع' : 'تم'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="إضافة تحصينة/علاج">
                <div className="space-y-3">
                    <Input 
                        label="اسم التحصينة/الدواء" 
                        value={newVac.name} 
                        onChange={e => setNewVac({...newVac, name: e.target.value})} 
                    />
                    <div className="flex gap-2">
                        <Input 
                            label="التاريخ" 
                            type="date" 
                            value={newVac.date} 
                            onChange={e => setNewVac({...newVac, date: e.target.value})} 
                        />
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 mb-1 block">
                                الطريقة
                            </label>
                            <select 
                                className="w-full p-3 bg-gray-50 border rounded-xl" 
                                value={newVac.type} 
                                onChange={e => setNewVac({...newVac, type: e.target.value})}
                            >
                                <option>مياه شرب</option>
                                <option>تقطير</option>
                                <option>رش</option>
                                <option>حقن</option>
                            </select>
                        </div>
                    </div>
                    <Input 
                        label="ملاحظات" 
                        value={newVac.notes} 
                        onChange={e => setNewVac({...newVac, notes: e.target.value})} 
                    />
                    <Button onClick={addCustomVaccine} className="w-full">
                        حفظ
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default HealthManager;
