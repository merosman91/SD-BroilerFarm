// الدوال المساعدة العامة
export const addDays = (date, days) => {
    if (!date) return null;
    const result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result.toISOString().split('T')[0];
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
};

export const getDaysDifference = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// قوائم الاختيار
export const INVENTORY_CATEGORIES = [
    'أعلاف',
    'أدوية وتحصينات',
    'مستلزمات مزرعة',
    'وقود وزيوت',
    'قطع غيار',
    'مستلزمات مكتبية',
    'أخرى'
];

// أنواع العلف الأساسية للمخزون
export const FEED_TYPES = [
    { name: 'بادي 23%', code: 'B23', protein: 23, pricePerKg: 2.8 },
    { name: 'نامي 21%', code: 'N21', protein: 21, pricePerKg: 2.5 },
    { name: 'ناهي 19%', code: 'F19', protein: 19, pricePerKg: 2.3 },
    { name: 'بياض 17%', code: 'L17', protein: 17, pricePerKg: 2.1 }
];

export const DEATH_CAUSES = [
    'طبيعي',
    'سموم فطرية',
    'إجهاد حراري',
    'أمراض تنفسية',
    'كوكسيديا',
    'سردة/فرزة',
    'أخرى'
];

// الحسابات الفنية
export const calculateFCR = (totalFeed, totalWeight) => {
    if (!totalWeight || totalWeight <= 0) return 0;
    return (totalFeed / totalWeight).toFixed(2);
};

export const calculateEPEF = (weight, livability, fcr, age) => {
    if (!age || !fcr || fcr <= 0) return 0;
    return ((weight * livability) / (fcr * age * 10)).toFixed(0);
};

export const calculateMortalityRate = (deadCount, initialCount) => {
    if (!initialCount || initialCount <= 0) return 0;
    return ((deadCount / initialCount) * 100).toFixed(1);
};

export const calculateLivability = (deadCount, initialCount) => {
    if (!initialCount || initialCount <= 0) return 0;
    return 100 - calculateMortalityRate(deadCount, initialCount);
};

export const calculateBirdCost = (totalExpenses, totalBirds) => {
    if (!totalBirds || totalBirds <= 0) return 0;
    return (totalExpenses / totalBirds).toFixed(2);
};

// إنشاء جدول تحصينات تلقائي
export const generateDefaultSchedule = (batchId, startDate, addDaysFunc) => {
    const templates = [
        { day: 7, name: 'هتشنر + نيوكاسل', type: 'تقطير' },
        { day: 10, name: 'أنفلونزا (H5N1)', type: 'حقن' },
        { day: 12, name: 'جامبورو (متوسط)', type: 'مياه شرب' },
        { day: 18, name: 'لاسوتا (كولون)', type: 'مياه شرب' },
        { day: 24, name: 'جامبورو (إعادة)', type: 'مياه شرب' }
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

// التحقق من المخزون وخصم العلف
export const checkAndDeductFeed = (inventoryItems, feedType, quantity) => {
    if (!quantity || quantity <= 0) {
        return { success: true, message: 'No deduction needed' };
    }

    const feedItem = inventoryItems.find(item => 
        item.name === feedType && item.category === 'أعلاف'
    );

    if (!feedItem) {
        return { 
            success: false, 
            message: `${feedType} not found in inventory` 
        };
    }

    if (feedItem.currentStock < quantity) {
        return { 
            success: false, 
            message: `Insufficient ${feedType}. Available: ${feedItem.currentStock} kg, Required: ${quantity} kg` 
        };
    }

    // تحديث المخزون
    const updatedItems = inventoryItems.map(item => 
        item.id === feedItem.id 
            ? { ...item, currentStock: item.currentStock - quantity }
            : item
    );

    return {
        success: true,
        updatedInventory: updatedItems,
        message: `Deducted ${quantity} kg of ${feedType}`,
        cost: quantity * (feedItem.costPerUnit || 0)
    };
};

// إنشاء مخزون العلف التلقائي
export const createInitialFeedInventory = () => {
    return FEED_TYPES.map(feed => ({
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
        isFeed: true,
        lastUpdated: new Date().toISOString().split('T')[0]
    }));
};

// تحذيرات المخزون
export const generateInventoryAlerts = (inventoryItems) => {
    const alerts = [];
    const today = new Date();
    
    inventoryItems.forEach(item => {
        // تحذير المخزون المنخفض
        if (item.currentStock <= item.minStock) {
            alerts.push({
                type: 'danger',
                message: `${item.name} - منخفض المخزون (${item.currentStock} ${item.unit})`,
                itemId: item.id
            });
        }
        
        // تحذير انتهاء الصلاحية
        if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
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

// حساب إحصائيات المخزون
export const calculateInventoryStats = (inventoryItems) => {
    const totalValue = inventoryItems.reduce((sum, item) => 
        sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
    );

    const feedItems = inventoryItems.filter(item => item.category === 'أعلاف');
    const feedValue = feedItems.reduce((sum, item) => 
        sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
    );

    const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);

    return {
        totalItems: inventoryItems.length,
        totalValue,
        feedItems: feedItems.length,
        feedValue,
        lowStockItems: lowStockItems.length,
        feedItemsList: feedItems
    };
};

// دالة لتنسيق الأرقام
export const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('en-US');
};

// دالة لتنسيق العملة
export const formatCurrency = (amount) => {
    return `${formatNumber(amount)} ج`;
};

// دالة للتحقق من البيانات
export const validateRequired = (data, requiredFields) => {
    const errors = [];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    return errors;
};
