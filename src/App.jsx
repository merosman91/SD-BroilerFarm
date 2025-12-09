import React, { useState, useEffect } from 'react';
import { 
  Bird, DollarSign, Activity, Download, Calendar, 
  Syringe, PackageOpen, Package, Settings, Menu,
  AlertCircle, Info, Share2, User, LogOut,
  Home, Shield, Database, Smartphone
} from 'lucide-react';
import { Button, Modal, InitialSetup } from './Ui.jsx';

// استيراد المكونات المنفصلة
//import SplashScreen from './components/SplashScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import HealthManager from './components/HealthManager.jsx';
import BatchManager from './components/BatchManager.jsx';
import DailyOperations from './components/DailyOperations.jsx';
import Financials from './components/Financials.jsx';
import InventoryManager from './components/InventoryManager.jsx';
import DeveloperInfo from './components/DeveloperInfo.jsx';

// استيراد الدوال المساعدة
import { formatDate, addDays, formatNumber, calculateTotalRevenue, analyzeFinancialPerformance } from './utils/helpers.js';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '',
    onConfirm: () => {} 
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);

  // البيانات - مع بيانات تجريبية أولية
  const [batches, setBatches] = useState(() => {
    const saved = localStorage.getItem('batches');
    if (saved) {
      return JSON.parse(saved);
    }
    // بيانات تجريبية
    return [
      {
        id: 1,
        name: "الدورة التجريبية",
        startDate: new Date().toISOString().split('T')[0],
        initialCount: 1000,
        breed: "كوب",
        breedId: "cobb",
        status: 'active',
        breedType: 'لاحم',
        batchType: 'دورة تسمين',
        notes: "دورة تجريبية للمستخدمين الجدد",
        createdAt: new Date().toISOString()
      }
    ];
  });
  
  const [dailyLogs, setDailyLogs] = useState(() => 
    JSON.parse(localStorage.getItem('dailyLogs')) || []
  );
  const [sales, setSales] = useState(() => 
    JSON.parse(localStorage.getItem('sales')) || []
  );
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) {
      return JSON.parse(saved);
    }
    // مصروفات تجريبية
    return [
      {
        id: 1,
        item: "علف بادي 23%",
        cost: 3020,
        date: new Date().toISOString().split('T')[0],
        category: "علف",
        quantity: 1000,
        unit: "كجم",
        notes: "شراء أولي",
        batchId: 1
      }
    ];
  });
  
  const [vaccinations, setVaccinations] = useState(() => 
    JSON.parse(localStorage.getItem('vaccinations')) || []
  );
  
  const [inventoryItems, setInventoryItems] = useState(() => {
    const saved = localStorage.getItem('inventory');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

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

  // التحقق من الإعداد الأولي
  useEffect(() => {
    const hasInitialSetup = localStorage.getItem('setup_completed');
    if (!hasInitialSetup && !showSplash) {
      setTimeout(() => {
        setShowInitialSetup(true);
      }, 1000);
    }
  }, [showSplash]);

  // الدوال المساعدة
  const showNotify = (msg) => { 
    setNotification({ 
      message: msg, 
      type: msg.includes('✓') || msg.includes('تم') ? 'success' : 
            msg.includes('✗') ? 'error' : 'info'
    }); 
    setTimeout(() => setNotification(null), 3000); 
  };
  
  const handleDelete = (title, action, message = '') => { 
    setConfirmDialog({ 
      isOpen: true, 
      title: `حذف ${title}؟`, 
      message: message || `هل أنت متأكد من حذف ${title}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      onConfirm: () => { 
        action(); 
        setConfirmDialog({ ...confirmDialog, isOpen: false }); 
        showNotify(`✓ تم حذف ${title} بنجاح`); 
      } 
    }); 
  };
  
  const shareViaWhatsapp = (text) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    showNotify("✓ تم فتح واتساب للمشاركة");
  };

  const downloadBackup = () => {
    const data = { 
      batches, 
      dailyLogs, 
      sales, 
      expenses, 
      vaccinations, 
      inventoryItems,
      backupDate: new Date().toISOString(),
      appVersion: "دواجني 2.0"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a'); 
    a.href = dataStr; 
    a.download = `نسخة_احتياطية_دواجني_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    showNotify("✓ تم حفظ النسخة الاحتياطية");
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target.result);
        
        setConfirmDialog({
          isOpen: true,
          title: "استعادة نسخة احتياطية",
          message: "هل تريد استبدال جميع البيانات الحالية بالنسخة الاحتياطية؟",
          onConfirm: () => {
            if (backupData.batches) setBatches(backupData.batches);
            if (backupData.dailyLogs) setDailyLogs(backupData.dailyLogs);
            if (backupData.sales) setSales(backupData.sales);
            if (backupData.expenses) setExpenses(backupData.expenses);
            if (backupData.vaccinations) setVaccinations(backupData.vaccinations);
            if (backupData.inventoryItems) setInventoryItems(backupData.inventoryItems);
            
            showNotify("✓ تم استعادة النسخة الاحتياطية بنجاح");
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }
        });
      } catch (error) {
        showNotify("✗ خطأ في قراءة ملف النسخة الاحتياطية");
      }
    };
    reader.readAsText(file);
  };

  const resetAllData = () => {
    setConfirmDialog({
      isOpen: true,
      title: "مسح جميع البيانات",
      message: "هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف كل المعلومات.",
      onConfirm: () => {
        setBatches([]);
        setDailyLogs([]);
        setSales([]);
        setExpenses([]);
        setVaccinations([]);
        setInventoryItems([]);
        localStorage.clear();
        showNotify("✓ تم مسح جميع البيانات");
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const completeSetup = () => {
    localStorage.setItem('setup_completed', 'true');
    setSetupCompleted(true);
    setShowInitialSetup(false);
    showNotify("✓ تم إكمال الإعداد الأولي بنجاح");
  };

  // إحصائيات سريعة
  const quickStats = {
    activeBatch: activeBatch ? activeBatch.name : "لا توجد دورة نشطة",
    totalBatches: batches.length,
    totalSales: calculateTotalRevenue(sales),
    totalExpenses: expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0),
    inventoryItems: inventoryItems.length,
    lowStockItems: inventoryItems.filter(item => item.currentStock <= item.minStock).length
  };

  const financialAnalysis = analyzeFinancialPerformance(sales, expenses);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} duration={4000} />}
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans text-gray-900" dir="rtl">
        {/* نافذة تأكيد */}
        <Modal 
          isOpen={confirmDialog.isOpen} 
          onClose={() => setConfirmDialog({...confirmDialog, isOpen: false})} 
          title={confirmDialog.title}
        > 
          {confirmDialog.message && (
            <p className="text-gray-600 mb-4 text-center">{confirmDialog.message}</p>
          )}
          <div className="space-y-3">
            <Button onClick={confirmDialog.onConfirm} className="w-full bg-red-500 hover:bg-red-600">
              نعم، تأكيد
            </Button> 
            <Button 
              onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})} 
              className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              إلغاء
            </Button> 
          </div> 
        </Modal>
        
        {/* الإشعارات */}
        {notification && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in font-bold text-sm flex items-center gap-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : 'ℹ️'}
            {notification.message}
          </div>
        )}
        
        {/* الهيدر */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white pt-safe-top pb-4 px-4 sticky top-0 z-30 shadow-lg"> 
          <div className="flex justify-between items-center max-w-md mx-auto pt-2"> 
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMenu(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-black flex items-center gap-2">
                <Bird size={24} /> دواجني
              </h1> 
            </div>
            <div className="flex items-center gap-2">
              {activeBatch && (
                <div className="text-xs bg-white/20 px-2 py-1 rounded hidden sm:block">
                  <span className="font-bold">{activeBatch.name}</span>
                </div>
              )}
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div> 
        </div>
        
        {/* القائمة الجانبية */}
        <Modal 
          isOpen={showMenu} 
          onClose={() => setShowMenu(false)} 
          title="القائمة"
          position="right"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">مستخدم دواجني</p>
                <p className="text-sm text-gray-500">نظام إدارة المزارع</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => { setActiveTab('dashboard'); setShowMenu(false); }}
                className="w-full p-3 text-right hover:bg-gray-100 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-gray-600" />
                  <span className="font-medium">الرئيسية</span>
                </div>
                {activeTab === 'dashboard' && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </button>
              
              <button 
                onClick={downloadBackup}
                className="w-full p-3 text-right hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <Database size={18} className="text-gray-600" />
                <span className="font-medium">نسخ احتياطي</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('batches'); setShowMenu(false); }}
                className="w-full p-3 text-right hover:bg-gray-100 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <PackageOpen size={18} className="text-gray-600" />
                  <span className="font-medium">إدارة الدورات</span>
                </div>
                {activeTab === 'batches' && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </button>
              
              <button 
                onClick={() => window.open('https://merghani.dev', '_blank')}
                className="w-full p-3 text-right hover:bg-gray-100 rounded-lg flex items-center gap-3"
              >
                <Info size={18} className="text-gray-600" />
                <span className="font-medium">عن المطور</span>
              </button>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                onClick={() => {
                  setShowMenu(false);
                  setShowSettings(true);
                }}
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Settings size={16} className="ml-2" /> الإعدادات
              </Button>
            </div>
          </div>
        </Modal>

        {/* نافذة الإعدادات */}
        <Modal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          title="الإعدادات"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-bold text-blue-800 mb-2">إدارة البيانات</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button onClick={downloadBackup} className="flex-1">
                    <Download size={16} className="ml-2" /> تصدير نسخة
                  </Button>
                  <label className="flex-1">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={importBackup} 
                      className="hidden"
                    />
                    <Button as="div" className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300">
                      <Database size={16} className="ml-2" /> استيراد نسخة
                    </Button>
                  </label>
                </div>
                <Button 
                  onClick={resetAllData}
                  className="w-full bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <AlertCircle size={16} className="ml-2" /> مسح جميع البيانات
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-800 mb-2">إحصائيات النظام</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">عدد الدورات</p>
                  <p className="font-bold">{quickStats.totalBatches}</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">العناصر في المخزون</p>
                  <p className="font-bold">{quickStats.inventoryItems}</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">إجمالي المبيعات</p>
                  <p className="font-bold">{formatNumber(quickStats.totalSales)} ج</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-gray-500">منخفض المخزون</p>
                  <p className="font-bold text-red-600">{quickStats.lowStockItems}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-xl">
              <h4 className="font-bold text-green-800 mb-2">الأداء المالي</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">صافي الربح:</span>
                  <span className={`font-bold ${financialAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(financialAnalysis.profit)} ج
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">هامش الربح:</span>
                  <span className="font-bold text-blue-600">{financialAnalysis.profitMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">العائد على الاستثمار:</span>
                  <span className="font-bold text-purple-600">{financialAnalysis.roi}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-xl">
              <h4 className="font-bold text-orange-800 mb-2">دعم النظام</h4>
              <p className="text-sm text-orange-700 mb-3">
                للتحديثات والدعم الفني، تواصل مع المطور:
              </p>
              <div className="space-y-2">
                <a 
                  href="https://wa.me/249912345678" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-white rounded hover:bg-orange-50"
                >
                  <span className="text-sm">واتساب الدعم الفني</span>
                  <Share2 size={16} className="text-gray-400" />
                </a>
                <a 
                  href="mailto:support@merghani.dev" 
                  className="flex items-center justify-between p-2 bg-white rounded hover:bg-orange-50"
                >
                  <span className="text-sm">البريد الإلكتروني</span>
                  <Mail size={16} className="text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </Modal>

        {/* الإعداد الأولي */}
        <InitialSetup 
          isOpen={showInitialSetup}
          onClose={() => setShowInitialSetup(false)}
          inventoryItems={inventoryItems}
          setInventoryItems={setInventoryItems}
          activeBatch={activeBatch}
          showNotify={showNotify}
          onSetupComplete={completeSetup}
        />

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
              handleDelete={handleDelete}
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
              inventoryItems={inventoryItems}
              setInventoryItems={setInventoryItems}
              showNotify={showNotify}
              shareViaWhatsapp={shareViaWhatsapp}
              handleDelete={handleDelete}
            />
          )}
          
          {activeTab === 'daily' && (
            <DailyOperations 
              activeBatch={activeBatch}
              dailyLogs={dailyLogs}
              setDailyLogs={setDailyLogs}
              inventoryItems={inventoryItems}
              setInventoryItems={setInventoryItems}
              showNotify={showNotify}
              handleDelete={handleDelete}
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
              handleDelete={handleDelete}
              shareViaWhatsapp={shareViaWhatsapp}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t pb-safe shadow-xl z-30"> 
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
                className={`flex flex-col items-center w-12 transition-all ${
                  activeTab === t.id ? 
                  'text-orange-600 transform -translate-y-1' : 
                  'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-2 rounded-full ${activeTab === t.id ? 'bg-orange-100' : ''}`}>
                  <t.icon size={22} strokeWidth={activeTab === t.id ? 2.5 : 2}/>
                </div>
                <span className="text-[10px] font-bold mt-1">{t.l}</span>
                {activeTab === t.id && (
                  <div className="w-1 h-1 bg-orange-600 rounded-full mt-1"></div>
                )}
              </button>
            ))} 
          </div> 
        </div>

        {/* معلومات المطور في الفوتر */}
        <DeveloperInfo />
      </div>
    </>
  );
}

// مكون Mail المساعد
const Mail = ({ size = 16, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
); 
