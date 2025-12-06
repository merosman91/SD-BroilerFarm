import React, { useState, useEffect } from 'react';
import { 
    Package, Plus, Edit2, Trash2, AlertTriangle, 
    TrendingUp, TrendingDown, BarChart3, 
    Filter, FileText, RefreshCw, Search,
    ArrowUpCircle, ArrowDownCircle, 
    CheckCircle, XCircle, ShoppingCart
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import InventoryReport from './InventoryReport';
import { 
    INVENTORY_CATEGORIES, 
    FEED_TYPES, 
    generateInventoryAlerts,
    calculateInventoryStats,
    formatCurrency,
    formatNumber
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
        notes: '',
        batchId: null  // إضافة batchId
    });
    const [editingItem, setEditingItem] = useState(null);
    const [consumptionModal, setConsumptionModal] = useState(false);
    const [restockModal, setRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consumptionAmount, setConsumptionAmount] = useState('');
    const [restockAmount, setRestockAmount] = useState('');
    const [showReport, setShowReport] = useState(false);

    // فلترة العناصر حسب الدورة النشطة
    const getFilteredItems = () => {
        let items = [...inventoryItems];
        
        // إذا كانت هناك دورة نشطة، اعرض فقط العناصر المرتبطة بها والعناصر العامة (التي ليس لها batchId)
        if (activeBatch) {
            items = items.filter(item => 
                !item.batchId || item.batchId === activeBatch.id
            );
        }
        
        // تطبيق الفلتر حسب النوع
        items = items.filter(item => {
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            if (filter === 'all') return true;
            if (filter === 'low') return item.currentStock <= item.minStock;
            if (filter === 'feed') return item.category === 'أعلاف';
            if (filter === 'medicine') return item.category === 'أدوية وتحصينات';
            if (filter === 'expired') {
                if (!item.expiryDate) return false;
                return new Date(item.expiryDate) < new Date();
            }
            return item.category === filter;
        });
        
        // الترتيب
        items.sort((a, b) => {
            switch (sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'stock': return a.currentStock - b.currentStock;
                case 'value': return (b.currentStock * b.costPerUnit) - (a.currentStock * a.costPerUnit);
                case 'category': return a.category.localeCompare(b.category);
                case 'expiry': return new Date(a.expiryDate || '9999-12-31') - new Date(b.expiryDate || '9999-12-31');
                default: return 0;
            }
        });
        
        return items;
    };

    const filteredItems = getFilteredItems();

    // إحصائيات المخزون للدورة النشطة فقط
    const inventoryStats = calculateInventoryStats(
        inventoryItems.filter(item => 
            activeBatch ? (!item.batchId || item.batchId === activeBatch.id) : true
        )
    );
    
    // تحذيرات المخزون للدورة النشطة فقط
    const inventoryAlerts = generateInventoryAlerts(
        inventoryItems.filter(item => 
            activeBatch ? (!item.batchId || item.batchId === activeBatch.id) : true
        )
    );

    // إضافة مخزون العلف التلقائي لكل دورة
    useEffect(() => {
        if (activeBatch && inventoryItems.length > 0) {
            // تحقق مما إذا كانت هناك أعلاف لهذه الدورة
            const hasFeedForBatch = inventoryItems.some(item => 
                item.category === 'أعلاف' && item.batchId === activeBatch.id
            );
            
            // إذا لم يكن هناك أعلاف للدورة الحالية، أضفها
            if (!hasFeedForBatch) {
                const batchFeed = FEED_TYPES.map(feed => ({
                    id: Date.now() + Math.random(),
                    name: feed.name,
                    category: 'أعلاف',
                    unit: 'كجم',
                    currentStock: 1000,
                    minStock: 200,
                    costPerUnit: feed.pricePerKg || 3.0,
                    supplier: 'شركة الأعلاف الوطنية',
                    notes: `علف ${feed.name}`,
                    batchId: activeBatch.id, // ربط بالدورة الحالية
                    isFeed: true,
                    lastUpdated: new Date().toISOString().split('T')[0]
                }));
                
                setInventoryItems(prev => [...prev, ...batchFeed]);
                showNotify("تم إنشاء مخزون العلف للدورة الحالية");
            }
        }
    }, [activeBatch?.id]); // تشغيل عند تغيير الدورة

    const saveItem = () => {
        if (!newItem.name) {
            return showNotify("✗ اسم العنصر مطلوب");
        }

        const stock = Number(newItem.currentStock) || 0;
        const minStock = Number(newItem.minStock) || 0;
        const cost = Number(newItem.costPerUnit) || 0;

        if (isNaN(stock) || stock < 0) {
            return showNotify("✗ المخزون الحالي يجب أن يكون رقم موجب");
        }

        if (isNaN(minStock) || minStock < 0) {
            return showNotify("✗ الحد الأدنى للمخزون يجب أن يكون رقم موجب");
        }

        if (isNaN(cost) || cost < 0) {
            return showNotify("✗ التكلفة لكل وحدة يجب أن تكون رقم موجب");
        }

        const itemToSave = {
            ...newItem,
            id: editingItem ? editingItem.id : Date.now(),
            batchId: activeBatch?.id || null, // ربط بالدورة النشطة أو عام
            lastUpdated: new Date().toISOString().split('T')[0],
            currentStock: stock,
            minStock: minStock,
            costPerUnit: cost,
            reorderPoint: newItem.reorderPoint || minStock * 1.5
        };

        if (editingItem) {
            setInventoryItems(prev => 
                prev.map(item => item.id === editingItem.id ? itemToSave : item)
            );
            showNotify("تم تحديث العنصر ✏️");
        } else {
            setInventoryItems(prev => [...prev, itemToSave]);
            showNotify("تم إضافة العنصر الجديد ✅");
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
            notes: item.notes || '',
            batchId: item.batchId || null
        });
        setView('new');
    };

    // استهلاك المخزون (طرح)
    const handleConsumption = (item) => {
        setSelectedItem(item);
        setConsumptionAmount('');
        setConsumptionModal(true);
    };

    const saveConsumption = () => {
        if (!consumptionAmount || isNaN(consumptionAmount) || Number(consumptionAmount) <= 0) {
            return showNotify("✗ الرجاء إدخال كمية صحيحة");
        }

        const amount = Number(consumptionAmount);
        const item = selectedItem;

        if (amount > item.currentStock) {
            return showNotify(`✗ المخزون غير كافٍ. المتاح: ${item.currentStock} ${item.unit}`);
        }

        const updatedItems = inventoryItems.map(invItem => 
            invItem.id === item.id ? 
            { 
                ...invItem, 
                currentStock: invItem.currentStock - amount,
                lastUpdated: new Date().toISOString().split('T')[0]
            } : 
            invItem
        );
        
        setInventoryItems(updatedItems);
        showNotify(`✓ تم استهلاك ${amount} ${item.unit} من ${item.name}`);
        setConsumptionModal(false);
        setSelectedItem(null);
    };

    // إضافة مخزون (جمع)
    const handleRestock = (item) => {
        setSelectedItem(item);
        setRestockAmount('');
        setRestockModal(true);
    };

    const saveRestock = () => {
        if (!restockAmount || isNaN(restockAmount) || Number(restockAmount) <= 0) {
            return showNotify("✗ الرجاء إدخال كمية صحيحة");
        }

        const amount = Number(restockAmount);
        const item = selectedItem;

        const updatedItems = inventoryItems.map(invItem => 
            invItem.id === item.id ? 
            { 
                ...invItem, 
                currentStock: invItem.currentStock + amount,
                lastUpdated: new Date().toISOString().split('T')[0]
            } : 
            invItem
        );
        
        setInventoryItems(updatedItems);
        showNotify(`✓ تمت إضافة ${amount} ${item.unit} إلى ${item.name}`);
        setRestockModal(false);
        setSelectedItem(null);
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
            notes: '',
            batchId: activeBatch?.id || null
        });
        setEditingItem(null);
    };

    // تحليل استهلاك العلف للدورة النشطة
    const feedConsumptionAnalysis = activeBatch ? (() => {
        const batchLogs = dailyLogs.filter(l => l.batchId === activeBatch.id);
        const feedByType = {};
        let totalFeed = 0;
        
        batchLogs.forEach(log => {
            if (log.feed && log.feedType) {
                const feedAmount = Number(log.feed) || 0;
                totalFeed += feedAmount;
                
                if (!feedByType[log.feedType]) {
                    feedByType[log.feedType] = 0;
                }
                feedByType[log.feedType] += feedAmount;
            }
        });
        
        return { totalFeed, feedByType };
    })() : { totalFeed: 0, feedByType: {} };

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Package size={24} /> إدارة المخزون
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowReport(true)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                            title="تقرير المخزون"
                        >
                            <FileText size={20} />
                        </button>
                        <button 
                            onClick={() => setView('new')}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                            title="إضافة عنصر جديد"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                
                {/* معلومات الدورة */}
                {activeBatch && (
                    <div className="mb-3 bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">المخزون للدورة: {activeBatch.name}</p>
                        <p className="text-sm font-bold">كل دورة لها مخزونها الخاص</p>
                    </div>
                )}
                
                {/* الإحصائيات */}
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">إجمالي العناصر</p>
                        <p className="font-bold text-lg">{inventoryStats.totalItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">القيمة الإجمالية</p>
                        <p className="font-bold text-lg">{formatNumber(inventoryStats.totalValue)} ج</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">مخزون منخفض</p>
                        <p className="font-bold text-lg text-yellow-300">{inventoryStats.lowStockItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">عناصر علف</p>
                        <p className="font-bold text-lg">{inventoryStats.feedItems}</p>
                    </div>
                </div>
            </div>

            {/* شريط البحث */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث في المخزون..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                </div>
                <button 
                    onClick={() => setSearchQuery('')}
                    className="p-3 bg-gray-100 rounded-xl"
                    title="إعادة تعيين البحث"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* الفلاتر */}
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
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border-none"
                >
                    <option value="name">ترتيب حسب الاسم</option>
                    <option value="stock">ترتيب حسب المخزون</option>
                    <option value="value">ترتيب حسب القيمة</option>
                    <option value="category">ترتيب حسب الفئة</option>
                </select>
            </div>

            {/* تحذيرات المخزون */}
            {inventoryAlerts.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 text-sm">⚠️ تحذيرات المخزون</h3>
                        <span className="text-xs text-gray-500">{inventoryAlerts.length} تحذير</span>
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
                                    if (item) {
                                        handleRestock(item);
                                    }
                                }}
                                className="text-xs bg-white px-3 py-1 rounded-lg font-bold hover:opacity-80"
                            >
                                إضافة مخزون
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* تحليل استهلاك العلف */}
            {activeBatch && feedConsumptionAnalysis.totalFeed > 0 && (
                <Card>
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-3">
                        <BarChart3 size={18} className="text-green-500" /> تحليل استهلاك العلف
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">إجمالي الاستهلاك:</span>
                            <span className="font-bold text-green-600">
                                {formatNumber(feedConsumptionAnalysis.totalFeed)} كجم
                            </span>
                        </div>
                        {Object.entries(feedConsumptionAnalysis.feedByType).map(([type, amount]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{type}:</span>
                                <span className="font-medium">
                                    {formatNumber(amount)} كجم
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
                            <p>لم يتم العثور على عناصر في المخزون</p>
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
                            const isGeneralItem = !item.batchId; // عنصر عام (ليس مرتبط بدورة)
                            
                            return (
                                <Card key={item.id} className={`p-4 ${isExpired ? 'border-red-300 bg-red-50' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                    {item.category}
                                                </span>
                                                {isGeneralItem && (
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                                        عام
                                                    </span>
                                                )}
                                                {!isGeneralItem && activeBatch && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded">
                                                        {activeBatch.name}
                                                    </span>
                                                )}
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
                                                {item.expiryDate && ` • الانتهاء: ${new Date(item.expiryDate).toLocaleDateString('ar-EG')}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${
                                                isExpired ? 'text-red-600' : 
                                                isLowStock ? 'text-yellow-600' : 
                                                'text-blue-600'
                                            }`}>
                                                {formatNumber(item.currentStock)} {item.unit}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {itemValue > 0 ? `${formatNumber(itemValue)} ج` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* شريط مستوى المخزون */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>المخزون الحالي</span>
                                            <span>نقطة إعادة الطلب: {item.minStock || 0}</span>
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
                                                className="text-red-500 hover:text-red-600 p-1"
                                                title="استهلاك"
                                            >
                                                <ArrowDownCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-green-500 hover:text-green-600 p-1"
                                                title="إضافة مخزون"
                                            >
                                                <ArrowUpCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('عنصر مخزون', () => 
                                                    setInventoryItems(inventoryItems.filter(i => i.id !== item.id))
                                                )}
                                                className="text-gray-500 hover:text-gray-600 p-1"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {isLowStock && !isExpired && (
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-lg font-bold"
                                            >
                                                <ArrowUpCircle size={12} className="inline mr-1" /> إضافة
                                            </button>
                                        )}
                                        {isExpired && (
                                            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold">
                                                ⚠️ منتهي
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* نموذج إضافة/تعديل */}
            {view === 'new' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">
                        {editingItem ? 'تعديل عنصر المخزون' : 'إضافة عنصر جديد'}
                    </h3>
                    
                    {activeBatch && (
                        <div className="mb-3 p-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                            ⓘ هذا العنصر سيتم إضافته للدورة الحالية: <strong>{activeBatch.name}</strong>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">اسم العنصر *</label>
                            <input
                                type="text"
                                value={newItem.name}
                                onChange={e => setNewItem({...newItem, name: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="مثال: علف بادي 23%"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الفئة</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newItem.category}
                                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                                >
                                    {INVENTORY_CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الوحدة</label>
                                <input
                                    type="text"
                                    value={newItem.unit}
                                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="كجم، لتر، علبة..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">المخزون الحالي</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={newItem.currentStock}
                                    onChange={e => setNewItem({...newItem, currentStock: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الحد الأدنى</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={newItem.minStock}
                                    onChange={e => setNewItem({...newItem, minStock: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="نقطة إعادة الطلب"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">التكلفة لكل وحدة (ج)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.costPerUnit}
                                    onChange={e => setNewItem({...newItem, costPerUnit: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="سعر الوحدة"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">تاريخ الانتهاء</label>
                                <input
                                    type="date"
                                    value={newItem.expiryDate}
                                    onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">المورد</label>
                            <input
                                type="text"
                                value={newItem.supplier}
                                onChange={e => setNewItem({...newItem, supplier: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="اسم المورد"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">ملاحظات</label>
                            <textarea
                                value={newItem.notes}
                                onChange={e => setNewItem({...newItem, notes: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="معلومات إضافية"
                                rows="2"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        <Button 
                            onClick={saveItem} 
                            className="flex-1"
                        >
                            {editingItem ? 'حفظ التعديلات' : 'إضافة العنصر'}
                        </Button>
                        <Button 
                            onClick={() => {
                                resetForm();
                                setView('list');
                            }} 
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            إلغاء
                        </Button>
                    </div>
                </Card>
            )}

            {/* نافذة الاستهلاك */}
            <Modal 
                isOpen={consumptionModal} 
                onClose={() => setConsumptionModal(false)} 
                title={`استهلاك - ${selectedItem?.name}`}
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDownCircle className="text-red-600" size={20} />
                                <p className="text-sm text-red-800 font-bold">خصم من المخزون</p>
                            </div>
                            <p className="text-sm text-gray-700">
                                المخزون المتاح: <span className="font-bold text-red-600">
                                    {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
                                </span>
                            </p>
                            {selectedItem.costPerUnit && (
                                <p className="text-sm text-gray-700 mt-1">
                                    التكلفة لكل وحدة: <span className="font-bold">
                                        {selectedItem.costPerUnit} ج
                                    </span>
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">الكمية للاستهلاك</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={consumptionAmount}
                                onChange={e => setConsumptionAmount(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder={`أدخل الكمية (${selectedItem.unit})`}
                            />
                        </div>
                        
                        {consumptionAmount && selectedItem.costPerUnit && (
                            <div className="bg-red-100 p-3 rounded-lg">
                                <p className="text-sm text-red-800">
                                    التكلفة الإجمالية: <span className="font-bold">
                                        {formatNumber(Number(consumptionAmount) * selectedItem.costPerUnit)} ج
                                    </span>
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    المخزون بعد الخصم: {formatNumber(selectedItem.currentStock - Number(consumptionAmount))} {selectedItem.unit}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={saveConsumption} 
                                className="flex-1 bg-red-500 hover:bg-red-600"
                            >
                                <ArrowDownCircle size={16} className="mr-2" /> تأكيد الاستهلاك
                            </Button>
                            <Button 
                                onClick={() => setConsumptionModal(false)} 
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* نافذة إضافة المخزون */}
            <Modal 
                isOpen={restockModal} 
                onClose={() => setRestockModal(false)} 
                title={`إضافة مخزون - ${selectedItem?.name}`}
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpCircle className="text-green-600" size={20} />
                                <p className="text-sm text-green-800 font-bold">إضافة إلى المخزون</p>
                            </div>
                            <p className="text-sm text-gray-700">
                                المخزون الحالي: <span className="font-bold text-green-600">
                                    {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
                                </span>
                            </p>
                            {selectedItem.costPerUnit && (
                                <p className="text-sm text-gray-700 mt-1">
                                    التكلفة لكل وحدة: <span className="font-bold">
                                        {selectedItem.costPerUnit} ج
                                    </span>
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">الكمية للإضافة</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={restockAmount}
                                onChange={e => setRestockAmount(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder={`أدخل الكمية (${selectedItem.unit})`}
                            />
                        </div>
                        
                        {restockAmount && selectedItem.costPerUnit && (
                            <div className="bg-green-100 p-3 rounded-lg">
                                <p className="text-sm text-green-800">
                                    التكلفة الإجمالية: <span className="font-bold">
                                        {formatNumber(Number(restockAmount) * selectedItem.costPerUnit)} ج
                                    </span>
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    المخزون بعد الإضافة: {formatNumber(selectedItem.currentStock + Number(restockAmount))} {selectedItem.unit}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={saveRestock} 
                                className="flex-1 bg-green-500 hover:bg-green-600"
                            >
                                <ArrowUpCircle size={16} className="mr-2" /> تأكيد الإضافة
                            </Button>
                            <Button 
                                onClick={() => setRestockModal(false)} 
                                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                                إلغاء
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* تقرير المخزون */}
            <Modal 
                isOpen={showReport} 
                onClose={() => setShowReport(false)} 
                title="تقرير المخزون"
                size="lg"
            >
                <InventoryReport 
                    inventoryItems={filteredItems}
                    activeBatch={activeBatch}
                    shareViaWhatsapp={shareViaWhatsapp}
                />
            </Modal>
        </div>
    );
};

export default InventoryManager;
