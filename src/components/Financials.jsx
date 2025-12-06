// components/Financials.jsx
import React, { useState } from 'react';
import { Button, Card, Input } from '../UI';
import { formatDate } from '../utils/helpers';

const Financials = ({ 
    activeBatch, 
    sales, 
    setSales, 
    expenses, 
    setExpenses, 
    showNotify 
}) => {
    const [view, setView] = useState('sales');
    const [newSale, setNewSale] = useState({ 
        buyer: '', 
        count: '', 
        weight: '', 
        price: '', 
        date: new Date().toISOString().split('T')[0] 
    });
    const [newExpense, setNewExpense] = useState({ 
        item: '', 
        cost: '', 
        date: new Date().toISOString().split('T')[0] 
    });

    if (!activeBatch) return null;

    const saveSale = () => { 
        const total = Number(newSale.weight || newSale.count) * Number(newSale.price); 
        setSales([...sales, { 
            ...newSale, 
            total, 
            id: Date.now(), 
            batchId: activeBatch.id 
        }]); 
        setNewSale({...newSale, buyer:'', count:'', weight:'', price:''}); 
        showNotify("تم البيع"); 
    };
    
    const saveExpense = () => { 
        setExpenses([...expenses, { 
            ...newExpense, 
            id: Date.now(), 
            batchId: activeBatch.id 
        }]); 
        setNewExpense({...newExpense, item:'', cost:''}); 
        showNotify("تم المصروف"); 
    };

    const currentSales = sales.filter(x => x.batchId === activeBatch.id);
    const currentExpenses = expenses.filter(x => x.batchId === activeBatch.id);

    return (
        <div className="space-y-4 pb-20">
            <div className="flex bg-gray-200 p-1 rounded-xl">
                <button 
                    onClick={() => setView('sales')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                        view === 'sales' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
                    }`}
                >
                    المبيعات
                </button>
                <button 
                    onClick={() => setView('expenses')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${
                        view === 'expenses' ? 'bg-white shadow text-rose-600' : 'text-gray-500'
                    }`}
                >
                    المصاريف
                </button>
            </div>
            
            {view === 'sales' && (
                <Card>
                    <Input 
                        label="التاجر" 
                        value={newSale.buyer} 
                        onChange={e => setNewSale({...newSale, buyer: e.target.value})} 
                    />
                    <div className="flex gap-2">
                        <Input 
                            label="العدد" 
                            type="number" 
                            value={newSale.count} 
                            onChange={e => setNewSale({...newSale, count: e.target.value})} 
                        />
                        <Input 
                            label="الوزن (كجم)" 
                            type="number" 
                            value={newSale.weight} 
                            onChange={e => setNewSale({...newSale, weight: e.target.value})} 
                        />
                    </div>
                    <Input 
                        label="سعر الوحدة" 
                        type="number" 
                        value={newSale.price} 
                        onChange={e => setNewSale({...newSale, price: e.target.value})} 
                    />
                    <Button onClick={saveSale} variant="success" className="w-full">
                        حفظ البيع
                    </Button>
                </Card>
            )}
            
            {view === 'expenses' && (
                <Card>
                    <Input 
                        label="البند" 
                        value={newExpense.item} 
                        onChange={e => setNewExpense({...newExpense, item: e.target.value})} 
                    />
                    <Input 
                        label="التكلفة" 
                        type="number" 
                        value={newExpense.cost} 
                        onChange={e => setNewExpense({...newExpense, cost: e.target.value})} 
                    />
                    <Button onClick={saveExpense} variant="danger" className="w-full">
                        حفظ المصروف
                    </Button>
                </Card>
            )}
            
            <div className="space-y-2 mt-4">
                {(view === 'sales' ? currentSales : currentExpenses).map(x => (
                    <div key={x.id} className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
                        <div>
                            <p className="font-bold text-sm">{x.buyer || x.item}</p>
                            <p className="text-gray-400">{formatDate(x.date)}</p>
                        </div>
                        <p className="font-bold text-lg">
                            {x.total?.toLocaleString() || Number(x.cost).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Financials;
