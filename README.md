poultry-farm-management/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── App.jsx                    # الملف الرئيسي للتطبيق
│   ├── main.jsx                   # نقطة دخول React
│   ├── index.css                  # الأنماط العامة
│   │
│   ├── components/                # جميع المكونات
│   │   ├── SplashScreen.jsx      # شاشة البداية
│   │   ├── Dashboard.jsx         # لوحة التحكم الرئيسية
│   │   ├── HealthManager.jsx     # إدارة الصحة والتحصينات
│   │   ├── BatchManager.jsx      # إدارة الدورات
│   │   ├── DailyOperations.jsx   # اليوميات
│   │   ├── Financials.jsx        # الإدارة المالية
│   │   ├── InventoryManager.jsx  # إدارة المخزون
│   │   ├── InventoryReport.jsx   # تقرير المخزون
│   │   └── DeveloperInfo.jsx     # معلومات المطور
│   │
│   ├── utils/                     # الدوال المساعدة
│   │   ├── helpers.js            # الدوال المساعدة العامة
│   │   ├── calculations.js       # الحسابات الفنية
│   │   └── storage.js            # إدارة التخزين المحلي
│   │
│   ├── hooks/                     # Custom Hooks
│   │   ├── useLocalStorage.js    # hook للتخزين المحلي
│   │   ├── usePoultryData.js     # hook لبيانات الدواجن
│   │   └── useInventory.js       # hook لإدارة المخزون
│   │
│   ├── context/                   # Context API
│   │   └── PoultryContext.js     # حالة التطبيق المركزية
│   │
│   └── UI.jsx                     # مكونات UI الأساسية
│
├── package.json                   # إعدادات المشروع
├── vite.config.js                 # إعدادات Vite
├── tailwind.config.js             # إعدادات Tailwind CSS
├── postcss.config.js              # إعدادات PostCSS
└── README.md                      # وثائق المشروع
