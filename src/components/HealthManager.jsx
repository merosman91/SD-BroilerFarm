import React, { useState, useEffect } from 'react';
import { 
    Syringe, Plus, CheckCircle, Clock, Info, 
    AlertCircle, Thermometer, Droplets, Shield,
    Calendar, Search, FileText, Trash2, Edit2
} from 'lucide-react';
import { Button, Card, Modal, Input } from '../UI';
import { VACCINATION_TEMPLATES, MEDICINE_OPTIONS } from '../utils/vaccinations';
import { formatDate, getDaysDifference } from '../utils/helpers';

const HealthManager = ({ 
    activeBatch, 
    vaccinations, 
    setVaccinations, 
    showNotify,
    handleDelete
}) => {
    const [showModal, setShowModal] = useState(false);
    const [showDetails, setShowDetails] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [newVac, setNewVac] = useState({ 
        name: '', 
        type: 'مياه شرب', 
        date: new Date().toISOString().split('T')[0], 
        notes: '',
        description: '',
        dosage: '',
        category: 'vaccine', // vaccine or medicine
        targetDisease: '',
        withdrawalPeriod: '',
        sideEffects: '',
        duration: '',
        batchId: null
    });

    // حالة البحث
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    if (!activeBatch) {
        return (
            <div className="text-center py-10">
                <Syringe className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">ابدأ دورة جديدة لعرض جدول الصحة</p>
            </div>
        );
    }

    const batchVaccines = vaccinations
        .filter(v => v.batchId === activeBatch.id)
        .sort((a,b) => new Date(a.date) - new Date(b.date));

    // فلترة القوائم حسب البحث
    const filteredVaccines = VACCINATION_TEMPLATES.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.targetDisease?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMedicines = MEDICINE_OPTIONS.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.targetDisease?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // فلترة العناصر المعروضة
    const filteredBatchVaccines = batchVaccines.filter(v => {
        if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
        if (selectedStatus !== 'all' && v.status !== selectedStatus) return false;
        if (searchTerm && !v.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const toggleStatus = (id) => {
        const updated = vaccinations.map(v => 
            v.id === id ? { ...v, status: v.status === 'done' ? 'pending' : 'done' } : v
        );
        setVaccinations(updated);
        showNotify(v.status === 'done' ? "تم إرجاع العنصر للمهام المعلقة" : "تم إكمال العنصر");
    };

    const addCustomVaccine = () => {
        if (!newVac.name) {
            showNotify("✗ اسم العنصر مطلوب");
            return;
        }

        const itemToSave = {
            ...newVac,
            id: editingItem ? editingItem.id : Date.now(),
            batchId: activeBatch.id,
            status: 'pending'
        };

        if (editingItem) {
            setVaccinations(vaccinations.map(v => 
                v.id === editingItem.id ? itemToSave : v
            ));
            showNotify("تم تحديث العنصر ✏️");
        } else {
            setVaccinations([...vaccinations, itemToSave]);
            showNotify("تم إضافة العنصر الجديد ✅");
        }

        resetForm();
        setShowModal(false);
    };

    const selectTemplate = (template) => {
        setNewVac({
            name: template.name,
            type: template.type || 'مياه شرب',
            date: calculateDateForDay(template.day),
            notes: template.notes || '',
            description: template.description,
            dosage: template.dosage || '',
            category: 'vaccine',
            targetDisease: template.targetDisease || '',
            withdrawalPeriod: template.withdrawalPeriod || '',
            sideEffects: template.sideEffects || '',
            duration: template.duration || '',
            batchId: activeBatch.id
        });
        setShowDetails(template);
    };

    const selectMedicine = (medicine) => {
        setNewVac({
            name: medicine.name,
            type: medicine.type || 'مياه شرب',
            date: new Date().toISOString().split('T')[0],
            notes: medicine.notes || '',
            description: medicine.description,
            dosage: medicine.dosage || '',
            category: 'medicine',
            targetDisease: medicine.targetDisease || '',
            withdrawalPeriod: medicine.withdrawalPeriod || '',
            sideEffects: medicine.sideEffects || '',
            duration: medicine.duration || '',
            batchId: activeBatch.id
        });
        setShowDetails(medicine);
    };

    const calculateDateForDay = (day) => {
        const startDate = new Date(activeBatch.startDate);
        startDate.setDate(startDate.getDate() + day);
        return startDate.toISOString().split('T')[0];
    };

    const resetForm = () => {
        setNewVac({ 
            name: '', 
            type: 'مياه شرب', 
            date: new Date().toISOString().split('T')[0], 
            notes: '',
            description: '',
            dosage: '',
            category: 'vaccine',
            targetDisease: '',
            withdrawalPeriod: '',
            sideEffects: '',
            duration: '',
            batchId: activeBatch.id
        });
        setEditingItem(null);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewVac({
            name: item.name,
            type: item.type,
            date: item.date,
            notes: item.notes || '',
            description: item.description || '',
            dosage: item.dosage || '',
            category: item.category || 'vaccine',
            targetDisease: item.targetDisease || '',
            withdrawalPeriod: item.withdrawalPeriod || '',
            sideEffects: item.sideEffects || '',
            duration: item.duration || '',
            batchId: item.batchId
        });
        setShowModal(true);
    };

    // إحصائيات
    const stats = {
        total: batchVaccines.length,
        completed: batchVaccines.filter(v => v.status === 'done').length,
        pending: batchVaccines.filter(v => v.status === 'pending').length,
        overdue: batchVaccines.filter(v => 
            v.status === 'pending' && v.date <= new Date().toISOString().split('T')[0]
        ).length,
        vaccines: batchVaccines.filter(v => v.category === 'vaccine').length,
        medicines: batchVaccines.filter(v => v.category === 'medicine').length
    };

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Syringe size={24} /> إدارة الصحة والتحصينات
                        </h2>
                        <p className="text-xs opacity-80">تحصينات وأدوية للدورة: {activeBatch.name}</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        title="إضافة جديد"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">إجمالي</p>
                        <p className="font-bold text-lg">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">مكتمل</p>
                        <p className="font-bold text-lg text-green-300">
                            {stats.completed}
                        </p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">معلق</p>
                        <p className="font-bold text-lg text-yellow-300">
                            {stats.pending}
                        </p>
                    </div>
                </div>
            </div>

            {/* شريط البحث والتصفية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث في التحصينات والأدوية..."
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
                    <option value="all">جميع الفئات</option>
                    <option value="vaccine">تحصينات</option>
                    <option value="medicine">أدوية</option>
                    <option value="vitamin">فيتامينات</option>
                    <option value="other">أخرى</option>
                </select>
                <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="p-3 bg-white border border-gray-200 rounded-xl text-sm"
                >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">معلقة</option>
                    <option value="done">مكتملة</option>
                </select>
            </div>

            {/* التحذيرات */}
            {stats.overdue > 0 && (
                <div className="bg-red-50 border-r-4 border-red-600 p-3 rounded-l-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={20} className="text-red-600" />
                        <h3 className="font-bold text-red-800 text-sm">تحصينات متأخرة</h3>
                    </div>
                    <p className="text-sm text-red-700">
                        لديك {stats.overdue} تحصين/دواء متأخر عن موعده. الرجاء المراجعة فوراً.
                    </p>
                </div>
            )}

            {/* قائمة التطعيمات المجدولة */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Calendar size={18} /> جدول الصحة المجدول
                    </h3>
                    <span className="text-xs text-gray-500">
                        {filteredBatchVaccines.length} عنصر
                    </span>
                </div>
                
                {filteredBatchVaccines.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <Syringe className="mx-auto text-gray-300 mb-3" size={32} />
                        <p className="text-gray-500">لا يوجد جدول صحي بعد</p>
                        <p className="text-sm text-gray-400 mt-1">أضف تحصينات أو أدوية للبدء</p>
                    </div>
                ) : (
                    filteredBatchVaccines.map(v => {
                        const isDone = v.status === 'done';
                        const isDue = !isDone && v.date <= new Date().toISOString().split('T')[0];
                        const ageAtVaccine = getDaysDifference(activeBatch.startDate) - 
                            (getDaysDifference(activeBatch.startDate) - getDaysDifference(v.date));
                        const daysUntil = getDaysDifference(v.date) - getDaysDifference(activeBatch.startDate);

                        return (
                            <Card key={v.id} className={`p-4 ${isDue ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className={`p-2 rounded-full ${isDone ? 'bg-green-100' : isDue ? 'bg-red-100' : 'bg-blue-100'}`}>
                                            {isDone ? 
                                                <CheckCircle size={20} className="text-green-600" /> : 
                                                isDue ? 
                                                <AlertCircle size={20} className="text-red-600" /> :
                                                <Clock size={20} className="text-blue-600" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                    {v.name}
                                                </h3>
                                                <span className={`text-xs px-2 py-0.5 rounded ${v.category === 'medicine' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {v.category === 'medicine' ? 'دواء' : 'تحصين'}
                                                </span>
                                                {v.targetDisease && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                                        {v.targetDisease}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {formatDate(v.date)} • العمر {ageAtVaccine} يوم • {v.type}
                                                {daysUntil > 0 && !isDone && (
                                                    <span className="text-green-600 font-bold"> • متبقي {daysUntil} يوم</span>
                                                )}
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
                                                        عرض التفاصيل →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleEditItem(v)}
                                                className="p-1 text-blue-500 hover:text-blue-600"
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('عنصر صحي', () => 
                                                    setVaccinations(vaccinations.filter(item => item.id !== v.id))
                                                )}
                                                className="p-1 text-red-500 hover:text-red-600"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => toggleStatus(v.id)}
                                            className={`px-3 py-1 rounded text-xs font-bold border ${isDone ? 'border-gray-300 text-gray-500' : 'bg-white border-blue-200 text-blue-600'}`}
                                        >
                                            {isDone ? 'تراجع' : 'تم'}
                                        </button>
                                    </div>
                                </div>
                                
                                {v.notes && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">ملاحظات: {v.notes}</p>
                                    </div>
                                )}
                                
                                {v.dosage && (
                                    <div className="mt-1 text-xs text-blue-600 font-medium">
                                        الجرعة: {v.dosage}
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            {/* نافذة إضافة جديدة */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="إضافة عنصر صحي" size="lg">
                <div className="space-y-4">
                    {/* قوالب التطعيمات */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Shield size={18} /> تحصينات مقترحة
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
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                                    يوم {vaccine.day}
                                                </span>
                                                <span className="text-xs text-blue-600">{vaccine.type}</span>
                                            </div>
                                        </div>
                                        <Info size={16} className="text-blue-500" />
                                    </div>
                                    {vaccine.targetDisease && (
                                        <p className="text-xs text-red-600 mt-1">{vaccine.targetDisease}</p>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{vaccine.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* قائمة الأدوية */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Droplets size={18} /> أدوية شائعة
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
                                    {medicine.targetDisease && (
                                        <p className="text-xs text-red-600 mt-1">{medicine.targetDisease}</p>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{medicine.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* نموذج الإدخال */}
                    <div className="pt-4 border-t">
                        <h3 className="font-bold text-gray-700 mb-3">
                            {editingItem ? 'تعديل العنصر' : 'إضافة عنصر مخصص'}
                        </h3>
                        <div className="space-y-3">
                            <Input 
                                label="الاسم *" 
                                value={newVac.name} 
                                onChange={e => setNewVac({...newVac, name: e.target.value})} 
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">طريقة التطبيق</label>
                                    <select 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.type}
                                        onChange={e => setNewVac({...newVac, type: e.target.value})}
                                    >
                                        <option value="مياه شرب">مياه الشرب</option>
                                        <option value="تقطير">تقطير</option>
                                        <option value="رش">رش</option>
                                        <option value="حقن">حقن</option>
                                        <option value="علف">خلط مع العلف</option>
                                        <option value="موضعي">موضعي</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">الفئة</label>
                                    <select 
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.category}
                                        onChange={e => setNewVac({...newVac, category: e.target.value})}
                                    >
                                        <option value="vaccine">تحصين</option>
                                        <option value="medicine">دواء</option>
                                        <option value="vitamin">فيتامين</option>
                                        <option value="disinfectant">مطهر</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">التاريخ</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.date}
                                        onChange={e => setNewVac({...newVac, date: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">الجرعة</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.dosage}
                                        onChange={e => setNewVac({...newVac, dosage: e.target.value})}
                                        placeholder="مثال: 1 مل لكل طائر"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 block">المرض المستهدف</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newVac.targetDisease}
                                    onChange={e => setNewVac({...newVac, targetDisease: e.target.value})}
                                    placeholder="المرض الذي يعالجه/يحمي منه"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 block">الوصف</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newVac.description}
                                    onChange={e => setNewVac({...newVac, description: e.target.value})}
                                    placeholder="وصف مفصل للتحصين أو الدواء..."
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">فترة السحب (أيام)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.withdrawalPeriod}
                                        onChange={e => setNewVac({...newVac, withdrawalPeriod: e.target.value})}
                                        placeholder="عدد الأيام قبل الذبح"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">مدة الحماية (أيام)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        value={newVac.duration}
                                        onChange={e => setNewVac({...newVac, duration: e.target.value})}
                                        placeholder="عدد أيام الحماية"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 block">الأعراض الجانبية</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newVac.sideEffects}
                                    onChange={e => setNewVac({...newVac, sideEffects: e.target.value})}
                                    placeholder="الأعراض الجانبية المحتملة..."
                                    rows="2"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-1 block">ملاحظات</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newVac.notes}
                                    onChange={e => setNewVac({...newVac, notes: e.target.value})}
                                    placeholder="ملاحظات إضافية..."
                                    rows="2"
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <Button onClick={addCustomVaccine} className="flex-1">
                                    {editingItem ? 'حفظ التعديلات' : 'إضافة للجدول'}
                                </Button>
                                <Button 
                                    onClick={() => { setShowModal(false); resetForm(); }} 
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* نافذة التفاصيل */}
            <Modal isOpen={showDetails} onClose={() => setShowDetails(null)} title={showDetails?.name || 'تفاصيل'} size="lg">
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
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-gray-500">{showDetails.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${showDetails.category === 'medicine' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {showDetails.category === 'medicine' ? 'دواء' : 'تحصين'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* الوصف */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-700 mb-2">الوصف</h4>
                            <p className="text-gray-600">{showDetails.description}</p>
                        </div>
                        
                        {/* المرض المستهدف */}
                        {showDetails.targetDisease && (
                            <div className="bg-red-50 p-4 rounded-xl">
                                <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} /> المرض المستهدف
                                </h4>
                                <p className="text-red-600">{showDetails.targetDisease}</p>
                            </div>
                        )}
                        
                        {/* الجرعة */}
                        {showDetails.dosage && (
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h4 className="font-bold text-blue-700 mb-2">الجرعة</h4>
                                <p className="text-blue-600">{showDetails.dosage}</p>
                            </div>
                        )}
                        
                        {/* فترة السحب */}
                        {showDetails.withdrawalPeriod && (
                            <div className="bg-yellow-50 p-4 rounded-xl">
                                <h4 className="font-bold text-yellow-700 mb-2 flex items-center gap-2">
                                    <AlertCircle size={16} /> فترة السحب
                                </h4>
                                <p className="text-yellow-600">{showDetails.withdrawalPeriod} يوم قبل الذبح</p>
                            </div>
                        )}
                        
                        {/* مدة الحماية */}
                        {showDetails.duration && (
                            <div className="bg-green-50 p-4 rounded-xl">
                                <h4 className="font-bold text-green-700 mb-2">مدة الحماية</h4>
                                <p className="text-green-600">{showDetails.duration} يوم</p>
                            </div>
                        )}
                        
                        {/* الأعراض الجانبية */}
                        {showDetails.sideEffects && (
                            <div className="bg-orange-50 p-4 rounded-xl">
                                <h4 className="font-bold text-orange-700 mb-2">الأعراض الجانبية</h4>
                                <p className="text-orange-600">{showDetails.sideEffects}</p>
                            </div>
                        )}
                        
                        {/* ملاحظات مهمة */}
                        {showDetails.notes && (
                            <div className="bg-purple-50 p-4 rounded-xl">
                                <h4 className="font-bold text-purple-700 mb-2">ملاحظات مهمة</h4>
                                <p className="text-purple-600">{showDetails.notes}</p>
                            </div>
                        )}
                        
                        {/* زر الإضافة */}
                        {!showDetails.id && (
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
                                إضافة للجدول
                            </Button>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HealthManager;
