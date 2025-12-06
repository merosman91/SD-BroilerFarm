import React, { useState, useEffect } from 'react';
import { 
    Plus, Info, TrendingUp, Scale, Shield, 
    Thermometer, Egg, Activity 
} from 'lucide-react';
import { Button, Card, Input, Modal } from '../UI';
import { 
    addDays, 
    formatDate, 
    getDaysDifference, 
    generateDefaultSchedule 
} from '../utils/helpers';
import { CHICKEN_BREEDS, BREED_CATEGORIES } from '../utils/breeds';

const BatchManager = ({ 
    batches, 
    setBatches, 
    vaccinations, 
    setVaccinations, 
    dailyLogs, 
    sales, 
    expenses, 
    showNotify, 
    shareViaWhatsapp 
}) => {
    const [view, setView] = useState('list');
    const [newBatch, setNewBatch] = useState({ 
        name: '', 
        startDate: new Date().toISOString().split('T')[0], 
        initialCount: '', 
        breed: '', 
        breedId: '' 
    });
    const [selectedBatchReport, setSelectedBatchReport] = useState(null);
    const [showBreedInfo, setShowBreedInfo] = useState(null);
    const [searchBreed, setSearchBreed] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // فلترة السلالات
    const filteredBreeds = CHICKEN_BREEDS.filter(breed => {
        const matchesSearch = breed.name.toLowerCase().includes(searchBreed.toLowerCase()) ||
                            breed.arabicName.toLowerCase().includes(searchBreed.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                               breed.category === (selectedCategory === 'broiler' ? 'لاحم' : 
                                                   selectedCategory === 'layer' ? 'بياض' : 'مزدوج');
        return matchesSearch && matchesCategory;
    });

    const startBatch = () => {
        if (!newBatch.name || !newBatch.initialCount || !newBatch.breed) {
            return showNotify("Please fill all required fields");
        }
        
        const batchId = Date.now();
        const updatedBatches = batches.map(b => 
            b.status === 'active' ? 
            {...b, status: 'closed', endDate: new Date().toISOString()} : b
        );
        
        setBatches([...updatedBatches, { 
            ...newBatch, 
            id: batchId, 
            status: 'active' 
        }]);
        
        setVaccinations([...vaccinations, 
            ...generateDefaultSchedule(batchId, newBatch.startDate, addDays)
        ]);
        
        setNewBatch({ name: '', startDate: '', initialCount: '', breed: '', breedId: '' }); 
        setView('list'); 
        showNotify("Batch started successfully");
    };

    const activateBatch = (id) => {
        const updated = batches.map(b => ({ 
            ...b, 
            status: b.id === id ? 'active' : 'closed', 
            endDate: b.id === id ? null : (b.status === 'active' ? new Date().toISOString() : b.endDate) 
        }));
        setBatches(updated);
        showNotify("Batch activated ✅");
    };

    const getReportStats = (batch) => {
        const bLogs = dailyLogs.filter(l => l.batchId === batch.id);
        const bSales = sales.filter(s => s.batchId === batch.id)
            .reduce((sum, s) => sum + Number(s.total), 0);
        const bExp = expenses.filter(e => e.batchId === batch.id)
            .reduce((sum, e) => sum + Number(e.cost), 0);
        const dead = bLogs.reduce((sum, l) => sum + Number(l.dead || 0), 0);
        const feed = bLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
        const lastWt = [...bLogs].sort((a,b)=>new Date(b.date)-new Date(a.date))
            .find(l=>l.avgWeight)?.avgWeight || 0;
        
        return { 
            bSales, 
            bExp, 
            profit: bSales - bExp, 
            dead, 
            feed, 
            lastWt 
        };
    };

    const handleBreedSelect = (breed) => {
        setNewBatch({
            ...newBatch,
            breed: breed.arabicName,
            breedId: breed.id
        });
        setShowBreedInfo(breed);
    };

    return (
        <div className="space-y-4 pb-20">
            {view === 'list' && (
                <>
                    <Button onClick={() => setView('new')} className="w-full">
                        <Plus size={18}/> Start New Batch
                    </Button>
                    <div className="space-y-3 mt-4">
                        {batches.map(b => (
                            <div 
                                key={b.id} 
                                onClick={() => setSelectedBatchReport(b)}
                                className={`p-4 rounded-xl border relative cursor-pointer active:scale-95 transition-all ${
                                    b.status === 'active' ? 
                                    'bg-orange-50 border-orange-200 shadow-md' : 
                                    'bg-white border-gray-100'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-800">{b.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(b.startDate)} • {b.initialCount} birds
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-600 rounded">
                                                {b.breed || 'Unknown breed'}
                                            </span>
                                            {b.breedId && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const breed = CHICKEN_BREEDS.find(br => br.id === b.breedId);
                                                        if (breed) setShowBreedInfo(breed);
                                                    }}
                                                    className="text-[10px] text-gray-400 hover:text-blue-500"
                                                >
                                                    <Info size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                            b.status === 'active' ? 
                                            'bg-green-100 text-green-700' : 
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {b.status === 'active' ? 'Active' : 'Closed'}
                                        </span>
                                        {b.status !== 'active' && (
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    activateBatch(b.id); 
                                                }} 
                                                className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200"
                                            >
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {view === 'new' && (
                <Card className="animate-slide-up">
                    <h3 className="font-bold mb-4 text-center">New Batch</h3>
                    
                    <Input 
                        label="Batch Name" 
                        value={newBatch.name} 
                        onChange={e => setNewBatch({...newBatch, name: e.target.value})} 
                        placeholder="e.g., Spring Batch 2024"
                    />
                    
                    <Input 
                        label="Start Date" 
                        type="date" 
                        value={newBatch.startDate} 
                        onChange={e => setNewBatch({...newBatch, startDate: e.target.value})} 
                    />
                    
                    <div className="flex gap-2">
                        <Input 
                            label="Initial Count" 
                            type="number" 
                            value={newBatch.initialCount} 
                            onChange={e => setNewBatch({...newBatch, initialCount: e.target.value})} 
                            placeholder="Number of birds"
                        />
                    </div>
                    
                    {/* اختيار السلالة */}
                    <div className="mb-3">
                        <label className="text-xs font-bold text-gray-400 mb-1 block">
                            Breed Selection
                        </label>
                        
                        {/* شريط البحث */}
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Search breeds..."
                                value={searchBreed}
                                onChange={(e) => setSearchBreed(e.target.value)}
                                className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            />
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            >
                                {BREED_CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* قائمة السلالات */}
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredBreeds.length === 0 ? (
                                <div className="p-3 text-center text-gray-400">
                                    No breeds found
                                </div>
                            ) : (
                                filteredBreeds.map(breed => (
                                    <div
                                        key={breed.id}
                                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                                            newBatch.breedId === breed.id ? 'bg-blue-50 border-blue-200' : ''
                                        }`}
                                        onClick={() => handleBreedSelect(breed)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-800">{breed.arabicName}</p>
                                                <p className="text-xs text-gray-500">{breed.name} • {breed.category}</p>
                                            </div>
                                            {newBatch.breedId === breed.id ? (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            ) : (
                                                <Info size={16} className="text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* السلالة المختارة */}
                        {newBatch.breed && (
                            <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-700">
                                    Selected: <span className="font-bold">{newBatch.breed}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <Button onClick={startBatch} className="w-full" disabled={!newBatch.breed}>
                        Save and Start Batch
                    </Button>
                </Card>
            )}

            {selectedBatchReport && (
                <Modal 
                    isOpen={!!selectedBatchReport} 
                    onClose={() => setSelectedBatchReport(null)} 
                    title={`Report: ${selectedBatchReport.name}`}
                >
                    {(() => {
                        const stats = getReportStats(selectedBatchReport);
                        return (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="bg-emerald-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">Profit</p>
                                        <p className={`font-bold ${
                                            stats.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {stats.profit.toLocaleString()} ج
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">Final Weight</p>
                                        <p className="font-bold text-blue-600">{stats.lastWt} gm</p>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">Mortality</p>
                                        <p className="font-bold text-red-600">{stats.dead}</p>
                                    </div>
                                    <div className="bg-amber-50 p-2 rounded-lg">
                                        <p className="text-xs text-gray-500">Feed</p>
                                        <p className="font-bold text-amber-600">{stats.feed} kg</p>
                                    </div>
                                </div>
                                <div className="text-xs space-y-1 bg-gray-50 p-3 rounded text-gray-600">
                                    <p>• Total Sales: {stats.bSales.toLocaleString()}</p>
                                    <p>• Total Expenses: {stats.bExp.toLocaleString()}</p>
                                    <p>• Start Date: {formatDate(selectedBatchReport.startDate)}</p>
                                </div>
                                <Button 
                                    onClick={() => shareViaWhatsapp(
                                        `Report: ${selectedBatchReport.name}\n` +
                                        `Profit: ${stats.profit}\n` +
                                        `Mortality: ${stats.dead}\n` +
                                        `Weight: ${stats.lastWt}`
                                    )} 
                                    variant="success" 
                                    className="w-full"
                                >
                                    Share on WhatsApp
                                </Button>
                            </div>
                        );
                    })()}
                </Modal>
            )}

            {/* نافذة معلومات السلالة */}
            <Modal isOpen={showBreedInfo} onClose={() => setShowBreedInfo(null)} title={showBreedInfo?.arabicName || 'Breed Info'} size="lg">
                {showBreedInfo && (
                    <div className="space-y-4">
                        {/* العنوان */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 rounded-full ${
                                showBreedInfo.category === 'لاحم' ? 'bg-red-100 text-red-600' :
                                showBreedInfo.category === 'بياض' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                {showBreedInfo.category === 'لاحم' ? <Scale size={24} /> :
                                 showBreedInfo.category === 'بياض' ? <Egg size={24} /> :
                                 <Activity size={24} />
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-gray-800">{showBreedInfo.arabicName}</h3>
                                <p className="text-sm text-gray-500">{showBreedInfo.name} • {showBreedInfo.category}</p>
                            </div>
                        </div>
                        
                        {/* الوصف */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-700 mb-2">Description</h4>
                            <p className="text-gray-600">{showBreedInfo.description}</p>
                        </div>
                        
                        {/* الخصائص */}
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <h4 className="font-bold text-blue-700 mb-2">Main Characteristics</h4>
                            <ul className="list-disc mr-4 space-y-1">
                                {showBreedInfo.characteristics.map((char, index) => (
                                    <li key={index} className="text-blue-600 text-sm">{char}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* الأداء */}
                        <div className="bg-green-50 p-4 rounded-xl">
                            <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                <TrendingUp size={16} /> Performance Indicators
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(showBreedInfo.performance).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                        <span className="text-gray-600">{key}: </span>
                                        <span className="font-bold text-green-600">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* المميزات */}
                        <div className="bg-purple-50 p-4 rounded-xl">
                            <h4 className="font-bold text-purple-700 mb-2">Advantages</h4>
                            <ul className="list-disc mr-4 space-y-1">
                                {showBreedInfo.advantages.map((adv, index) => (
                                    <li key={index} className="text-purple-600 text-sm">{adv}</li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* العيوب */}
                        {showBreedInfo.disadvantages && showBreedInfo.disadvantages.length > 0 && (
                            <div className="bg-orange-50 p-4 rounded-xl">
                                <h4 className="font-bold text-orange-700 mb-2">Disadvantages</h4>
                                <ul className="list-disc mr-4 space-y-1">
                                    {showBreedInfo.disadvantages.map((dis, index) => (
                                        <li key={index} className="text-orange-600 text-sm">{dis}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {/* المعلومات الإضافية */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Suitable For</p>
                                <p className="font-bold text-indigo-600">{showBreedInfo.suitableFor}</p>
                            </div>
                            <div className="bg-teal-50 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Market Demand</p>
                                <p className="font-bold text-teal-600">{showBreedInfo.marketDemand}</p>
                            </div>
                        </div>
                        
                        {/* زر التحديد */}
                        <Button 
                            onClick={() => {
                                handleBreedSelect(showBreedInfo);
                                setShowBreedInfo(null);
                            }}
                            className="w-full"
                        >
                            Select This Breed
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BatchManager;
