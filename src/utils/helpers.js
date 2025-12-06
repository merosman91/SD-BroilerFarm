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
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateShort = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
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
    { 
        name: 'بادي 23%', 
        code: 'starter', 
        protein: '23%',
        pricePerKg: 3.02 
    },
    { 
        name: 'نامي 21%', 
        code: 'grower', 
        protein: '21%',
        pricePerKg: 2.85 
    },
    { 
        name: 'ناهي 19%', 
        code: 'finisher', 
        protein: '19%',
        pricePerKg: 2.70 
    },
    { 
        name: 'بياض 17%', 
        code: 'layer', 
        protein: '17%',
        pricePerKg: 2.55 
    }
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
    return (Number(totalFeed) / Number(totalWeight)).toFixed(2);
};

export const calculateEPEF = (weight, livability, fcr, age) => {
    if (!age || !fcr || fcr <= 0) return 0;
    const epi = (Number(weight) * Number(livability)) / (Number(fcr) * Number(age) * 10);
    return Math.round(epi);
};

export const calculateMortalityRate = (deadCount, initialCount) => {
    if (!initialCount || initialCount <= 0) return 0;
    return ((Number(deadCount) / Number(initialCount)) * 100).toFixed(1);
};

export const calculateLivability = (deadCount, initialCount) => {
    if (!initialCount || initialCount <= 0) return 0;
    return 100 - Number(calculateMortalityRate(deadCount, initialCount));
};

export const calculateBirdCost = (totalExpenses, totalBirds) => {
    if (!totalBirds || totalBirds <= 0) return 0;
    return (Number(totalExpenses) / Number(totalBirds)).toFixed(2);
};

// حساب إجمالي الإيرادات
export const calculateTotalRevenue = (sales) => {
    return sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
};

// حساب التكلفة لكل كيلو
export const calculateCostPerKg = (totalExpenses, totalWeight) => {
    if (!totalWeight || totalWeight <= 0) return 0;
    return (Number(totalExpenses) / Number(totalWeight)).toFixed(2);
};

// حساب هامش الربح
export const calculateProfitMargin = (profit, revenue) => {
    if (!revenue || revenue <= 0) return 0;
    return ((Number(profit) / Number(revenue)) * 100).toFixed(1);
};

// إنشاء جدول تحصينات تلقائي
export const generateDefaultSchedule = (batchId, startDate, addDaysFunc) => {
    const templates = [
        { day: 7, name: 'نيوكاسل + هتشنر', type: 'تقطير', description: 'لقاح ثنائي ضد مرض نيوكاسل ومرض الهتشنر' },
        { day: 10, name: 'أنفلونزا (H5N1)', type: 'حقن', description: 'لقاح ضد أنفلونزا الطيور النوع H5N1' },
        { day: 12, name: 'جامبورو', type: 'مياه شرب', description: 'لقاح ضد مرض جومبورو (متوسط)' },
        { day: 18, name: 'لاسوتا', type: 'مياه شرب', description: 'لقاح نيوكاسل لاسوتا (إعادة)' },
        { day: 24, name: 'جامبورو (إعادة)', type: 'مياه شرب', description: 'إعادة تحصين ضد مرض جومبورو' }
    ];
    
    return templates.map((t, i) => ({
        id: Date.now() + i,
        batchId,
        name: t.name,
        type: t.type,
        date: addDaysFunc(startDate, t.day),
        dayAge: t.day,
        description: t.description,
        status: 'pending',
        category: 'vaccine'
    }));
};

