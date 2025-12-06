import React, { useState, useEffect } from 'react';
import { 
    Syringe, Plus, CheckCircle, Clock, Info, 
    AlertCircle, Thermometer, Droplets, Shield
} from 'lucide-react';
import { Button, Card, Modal, Input } from '../UI';
import { VACCINATION_TEMPLATES, MEDICINE_OPTIONS } from '../utils/vaccinations';
import { formatDate, getDaysDifference } from '../utils/helpers';

const HealthManager = ({ 
    activeBatch, 
    vaccinations, 
    setVaccinations, 
    showNotify 
}) => {
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(null);
    const [newVac, setNewVac] = useState({ 
        name: '', 
        type: 'مياه شرب', 
        date: new Date().toISOString().split('T')[0], 
        notes: '',
        description: '',
        dosage: '',
        category: 'vaccine' // vaccine or medicine
    });

    // حالة البحث
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    if (!activeBatch) {
        return (
            <div className="text-center py-10">
                <Syringe className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">Start a batch to view health schedule</p>
            </div>
        );
    }

    const batchVaccines = vaccinations
        .filter(v => v.batchId === activeBatch.id)
        .sort((a,b) => new Date(a.date) - new Date(b.date));

    // فلترة القوائم حسب البحث
    const filteredVaccines = VACCINATION_TEMPLATES.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMedicines = MEDICINE_OPTIONS.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleStatus = (id) => {
        const updated = vaccinations.map(v => 
            v.id === id ? { ...v, status: v.status === 'done' ? 'pending' : 'done' } : v
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
            notes: '',
            description: '',
            dosage: '',
            category: 'vaccine'
        });
        
        setShowModal(false); 
        showNotify("تمت الإضافة");
    };

    const selectTemplate = (template) => {
        setNewVac({
            name: template.name,
            type: template.type,
            date: new Date().toISOString().split('T')[0],
            notes: template.notes || '',
            description: template.description,
            dosage: template.dosage,
            category: 'vaccine'
        });
        setShowDetails(template);
    };

    const selectMedicine = (medicine) => {
        setNewVac({
            name: medicine.name,
            type: medicine.type,
            date: new Date().toISOString().split('T')[0],
            notes: medicine.notes || '',
            description: medicine.description,
            dosage: medicine.dosage,
            category: 'medicine'
        });
        setShowDetails(medicine);
    };

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Syringe size={24} /> Health Management
                        </h2>
                        <p className="text-xs opacity-80">Vaccinations & Medicines for {activeBatch.name}</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Total</p>
                        <p className="font-bold text-lg">{batchVaccines.length}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Completed</p>
                        <p className="font-bold text-lg text-green-300">
                            {batchVaccines.filter(v => v.status === 'done').length}
                        </p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Pending</p>
                        <p className="font-bold text-lg text-yellow-300">
                            {batchVaccines.filter(v => v.status === 'pending').length}
                        </p>
                    </div>
                </div>
            </div>

            {/* شريط البحث والتصفية */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search vaccines or medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                </div>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-3 bg-white border border-gray-200 rounded-xl text-sm"
                >
                    <option value="all">All</option>
                    <option value="vaccines">Vaccines</option>
                    <option value="medicines">Medicines</option>
                </select>
            </div>

            {/* قائمة التطعيمات المجدولة */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Clock size={18} /> Scheduled Health Plan
                </h3>
                
                {batchVaccines.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Syringe className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-gray-500">No health schedule yet</p>
                        <p className="text-sm text-gray-400 mt-1">Add vaccinations or medicines</p>
                    </div>
                ) : (
                    batchVaccines.map(v => {
                        const isDone = v.status === 'done';
                        const isDue = !isDone && v.date <= new Date().toISOString().split('T')[0];
                        const ageAtVaccine = getDaysDifference(activeBatch.startDate) - 
                            (getDaysDifference(activeBatch.startDate) - getDaysDifference(v.date));

                        return (
                            <Card key={v.id} className={`p-4 ${isDue ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-full ${isDone ? 'bg-green-100' : 'bg-blue-100'}`}>
                                            {isDone ? 
                                                <CheckCircle size={20} className="text-green-600" /> : 
                                                <Clock size={20} className="text-blue-600" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                    {v.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded ${v.category === 'medicine' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {v.category === 'medicine' ? 'Medicine' : 'Vaccine'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {formatDate(v.date)} • Age {ageAtVaccine} days • {v.type}
                                            </p>
                                            
                                            {v.description && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 line-clamp-2">
                                                        {v.description}
                                                    </p>
                                                    <button 
                                                        onClick={() => setShowDetails(v)}
                                                        className="text-xs text-blue-500 mt-1 hover:text-blue-600"
                                                    >
                                                        View details →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleStatus(v.id)}
                                        className={`px-3 py-1 rounded text-xs font-bold border ${isDone ? 'border-gray-300 text-gray-500' : 'bg-white border-blue-200 text-blue-600'}`}
                                    >
                                        {isDone ? 'Undo' : 'Done'}
                                    </button>
                                </div>
                                
                                {v.notes && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">Notes: {v.notes}</p>
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {/* نافذة إضافة جديدة */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Health Item" size="lg">
                <div className="space-y-4">
                    {/* قوالب التطعيمات */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Shield size={18} /> Recommended Vaccines
                        </h3>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            {filteredVaccines.map(vaccine => (
                                <div 
                                    key={vaccine.day} 
                                    className="p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => selectTemplate(vaccine)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-blue-800">{vaccine.name}</p>
                                            <p className="text-xs text-blue-600">Day {vaccine.day} • {vaccine.type}</p>
                                        </div>
                                        <Info size={16} className="text-blue-500" />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{vaccine.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* قائمة الأدوية */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Droplets size={18} /> Common Medicines
                        </h3>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            {filteredMedicines.map(medicine => (
                                <div 
                                    key={medicine.name} 
                                    className="p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
                                    onClick={() => selectMedicine(medicine)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-purple-800">{medicine.name}</p>
                                            <p className="text-xs text-purple-600">{medicine.type}</p>
                                        </div>
                                        <Info size={16} className="text-purple-500" />
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{medicine.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* نموذج الإدخال */}
                    <div className="pt-4 border-t">
                        <h3 className="font-bold text-gray-700 mb-3">Add Custom Item</h3>
                        <div className="space-y-3">
                            <Input 
                                label="Name" 
                                value={newVac.name} 
                                onChange={e => setNewVac({...newVac, name: e.target.value})} 
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Type</label>
                                    <select 
                                        className="w-full p-3 bg-gray-50 border rounded-xl"
                                        value={newVac.type}
                                        onChange={e => setNewVac({...newVac, type: e.target.value})}
                                    >
                                        <option value="مياه شرب">Drinking Water</option>
                                        <option value="تقطير">Eye Drop</option>
                                        <option value="رش">Spray</option>
                                        <option value="حقن">Injection</option>
                                        <option value="علف">Feed Mix</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Category</label>
                                    <select 
                                        className="w-full p-3 bg-gray-50 border rounded-xl"
                                        value={newVac.category}
                                        onChange={e => setNewVac({...newVac, category: e.target.value})}
                                    >
                                        <option value="vaccine">Vaccine</option>
                                        <option value="medicine">Medicine</option>
                                        <option value="vitamin">Vitamin</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Input 
                                    label="Date" 
                                    type="date" 
                                    value={newVac.date} 
                                    onChange={e => setNewVac({...newVac, date: e.target.value})} 
                                />
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-400 mb-1 block">Dosage</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.dosage}
                                        onChange={e => setNewVac({...newVac, dosage: e.target.value})}
                                        placeholder="e.g., 1ml per bird"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-400 mb-1 block">Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newVac.description}
                                    onChange={e => setNewVac({...newVac, description: e.target.value})}
                                    placeholder="Description of the vaccine or medicine..."
                                    rows="3"
                                />
                            </div>
                            
                            <Input 
                                label="Notes" 
                                value={newVac.notes} 
                                onChange={e => setNewVac({...newVac, notes: e.target.value})} 
                            />
                            
                            <Button onClick={addCustomVaccine} className="w-full">
                                Add to Health Schedule
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* نافذة التفاصيل */}
            <Modal isOpen={showDetails} onClose={() => setShowDetails(null)} title={showDetails?.name || 'Details'} size="lg">
                {showDetails && (
                    <div className="space-y-4">
                        {/* العنوان */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${showDetails.category === 'medicine' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {showDetails.category === 'medicine' ? 
                                    <Droplets size={24} /> : 
                                    <Shield size={24} />
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{showDetails.name}</h3>
                                <p className="text-sm text-gray-500">{showDetails.type}</p>
                            </div>
                        </div>
                        
                        {/* الوصف */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-700 mb-2">Description</h4>
                            <p className="text-gray-600">{showDetails.description}</p>
                        </div>
                        
                        {/* الفوائد/الاستخدامات */}
                        {showDetails.benefits && (
                            <div className="bg-green-50 p-4 rounded-xl">
                                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                    <CheckCircle size={16} /> Benefits/Uses
                                </h4>
                                <p className="text-green-600">{showDetails.benefits}</p>
                            </div>
                        )}
                        
                        {/* الجرعة */}
                        {showDetails.dosage && (
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h4 className="font-bold text-blue-700 mb-2">Dosage</h4>
                                <p className="text-blue-600">{showDetails.dosage}</p>
                            </div>
                        )}
                        
                        {/* فترة السحب */}
                        {showDetails.withdrawalPeriod && (
                            <div className="bg-yellow-50 p-4 rounded-xl">
                                <h4 className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} /> Withdrawal Period
                                </h4>
                                <p className="text-yellow-600">{showDetails.withdrawalPeriod}</p>
                            </div>
                        )}
                        
                        {/* ملاحظات مهمة */}
                        {showDetails.notes && (
                            <div className="bg-red-50 p-4 rounded-xl">
                                <h4 className="font-bold text-red-700 mb-2">Important Notes</h4>
                                <p className="text-red-600">{showDetails.notes}</p>
                            </div>
                        )}
                        
                        {/* المدة */}
                        {showDetails.duration && (
                            <div className="bg-indigo-50 p-4 rounded-xl">
                                <h4 className="font-bold text-indigo-700 mb-2">Duration of Protection</h4>
                                <p className="text-indigo-600">{showDetails.duration}</p>
                            </div>
                        )}
                        
                        {/* الأعراض الجانبية */}
                        {showDetails.sideEffects && (
                            <div className="bg-orange-50 p-4 rounded-xl">
                                <h4 className="font-bold text-orange-700 mb-2">Side Effects</h4>
                                <p className="text-orange-600">{showDetails.sideEffects}</p>
                            </div>
                        )}
                        
                        {/* زر الإضافة */}
                        <Button 
                            onClick={() => {
                                if (showDetails.day) {
                                    selectTemplate(showDetails);
                                } else {
                                    selectMedicine(showDetails);
                                }
                                setShowDetails(null);
                                setShowModal(true);
                            }}
                            className="w-full"
                        >
                            Add to Schedule
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HealthManager;
