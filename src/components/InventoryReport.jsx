import React from 'react';
import { Download, Printer, Share2, FileText, AlertTriangle, Package } from 'lucide-react';
import { Button } from '../UI';

const InventoryReport = ({ inventoryItems, activeBatch, shareViaWhatsapp }) => {
    const generateReport = () => {
        const now = new Date();
        const reportDate = now.toLocaleDateString('ar-SA');
        const reportTime = now.toLocaleTimeString('ar-SA');
        
        // تصفية العناصر حسب الدورة النشطة
        const filteredItems = inventoryItems.filter(item => {
            // إذا كانت هناك دورة نشطة، اعرض فقط العناصر المرتبطة بها والعناصر العامة
            if (activeBatch) {
                return !item.batchId || item.batchId === activeBatch.id;
            }
            return true; // إذا لم تكن هناك دورة نشطة، اعرض جميع العناصر
        });
        
        const totalValue = filteredItems.reduce((sum, item) => 
            sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
        );
        
        const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minStock);
        const expiredItems = filteredItems.filter(item => {
            if (!item.expiryDate) return false;
            const expiryDate = new Date(item.expiryDate);
            return expiryDate < new Date();
        });
        
        const itemsByCategory = filteredItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = { count: 0, value: 0 };
            acc[item.category].count++;
            acc[item.category].value += Number(item.currentStock) * Number(item.costPerUnit || 0);
            return acc;
        }, {});

        // تحليل حسب الدورة
        const itemsByBatch = filteredItems.reduce((acc, item) => {
            const batchName = item.batchId ? `دورة ${activeBatch?.name || 'غير معروفة'}` : 'مخزون عام';
            if (!acc[batchName]) acc[batchName] = { count: 0, value: 0 };
            acc[batchName].count++;
            acc[batchName].value += Number(item.currentStock) * Number(item.costPerUnit || 0);
            return acc;
        }, {});

        // حساب إجماليات الأعلاف
        const feedItems = filteredItems.filter(item => item.category === 'أعلاف');
        const totalFeedStock = feedItems.reduce((sum, item) => sum + Number(item.currentStock), 0);
        const totalFeedValue = feedItems.reduce((sum, item) => 
            sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
        );

        return {
            date: reportDate,
            time: reportTime,
            batchName: activeBatch?.name || 'جميع الدورات',
            totalItems: filteredItems.length,
            totalValue,
            lowStockItems: lowStockItems.length,
            expiredItems: expiredItems.length,
            feedItems: feedItems.length,
            totalFeedStock,
            totalFeedValue,
            itemsByCategory,
            itemsByBatch,
            details: filteredItems.map(item => ({
                name: item.name,
                category: item.category,
                batchType: item.batchId ? 'خاص بالدورة' : 'عام',
                stock: item.currentStock,
                minStock: item.minStock,
                unit: item.unit,
                costPerUnit: item.costPerUnit || 0,
                value: Number(item.currentStock) * Number(item.costPerUnit || 0),
                supplier: item.supplier,
                expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('ar-SA') : 'غير محدد',
                status: item.currentStock <= item.minStock ? 'منخفض' : 
                       item.expiryDate && new Date(item.expiryDate) < new Date() ? 'منتهي' : 'جيد'
            }))
        };
    };

    const shareReportOnWhatsapp = () => {
        const report = generateReport();
        
        // نص التقرير المعد للمشاركة
        let reportText = `📊 *تقرير المخزون - دواجني*\n\n`;
        reportText += `🏭 *الدورة:* ${report.batchName}\n`;
        reportText += `📅 التاريخ: ${report.date}\n`;
        reportText += `⏰ الوقت: ${report.time}\n\n`;
        
        reportText += `📦 *ملخص المخزون:*\n`;
        reportText += `• إجمالي العناصر: ${report.totalItems}\n`;
        reportText += `• قيمة المخزون: ${report.totalValue.toLocaleString('ar-SA')} جنيهاً\n`;
        reportText += `• عناصر منخفضة المخزون: ${report.lowStockItems}\n`;
        reportText += `• عناصر منتهية الصلاحية: ${report.expiredItems}\n`;
        reportText += `• عناصر علف: ${report.feedItems} (${report.totalFeedStock.toLocaleString('ar-SA')} كجم)\n\n`;
        
        reportText += `🏷️ *التوزيع حسب النوع:*\n`;
        Object.entries(report.itemsByCategory).forEach(([category, data]) => {
            reportText += `• ${category}: ${data.count} عنصر (${data.value.toLocaleString('ar-SA')} ج)\n`;
        });
        
        if (Object.keys(report.itemsByBatch).length > 1) {
            reportText += `\n🔢 *التوزيع حسب الدورة:*\n`;
            Object.entries(report.itemsByBatch).forEach(([batch, data]) => {
                reportText += `• ${batch}: ${data.count} عنصر (${data.value.toLocaleString('ar-SA')} ج)\n`;
            });
        }
        
        reportText += `\n⚠️ *تحذيرات المخزون:*\n`;
        if (report.lowStockItems > 0) {
            reportText += `• ${report.lowStockItems} عنصر يحتاج لإعادة طلب\n`;
        }
        if (report.expiredItems > 0) {
            reportText += `• ${report.expiredItems} عنصر منتهي الصلاحية\n`;
        }
        
        reportText += `\n🚨 *التوصيات:*\n`;
        reportText += `1. التحقق من عناصر المخزون المنخفضة\n`;
        reportText += `2. مراجعة تواريخ الصلاحية\n`;
        reportText += `3. تحديث المخزون حسب الاستهلاك\n`;
        reportText += `4. توزيع المخزون حسب متطلبات كل دورة\n\n`;
        
        reportText += `تم إنشاء التقرير بواسطة نظام إدارة مزارع الدواجن الذكي\n`;
        reportText += `#دواجني #مخزون #إدارة_مزارع`;

        if (shareViaWhatsapp) {
            shareViaWhatsapp(reportText);
        } else {
            // إذا لم تكن الدالة متوفرة، افتح رابط واتساب مباشر
            const encodedText = encodeURIComponent(reportText);
            window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }
    };

    const exportToPDF = () => {
        const report = generateReport();
        
        // إنشاء محتوى PDF مبسط
        const reportContent = `
            تقرير المخزون - دواجني
            ========================
            
            الدورة: ${report.batchName}
            التاريخ: ${report.date}
            الوقت: ${report.time}
            
            ملخص المخزون:
            -------------
            إجمالي العناصر: ${report.totalItems}
            قيمة المخزون: ${report.totalValue.toLocaleString('ar-SA')} ج
            عناصر منخفضة المخزون: ${report.lowStockItems}
            عناصر منتهية الصلاحية: ${report.expiredItems}
            عناصر علف: ${report.feedItems} (${report.totalFeedStock} كجم)
            
            التوزيع حسب النوع:
            ------------------
            ${Object.entries(report.itemsByCategory).map(([category, data]) => 
                `${category}: ${data.count} عنصر (${data.value.toLocaleString('ar-SA')} ج)`
            ).join('\n')}
            
            ${report.lowStockItems > 0 ? `
            عناصر تحتاج اهتمام:
            -------------------
            ${report.details.filter(item => item.status === 'منخفض').map(item => 
                `${item.name} - المخزون: ${item.stock} ${item.unit} (الحد الأدنى: ${item.minStock})`
            ).join('\n')}
            ` : ''}
            
            ${report.expiredItems > 0 ? `
            عناصر منتهية الصلاحية:
            ----------------------
            ${report.details.filter(item => item.status === 'منتهي').map(item => 
                `${item.name} - انتهت بتاريخ: ${item.expiryDate}`
            ).join('\n')}
            ` : ''}
            
            تم إنشاء التقرير: ${new Date().toLocaleString('ar-SA')}
            نظام دواجني - إدارة مزارع الدواجن الذكي
        `;
        
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير_المخزون_${report.batchName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const printReport = () => {
        const report = generateReport();
        const printWindow = window.open('', '_blank');
        
        const itemsList = report.details.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.batchType}</td>
                <td class="${item.status === 'منخفض' ? 'warning' : item.status === 'منتهي' ? 'danger' : ''}">
                    ${item.stock} ${item.unit}
                </td>
                <td>${item.minStock}</td>
                <td>${item.value.toLocaleString('ar-SA')} ج</td>
                <td class="${item.status === 'منخفض' ? 'warning' : item.status === 'منتهي' ? 'danger' : 'success'}">
                    ${item.status}
                </td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html dir="rtl" lang="ar">
            <head>
                <title>تقرير المخزون - دواجني</title>
                <meta charset="UTF-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap');
                    
                    * {
                        font-family: 'Cairo', Arial, sans-serif;
                        box-sizing: border-box;
                    }
                    
                    body {
                        margin: 20px;
                        padding: 0;
                        background: #f5f5f5;
                        color: #333;
                    }
                    
                    .print-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 15px;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4CAF50;
                    }
                    
                    .header h1 {
                        color: #2c3e50;
                        margin: 0 0 10px 0;
                        font-size: 28px;
                    }
                    
                    .header .subtitle {
                        color: #7f8c8d;
                        font-size: 16px;
                    }
                    
                    .batch-info {
                        background: #e8f5e9;
                        padding: 15px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        border-right: 5px solid #4CAF50;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin: 25px 0;
                    }
                    
                    .stat-card {
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    }
                    
                    .stat-card.alert {
                        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                    }
                    
                    .stat-card.danger {
                        background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
                    }
                    
                    .stat-card.success {
                        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                    }
                    
                    .stat-card h3 {
                        margin: 0 0 10px 0;
                        font-size: 14px;
                        color: #555;
                    }
                    
                    .stat-card .value {
                        font-size: 32px;
                        font-weight: bold;
                        color: #2c3e50;
                    }
                    
                    .section-title {
                        color: #2c3e50;
                        margin: 30px 0 15px 0;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #ddd;
                        font-size: 20px;
                    }
                    
                    .table-container {
                        overflow-x: auto;
                        margin: 20px 0;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    
                    th {
                        background: #2c3e50;
                        color: white;
                        padding: 12px;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                        text-align: center;
                    }
                    
                    tr:hover {
                        background: #f9f9f9;
                    }
                    
                    .warning {
                        background-color: #fff3cd !important;
                        color: #856404;
                        font-weight: bold;
                    }
                    
                    .danger {
                        background-color: #f8d7da !important;
                        color: #721c24;
                        font-weight: bold;
                    }
                    
                    .success {
                        background-color: #d4edda !important;
                        color: #155724;
                    }
                    
                    .category-summary {
                        display: flex;
                        justify-content: space-between;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 10px;
                        margin: 10px 0;
                        border-right: 4px solid #3498db;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #7f8c8d;
                        font-size: 14px;
                    }
                    
                    @media print {
                        body {
                            background: white;
                            margin: 0;
                        }
                        
                        .print-container {
                            box-shadow: none;
                            padding: 10px;
                        }
                        
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="header">
                        <h1>📊 تقرير المخزون - دواجني</h1>
                        <p class="subtitle">نظام إدارة مزارع الدواجن الذكي</p>
                    </div>
                    
                    <div class="batch-info">
                        <h2 style="margin: 0; color: #27ae60;">الدورة: ${report.batchName}</h2>
                        <p style="margin: 5px 0 0 0; color: #555;">التاريخ: ${report.date} | الوقت: ${report.time}</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>إجمالي العناصر</h3>
                            <div class="value">${report.totalItems}</div>
                        </div>
                        
                        <div class="stat-card success">
                            <h3>قيمة المخزون</h3>
                            <div class="value">${report.totalValue.toLocaleString('ar-SA')} ج</div>
                        </div>
                        
                        <div class="stat-card ${report.lowStockItems > 0 ? 'alert' : ''}">
                            <h3>عناصر منخفضة</h3>
                            <div class="value">${report.lowStockItems}</div>
                        </div>
                        
                        <div class="stat-card ${report.expiredItems > 0 ? 'danger' : ''}">
                            <h3>منتهية الصلاحية</h3>
                            <div class="value">${report.expiredItems}</div>
                        </div>
                    </div>
                    
                    <h3 class="section-title">📈 التوزيع حسب النوع</h3>
                    ${Object.entries(report.itemsByCategory).map(([category, data]) => `
                        <div class="category-summary">
                            <span style="font-weight: bold; color: #2c3e50;">${category}</span>
                            <div style="text-align: left;">
                                <span style="color: #27ae60; font-weight: bold;">${data.count} عنصر</span><br>
                                <span style="color: #7f8c8d; font-size: 14px;">${data.value.toLocaleString('ar-SA')} ج</span>
                            </div>
                        </div>
                    `).join('')}
                    
                    <h3 class="section-title">📋 تفاصيل المخزون</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>اسم العنصر</th>
                                    <th>الفئة</th>
                                    <th>النوع</th>
                                    <th>المخزون</th>
                                    <th>الحد الأدنى</th>
                                    <th>القيمة</th>
                                    <th>الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>
                    </div>
                    
                    ${report.lowStockItems > 0 ? `
                        <div class="warning" style="padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #856404;">⚠️ عناصر تحتاج إعادة طلب فورية</h3>
                            <ul style="margin: 0; padding-right: 20px;">
                                ${report.details.filter(item => item.status === 'منخفض').slice(0, 5).map(item => `
                                    <li>${item.name} - ${item.stock} ${item.unit} من أصل ${item.minStock} ${item.unit}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p>تم إنشاء التقرير في: ${new Date().toLocaleString('ar-SA')}</p>
                        <p>نظام دواجني © ${new Date().getFullYear()} - جميع الحقوق محفوظة</p>
                        <p class="no-print">هذا التقرير خاص ولا يجوز مشاركته دون إذن</p>
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const report = generateReport();

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                {/* رأس التقرير */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <FileText size={24} className="text-blue-500" /> تقرير المخزون
                        </h3>
                        {activeBatch && (
                            <p className="text-sm text-green-600 mt-1">
                                <span className="font-bold">الدورة الحالية:</span> {activeBatch.name}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={exportToPDF} 
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            size="sm"
                        >
                            <Download size={16} /> تصدير
                        </Button>
                        <Button 
                            onClick={printReport} 
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            size="sm"
                        >
                            <Printer size={16} /> طباعة
                        </Button>
                        <Button 
                            onClick={shareReportOnWhatsapp} 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            size="sm"
                        >
                            <Share2 size={16} /> مشاركة
                        </Button>
                    </div>
                </div>
                
                {/* معلومات الدورة */}
                {activeBatch && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-blue-800">مخزون الدورة الحالية</h4>
                                <p className="text-sm text-blue-600">كل دورة لها مخزونها الخاص بالإضافة للمخزون العام</p>
                            </div>
                            <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                                {report.details.filter(item => item.batchType === 'خاص بالدورة').length} عنصر خاص
                            </span>
                        </div>
                    </div>
                )}
                
                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">إجمالي العناصر</p>
                                <p className="font-bold text-2xl text-blue-600">{report.totalItems}</p>
                            </div>
                            <Package className="text-blue-400" size={24} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            {report.details.filter(item => item.batchType === 'خاص بالدورة').length} خاص بالدورة
                        </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">قيمة المخزون</p>
                                <p className="font-bold text-2xl text-green-600">{report.totalValue.toLocaleString('ar-SA')} ج</p>
                            </div>
                            <FileText className="text-green-400" size={24} />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            {report.totalFeedValue.toLocaleString('ar-SA')} ج للعلف
                        </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-xl border border-yellow-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">منخفض المخزون</p>
                                <p className="font-bold text-2xl text-yellow-600">{report.lowStockItems}</p>
                            </div>
                            <AlertTriangle className="text-yellow-400" size={24} />
                        </div>
                        {report.lowStockItems > 0 && (
                            <p className="text-xs text-yellow-600 mt-2 font-bold">
                                يحتاج اهتمام عاجل
                            </p>
                        )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">منتهي الصلاحية</p>
                                <p className="font-bold text-2xl text-red-600">{report.expiredItems}</p>
                            </div>
                            <AlertTriangle className="text-red-400" size={24} />
                        </div>
                        {report.expiredItems > 0 && (
                            <p className="text-xs text-red-600 mt-2 font-bold">
                                يجب التخلص فوراً
                            </p>
                        )}
                    </div>
                </div>
                
                {/* التحليل التفصيلي */}
                <div className="space-y-4">
                    {/* توزيع حسب النوع */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h4 className="font-bold text-gray-700 mb-3">📊 التوزيع حسب النوع</h4>
                        <div className="space-y-2">
                            {Object.entries(report.itemsByCategory).map(([category, data]) => (
                                <div key={category} className="flex justify-between items-center p-3 bg-white rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            category === 'أعلاف' ? 'bg-green-500' :
                                            category === 'أدوية وتحصينات' ? 'bg-blue-500' :
                                            category === 'مستلزمات' ? 'bg-purple-500' : 'bg-gray-500'
                                        }`}></div>
                                        <span className="font-medium text-gray-700">{category}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800">{data.count} عنصر</p>
                                        <p className="text-sm text-gray-500">{data.value.toLocaleString('ar-SA')} ج</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* تفاصيل الأعلاف */}
                    {report.feedItems > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                            <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                                🌾 مخزون الأعلاف
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">إجمالي العلف</p>
                                    <p className="font-bold text-green-600">{report.feedItems} نوع</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">الكمية الإجمالية</p>
                                    <p className="font-bold text-green-600">{report.totalFeedStock.toLocaleString('ar-SA')} كجم</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* التحذيرات */}
                    {(report.lowStockItems > 0 || report.expiredItems > 0) && (
                        <div className="space-y-3">
                            {report.lowStockItems > 0 && (
                                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                                    <h4 className="font-bold text-yellow-700 mb-3">⚠️ عناصر منخفضة المخزون</h4>
                                    <div className="space-y-2">
                                        {report.details.filter(item => item.status === 'منخفض').slice(0, 3).map(item => (
                                            <div key={item.name} className="flex justify-between items-center p-2 bg-white rounded">
                                                <div>
                                                    <p className="font-medium text-gray-700">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-red-600">{item.stock} {item.unit}</p>
                                                    <p className="text-xs text-gray-500">الحد: {item.minStock}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {report.expiredItems > 0 && (
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                                    <h4 className="font-bold text-red-700 mb-3">⛔ عناصر منتهية الصلاحية</h4>
                                    <div className="space-y-2">
                                        {report.details.filter(item => item.status === 'منتهي').map(item => (
                                            <div key={item.name} className="flex justify-between items-center p-2 bg-white rounded">
                                                <div>
                                                    <p className="font-medium text-gray-700">{item.name}</p>
                                                    <p className="text-xs text-gray-500">انتهى: {item.expiryDate}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-red-600">منتهي</p>
                                                    <p className="text-xs text-gray-500">المخزون: {item.stock} {item.unit}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* تذييل التقرير */}
                    <div className="pt-4 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-500">
                            تم إنشاء التقرير في {report.date} الساعة {report.time}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            نظام دواجني الذكي • إدارة مزارع الدواجن بكفاءة
                        </p>
                        <div className="flex justify-center gap-2 mt-2 text-xs text-gray-400">
                            <span>• كل دورة بمخزونها</span>
                            <span>• متابعة ذكية للمخزون</span>
                            <span>• تقارير لحظية</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;
