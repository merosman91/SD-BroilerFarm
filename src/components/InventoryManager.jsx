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
        notes: ''
    });
    const [editingItem, setEditingItem] = useState(null);
    const [consumptionModal, setConsumptionModal] = useState(false);
    const [restockModal, setRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [consumptionAmount, setConsumptionAmount] = useState('');
    const [restockAmount, setRestockAmount] = useState('');
    const [showReport, setShowReport] = useState(false);

    // إحصائيات المخزون
    const inventoryStats = calculateInventoryStats(inventoryItems);
    
    // تحذيرات المخزون
    const inventoryAlerts = generateInventoryAlerts(inventoryItems);

    // فلترة العناصر
    const filteredItems = inventoryItems
        .filter(item => {
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

    // إضافة مخزون العلف التلقائي
    useEffect(() => {
        if (inventoryItems.length === 0) {
            const hasFeed = inventoryItems.some(item => item.category === 'أعلاف');
            if (!hasFeed) {
                const initialFeed = FEED_TYPES.map(feed => ({
                    id: Date.now() + Math.random(),
                    name: feed.name,
                    category: 'أعلاف',
                    unit: 'كجم',
                    currentStock: 1000,
                    minStock: 200,
                    costPerUnit: feed.pricePerKg,
                    supplier: 'شركة الأعلاف الوطنية',
                    notes: `علف ${feed.name} - بروتين ${feed.protein}%`,
                    code: feed.code,
                    isFeed: true
                }));
                setInventoryItems(initialFeed);
                showNotify("Initial feed inventory created");
            }
        }
    }, []);

    const saveItem = () => {
        if (!newItem.name) {
            return showNotify("Item name is required");
        }

        const itemToSave = {
            ...newItem,
            id: editingItem ? editingItem.id : Date.now(),
            batchId: activeBatch?.id || null,
            lastUpdated: new Date().toISOString().split('T')[0],
            currentStock: Number(newItem.currentStock) || 0,
            minStock: Number(newItem.minStock) || 0,
            costPerUnit: Number(newItem.costPerUnit) || 0
        };

        if (editingItem) {
            setInventoryItems(prev => 
                prev.map(item => item.id === editingItem.id ? itemToSave : item)
            );
            showNotify("Item updated ✅");
        } else {
            setInventoryItems(prev => [...prev, itemToSave]);
            showNotify("Item added ✅");
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

    // استهلاك المخزون (طرح)
    const handleConsumption = (item) => {
        setSelectedItem(item);
        setConsumptionAmount('');
        setConsumptionModal(true);
    };

    const saveConsumption = () => {
        if (!consumptionAmount || isNaN(consumptionAmount) || consumptionAmount <= 0) {
            return showNotify("Please enter a valid quantity");
        }

        const amount = Number(consumptionAmount);
        const item = selectedItem;

        if (amount > item.currentStock) {
            return showNotify(`Insufficient stock. Available: ${item.currentStock} ${item.unit}`);
        }

        // الطرح من المخزون
        const updatedItems = inventoryItems.map(invItem => 
            invItem.id === item.id ? 
            { 
                ...invItem, 
                currentStock: invItem.currentStock - amount // الطرح
            } : 
            invItem
        );
        
        setInventoryItems(updatedItems);
        showNotify(`✓ Consumed ${amount} ${item.unit} of ${item.name}`);
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
        if (!restockAmount || isNaN(restockAmount) || restockAmount <= 0) {
            return showNotify("Please enter a valid quantity");
        }

        const amount = Number(restockAmount);
        const item = selectedItem;

        // الجمع إلى المخزون
        const updatedItems = inventoryItems.map(invItem => 
            invItem.id === item.id ? 
            { 
                ...invItem, 
                currentStock: invItem.currentStock + amount // الجمع
            } : 
            invItem
        );
        
        setInventoryItems(updatedItems);
        showNotify(`✓ Added ${amount} ${item.unit} to ${item.name}`);
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
            notes: ''
        });
        setEditingItem(null);
    };

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

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Package size={24} /> Inventory Management
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
                
                {/* الإحصائيات */}
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Total Items</p>
                        <p className="font-bold text-lg">{inventoryStats.totalItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Total Value</p>
                        <p className="font-bold text-lg">{formatNumber(inventoryStats.totalValue)} ج</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Low Stock</p>
                        <p className="font-bold text-lg text-yellow-300">{inventoryStats.lowStockItems}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">Feed Items</p>
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
                        placeholder="Search inventory..."
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

            {/* الفلاتر */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'all' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilter('low')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'low' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    <AlertTriangle size={12} className="inline mr-1" /> Low
                </button>
                <button 
                    onClick={() => setFilter('feed')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'feed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Feed
                </button>
                <button 
                    onClick={() => setFilter('medicine')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                        filter === 'medicine' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    Medicine
                </button>
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border-none"
                >
                    <option value="name">Sort by Name</option>
                    <option value="stock">Sort by Stock</option>
                    <option value="value">Sort by Value</option>
                    <option value="category">Sort by Category</option>
                </select>
            </div>

            {/* تحذيرات المخزون */}
            {inventoryAlerts.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 text-sm">⚠️ Inventory Alerts</h3>
                        <span className="text-xs text-gray-500">{inventoryAlerts.length} alerts</span>
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
                                Restock
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* تحليل استهلاك العلف */}
            {activeBatch && feedConsumptionAnalysis.totalFeed > 0 && (
                <Card>
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-3">
                        <BarChart3 size={18} className="text-green-500" /> Feed Consumption Analysis
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Consumption:</span>
                            <span className="font-bold text-green-600">
                                {formatNumber(feedConsumptionAnalysis.totalFeed)} kg
                            </span>
                        </div>
                        {Object.entries(feedConsumptionAnalysis.feedByType).map(([type, amount]) => (
                            <div key={type} className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{type}:</span>
                                <span className="font-medium">
                                    {formatNumber(amount)} kg
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
                            <p>No inventory items found</p>
                            <button 
                                onClick={() => setView('new')}
                                className="mt-3 text-orange-500 text-sm font-bold"
                            >
                                + Add First Item
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
                                                        Expired
                                                    </span>
                                                )}
                                                {isLowStock && !isExpired && (
                                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-600 rounded">
                                                        Low
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {item.supplier && `Supplier: ${item.supplier} • `}
                                                Unit: {item.unit}
                                                {item.expiryDate && ` • Expiry: ${new Date(item.expiryDate).toLocaleDateString('en-US')}`}
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
                                            <span>Current Stock</span>
                                            <span>Reorder Point: {item.minStock || 0}</span>
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
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleConsumption(item)}
                                                className="text-red-500 hover:text-red-600 p-1" // أحمر للاستهلاك
                                                title="Consume"
                                            >
                                                <ArrowDownCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-green-500 hover:text-green-600 p-1" // أخضر للإضافة
                                                title="Restock"
                                            >
                                                <ArrowUpCircle size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete('inventory item', () => 
                                                    setInventoryItems(inventoryItems.filter(i => i.id !== item.id))
                                                )}
                                                className="text-gray-500 hover:text-gray-600 p-1"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {isLowStock && !isExpired && (
                                            <button 
                                                onClick={() => handleRestock(item)}
                                                className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-lg font-bold" // أخضر
                                            >
                                                <ArrowUpCircle size={12} className="inline mr-1" /> Restock
                                            </button>
                                        )}
                                        {isExpired && (
                                            <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold">
                                                ⚠️ Expired
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
                        {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
                    </h3>
                    
                    <Input 
                        label="Item Name" 
                        value={newItem.name} 
                        onChange={e => setNewItem({...newItem, name: e.target.value})} 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold text-gray-400 mb-1 block">Category</label>
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
                            label="Unit" 
                            value={newItem.unit} 
                            onChange={e => setNewItem({...newItem, unit: e.target.value})} 
                            placeholder="kg, liter, box..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="Current Stock" 
                            type="number" 
                            value={newItem.currentStock} 
                            onChange={e => setNewItem({...newItem, currentStock: e.target.value})} 
                        />
                        <Input 
                            label="Minimum Stock" 
                            type="number" 
                            value={newItem.minStock} 
                            onChange={e => setNewItem({...newItem, minStock: e.target.value})} 
                            placeholder="Reorder point"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            label="Cost per Unit" 
                            type="number" 
                            value={newItem.costPerUnit} 
                            onChange={e => setNewItem({...newItem, costPerUnit: e.target.value})} 
                            placeholder="Price per unit"
                        />
                        <Input 
                            label="Expiry Date" 
                            type="date" 
                            value={newItem.expiryDate} 
                            onChange={e => setNewItem({...newItem, expiryDate: e.target.value})} 
                        />
                    </div>
                    
                    <Input 
                        label="Supplier" 
                        value={newItem.supplier} 
                        onChange={e => setNewItem({...newItem, supplier: e.target.value})} 
                        placeholder="Supplier name"
                    />
                    
                    <Input 
                        label="Notes" 
                        value={newItem.notes} 
                        onChange={e => setNewItem({...newItem, notes: e.target.value})} 
                        placeholder="Additional information"
                    />
                    
                    <div className="flex gap-2 mt-4">
                        <Button 
                            onClick={saveItem} 
                            className="flex-1"
                            variant={editingItem ? "primary" : "success"}
                        >
                            {editingItem ? 'Save Changes' : 'Add Item'}
                        </Button>
                        <Button 
                            onClick={() => {
                                resetForm();
                                setView('list');
                            }} 
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {/* نافذة الاستهلاك */}
            <Modal 
                isOpen={consumptionModal} 
                onClose={() => setConsumptionModal(false)} 
                title={`Consume - ${selectedItem?.name}`}
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDownCircle className="text-red-600" size={20} />
                                <p className="text-sm text-red-800 font-bold">Deduct from Inventory</p>
                            </div>
                            <p className="text-sm text-gray-700">
                                Available stock: <span className="font-bold text-red-600">
                                    {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
                                </span>
                            </p>
                            {selectedItem.costPerUnit && (
                                <p className="text-sm text-gray-700 mt-1">
                                    Cost per unit: <span className="font-bold">
                                        {selectedItem.costPerUnit} ج
                                    </span>
                                </p>
                            )}
                        </div>
                        
                        <Input 
                            label="Quantity to Consume" 
                            type="number" 
                            value={consumptionAmount} 
                            onChange={e => setConsumptionAmount(e.target.value)} 
                            placeholder={`Enter quantity (${selectedItem.unit})`}
                        />
                        
                        {consumptionAmount && selectedItem.costPerUnit && (
                            <div className="bg-red-100 p-3 rounded-lg">
                                <p className="text-sm text-red-800">
                                    Total cost: <span className="font-bold">
                                        {formatNumber(consumptionAmount * selectedItem.costPerUnit)} ج
                                    </span>
                                </p>
                                <p className="text-xs text-red-600 mt-1">
                                    Stock after: {formatNumber(selectedItem.currentStock - consumptionAmount)} {selectedItem.unit}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={saveConsumption} 
                                className="flex-1"
                                variant="danger" // أحمر
                            >
                                <ArrowDownCircle size={16} className="mr-2" /> Confirm Consumption
                            </Button>
                            <Button 
                                onClick={() => setConsumptionModal(false)} 
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* نافذة إضافة المخزون */}
            <Modal 
                isOpen={restockModal} 
                onClose={() => setRestockModal(false)} 
                title={`Restock - ${selectedItem?.name}`}
            >
                {selectedItem && (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpCircle className="text-green-600" size={20} />
                                <p className="text-sm text-green-800 font-bold">Add to Inventory</p>
                            </div>
                            <p className="text-sm text-gray-700">
                                Current stock: <span className="font-bold text-green-600">
                                    {formatNumber(selectedItem.currentStock)} {selectedItem.unit}
                                </span>
                            </p>
                            {selectedItem.costPerUnit && (
                                <p className="text-sm text-gray-700 mt-1">
                                    Cost per unit: <span className="font-bold">
                                        {selectedItem.costPerUnit} ج
                                    </span>
                                </p>
                            )}
                        </div>
                        
                        <Input 
                            label="Quantity to Add" 
                            type="number" 
                            value={restockAmount} 
                            onChange={e => setRestockAmount(e.target.value)} 
                            placeholder={`Enter quantity (${selectedItem.unit})`}
                        />
                        
                        {restockAmount && selectedItem.costPerUnit && (
                            <div className="bg-green-100 p-3 rounded-lg">
                                <p className="text-sm text-green-800">
                                    Total cost: <span className="font-bold">
                                        {formatNumber(restockAmount * selectedItem.costPerUnit)} ج
                                    </span>
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Stock after: {formatNumber(selectedItem.currentStock + Number(restockAmount))} {selectedItem.unit}
                                </p>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button 
                                onClick={saveRestock} 
                                className="flex-1"
                                variant="success" // أخضر
                            >
                                <ArrowUpCircle size={16} className="mr-2" /> Confirm Restock
                            </Button>
                            <Button 
                                onClick={() => setRestockModal(false)} 
                                variant="ghost"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* تقرير المخزون */}
            <Modal 
                isOpen={showReport} 
                onClose={() => setShowReport(false)} 
                title="Inventory Report"
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