// التحقق من المخزون وخصم العلف
export const checkAndDeductFeed = (inventoryItems, feedType, quantity, batchId = null) => {
    if (!quantity || quantity <= 0) {
        return { success: true, message: 'لا تحتاج لخصم' };
    }

    // البحث عن العلف المناسب (مرتبط بالدورة أو عام)
    const feedItem = inventoryItems.find(item => 
        item.name === feedType && 
        item.category === 'أعلاف' &&
        (batchId === null || !item.batchId || item.batchId === batchId)
    );

    if (!feedItem) {
        // إذا لم يتم العثور على علف مرتبط بالدورة، ابحث عن علف عام
        const generalFeedItem = inventoryItems.find(item => 
            item.name === feedType && 
            item.category === 'أعلاف' &&
            !item.batchId
        );
        
        if (!generalFeedItem) {
            return { 
                success: false, 
                message: `${feedType} غير موجود في المخزون` 
            };
        }
        
        // استخدام العلف العام
        if (generalFeedItem.currentStock < quantity) {
            return { 
                success: false, 
                message: `مخزون ${feedType} غير كافٍ. المتاح: ${generalFeedItem.currentStock} كجم، المطلوب: ${quantity} كجم` 
            };
        }

        // تحديث المخزون العام
        const updatedItems = inventoryItems.map(item => 
            item.id === generalFeedItem.id 
                ? { ...item, currentStock: item.currentStock - quantity }
                : item
        );

        return {
            success: true,
            updatedInventory: updatedItems,
            message: `تم خصم ${quantity} كجم من ${feedType}`,
            cost: quantity * (generalFeedItem.costPerUnit || 0)
        };
    }

    // استخدام العلف المخصص للدورة
    if (feedItem.currentStock < quantity) {
        return { 
            success: false, 
            message: `مخزون ${feedType} غير كافٍ. المتاح: ${feedItem.currentStock} كجم، المطلوب: ${quantity} كجم` 
        };
    }

    // تحديث المخزون المخصص للدورة
    const updatedItems = inventoryItems.map(item => 
        item.id === feedItem.id 
            ? { ...item, currentStock: item.currentStock - quantity }
            : item
    );

    return {
        success: true,
        updatedInventory: updatedItems,
        message: `تم خصم ${quantity} كجم من ${feedType}`,
        cost: quantity * (feedItem.costPerUnit || 0)
    };
};

// إنشاء مخزون العلف التلقائي لدورة جديدة
export const createInitialFeedInventory = (batchId = null) => {
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
        batchId: batchId, // ربط بالدورة إذا تم توفير batchId
        lastUpdated: new Date().toISOString().split('T')[0]
    }));
};

// تحذيرات المخزون للدورة النشطة
export const generateInventoryAlerts = (inventoryItems, batchId = null) => {
    const alerts = [];
    
    // فلترة العناصر حسب الدورة (إذا تم تحديد batchId)
    const filteredItems = inventoryItems.filter(item => 
        batchId === null || !item.batchId || item.batchId === batchId
    );
    
    filteredItems.forEach(item => {
        // تحقق من المخزون المنخفض
        if (item.currentStock <= item.minStock && item.currentStock > 0) {
            alerts.push({
                type: 'warning',
                itemId: item.id,
                message: `المخزون منخفض: ${item.name} (${item.currentStock} ${item.unit})`,
                itemType: item.batchId ? 'خاص بالدورة' : 'عام'
            });
        }
        
        // تحقق من نفاد المخزون
        if (item.currentStock <= 0) {
            alerts.push({
                type: 'danger',
                itemId: item.id,
                message: `نفاذ المخزون: ${item.name}`,
                itemType: item.batchId ? 'خاص بالدورة' : 'عام'
            });
        }
        
        // تحقق من تاريخ الانتهاء
        if (item.expiryDate) {
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 30 && daysDiff > 0) {
                alerts.push({
                    type: 'warning',
                    itemId: item.id,
                    message: `ينتهي خلال ${daysDiff} يوم: ${item.name}`,
                    itemType: item.batchId ? 'خاص بالدورة' : 'عام'
                });
            } else if (expiryDate < today) {
                alerts.push({
                    type: 'danger',
                    itemId: item.id,
                    message: `منتهي الصلاحية: ${item.name}`,
                    itemType: item.batchId ? 'خاص بالدورة' : 'عام'
                });
            }
        }
    });
    
    return alerts;
};

// حساب إحصائيات المخزون للدورة النشطة
export const calculateInventoryStats = (inventoryItems, batchId = null) => {
    // فلترة العناصر حسب الدورة (إذا تم تحديد batchId)
    const filteredItems = inventoryItems.filter(item => 
        batchId === null || !item.batchId || item.batchId === batchId
    );

    const totalValue = filteredItems.reduce((sum, item) => 
        sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
    );

    const feedItems = filteredItems.filter(item => item.category === 'أعلاف');
    const feedValue = feedItems.reduce((sum, item) => 
        sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
    );

    const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minStock);

    return {
        totalItems: filteredItems.length,
        totalValue,
        feedItems: feedItems.length,
        feedValue,
        lowStockItems: lowStockItems.length,
        feedItemsList: feedItems,
        filteredItems: filteredItems
    };
};

// دالة لتنسيق الأرقام باللغة العربية
export const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '0';
    
    const number = Number(num);
    if (isNaN(number)) return '0';
    
    // تنسيق الأرقام العربية مع الاحتفاظ بالفواصل
    return number.toLocaleString('ar-SA');
};

