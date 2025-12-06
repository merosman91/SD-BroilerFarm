// components/Financials.jsx
import React, { useState, useEffect } from 'react';
import { 
    DollarSign, TrendingUp, TrendingDown, Receipt, 
    ShoppingCart, Truck, User, Package, Calendar,
    Edit2, Trash2, Filter, Download, FileText,
    PieChart, BarChart3, TrendingDown as TrendingDownIcon,
    TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import { formatDate, formatNumber, formatCurrency, calculateTotalRevenue } from '../utils/helpers';

const Financials = ({ 
    activeBatch, 
    sales, 
    setSales, 
    expenses, 
    setExpenses, 
    showNotify,
    handleDelete
}) => {
    const [view, setView] = useState('sales');
    const [newSale, setNewSale] = useState({ 
        buyer: '', 
        count: '', 
        weight: '', 
        price: '', 
        date: new Date().toISOString().split('T')[0],
        notes: '',
        paymentMethod: 'نقدي',
        type: 'طائر حي',
        unit: 'كجم'
    });
    const [newExpense, setNewExpense] = useState({ 
        item: '', 
        cost: '', 
        date: new Date().toISOString().split('T')[0],
        category: 'علف',
        quantity: '',
        unit: 'كجم',
        notes: '',
        supplier: ''
    });
    const [editingSale, setEditingSale] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showReport, setShowReport] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    if (!activeBatch) {
        return (
            <div className="text-center py-10">
                <DollarSign className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">ابدأ دورة جديدة لمتابعة المالية</p>
            </div>
        );
    }

    const currentSales = sales.filter(x => x.batchId === activeBatch.id);
    const currentExpenses = expenses.filter(x => x.batchId === activeBatch.id);

    // فلترة المبيعات
    const filteredSales = currentSales.filter(sale => {
        if (searchTerm && !sale.buyer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterType !== 'all' && sale.type !== filterType) return false;
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // فلترة المصروفات
    const filteredExpenses = currentExpenses.filter(expense => {
        if (searchTerm && !expense.item.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
        return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // إحصائيات مالية
    const financialStats = {
        totalSales: currentSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
        totalExpenses: currentExpenses.reduce((sum, expense) => sum + Number(expense.cost || 0), 0),
        totalWeight: currentSales.reduce((sum, sale) => sum + Number(sale.weight || 0), 0),
        totalCount: currentSales.reduce((sum, sale) => sum + Number(sale.count || 0), 0),
        avgPrice: currentSales.length > 0 
            ? currentSales.reduce((sum, sale) => sum + Number(sale.price || 0), 0) / currentSales.length 
            : 0,
        profit: calculateTotalRevenue(currentSales) - currentExpenses.reduce((sum, e) => sum + Number(e.cost || 0), 0)
    };

    // حساب التكلفة لكل كيلو
    const costPerKg = financialStats.totalWeight > 0 
        ? financialStats.totalExpenses / financialStats.totalWeight 
        : 0;

    const saveSale = () => {
        const errors = [];
        
        if (!newSale.buyer) errors.push("اسم المشتري مطلوب");
        if (!newSale.price || isNaN(Number(newSale.price))) errors.push("السعر يجب أن يكون رقم صحيح");
        if (!newSale.count && !newSale.weight) errors.push("يجب إدخال العدد أو الوزن");
        
        if (errors.length > 0) {
            errors.forEach(error => showNotify(`✗ ${error}`));
            return;
        }

        const weight = Number(newSale.weight || (Number(newSale.count) * 1.5)); // تقدير الوزن إذا لم يتم إدخاله
        const count = Number(newSale.count || Math.round(weight / 1.5)); // تقدير العدد إذا لم يتم إدخاله
        const total = weight * Number(newSale.price);

        const saleToSave = {
            ...newSale,
            id: editingSale ? editingSale.id : Date.now(),
            batchId: activeBatch.id,
            weight,
            count,
            total,
            date: newSale.date,
            unitPrice: Number(newSale.price),
            notes: newSale.notes || ''
        };

        if (editingSale) {
            setSales(sales.map(s => s.id === editingSale.id ? saleToSave : s));
            showNotify("تم تحديث عملية البيع ✏️");
        } else {
            setSales([...sales, saleToSave]);
            showNotify("تم حفظ عملية البيع ✅");
        }

        resetSaleForm();
    };

    const saveExpense = () => {
        const errors = [];
        
        if (!newExpense.item) errors.push("اسم البند مطلوب");
        if (!newExpense.cost || isNaN(Number(newExpense.cost)) || Number(newExpense.cost) <= 0) {
            errors.push("التكلفة يجب أن تكون رقم موجب");
        }
        
        if (errors.length > 0) {
            errors.forEach(error => showNotify(`✗ ${error}`));
            return;
        }

        const expenseToSave = {
            ...newExpense,
            id: editingExpense ? editingExpense.id : Date.now(),
            batchId: activeBatch.id,
            cost: Number(newExpense.cost),
            quantity: newExpense.quantity ? Number(newExpense.quantity) : null,
            unit: newExpense.unit || 'كجم',
            notes: newExpense.notes || '',
            date: newExpense.date
        };

        if (editingExpense) {
            setExpenses(expenses.map(e => e.id === editingExpense.id ? expenseToSave : e));
            showNotify("تم تحديث المصروف ✏️");
        } else {
            setExpenses([...expenses, expenseToSave]);
            showNotify("تم حفظ المصروف ✅");
        }

        resetExpenseForm();
    };

    const resetSaleForm = () => {
        setNewSale({ 
            buyer: '', 
            count: '', 
            weight: '', 
            price: '', 
            date: new Date().toISOString().split('T')[0],
            notes: '',
            paymentMethod: 'نقدي',
            type: 'طائر حي',
            unit: 'كجم'
        });
        setEditingSale(null);
    };

    const resetExpenseForm = () => {
        setNewExpense({ 
            item: '', 
            cost: '', 
            date: new Date().toISOString().split('T')[0],
            category: 'علف',
            quantity: '',
            unit: 'كجم',
            notes: '',
            supplier: ''
        });
        setEditingExpense(null);
    };

    const handleEditSale = (sale) => {
        setEditingSale(sale);
        setNewSale({
            buyer: sale.buyer,
            count: sale.count,
            weight: sale.weight,
            price: sale.unitPrice || sale.price,
            date: sale.date,
            notes: sale.notes || '',
            paymentMethod: sale.paymentMethod || 'نقدي',
            type: sale.type || 'طائر حي',
            unit: sale.unit || 'كجم'
        });
        setView('sales');
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            item: expense.item,
            cost: expense.cost,
            date: expense.date,
            category: expense.category || 'علف',
            quantity: expense.quantity || '',
            unit: expense.unit || 'كجم',
            notes: expense.notes || '',
            supplier: expense.supplier || ''
        });
        setView('expenses');
    };

    // فئات المصروفات
    const expenseCategories = [
        'علف', 'أدوية', 'مستلزمات', 'عمالة', 'كهرباء وماء',
        'نقل', 'صيانة', 'إيجار', 'أخرى'
    ];

    // أنواع المبيعات
    const saleTypes = [
        'طائر حي', 'ذبيحة', 'بيض', 'سماد', 'أخرى'
    ];

    // طرق الدفع
    const paymentMethods = [
        'نقدي', 'شيك', 'حوالة بنكية', 'آجل'
    ];

    const generateFinancialReport = () => {
        const report = {
            batchName: activeBatch.name,
            date: new Date().toLocaleDateString('ar-SA'),
            stats: financialStats,
            sales: currentSales,
            expenses: currentExpenses,
            summary: {
                totalRevenue: financialStats.totalSales,
                totalCost: financialStats.totalExpenses,
                netProfit: financialStats.profit,
                profitMargin: financialStats.totalSales > 0 
                    ? (financialStats.profit / financialStats.totalSales * 100).toFixed(2) 
                    : 0
            }
        };
        
        return report;
    };

    const exportReport = () => {
        const report = generateFinancialReport();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const a = document.createElement('a'); 
        a.href = dataStr; 
        a.download = `financial_report_${activeBatch.name}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); 
        a.click(); 
        a.remove();
        showNotify("تم تصدير التقرير ✅");
    };

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* رأس الصفحة */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign size={24} /> الإدارة المالية
                        </h2>
                        <p className="text-xs opacity-80">إدارة المبيعات والمصروفات للدورة: {activeBatch.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowReport(true)}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                            title="تقرير مالي"
                        >
                            <FileText size={20} />
                        </button>
                        <button 
                            onClick={exportReport}
                            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                            title="تصدير التقرير"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">إجمالي المبيعات</p>
                        <p className="font-bold text-lg">{formatNumber(financialStats.totalSales)} ج</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">إجمالي المصروفات</p>
                        <p className="font-bold text-lg">{formatNumber(financialStats.totalExpenses)} ج</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">صافي الربح</p>
                        <p className={`font-bold text-lg ${financialStats.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {formatNumber(financialStats.profit)} ج
                        </p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                        <p className="text-xs opacity-80">الوزن المباع</p>
                        <p className="font-bold text-lg">{formatNumber(financialStats.totalWeight)} كجم</p>
                    </div>
                </div>
            </div>

            {/* التبويبات */}
            <div className="flex bg-gray-200 p-1 rounded-xl">
                <button 
                    onClick={() => { setView('sales'); resetSaleForm(); }} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${
                        view === 'sales' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
                    }`}
                >
                    <TrendingUp size={14} /> المبيعات
                </button>
                <button 
                    onClick={() => { setView('expenses'); resetExpenseForm(); }} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${
                        view === 'expenses' ? 'bg-white shadow text-rose-600' : 'text-gray-500'
                    }`}
                >
                    <TrendingDown size={14} /> المصروفات
                </button>
                <button 
                    onClick={() => setView('analytics')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${
                        view === 'analytics' ? 'bg-white shadow text-blue-600' : 'text-gray-500'
                    }`}
                >
                    <PieChart size={14} /> التحليل
                </button>
            </div>

            {/* شريط البحث */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder={`بحث في ${view === 'sales' ? 'المبيعات' : 'المصروفات'}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pr-10 bg-white border border-gray-200 rounded-xl text-sm"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {view === 'sales' && (
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="all">جميع الأنواع</option>
                        {saleTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                )}
                {view === 'expenses' && (
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="p-3 bg-white border border-gray-200 rounded-xl text-sm"
                    >
                        <option value="all">جميع الفئات</option>
                        {expenseCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* نموذج المبيعات */}
            {view === 'sales' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">
                        {editingSale ? 'تعديل عملية البيع' : 'إضافة عملية بيع جديدة'}
                    </h3>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">اسم المشتري *</label>
                            <input
                                type="text"
                                value={newSale.buyer}
                                onChange={e => setNewSale({...newSale, buyer: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="اسم المشتري أو الشركة"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">نوع البيع</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newSale.type}
                                    onChange={e => setNewSale({...newSale, type: e.target.value})}
                                >
                                    {saleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">طريقة الدفع</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newSale.paymentMethod}
                                    onChange={e => setNewSale({...newSale, paymentMethod: e.target.value})}
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method} value={method}>{method}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">عدد الطيور</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newSale.count}
                                    onChange={e => setNewSale({...newSale, count: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="عدد الطيور المباعة"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الوزن (كجم)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={newSale.weight}
                                    onChange={e => setNewSale({...newSale, weight: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="الوزن الإجمالي"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">سعر الكيلو *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={newSale.price}
                                    onChange={e => setNewSale({...newSale, price: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="سعر الكيلو جرام"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">التاريخ</label>
                                <input
                                    type="date"
                                    value={newSale.date}
                                    onChange={e => setNewSale({...newSale, date: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">ملاحظات</label>
                            <textarea
                                value={newSale.notes}
                                onChange={e => setNewSale({...newSale, notes: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="أي ملاحظات إضافية..."
                                rows="2"
                            />
                        </div>
                        
                        {/* ملخص العملية */}
                        {newSale.price > 0 && (newSale.weight > 0 || newSale.count > 0) && (
                            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                <h4 className="font-bold text-emerald-700 text-sm mb-2">ملخص العملية:</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-gray-600">الوزن الإجمالي:</p>
                                        <p className="font-bold text-emerald-700">
                                            {newSale.weight || (newSale.count * 1.5).toFixed(1)} كجم
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">القيمة الإجمالية:</p>
                                        <p className="font-bold text-emerald-700">
                                            {formatNumber(
                                                (newSale.weight || (newSale.count * 1.5)) * newSale.price
                                            )} ج
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <Button onClick={saveSale} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                                {editingSale ? 'حفظ التعديلات' : 'حفظ عملية البيع'}
                            </Button>
                            {editingSale && (
                                <Button 
                                    onClick={resetSaleForm}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    إلغاء التعديل
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* نموذج المصروفات */}
            {view === 'expenses' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">
                        {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
                    </h3>
                    
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">اسم البند *</label>
                            <input
                                type="text"
                                value={newExpense.item}
                                onChange={e => setNewExpense({...newExpense, item: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="اسم البند أو الخدمة"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الفئة</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                                >
                                    {expenseCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">المورد</label>
                                <input
                                    type="text"
                                    value={newExpense.supplier}
                                    onChange={e => setNewExpense({...newExpense, supplier: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="اسم المورد أو الشركة"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الكمية</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newExpense.quantity}
                                    onChange={e => setNewExpense({...newExpense, quantity: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="الكمية"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">الوحدة</label>
                                <input
                                    type="text"
                                    value={newExpense.unit}
                                    onChange={e => setNewExpense({...newExpense, unit: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="كجم، لتر، علبة..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">التكلفة *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newExpense.cost}
                                    onChange={e => setNewExpense({...newExpense, cost: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    placeholder="التكلفة الإجمالية"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">التاريخ</label>
                                <input
                                    type="date"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">ملاحظات</label>
                            <textarea
                                value={newExpense.notes}
                                onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                placeholder="أي ملاحظات إضافية..."
                                rows="2"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <Button onClick={saveExpense} className="flex-1 bg-rose-500 hover:bg-rose-600">
                                {editingExpense ? 'حفظ التعديلات' : 'حفظ المصروف'}
                            </Button>
                            {editingExpense && (
                                <Button 
                                    onClick={resetExpenseForm}
                                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                                >
                                    إلغاء التعديل
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* تحليل مالي */}
            {view === 'analytics' && (
                <Card>
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-4">
                        <PieChart size={18} className="text-blue-500" /> التحليل المالي
                    </h3>
                    
                    <div className="space-y-4">
                        {/* إحصائيات رئيسية */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-800 font-bold mb-1">إجمالي المبيعات</p>
                                        <p className="text-lg font-bold text-emerald-700">
                                            {formatNumber(financialStats.totalSales)} ج
                                        </p>
                                    </div>
                                    <TrendingUpIcon className="text-emerald-500" size={20} />
                                </div>
                            </div>
                            
                            <div className="bg-rose-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-rose-800 font-bold mb-1">إجمالي المصروفات</p>
                                        <p className="text-lg font-bold text-rose-700">
                                            {formatNumber(financialStats.totalExpenses)} ج
                                        </p>
                                    </div>
                                    <TrendingDownIcon className="text-rose-500" size={20} />
                                </div>
                            </div>
                        </div>
                        
                        {/* تحليل الربح */}
                        <div className={`p-3 rounded-lg ${financialStats.profit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold mb-1">
                                        {financialStats.profit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                                    </p>
                                    <p className={`text-xl font-bold ${financialStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatNumber(financialStats.profit)} ج
                                    </p>
                                    {financialStats.totalSales > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            هامش الربح: {(financialStats.profit / financialStats.totalSales * 100).toFixed(1)}%
                                        </p>
                                    )}
                                </div>
                                {financialStats.profit >= 0 ? (
                                    <TrendingUpIcon className="text-green-500" size={24} />
                                ) : (
                                    <TrendingDownIcon className="text-red-500" size={24} />
                                )}
                            </div>
                        </div>
                        
                        {/* تكلفة الكيلو */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-blue-800 font-bold mb-1">متوسط تكلفة الكيلو</p>
                                    <p className="text-lg font-bold text-blue-700">
                                        {formatNumber(costPerKg)} ج/كجم
                                    </p>
                                    {financialStats.avgPrice > 0 && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            سعر البيع: {formatNumber(financialStats.avgPrice)} ج/كجم
                                        </p>
                                    )}
                                </div>
                                <Scale className="text-blue-500" size={20} />
                            </div>
                        </div>
                        
                        {/* توزيع المصروفات حسب الفئة */}
                        <div>
                            <h4 className="font-bold text-gray-700 text-sm mb-2">توزيع المصروفات حسب الفئة:</h4>
                            <div className="space-y-2">
                                {expenseCategories.map(category => {
                                    const categoryTotal = currentExpenses
                                        .filter(e => e.category === category)
                                        .reduce((sum, e) => sum + Number(e.cost || 0), 0);
                                    
                                    if (categoryTotal === 0) return null;
                                    
                                    const percentage = (categoryTotal / financialStats.totalExpenses * 100).toFixed(1);
                                    
                                    return (
                                        <div key={category} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{category}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">
                                                    {formatNumber(categoryTotal)} ج ({percentage}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* قائمة المعاملات */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">
                        {view === 'sales' ? 'عمليات البيع' : 'المصروفات'}
                    </h3>
                    <span className="text-xs text-gray-500">
                        {view === 'sales' ? filteredSales.length : filteredExpenses.length} عنصر
                    </span>
                </div>
                
                {(view === 'sales' ? filteredSales : filteredExpenses).length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        {view === 'sales' ? (
                            <ShoppingCart className="mx-auto text-gray-300 mb-3" size={32} />
                        ) : (
                            <Receipt className="mx-auto text-gray-300 mb-3" size={32} />
                        )}
                        <p className="text-gray-500">
                            {view === 'sales' ? 'لا توجد عمليات بيع' : 'لا توجد مصروفات'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {view === 'sales' ? 'أضف أول عملية بيع' : 'أضف أول مصروف'}
                        </p>
                    </div>
                ) : (
                    (view === 'sales' ? filteredSales : filteredExpenses).map(item => (
                        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">
                                            {view === 'sales' ? item.buyer : item.item}
                                        </h3>
                                        {view === 'sales' ? (
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded">
                                                {item.type}
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-600 rounded">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(item.date)}
                                        {view === 'sales' && item.paymentMethod && ` • ${item.paymentMethod}`}
                                        {view === 'expenses' && item.supplier && ` • ${item.supplier}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${view === 'sales' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formatNumber(view === 'sales' ? item.total : item.cost)} ج
                                    </p>
                                    {view === 'sales' && (
                                        <p className="text-xs text-gray-500">
                                            {item.weight} كجم × {item.unitPrice} ج
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {view === 'sales' && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="text-xs text-gray-600">
                                        <span className="font-bold">العدد:</span> {formatNumber(item.count || 0)}
                                    </div>
                                    <div className="text-xs text-gray-600 text-right">
                                        <span className="font-bold">الوزن:</span> {formatNumber(item.weight || 0)} كجم
                                    </div>
                                </div>
                            )}
                            
                            {view === 'expenses' && item.quantity && (
                                <div className="text-xs text-gray-600 mb-2">
                                    <span className="font-bold">الكمية:</span> {item.quantity} {item.unit}
                                </div>
                            )}
                            
                            {item.notes && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-xs text-gray-600 italic">"{item.notes}"</p>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-100">
                                <button 
                                    onClick={() => view === 'sales' ? handleEditSale(item) : handleEditExpense(item)}
                                    className="text-blue-500 hover:text-blue-600 p-1"
                                    title="تعديل"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(
                                        view === 'sales' ? 'عملية بيع' : 'مصروف',
                                        () => {
                                            if (view === 'sales') {
                                                setSales(sales.filter(s => s.id !== item.id));
                                            } else {
                                                setExpenses(expenses.filter(e => e.id !== item.id));
                                            }
                                        }
                                    )}
                                    className="text-red-500 hover:text-red-600 p-1"
                                    title="حذف"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* نافذة التقرير المالي */}
            <Modal 
                isOpen={showReport} 
                onClose={() => setShowReport(false)} 
                title="التقرير المالي"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-4 text-white">
                        <h3 className="font-bold text-lg mb-2">التقرير المالي للدورة</h3>
                        <p className="text-sm opacity-80">{activeBatch.name}</p>
                        <p className="text-xs opacity-60">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-emerald-200 p-3 rounded-lg">
                            <p className="text-xs text-emerald-700 font-bold mb-1">إجمالي الإيرادات</p>
                            <p className="text-xl font-bold text-emerald-800">
                                {formatNumber(financialStats.totalSales)} ج
                            </p>
                        </div>
                        
                        <div className="bg-white border border-rose-200 p-3 rounded-lg">
                            <p className="text-xs text-rose-700 font-bold mb-1">إجمالي التكاليف</p>
                            <p className="text-xl font-bold text-rose-800">
                                {formatNumber(financialStats.totalExpenses)} ج
                            </p>
                        </div>
                        
                        <div className="bg-white border border-blue-200 p-3 rounded-lg col-span-2">
                            <p className="text-xs text-blue-700 font-bold mb-1">صافي الربح/الخسارة</p>
                            <p className={`text-2xl font-bold ${financialStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatNumber(financialStats.profit)} ج
                            </p>
                            {financialStats.totalSales > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    هامش الربح: {(financialStats.profit / financialStats.totalSales * 100).toFixed(2)}%
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">الوزن المباع</p>
                            <p className="font-bold text-gray-800">{formatNumber(financialStats.totalWeight)} كجم</p>
                        </div>
                        
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">متوسط سعر الكيلو</p>
                            <p className="font-bold text-gray-800">{formatNumber(financialStats.avgPrice)} ج</p>
                        </div>
                        
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">عدد عمليات البيع</p>
                            <p className="font-bold text-gray-800">{currentSales.length}</p>
                        </div>
                        
                        <div className="p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-600">عدد المصروفات</p>
                            <p className="font-bold text-gray-800">{currentExpenses.length}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button onClick={exportReport} className="flex-1">
                            <Download size={16} className="mr-2" /> تصدير التقرير
                        </Button>
                        <Button 
                            onClick={() => setShowReport(false)} 
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            إغلاق
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Financials;
