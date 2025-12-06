import React from 'react';
import { Download, Printer, Share2, FileText, AlertTriangle, Package } from 'lucide-react';
import { Button } from '../UI';

const InventoryReport = ({ inventoryItems, shareViaWhatsapp }) => {
    const generateReport = () => {
        const now = new Date();
        const reportDate = now.toLocaleDateString('ar-SA');
        const reportTime = now.toLocaleTimeString('ar-SA');
        
        const totalValue = inventoryItems.reduce((sum, item) => 
            sum + (Number(item.currentStock) * Number(item.costPerUnit || 0)), 0
        );
        
        const lowStockItems = inventoryItems.filter(item => item.currentStock <= item.minStock);
        const expiredItems = inventoryItems.filter(item => {
            if (!item.expiryDate) return false;
            const expiryDate = new Date(item.expiryDate);
            return expiryDate < new Date();
        });
        
        const itemsByCategory = inventoryItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = { count: 0, value: 0 };
            acc[item.category].count++;
            acc[item.category].value += Number(item.currentStock) * Number(item.costPerUnit || 0);
            return acc;
        }, {});

        return {
            date: reportDate,
            time: reportTime,
            totalItems: inventoryItems.length,
            totalValue,
            lowStockItems: lowStockItems.length,
            expiredItems: expiredItems.length,
            itemsByCategory,
            details: inventoryItems.map(item => ({
                name: item.name,
                category: item.category,
                stock: item.currentStock,
                minStock: item.minStock,
                unit: item.unit,
                value: Number(item.currentStock) * Number(item.costPerUnit || 0),
                supplier: item.supplier,
                status: item.currentStock <= item.minStock ? 'منخفض' : 
                       item.expiryDate && new Date(item.expiryDate) < new Date() ? 'منتهي' : 'جيد'
            }))
        };
    };

    const shareReportOnWhatsapp = () => {
        const report = generateReport();
        
        // نص التقرير المعد للمشاركة
        const reportText = `📊 *تقرير المخزون - دواجني*
        
📅 التاريخ: ${report.date}
⏰ الوقت: ${report.time}

📦 *ملخص المخزون:*
- إجمالي العناصر: ${report.totalItems}
- قيمة المخزون: ${report.totalValue.toLocaleString()} جنيهاً
- عناصر منخفضة المخزون: ${report.lowStockItems}
- عناصر منتهية الصلاحية: ${report.expiredItems}

🏷️ *التوزيع حسب النوع:*
${Object.entries(report.itemsByCategory).map(([category, data]) => 
    `• ${category}: ${data.count} عنصر (${data.value.toLocaleString()} ج)`
).join('\n')}

⚠️ *تحذيرات المخزون:*
${report.lowStockItems > 0 ? `- ${report.lowStockItems} عنصر يحتاج لإعادة طلب\n` : ''}
${report.expiredItems > 0 ? `- ${report.expiredItems} عنصر منتهي الصلاحية` : '- لا توجد عناصر منتهية'}

🚨 *التوصيات:*
1. التحقق من عناصر المخزون المنخفضة
2. مراجعة تواريخ الصلاحية
3. تحديث المخزون حسب الاستهلاك

تم إنشاء التقرير بواسطة نظام إدارة مزارع الدواجن الذكي
#دواجني #مخزون #إدارة_مزارع`;

        shareViaWhatsapp(reportText);
    };

    const exportToPDF = () => {
        const report = generateReport();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const a = document.createElement('a'); 
        a.href = dataStr; 
        a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); 
        a.click(); 
        a.remove();
    };

    const printReport = () => {
        const report = generateReport();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>تقرير المخزون - دواجني</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                    .stat-card { padding: 15px; border-radius: 10px; text-align: center; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .table th, .table td { padding: 10px; border: 1px solid #ddd; text-align: center; }
                    .warning { background-color: #fff3cd; color: #856404; }
                    .danger { background-color: #f8d7da; color: #721c24; }
                    .success { background-color: #d4edda; color: #155724; }
                    .footer { text-align: center; margin-top: 30px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 تقرير المخزون - دواجني</h1>
                    <p>التاريخ: ${report.date} | الوقت: ${report.time}</p>
                </div>
                
                <div class="stats">
                    <div class="stat-card" style="background-color: #e3f2fd;">
                        <h3>إجمالي العناصر</h3>
                        <p style="font-size: 24px; font-weight: bold;">${report.totalItems}</p>
                    </div>
                    <div class="stat-card" style="background-color: #e8f5e9;">
                        <h3>قيمة المخزون</h3>
                        <p style="font-size: 24px; font-weight: bold;">${report.totalValue.toLocaleString()} ج</p>
                    </div>
                    <div class="stat-card ${report.lowStockItems > 0 ? 'warning' : ''}">
                        <h3>عناصر منخفضة</h3>
                        <p style="font-size: 24px; font-weight: bold;">${report.lowStockItems}</p>
                    </div>
                    <div class="stat-card ${report.expiredItems > 0 ? 'danger' : ''}">
                        <h3>منتهية الصلاحية</h3>
                        <p style="font-size: 24px; font-weight: bold;">${report.expiredItems}</p>
                    </div>
                </div>
                
                <h2>التوزيع حسب النوع</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>النوع</th>
                            <th>عدد العناصر</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(report.itemsByCategory).map(([category, data]) => `
                            <tr>
                                <td>${category}</td>
                                <td>${data.count}</td>
                                <td>${data.value.toLocaleString()} ج</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                ${report.lowStockItems > 0 ? `
                    <h2>📉 عناصر تحتاج اهتمام</h2>
                    <p>الرجاء مراجعة العناصر التالية:</p>
                    <ul>
                        ${report.details.filter(item => item.status === 'منخفض').map(item => `
                            <li>${item.name} - المخزون: ${item.stock} ${item.unit} (الحد الأدنى: ${item.minStock})</li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                <div class="footer">
                    <p>تم إنشاء التقرير بواسطة نظام دواجني الذكي</p>
                    <p>© ${new Date().getFullYear()} - جميع الحقوق محفوظة</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const report = generateReport();

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={20} /> تقرير المخزون
                    </h3>
                    <div className="flex gap-2">
                        <Button onClick={exportToPDF} size="sm" variant="outline">
                            <Download size={16} /> تصدير
                        </Button>
                        <Button onClick={printReport} size="sm" variant="outline">
                            <Printer size={16} /> طباعة
                        </Button>
                        <Button onClick={shareReportOnWhatsapp} size="sm" variant="success">
                            <Share2 size={16} /> مشاركة واتساب
                        </Button>
                    </div>
                </div>
                
                {/* معلومات سريعة */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">إجمالي العناصر</p>
                                <p className="font-bold text-xl">{report.totalItems}</p>
                            </div>
                            <Package className="text-blue-500" size={24} />
                        </div>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">قيمة المخزون</p>
                                <p className="font-bold text-xl">{report.totalValue.toLocaleString()} ج</p>
                            </div>
                            <FileText className="text-green-500" size={24} />
                        </div>
                    </div>
                    
                    {report.lowStockItems > 0 && (
                        <div className="bg-yellow-50 p-3 rounded-lg col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500">عناصر منخفضة المخزون</p>
                                    <p className="font-bold text-xl text-yellow-600">{report.lowStockItems}</p>
                                </div>
                                <AlertTriangle className="text-yellow-500" size={24} />
                            </div>
                            {report.details.filter(item => item.status === 'منخفض').slice(0, 2).map(item => (
                                <p key={item.name} className="text-xs text-gray-600 mt-1">
                                    • {item.name}: {item.stock} {item.unit}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* تفاصيل التقرير */}
                <div className="space-y-3">
                    <div>
                        <h4 className="font-bold text-gray-700 mb-2">التوزيع حسب النوع:</h4>
                        <div className="space-y-2">
                            {Object.entries(report.itemsByCategory).map(([category, data]) => (
                                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">{category}</span>
                                    <div className="text-right">
                                        <p className="font-bold">{data.count} عنصر</p>
                                        <p className="text-xs text-gray-500">{data.value.toLocaleString()} ج</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {report.expiredItems > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                            <h4 className="font-bold text-red-700 mb-2">⚠️ عناصر منتهية الصلاحية:</h4>
                            {report.details.filter(item => item.status === 'منتهي').map(item => (
                                <div key={item.name} className="flex justify-between items-center mb-1">
                                    <span className="text-sm">{item.name}</span>
                                    <span className="text-sm font-bold text-red-600">
                                        انتهت الصلاحية
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center text-xs text-gray-400 pt-3 border-t">
                        <p>تم إنشاء التقرير في {report.date} الساعة {report.time}</p>
                        <p>نظام دواجني - إدارة مزارع الدواجن الذكي</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;