// دالة لتنسيق العملة باللغة العربية
export const formatCurrency = (amount) => {
    return `${formatNumber(amount)} ج`;
};

// دالة للتحقق من البيانات
export const validateRequired = (data, requiredFields) => {
    const errors = [];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
            errors.push(`${field} مطلوب`);
        }
    });
    return errors;
};

// دالة للتحقق من البيانات الرقمية
export const validateNumeric = (data, numericFields) => {
    const errors = [];
    numericFields.forEach(field => {
        const value = data[field];
        if (value && isNaN(Number(value))) {
            errors.push(`${field} يجب أن يكون رقم`);
        }
        if (value && Number(value) < 0) {
            errors.push(`${field} يجب أن يكون رقم موجب`);
        }
    });
    return errors;
};

// حساب عمر الدورة بالكامل
export const calculateBatchAge = (startDate, endDate = null) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// حساب متوسط الوزن اليومي
export const calculateDailyWeightGain = (currentWeight, startWeight, age) => {
    if (!age || age <= 0) return 0;
    return ((Number(currentWeight) - Number(startWeight || 40)) / Number(age)).toFixed(1);
};

// حساب استهلاك العلف لكل طائر
export const calculateFeedPerBird = (totalFeed, currentBirds) => {
    if (!currentBirds || currentBirds <= 0) return 0;
    return (Number(totalFeed) / Number(currentBirds)).toFixed(2);
};

// حساب الكتلة الحيوية الإجمالية
export const calculateTotalBiomass = (currentWeight, currentBirds) => {
    if (!currentWeight || !currentBirds) return 0;
    return ((Number(currentWeight) / 1000) * Number(currentBirds)).toFixed(2);
};

// حساب التكلفة لكل كيلو لحم
export const calculateCostPerKgMeat = (totalExpenses, totalWeight) => {
    if (!totalWeight || totalWeight <= 0) return 0;
    return (Number(totalExpenses) / Number(totalWeight)).toFixed(2);
};

// تحليل الأداء المالي
export const analyzeFinancialPerformance = (sales, expenses) => {
    const totalRevenue = calculateTotalRevenue(sales);
    const totalCost = expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = calculateProfitMargin(profit, totalRevenue);
    
    return {
        totalRevenue,
        totalCost,
        profit,
        profitMargin,
        roi: totalCost > 0 ? ((profit / totalCost) * 100).toFixed(1) : 0,
        breakEvenPoint: profit >= 0 ? 'مربح' : 'خسارة'
    };
};

// توليد معرف فريد
export const generateUniqueId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
};

// تحويل التاريخ من صيغة إلى أخرى
export const convertDateFormat = (dateString, format = 'YYYY-MM-DD') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        default:
            return date.toISOString().split('T')[0];
    }
};

// تحويل الوزن من جرام إلى كيلو
export const convertGramToKg = (grams) => {
    return Number(grams) / 1000;
};

// تحويل الوزن من كيلو إلى جرام
export const convertKgToGram = (kg) => {
    return Number(kg) * 1000;
};

// تقريب الأرقام
export const roundNumber = (num, decimals = 2) => {
    return Number(Number(num).toFixed(decimals));
};

// التحقق من تاريخ انتهاء الصلاحية
export const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
};

// حساب الأيام المتبقية حتى انتهاء الصلاحية
export const daysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// ترتيب البيانات حسب التاريخ
export const sortByDate = (data, descending = true) => {
    return [...data].sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0);
        const dateB = new Date(b.date || b.createdAt || 0);
        return descending ? dateB - dateA : dateA - dateB;
    });
};

// ترشيح البيانات حسب النطاق الزمني
export const filterByDateRange = (data, startDate, endDate) => {
    if (!startDate && !endDate) return data;
    
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    
    return data.filter(item => {
        const itemDate = new Date(item.date || item.createdAt || 0);
        return itemDate >= start && itemDate <= end;
    });
};

// إنشاء ملخص التقرير
export const generateReportSummary = (data, type) => {
    const summary = {
        total: data.length,
        totalValue: 0,
        averageValue: 0,
        minValue: Infinity,
        maxValue: 0
    };

    if (data.length === 0) return summary;

    let total = 0;
    data.forEach(item => {
        const value = type === 'sales' ? Number(item.total || 0) : Number(item.cost || 0);
        total += value;
        summary.minValue = Math.min(summary.minValue, value);
        summary.maxValue = Math.max(summary.maxValue, value);
    });

    summary.totalValue = total;
    summary.averageValue = total / data.length;
    summary.minValue = summary.minValue === Infinity ? 0 : summary.minValue;

    return summary;
};
