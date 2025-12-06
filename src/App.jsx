import React, { useState, useEffect } from 'react';
import { 
  Bird, DollarSign, Activity, Download, Calendar, 
  Syringe, PackageOpen, Package 
} from 'lucide-react';
import { Button, Modal } from './UI';

// استيراد المكونات المنفصلة
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import HealthManager from './components/HealthManager';
import BatchManager from './components/BatchManager';
import DailyOperations from './components/DailyOperations';
import Financials from './components/Financials';
import InventoryManager from './components/InventoryManager';

// استيراد الدوال المساعدة
import { formatDate, addDays } from '/utils/helpers';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    onConfirm: () => {} 
  });

  // البيانات
  const [batches, setBatches] = useState(() => 
    JSON.parse(localStorage.getItem('batches')) || []
  );
  const [dailyLogs, setDailyLogs] = useState(() => 
    JSON.parse(localStorage.getItem('dailyLogs')) || []
  );
  const [sales, setSales] = useState(() => 
    JSON.parse(localStorage.getItem('sales')) || []
  );
  const [expenses, setExpenses] = useState(() => 
    JSON.parse(localStorage.getItem('expenses')) || []
  );
  const [vaccinations, setVaccinations] = useState(() => 
    JSON.parse(localStorage.getItem('vaccinations')) || []
  );
  const [inventoryItems, setInventoryItems] = useState(() => 
    JSON.parse(localStorage.getItem('inventory')) || []
  );

  const activeBatch = batches.find(b => b.status === 'active');

  // حفظ البيانات في localStorage
  useEffect(() => {
    localStorage.setItem('batches', JSON.stringify(batches));
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('vaccinations', JSON.stringify(vaccinations));
    localStorage.setItem('inventory', JSON.stringify(inventoryItems));
  }, [batches, dailyLogs, sales, expenses, vaccinations, inventoryItems]);

  // الدوال المساعدة
  const showNotify = (msg) => { 
    setNotification(msg); 
    setTimeout(() => setNotification(null), 3000); 
  };
  
  const handleDelete = (title, action) => { 
    setConfirmDialog({ 
      isOpen: true, 
      title: `حذف ${title}؟`, 
      onConfirm: () => { 
        action(); 
        setConfirmDialog({ ...confirmDialog, isOpen: false }); 
        showNotify("تم الحذف"); 
      } 
    }); 
  };
  
  const shareViaWhatsapp = (text) => 
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

  const downloadBackup = () => {
    const data = { batches, dailyLogs, sales, expenses, vaccinations, inventoryItems };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const a = document.createElement('a'); 
    a.href = dataStr; 
    a.download = `poultry_smart_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    showNotify("تم حفظ النسخة الاحتياطية");
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} duration={6000} />}
      
      <div className="min-h-screen bg-[#FFF7ED] font-sans text-gray-900" dir="rtl">
        {/* نافذة تأكيد الحذف */}
        <Modal 
          isOpen={confirmDialog.isOpen} 
          onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})} 
          title="تأكيد"
        > 
          <p className="text-gray-600 mb-6 text-center">{confirmDialog.title}</p> 
          <div className="flex gap-3"> 
            <Button onClick={confirmDialog.onConfirm} variant="danger" className="flex-1">
              نعم
            </Button> 
            <Button 
              onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} 
              variant="ghost" 
              className="flex-1"
            >
              إلغاء
            </Button> 
          </div> 
        </Modal>
        
        {/* الإشعارات */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold text-sm">
            {notification}
          </div>
        )}
        
        {/* الهيدر */}
        <div className="bg-white pt-safe-top pb-2 px-4 sticky top-0 z-20 shadow-sm"> 
          <div className="flex justify-between items-center max-w-md mx-auto pt-2"> 
            <h1 className="text-xl font-black text-orange-600 flex items-center gap-2">
              <Bird size={24}/> دواجني
            </h1> 
            <button onClick={downloadBackup} className="text-gray-400">
              <Download size={20}/>
            </button> 
          </div> 
        </div>
        
        {/* المحتوى الرئيسي */}
        <div className="p-4 max-w-md mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              activeBatch={activeBatch}
              dailyLogs={dailyLogs}
              sales={sales}
              expenses={expenses}
              vaccinations={vaccinations}
              inventoryItems={inventoryItems}
              setActiveTab={setActiveTab}
              shareViaWhatsapp={shareViaWhatsapp}
            />
          )}
          
          {activeTab === 'health' && (
            <HealthManager 
              activeBatch={activeBatch}
              vaccinations={vaccinations}
              setVaccinations={setVaccinations}
              showNotify={showNotify}
            />
          )}
          
          {activeTab === 'batches' && (
            <BatchManager 
              batches={batches}
              setBatches={setBatches}
              vaccinations={vaccinations}
              setVaccinations={setVaccinations}
              dailyLogs={dailyLogs}
              sales={sales}
              expenses={expenses}
              showNotify={showNotify}
              shareViaWhatsapp={shareViaWhatsapp}
            />
          )}
          
          {activeTab === 'daily' && (
            <DailyOperations 
              activeBatch={activeBatch}
              dailyLogs={dailyLogs}
              setDailyLogs={setDailyLogs}
              showNotify={showNotify}
              handleDelete={handleDelete}
              formatDate={formatDate}
            />
          )}
          
          {activeTab === 'finance' && (
            <Financials 
              activeBatch={activeBatch}
              sales={sales}
              setSales={setSales}
              expenses={expenses}
              setExpenses={setExpenses}
              showNotify={showNotify}
              formatDate={formatDate}
            />
          )}
          
          {activeTab === 'inventory' && (
            <InventoryManager 
              activeBatch={activeBatch}
              inventoryItems={inventoryItems}
              setInventoryItems={setInventoryItems}
              expenses={expenses}
              dailyLogs={dailyLogs}
              showNotify={showNotify}
              handleDelete={handleDelete}
              shareViaWhatsapp={shareViaWhatsapp}
            />
          )}
        </div>
        
        {/* شريط التنقل السفلي */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe shadow-lg z-30"> 
          <div className="flex justify-around p-2 max-w-md mx-auto"> 
            {[
              {id:'dashboard', icon:Activity, l:'الرئيسية'},
              {id:'daily', icon:Calendar, l:'اليوميات'},
              {id:'health', icon:Syringe, l:'الصحة'},
              {id:'finance', icon:DollarSign, l:'المالية'},
              {id:'inventory', icon:Package, l:'المخزون'},
              {id:'batches', icon:PackageOpen, l:'الدورات'}
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`flex flex-col items-center w-12 ${
                  activeTab === t.id ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                <t.icon size={20} strokeWidth={activeTab === t.id ? 2.5 : 2}/>
                <span className="text-[9px] font-bold mt-1">{t.l}</span>
              </button>
            ))} 
          </div> 
        </div>
      </div>
    </>
  );
  }
