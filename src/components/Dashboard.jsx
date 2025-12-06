import React, { useState } from 'react';
import { 
    Bird, Scale, Info, Package, AlertTriangle, 
    TrendingDown, TrendingUp, BarChart3, DollarSign,
    Users, Thermometer, Activity, PieChart
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
            <h2 className="text-xl font-bold text-gray-700">No Active Batch</h2>
            <Button onClick={() => setActiveTab('batches')} className="mt-4">
                Start New Batch
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

    // إحصائيات المخزون
    const inventoryStats = {
        totalItems: inventoryItems.length,
        totalValue: inventoryItems.reduce((sum, item) => 
            sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
        ),
        lowStockItems: inventoryItems.filter(item => 
            item.currentStock <= item.minStock
        ).length,
        feedItems: inventoryItems.filter(item => 
            item.category === 'أعلاف'
        ),
        feedValue: inventoryItems
            .filter(item => item.category === 'أعلاف')
            .reduce((sum, item) => sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0),
        feedConsumption: batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0)
    };

    // العثور على العناصر المنخفضة المخزون
    const lowStockItems = inventoryItems
        .filter(item => item.currentStock <= item.minStock)
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

    return (
        <div className="space-y-4 pb-20 animate-fade-in">
            {/* تنبيه التحصينات المستحقة */}
            {dueVaccines.length > 0 && (
                <div className="bg-purple-100 border-l-4 border-purple-600 p-3 rounded-r-xl shadow-sm flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-purple-800 text-sm">💉 Due Vaccination Today</h3>
                        <p className="text-xs text-purple-700">{dueVaccines[0].name}</p>
                    </div>
                    <Button onClick={() => setActiveTab('health')} variant="ghost" className="text-xs bg-white h-8">
                        View
                    </Button>
                </div>
            )}

            {/* الكارت الرئيسي */}
            <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-5 text-white shadow-xl relative">
                <button 
                    onClick={() => setShowInfo(true)} 
                    className="absolute top-2 left-2 p-1 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                >
                    <Info size={16} className="text-white" />
                </button>

                <div className="flex justify-between items-start mb-4 mt-2">
                    <div>
                        <h2 className="text-lg font-bold">{activeBatch.name}</h2>
                        <p className="text-xs opacity-80">Age {age} days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] opacity-80">EPEF Index</p>
                        <p className={`font-bold text-2xl ${epef > 300 ? 'text-green-300' : 'text-white'}`}>
                            {epef}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-center border-t border-white/20 pt-3">
                    <div>
                        <p className="text-[10px] opacity-70">FCR</p>
                        <p className="font-bold">{fcr}</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">Weight (gm)</p>
                        <p className="font-bold">{formatNumber(currentWeightGM)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">Cost/Bird</p> {/* جديد */}
                        <p className="font-bold">{birdCost} ج</p>
                    </div>
                    <div>
                        <p className="text-[10px] opacity-70">Mortality %</p>
                        <p className="font-bold">{mortalityRate}%</p>
                    </div>
                </div>
            </div>

            {/* مخطط الوزن */}
            <Card>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Scale size={18} className="text-blue-500"/> Weight Curve
                    </h3>
                </div>
                <WeightChart data={chartData} />
            </Card>

            {/* المبيعات والمصروفات وتكلفة الطائر */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-emerald-50 border-emerald-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-emerald-800 font-bold mb-1">Sales</p>
                            <p className="text-lg font-bold text-emerald-700">
                                {formatNumber(batchSales)} ج
                            </p>
                        </div>
                        <DollarSign className="text-emerald-500" size={20} />
                    </div>
                </Card>
                
                <Card className="bg-rose-50 border-rose-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-rose-800 font-bold mb-1">Expenses</p>
                            <p className="text-lg font-bold text-rose-700">
                                {formatNumber(batchExpenses)} ج
                            </p>
                        </div>
                        <TrendingDown className="text-rose-500" size={20} />
                    </div>
                </Card>
                
                <Card className="bg-blue-50 border-blue-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-800 font-bold mb-1">Cost/Bird</p>
                            <p className="text-lg font-bold text-blue-700">
                                {birdCost} ج
                            </p>
                            <p className="text-[10px] text-blue-600 mt-1">
                                {profitPerBird >= 0 ? `+${profitPerBird.toFixed(2)}` : profitPerBird.toFixed(2)} profit/bird
                            </p>
                        </div>
                        <Users className="text-blue-500" size={20} />
                    </div>
                </Card>
            </div>

            {/* قسم المخزون */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                        <Package size={18} className="text-purple-500"/> Inventory Status
                    </h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('inventory')}
                            className="text-xs text-purple-600 hover:text-purple-700 font-bold"
                        >
                            Inventory →
                        </button>
                        <button 
                            onClick={() => setShowInventoryReport(true)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                        >
                            Report →
                        </button>
                    </div>
                </div>
                
                {/* إحصائيات سريعة */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-purple-800 font-bold mb-1">Total Items</p>
                                <p className="text-lg font-bold text-purple-700">
                                    {inventoryStats.totalItems}
                                </p>
                            </div>
                            <Package className="text-purple-500" size={20} />
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-indigo-800 font-bold mb-1">Total Value</p>
                                <p className="text-lg font-bold text-indigo-700">
                                    {formatNumber(inventoryStats.totalValue)} ج
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
                            <p className="text-xs font-bold text-red-600">Low Stock Alert</p>
                        </div>
                        <div className="space-y-2">
                            {lowStockItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className="flex justify-between items-center p-2 bg-red-50 rounded"
                                >
                                    <div>
                                        <p className="text-xs font-medium text-red-800">{item.name}</p>
                                        <p className="text-[10px] text-red-600">{item.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-red-700">
                                            {formatNumber(item.currentStock)} / {item.minStock} {item.unit}
                                        </p>
                                        <p className="text-[10px] text-red-500">Low Stock</p>
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
                                <p className="text-xs font-bold text-amber-800">Feed Consumption</p>
                            </div>
                            <p className="text-lg font-bold text-amber-700">
                                {formatNumber(inventoryStats.feedConsumption)} kg
                            </p>
                        </div>
                        
                        {/* تحليل حسب نوع العلف */}
                        {Object.keys(feedAnalysis).length > 0 && (
                            <div className="text-xs space-y-1">
                                <p className="text-amber-700 font-medium">By Type:</p>
                                {Object.entries(feedAnalysis).map(([type, amount]) => (
                                    <div key={type} className="flex justify-between">
                                        <span>{type}:</span>
                                        <span className="font-bold">{formatNumber(amount)} kg</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {/* معلومات إضافية */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Feed Items</p>
                        <p className="font-bold text-gray-700">{inventoryStats.feedItems}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500">Feed Value</p>
                        <p className="font-bold text-gray-700">{formatNumber(inventoryStats.feedValue)} ج</p>
                    </div>
                </div>
            </Card>

            {/* معلومات إضافية عن الدورة */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="bg-green-50 border-green-100 p-3">
                    <div className="
