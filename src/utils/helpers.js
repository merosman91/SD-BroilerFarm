// دالة مساعدة لإضافة أيام على تاريخ معين
export const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

// تحديث دالة formatDate
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {  // تغيير من ar-SA إلى en-US
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// دالة جديدة للتاريخ الميلادي الكامل
export const formatGregorianDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// دالة للتاريخ الميلادي مع الوقت
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// دالة generateDefaultSchedule
export const generateDefaultSchedule = (batchId, startDate, addDaysFunc) => {
    const templates = [
        { day: 7, name: 'هتشنر + نيوكاسل', type: 'تقطير' }, 
        { day: 10, name: 'أنفلونزا', type: 'حقن' }, 
        { day: 12, name: 'جامبورو', type: 'شرب' }, 
        { day: 18, name: 'لاسوتا', type: 'شرب' }
    ];
    return templates.map((t, i) => ({ 
        id: Date.now() + i, 
        batchId, 
        name: t.name, 
        type: t.type, 
        date: addDaysFunc(startDate, t.day), 
        dayAge: t.day, 
        status: 'pending' 
    }));
};

// قوائم الاختيار
export const FEED_TYPES = ['بادي 23%', 'نامي 21%', 'ناهي 19%'];
export const DEATH_CAUSES = ['طبيعي', 'سموم فطرية', 'إجهاد حراري', 'أمراض تنفسية', 'كوكسيديا', 'سردة/فرزة', 'أخرى'];

// إضافة هذه الدوال إلى utils/helpers.js
export const INVENTORY_CATEGORIES = [
    'أعلاف',
    'أدوية وتحصينات',
    'مستلزمات مزرعة',
    'وقود وزيوت',
    'قطع غيار',
    'مستلزمات مكتبية',
    'أخرى'
];

export const FEED_TYPES_DETAILED = {
    'بادي 23%': { protein: 23, energy: 3000, pricePerKg: 2.5 },
    'نامي 21%': { protein: 21, energy: 3100, pricePerKg: 2.3 },
    'ناهي 19%': { protein: 19, energy: 3200, pricePerKg: 2.1 },
    'بياض 17%': { protein: 17, energy: 2900, pricePerKg: 2.0 }
};

export const calculateFeedConsumption = (batchData, logs) => {
    const batchLogs = logs.filter(l => l.batchId === batchData.id);
    const totalConsumption = batchLogs.reduce((sum, l) => sum + Number(l.feed || 0), 0);
    
    // تحليل حسب النوع
    const feedByType = {};
    batchLogs.forEach(log => {
        if (log.feed && log.feedType) {
            if (!feedByType[log.feedType]) {
                feedByType[log.feedType] = 0;
            }
            feedByType[log.feedType] += Number(log.feed);
        }
    });
    
    return {
        totalConsumption,
        feedByType,
        avgDailyConsumption: totalConsumption / (batchLogs.length || 1)
    };
};

export const generateInventoryAlerts = (inventoryItems) => {
    const alerts = [];
    
    inventoryItems.forEach(item => {
        if (item.currentStock <= item.minStock) {
            alerts.push({
                type: 'danger',
                message: `${item.name} - المخزون منخفض (${item.currentStock} ${item.unit})`,
                itemId: item.id
            });
        } else if (item.currentStock <= item.minStock * 1.5) {
            alerts.push({
                type: 'warning',
                message: `${item.name} - المخزون قارب النفاد`,
                itemId: item.id
            });
        }
        
        // تحذير من انتهاء الصلاحية
        if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            const daysToExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysToExpiry <= 7 && daysToExpiry > 0) {
                alerts.push({
                    type: 'warning',
                    message: `${item.name} - تنتهي صلاحيته خلال ${daysToExpiry} أيام`,
                    itemId: item.id
                });
            } else if (daysToExpiry <= 0) {
                alerts.push({
                    type: 'danger',
                    message: `${item.name} - منتهي الصلاحية`,
                    itemId: item.id
                });
            }
        }
    });
    
    return alerts;
};
