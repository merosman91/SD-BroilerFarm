import React, { useState } from 'react';
import { 
    Bird, Scale, Info, Package, AlertTriangle, 
    TrendingDown, TrendingUp, BarChart3, DollarSign,
    Users, Thermometer, Activity, PieChart,
    Calculator, Heart, AlertCircle, Target
} from 'lucide-react';
import { Button, Card, Modal, WeightChart, getDaysDifference } from '../UI';
import DeveloperInfo from './DeveloperInfo';
import InventoryReport from './InventoryReport';
import { 
    calculateFCR, 
    calculateEPEF, 
    calculateMortalityRate,
    calculateLivability,
    calculateBirdCost,
    formatNumber,
    formatCurrency
} from '../utils/helpers';

const Dashboard = ({ 
    activeBatch, 
    dailyLogs, 
    sales, 
    expenses, 
    vaccinations, 
    inventoryItems,
    setActiveTab,
    shareViaWhatsapp
}) => {
    const [showInfo, setShowInfo] = useState(false);
    const [showInventoryReport, setShowInventoryReport] = useState(false);

    if (!activeBatch) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-fade-in">
            <Bird size={64} className="text-gray-300 mb-4"/>
            <h2 className="text-xl font-bold text-gray-700">لا توجد دورة نشطة</h2>
            <p className="text-gray-500 mt-2">ابدأ دورة جديدة لمتابعة الإحصائيات</p>
            <Button onClick={() => setActiveTab('batches')} className="mt-4">
                بدء دورة جديدة
            </Button>
        </div>
    );

    // حساب مؤشرات الدورة
    const batchLogs = dailyLogs.filter(l => l.batchId === activeBatch.id);
    const totalDead = batchLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
    const mortalityRate = calculateMortalityRate(totalDead, activeBatch.initialCount);
    const livability = calculateLivability(totalDead, activeBatch.initialCount);
    const totalFeed = batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
    const age = getDaysDifference(activeBatch.startDate);
    
    const lastWeightLog = [...batchLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).find(l => l.avgWeight);
    const currentWeightGM = lastWeightLog ? Number(lastWeightLog.avgWeight) : 0;
    const currentWeightKG = currentWeightGM / 1000;
    const currentCount = activeBatch.initialCount - totalDead;
    const totalBiomass = currentCount * currentWeightKG;
    const fcr = calculateFCR(totalFeed, totalBiomass);

    const epef = calculateEPEF(currentWeightGM, livability, fcr, age);

    const batchSales = sales.filter(s => s.batchId === activeBatch.id)
        .reduce((sum, s) => sum + Number(s.total), 0);
    const batchExpenses = expenses.filter(e => e.batchId === activeBatch.id)
        .reduce((sum, e) => sum + Number(e.cost), 0);
    const dueVaccines = vaccinations.filter(v => 
        v.batchId === activeBatch.id && 
        v.status === 'pending' && 
        v.date <= new Date().toISOString().split('T')[0]
    );

    // حساب تكلفة الطائر الواحد
    const birdCost = calculateBirdCost(batchExpenses, activeBatch.initialCount);
    const totalCost = batchExpenses + (Number(birdCost) * activeBatch.initialCount);
    const profit = batchSales - totalCost;
    const profitPerBird = profit / (activeBatch.initialCount || 1);

    // تحليل بيانات الرسم البياني
    const chartData = batchLogs.filter(l => l.avgWeight).map(l => ({ 
        day: getDaysDifference(activeBatch.startDate) - 
            (getDaysDifference(activeBatch.startDate) - getDaysDifference(l.date)), 
        val: l.avgWeight 
    })).sort((a,b)=>a.day-b.day);

    // إحصائيات المخزون للدورة الحالية فقط
    const inventoryStats = {
        totalItems: inventoryItems.filter(item => !item.batchId || item.batchId === activeBatch.id).length,
        totalValue: inventoryItems
            .filter(item => !item.batchId || item.batchId === activeBatch.id)
            .reduce((sum, item) => sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0),
        lowStockItems: inventoryItems.filter(item => 
            (!item.batchId || item.batchId === activeBatch.id) &&
            item.currentStock <= item.minStock
        ).length,
        feedItems: inventoryItems.filter(item => 
            item.category === 'أعلاف' && 
            (!item.batchId || item.batchId === activeBatch.id)
        ).length,
        feedValue: inventoryItems
            .filter(item => item.category === 'أعلاف' && (!item.batchId || item.batchId === activeBatch.id))
            .reduce((sum, item) => sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0),
        feedConsumption: batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0)
    };

    // العثور على العناصر المنخفضة المخزون للدورة الحالية
    const lowStockItems = inventoryItems
        .filter(item => 
            (!item.batchId || item.batchId === activeBatch.id) &&
            item.currentStock <= item.minStock
        )
        .slice(0, 3);

    // تحليل استهلاك العلف حسب النوع
    const feedAnalysis = {};
    batchLogs.forEach(log => {
        if (log.feed && log.feedType) {
            if (!feedAnalysis[log.feedType]) {
                feedAnalysis[log.feedType] = 0;
            }
            feedAnalysis[log.feedType] += Number(log.feed);
        }
    });

    // متوسط درجة الحرارة
    const avgTemperature = batchLogs.filter(l => l.temp).reduce((sum, l) => sum + Number(l.temp), 0) / 
                          (batchLogs.filter(l => l.temp).length || 1);

    // تقييم أداء الدورة
    const getPerformanceStatus = () => {
        if (epef >= 350) return { color: 'text-green-600', status: 'ممتاز', icon: '⭐' };
        if (epef >= 300) return { color: 'text-blue-600', status: 'جيد جداً', icon: '👍' };
        if (epef >= 250) return { color: 'text-yellow-600', status: 'جيد', icon: '✅' };
        return { color: 'text-red-600', status: 'يحتاج تحسين', icon: '⚠️' };
    };

    const performance = getPerformanceStatus();

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* تنبيه التحصينات المستحقة */}
            {dueVaccines.length > 0 && (
                <div className="bg-purple-100 border-r-4 border-purple-600 p-3 rounded-l-xl shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-purple-800 text-sm">💉 تحصينات مستحقة اليوم</h3>
                        <p className="text-xs text-purple-700">{dueVaccines[0].name}</p>
                    </div>
                    <Button 
                        onClick={() => setActiveTab('health')} 
                        className="text-xs bg-white h-8 text-purple-700 hover:bg-purple-50"
                    >
                        عرض
                    </Button>
                </div>
            )}

            {/* الكارت الرئيسي */}
            <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-5 text-white shadow-xl relative">
                <button 
                    onClick={() => setShowInfo(true)} 
                    className="absolute top-2 right-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                    title="معلومات المطور"
                >
                    <Info size={16} className="text-white" />
                </button>

                <div className="flex justify-between items-start mb-4 mt-2">
                    <div>
                        <h2 className="text-lg font-bold">{activeBatch.name}</h2>
                        <p className="text-xs opacity-80">العمر {age} يوم</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] opacity-80">مؤشر EPEF</p>
                        <p className={`font-bold text-2xl ${epef > 300 ? 'text-green-300' : 'text-white'}`}>
                            {epef}
                        </p>
                    </div>
                </div>
                
                {/* مؤشرات الأداء */}
                <div className="grid grid-cols-4 gap-2 text-center border-t border-white/20 pt-3">
                    <div>
                        <p className="text-[10px] opacity-70">معدل التحويل</p>
                        <p className="font-bold">{fcr.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">متوسط الوزن (جرام)</p>
                        <p className="font-bold">{formatNumber(currentWeightGM)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">التكلفة/طائر</p>
                        <p className="font-bold">{birdCost.toFixed(2)} ج</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">نسبة النفوق %</p>
                        <p className="font-bold">{mortalityRate}%</p>
                    </div>
                </div>
            </div>

            {/* مخطط الوزن */}
            <Card>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Scale size={18} className="text-blue-500"/> منحنى النمو
                    </h3>
                    <span className="text-xs text-gray-500">
                        {chartData.length > 0 ? `آخر وزن: ${chartData[chartData.length-1].val} جرام` : 'لا توجد بيانات'}
                    </span>
                </div>
                <WeightChart data={chartData} />
            </Card>

            {/* المبيعات والمصروفات وتكلفة الطائر */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-emerald-50 border-emerald-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-800 font-bold mb-1">إجمالي المبيعات</p>
                            <p className="text-lg font-bold text-emerald-700">
                                {formatNumber(batchSales)} ج
                            </p>
                            {batchSales > 0 && (
                                <p className="text-[10px] text-emerald-600 mt-1">
                                    +{formatNumber(profit)} ج ربح
                                </p>
                            )}
                        </div>
                        <DollarSign className="text-emerald-500" size={20} />
                    </div>
                </Card>
                
                <Card className="bg-rose-50 border-rose-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-rose-800 font-bold mb-1">إجمالي المصروفات</p>
                            <p className="text-lg font-bold text-rose-700">
                                {formatNumber(batchExpenses)} ج
                            </p>
                            {batchExpenses > 0 && (
                                <p className="text-[10px] text-rose-600 mt-1">
                                    {formatNumber(birdCost)} ج/طائر
                                </p>
                            )}
                        </div>
                        <TrendingDown className="text-rose-500" size={20} />
                    </div>
                </Card>
                
                <Card className="bg-blue-50 border-blue-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-800 font-bold mb-1">أداء الدورة</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-blue-700">
                                    {performance.icon} {performance.status}
                                </p>
                                <span className={`text-xs ${performance.color}`}>
                                    EPEF: {epef}
                                </span>
                            </div>
                            <p className="text-[10px] text-blue-600 mt-1">
                                نسبة البقاء: {livability.toFixed(1)}%
                            </p>
                        </div>
                        <Target className="text-blue-500" size={20} />
                    </div>
                </Card>
            </div>

            {/* إحصائيات الدورة */}
            <Card>
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-4">
                    <Calculator size={18} className="text-purple-500"/> إحصائيات الدورة
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-800 font-bold mb-1">العدد الحالي</p>
                                <p className="text-lg font-bold text-gray-700">
                                    {formatNumber(currentCount)}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-1">
                                    من {formatNumber(activeBatch.initialCount)} طائر
                                </p>
                            </div>
                            <Users className="text-gray-500" size={20} />
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-amber-800 font-bold mb-1">استهلاك العلف</p>
                                <p className="text-lg font-bold text-amber-700">
                                    {formatNumber(totalFeed)} كجم
                                </p>
                                <p className="text-[10px] text-amber-600 mt-1">
                                    {formatNumber(totalFeed/age || 0)} كجم/يوم
                                </p>
                            </div>
                            <Activity className="text-amber-500" size={20} />
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-green-800 font-bold mb-1">الكتلة الحيوية</p>
                                <p className="text-lg font-bold text-green-700">
                                    {formatNumber(totalBiomass)} كجم
                                </p>
                                <p className="text-[10px] text-green-600 mt-1">
                                    {formatNumber(totalBiomass/currentCount || 0)} كجم/طائر
                                </p>
                            </div>
                            <Scale className="text-green-500" size={20} />
                        </div>
                    </div>
                    
                    <div className="bg-sky-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-sky-800 font-bold mb-1">متوسط الحرارة</p>
                                <p className="text-lg font-bold text-sky-700">
                                    {avgTemperature.toFixed(1)}°م
                                </p>
                                <p className="text-[10px] text-sky-600 mt-1">
                                    {batchLogs.filter(l => l.temp).length} يوم مسجل
                                </p>
                            </div>
                            <Thermometer className="text-sky-500" size={20} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* قسم المخزون */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Package size={18} className="text-purple-500"/> حالة المخزون
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className="text-xs text-purple-600 hover:text-purple-700 font-bold"
                        >
                            المخزون →
                        </button>
                        <button 
                            onClick={() => setShowInventoryReport(true)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                        >
                            تقرير →
                        </button>
                    </div>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-800 font-bold mb-1">إجمالي العناصر</p>
                                <p className="text-lg font-bold text-purple-700">
                                    {inventoryStats.totalItems}
                                </p>
                                <p className="text-[10px] text-purple-600 mt-1">
                                    للدورة الحالية
                                </p>
                            </div>
                            <Package className="text-purple-500" size={20} />
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-indigo-800 font-bold mb-1">قيمة المخزون</p>
                                <p className="text-lg font-bold text-indigo-700">
                                    {formatNumber(inventoryStats.totalValue)} ج
                                </p>
                                <p className="text-[10px] text-indigo-600 mt-1">
                                    {inventoryStats.feedValue > 0 ? `${formatNumber(inventoryStats.feedValue)} ج علف` : ''}
                                </p>
                            </div>
                            <TrendingUp className="text-indigo-500" size={20} />
                        </div>
                    </div>
                </div>
                
                {/* تحذيرات المخزون المنخفض */}
                {lowStockItems.length > 0 && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={16} className="text-red-500" />
                            <p className="text-xs font-bold text-red-600">تحذير مخزون منخفض</p>
                        </div>
                        <div className="space-y-2">
                            {lowStockItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="flex justify-between items-center p-2 bg-red-50 rounded"
                                >
                                    <div>
                                        <p className="text-xs font-medium text-red-800">{item.name}</p>
                                        <p className="text-[10px] text-red-600">
                                            {item.batchId ? 'خاص بالدورة' : 'مخزون عام'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-red-700">
                                            {formatNumber(item.currentStock)} / {item.minStock} {item.unit}
                                        </p>
                                        <p className="text-[10px] text-red-500">مخزون منخفض</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* تحليل استهلاك العلف */}
                {inventoryStats.feedConsumption > 0 && (
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <TrendingDown size={16} className="text-amber-600" />
                                <p className="text-xs font-bold text-amber-800">استهلاك العلف</p>
                            </div>
                            <p className="text-lg font-bold text-amber-700">
                                {formatNumber(inventoryStats.feedConsumption)} كجم
                            </p>
                        </div>
                        
                        {/* تحليل حسب نوع العلف */}
                        {Object.keys(feedAnalysis).length > 0 && (
                            <div className="text-xs space-y-1">
                                <p className="text-amber-700 font-medium">حسب النوع:</p>
                                {Object.entries(feedAnalysis).map(([type, amount]) => (
                                    <div key={type} className="flex justify-between">
                                        <span>{type}:</span>
                                        <span className="font-bold">{formatNumber(amount)} كجم</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* إحصاءات إضافية */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">عناصر علف</p>
                        <p className="font-bold text-gray-700">{inventoryStats.feedItems}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">عناصر منخفضة</p>
                        <p className="font-bold text-gray-700">{inventoryStats.lowStockItems}</p>
                    </div>
                </div>
            </Card>

            {/* تقييم أداء الدورة */}
            <Card>
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-3">
                    <BarChart3 size={18} className="text-green-500"/> تقييم أداء الدورة
                </h3>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Heart className="text-green-500" size={16} />
                            <span className="text-sm text-green-700">نسبة البقاء:</span>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${livability >= 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                                {livability.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">
                                {livability >= 95 ? 'ممتازة' : 'تحتاج تحسين'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Scale className="text-blue-500" size={16} />
                            <span className="text-sm text-blue-700">معدل التحويل الغذائي:</span>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${fcr <= 1.5 ? 'text-green-600' : fcr <= 2.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {fcr.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {fcr <= 1.5 ? 'ممتاز' : fcr <= 2.0 ? 'جيد' : 'يحتاج تحسين'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Target className="text-purple-500" size={16} />
                            <span className="text-sm text-purple-700">مؤشر EPEF:</span>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${epef >= 350 ? 'text-green-600' : epef >= 300 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                {epef}
                            </p>
                            <p className="text-xs text-gray-500">
                                {epef >= 350 ? 'ممتاز' : epef >= 300 ? 'جيد جداً' : 'يحتاج تحسين'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <DollarSign className="text-orange-500" size={16} />
                            <span className="text-sm text-orange-700">الربح/طائر:</span>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${profitPerBird >= 5 ? 'text-green-600' : profitPerBird >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {profitPerBird.toFixed(2)} ج
                            </p>
                            <p className="text-xs text-gray-500">
                                {profitPerBird >= 5 ? 'مربح جداً' : profitPerBird >= 0 ? 'مربح' : 'خسارة'}
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* توصيات */}
                {epef < 300 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                        <h4 className="text-xs font-bold text-yellow-800 mb-1">🎯 توصيات للتحسين:</h4>
                        <ul className="text-xs text-yellow-700 space-y-1 pr-2">
                            {fcr > 2.0 && <li>• تحسين جودة العلف لتقليل معدل التحويل</li>}
                            {mortalityRate > 5 && <li>• تحسين ظروف التربية لتقليل النفوق</li>}
                            {avgTemperature > 30 && <li>• تحسين نظام التبريد</li>}
                            {livability < 95 && <li>• مراجعة برنامج التحصينات والرعاية الصحية</li>}
                        </ul>
                    </div>
                )}
            </Card>

            {/* نماذج المعلومات */}
            <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="معلومات المطور">
                <DeveloperInfo />
            </Modal>
            
            <Modal 
                isOpen={showInventoryReport} 
                onClose={() => setShowInventoryReport(false)} 
                title="تقرير المخزون"
                size="lg"
            >
                <InventoryReport 
                    inventoryItems={inventoryItems.filter(item => !item.batchId || item.batchId === activeBatch.id)}
                    activeBatch={activeBatch}
                    shareViaWhatsapp={shareViaWhatsapp}
                />
            </Modal>
        </div>
    );
};

export default Dashboard;
