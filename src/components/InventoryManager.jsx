import React, { useState } from 'react';
import { 
    Package, Plus, Edit2, Trash2, AlertTriangle, 
    TrendingUp, TrendingDown, Calendar, BarChart3, 
    Filter, FileText, RefreshCw, Search
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import InventoryReport from './InventoryReport';
import { 
    INVENTORY_CATEGORIES, 
    FEED_TYPES_DETAILED, 
    generateInventoryAlerts 
} from '../utils/helpers';

const InventoryManager = ({ 
    activeBatch,
    inventoryItems,
    setInventoryItems,
    expenses,
    dailyLogs,
    showNotify,
    handleDelete,
    shareViaWhatsapp
}) => {
    const [view, setView] = useState('list');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [searchQuery, setSearchQuery] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'أعلاف',
        unit: 'كجم',
        currentStock: '',
        minStock: '',
        reorderPoint: '',
        costPerUnit: '',
        expiryDate: '',
        supplier: '',
        notes: ''
    });
    const [editingItem, setEditingItem] = useState(null);
    const [consumptionModal, setConsumptionModal] = useState(false);
    const [selectedItemForConsumption, setSelectedItemForConsumption] = useState(null);
    const [consumptionAmount, setConsumptionAmount] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [stockHistory, setStockHistory] = useState([]);

    // تحليل استهلاك العلف
    const feedConsumptionAnalysis = activeBatch ? (() => {
        const batchLogs = dailyLogs.filter(l => l.batchId === activeBatch.id);
        const feedByType = {};
        let totalFeed = 0;
        
        batchLogs.forEach(log => {
            if (log.feed && log.feedType) {
                totalFeed += Number(log.feed);
                if (!feedByType[log.feedType]) {
                    feedByType[log.feedType] = 0;
                }
                feedByType[log.feedType] += Number(log.feed);
            }
        });
        
        return { totalFeed, feedByType };
    })() : { totalFeed: 0, feedByType: {} };

    // حساب إجمالي قيمة المخزون
    const totalInventoryValue = inventoryItems.reduce((total, item) => {
        return total + (Number(item.currentStock) * Number(item.costPerUnit || 0));
    }, 0);

    // تحذيرات المخزون
    const inventoryAlerts = generateInventoryAlerts(inventoryItems);

    // فلترة العناصر مع البحث
    const filteredItems = inventoryItems
        .filter(item => {
            // البحث حسب الاسم
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            // الفلترة حسب النوع
            if (filter === 'all') return true;
            if (filter === 'low') return item.currentStock <= item.minStock;
            if (filter === 'feed') return item.category === 'أعلاف';
            if (filter === 'medicine') return item.category === 'أدوية وتحصينات';
            if (filter === 'expired') {
                if (!item.expiryDate) return false;
                const expiryDate = new Date(item.expiryDate);
                return expiryDate < new Date();
            }
            return item.category === filter;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'stock': return a.currentStock - b.currentStock;
                case 'value': return (b.currentStock * b.costPerUnit) - (a.currentStock * a.costPerUnit);
                case 'category': return a.category.localeCompare(b.category);
                case 'expiry': return new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31');
                default: return 0;
            }
        });

    // التحليل الإحصائي
    const inventoryStats = {
        totalItems: inventoryItems.length,
        lowStockItems: inventoryItems.filter(item => item.currentStock <= item.minStock).length,
        feedItems: inventoryItems.filter(item => item.category === 'أعلاف').length,
        medicineItems: inventoryItems.filter(item => item.category === 'أدوية وتحصينات').length,
        expiredItems: inventoryItems.filter(item => {
            if (!item.expiryDate) return false;
            return new Date(item.expiryDate) < new Date();
        }).length
    };

    const saveItem = () => {
        if (!newItem.name || !newItem.currentStock) {
            return showNotify("البيانات الأساسية مطلوبة");
        }

        const itemToSave = {
            ...newItem,
            id: editingItem ? editingItem.id : Date.now(),
            batchId: activeBatch?.id || null,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        if (editingItem) {
            // حفظ تاريخ التعديل
            const historyEntry = {
                date: new Date().toISOString(),
                itemId: editingItem.id,
                action: 'تعديل',
                previousStock: editingItem.currentStock,
                newStock: newItem.currentStock,
                notes: `تعديل بواسطة المستخدم`
            };
            setStockHistory(prev => [historyEntry, ...prev]);

            // تحديث العنصر
            setInventoryItems(prev => 
                prev.map(item => item.id === editingItem.id ? itemToSave : item)
            );
            showNotify("تم تحديث العنصر ✅");
        } else {
            // تاريخ إضافة جديد
            const historyEntry = {
                date: new Date().toISOString(),
                itemId: itemToSave.id,
                action: 'إضافة',
                previousStock: 0,
                newStock: newItem.currentStock,
                notes: `إضافة جديدة`
            };
            setStockHistory(prev => [historyEntry, ...prev]);

            // إضافة عنصر جديد
            setInventoryItems(prev => [...prev, itemToSave]);
            showNotify("تم إضافة العنصر ✅");
        }

        resetForm();
        setView('list');
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            category: item.category,
            unit: item.unit,
            currentStock: item.currentStock,
            minStock: item.minStock || '',
            reorderPoint: item.reorderPoint || '',
            costPerUnit: item.costPerUnit || '',
            expiryDate: item.expiryDate || '',
            supplier: item.supplier || '',
            notes: item.notes || ''
        });
        setView('new');
    };

    const handleConsumption = (item) => {
        setSelectedItemForConsumption(item);
        setConsumptionAmount('');
        setConsumptionModal(true);
    };

    const saveConsumption = () => {
        if (!consumptionAmount || consumptionAmount <= 0) {
            return showNotify("الرجاء إدخال كمية صحيحة");
        }

        const amount = Number(consumptionAmount);
        const item = selectedItemForConsumption;

        if (amount > item.currentStock) {
            return showNotify("الكمية المطلوبة أكبر من المخزون المتاح");
        }

        // تحديث المخزون
        const updatedItems = inventoryItems.map(invItem => 
            invItem.id === item.id ? 
            { ...invItem, currentStock: invItem.currentStock - amount } : 
            invItem
        );
        setInventoryItems(updatedItems);

        // تسجيل في التاريخ
        const historyEntry = {
            date: new Date().toISOString(),
            itemId: item.id,
            action: 'استهلاك',
            previousStock: item.currentStock,
            newStock: item.currentStock - amount,
            notes: `استهلاك: ${amount} ${item.unit} للدورة ${activeBatch?.name || 'عام'}`
        };
        setStockHistory(prev => [historyEntry, ...prev]);

        showNotify(`تم خصم ${amount} ${item.unit} من ${item.name}`);
        setConsumptionModal(false);
        setSelectedItemForConsumption(null);
    };

    const handleRestock = (item) => {
        const restockAmount = prompt(`كمية الإضافة لـ ${item.name} (${item.unit}):`, item.minStock * 2);
        
        if (restockAmount && !isNaN(restockAmount) && restockAmount > 0) {
            const amount = Number(restockAmount);
            const updatedItems = inventoryItems.map(invItem => 
                invItem.id === item.id ? 
                { ...invItem, currentStock: invItem.currentStock + amount } : 
                invItem
            );
            setInventoryItems(updatedItems);

            // تسجيل في التاريخ
            const historyEntry = {
                date: new Date().toISOString(),
                itemId: item.id,
                action: 'تزويد',
                previousStock: item.currentStock,
                newStock: item.currentStock + amount,
                notes: `تزويد بالمخزون`
            };
            setStockHistory(prev => [historyEntry, ...prev]);

            showNotify(`تم إضافة ${amount} ${item.unit} إلى ${item.name}`);
        }
    };

    const resetForm = () => {
        setNewItem({
            name: '',
            category: 'أعلاف',
            unit: 'كجم',
            currentStock: '',
            minStock: '',
            reorderPoint: '',
            costPerUnit: '',
            expiryDate: '',
            supplier: '',
            notes: ''
        });
        setEditingItem(null);
    };

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة مع الإحصائيات */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Package size={24} /> إدارة المخزون
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowReport(true)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                            <FileText size={20} />
                        </button>
                        <button 
                            onClick={() => setView('new')}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">إجمالي العناصر</p>
                        <p className="font-bold text-lg">{inventoryStats.totalItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">قيمة المخزون</p>
                        <p className="font-bold text-lg">{totalInventoryValue.toLocaleString()} ج</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">منخفض المخزون</p>
                        <p className="font-bold text-lg text-yellow-300">{inventoryStats.lowStockItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">الأعلاف</p>
                        <p className="font-bold text-lg">{inventoryStats.feedItems}</p>
                    </div>
                </div>
            </div>

            {/* شريط البحث والفلترة */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن عنصر في المخزون..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                </div>
                <button 
                    onClick={() => setSearchQuery('')}
                    className="p-3 bg-gray-100 rounded-xl"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* أزرار الفلترة */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'all' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    الكل
                </button>
                <button 
                    onClick={() => setFilter('low')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'low' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    <AlertTriangle size={12} className="inline mr-1" /> منخفض
                </button>
                <button 
                    onClick={() => setFilter('feed')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'feed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    أعلاف
                </button>
                <button 
                    onClick={() => setFilter('medicine')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'medicine' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    أدوية
                </button>
                {inventoryStats.expiredItems > 0 && (
                    <button 
                        onClick={() => setFilter('expired')}
                        className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                            filter === 'expired' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        ⚠️ منتهي
                    </button>
                )}
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border-none"
                >
                    <option value="name">ترتيب أبجدي</option>
                    <option value="stock">حسب الكمية</option>
                    <option value="value">حسب القيمة</option>
                    <option value="category">حسب النوع</option>
                    <option value="expiry">حسب الصلاحية</option>
                </select>
            </div>

            {/* تحذيرات المخزون */}
            {inventoryAlerts.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 text-sm">📢 تنبيهات المخزون</h3>
                        <span className="text-xs text-gray-500">{inventoryAlerts.length} تنبيه</span>
                    </div>
                    {inventoryAlerts.map((alert, index) => (
                        <div 
                            key={index} 
                            className={`p-3 rounded-xl border-l-4 flex items-center justify-between ${
                                alert.type === 'danger' 
                                    ? 'bg-red-50 border-red-500 text-red-800' 
                                    : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} />
                                <span className="text-sm font-medium">{alert.message}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    const item = inventoryItems.find(i => i.id === alert.itemId);
                                    if (item) handleRestock(item);
                                }}
                                className="text-xs bg-white px-3 py-1 rounded-lg font-bold hover:opacity-80"
                            >
                                تزويد
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* تحليل استهلاك العلف */}
            {activeBatch && feedConsumptionAnalysis.totalFeed > 0 && (
                <Card>
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-3">
                        <BarChart3 size={18} className="text-green-500" /> تحليل استهلاك العلف للدورة الحالية
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">إجمالي الاستهلاك:</span>
                            <span className="font-bold text-green-600">
                                {feedConsumptionAnalysis.totalFeed.toLocaleString()} كجم
                            </span>
                        </div>
                        {Object.entries(feedConsumptionAnalysis.feedByType).map(([type, amount]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{type}:</span>
                                <span className="font-medium">
                                    {amount.toLocaleString()} كجم
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* عرض العناصر */}
            {view === 'list' && (
                <div className="space-y-3">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Package size={48} className="mx-auto mb-3 opacity-30" />
                            <p>لا توجد عناصر في المخزون</p>
                            <button 
                                onClick={() => setView('new')}
                                className="mt-3 text-orange-500 text-sm font-bold"
                            >
                                + إضافة أول عنصر
                            </button>
                        </div>
                    ) : (
                        filteredItems.map(item => {
                            const stockPercentage = (item.currentStock / (item.minStock * 3 || 1)) * 100;
                            const itemValue = Number(item.currentStock) * Number(item.costPerUnit || 0);
                            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                            const isLowStock = item.currentStock <= item.minStock;
                            
                            return (
                                <Card key={item.id} className={`p-4 ${isExpired ? 'border-red-300 bg-red-50' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                    {item.category}
                                                </span>
                                                {isExpired && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                                        منتهي
                                                    </span>
                                                )}
                                                {isLowStock && !isExpired && (
                                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">
                                                        منخفض
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {item.supplier && `المورد: ${item.supplier} • `}
                                                الوحدة: {item.unit}
                                                {item.expiryDate && ` • الصلاحية: ${new Date(item.expiryDate).toLocaleDateString('ar-SA')}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${
                                                isExpired ? 'text-red-600' : 
                                                isLowStock ? 'text-yellow-600' : 
                                                'text-blue-600'
                                            }`}>
                                                {item.currentStock.toLocaleString()} {item.unit}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {itemValue > 0 ? `${itemValue.toLocaleString()} ج` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* شريط مستوى المخزون */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>المخزون الحالي</span>
                                            <span>حد إعادة الطلب: {item.minStock || 0}</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${
                                                    stockPercentage < 30 ? 'bg-red-500' :
                                                    stockPercentage < 60 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEditItem(item)}
                                                className="text-blue-500 hover:text-blue-600 p-1"
                                                title="تعديل"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleConsumption(item)}
                                                className="text-green-500 hover:text-green-600 p-1"
                                                title="استهلاك"
                                            >
                                                <TrendingDown size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-orange-500 hover:text-orange-600 p-1"
                                                title="تزويد"
                                            >
                                                <TrendingUp size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('عنصر المخزون', () => 
                                                    setInventoryItems(inventoryItems.filter(i => i.id !== item.id))
                                                )}
                                                className="text-red-500 hover:text-red-600 p-1"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {isLowStock && !isExpired && (
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-lg font-bold"
                                            >
                                                <Plus size={12} className="inline mr-1" /> تزويد عاجل
                                            </button>
                                        )}
                                        {isExpired && (
                                            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold">
                                                ⚠️ منتهي الصلاحية
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* نموذج إضافة/تعديل عنصر */}
            {view === 'new' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">
                        {editingItem ? 'تعديل عنصر المخزون' : 'إضافة عنصر جديد'}
                    </h3>
                    
                    <Input 
                        label="اسم العنصر" 
                        value={newItem.name} 
                        onChange={e => setNewItem({...newItem, name: e.target.value})} 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-400 mb-1 block">النوع</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border rounded-xl"
                                value={newItem.category}
                                onChange={e => setNewItem({...newItem, category: e.target.value})}
                            >
                                {INVENTORY_CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <Input 
                            label="الوحدة" 
                            value={newItem.unit} 
                            onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                            placeholder="كجم، لتر، علبة..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="الكمية الحالية" 
                            type="number" 
                            value={newItem.currentStock} 
                            onChange={e => setNewItem({...newItem, currentStock: e.target.value})} 
                        />
                        <Input 
                            label="الحد الأدنى" 
                            type="number" 
                            value={newItem.minStock} 
                            onChange={e => setNewItem({...newItem, minStock: e.target.value})} 
                            placeholder="عندها يتم إعادة الطلب"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="سعر الوحدة" 
                            type="number" 
                            value={newItem.costPerUnit} 
                            onChange={e => setNewItem({...newItem, costPerUnit: e.target.value})} 
                            placeholder="السعر بالجنية"
                        />
                        <Input 
                            label="تاريخ الصلاحية" 
                            type="date" 
                            value={newItem.expiryDate} 
                            onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} 
                        />
                    </div>
                    
                    <Input 
                        label="المورد" 
                        value={newItem.supplier} 
                        onChange={e => setNewItem({...newItem, supplier: e.target.value})} 
                        placeholder="اسم المورد أو الشركة"
                    />
                    
                    <Input 
                        label="ملاحظات" 
                        value={newItem.notes} 
                        onChange={e => setNewItem({...newItem, notes: e.target.value})} 
                        placeholder="أي معلومات إضافية"
                    />
                    
                    <div className="flex gap-2 mt-4">
                        <Button 
                            onClick={saveItem} 
                            className="flex-1"
                            variant={editingItem ? "primary" : "success"}
                        >
                            {editingItem ? 'حفظ التعديلات' : 'إضافة العنصر'}
                        </Button>
                        <Button 
                            onClick={() => {
                                resetForm();
                                setView('list');
                            }} 
                            variant="ghost"
                        >
                            إلغاء
                        </Button>
                    </div>
                </Card>
            )}

            {/* نافذة استهلاك المخزون */}
            <Modal 
                isOpen={consumptionModal} 
                onClose={() => setConsumptionModal(false)} 
                title={`استهلاك ${selectedItemForConsumption?.name}`}
            >
                {selectedItemForConsumption && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                                المخزون المتاح: <span className="font-bold">
                                    {selectedItemForConsumption.currentStock} {selectedItemForConsumption.unit}
                                </span>
                            </p>
                            {selectedItemForConsumption.costPerUnit && (
                                <p className="text-sm text-gray-700 mt-1">
                                    سعر الوحدة: <span className="font-bold">
                                        {selectedItemForConsumption.costPerUnit} ج
                                    </span>
                                </p>
                            )}
                            {selectedItemForConsumption.expiryDate && (
                                <p className="text-sm text-gray-700 mt-1">
                                    تاريخ الصلاحية: <span className="font-bold">
                                        {new Date(selectedItemForConsumption.expiryDate).toLocaleDateString('ar-SA')}
                                    </span>
                                </p>
                            )}
                        </div>
                        
                        <Input 
                            label="الكمية المستهلكة" 
                            type="number" 
                            value={consumptionAmount} 
                            onChange={e => setConsumptionAmount(e.target.value)} 
                            placeholder={`أدخل الكمية (${selectedItemForConsumption.unit})`}
                        />
                        
                        {consumptionAmount && selectedItemForConsumption.costPerUnit && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    التكلفة الإجمالية: <span className="font-bold text-green-600">
                                        {(consumptionAmount * selectedItemForConsumption.costPerUnit).toLocaleString()} ج
                                    </span>
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={saveConsumption} 
                                className="flex-1"
                                variant="success"
                            >
                                تأكيد الاستهلاك
                            </Button>
                            <Button 
                                onClick={() => setConsumptionModal(false)} 
                                variant="ghost"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* نافذة تقرير المخزون */}
            <Modal 
                isOpen={showReport} 
                onClose={() => setShowReport(false)} 
                title="تقرير المخزون الشامل"
                size="lg"
            >
                <InventoryReport 
                    inventoryItems={inventoryItems}
                    shareViaWhatsapp={shareViaWhatsapp}
                />
            </Modal>
        </div>
    );
};

export default InventoryManager;
