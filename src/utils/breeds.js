export const CHICKEN_BREEDS = [
    {
        id: 'arbor-acres',
        name: 'أربور إيكرز',
        arabicName: 'أربور إيكرز',
        category: 'لاحم',
        description: 'سلالة أمريكية مشهورة لإنتاج اللحم. تتميز بالنمو السريع وكفاءة التحويل الغذائي العالية.',
        characteristics: [
            'معدل نمو سريع جداً',
            'كفاءة تحويل غذائي ممتازة (FCR منخفض)',
            'لون جلد أصفر',
            'مناعة جيدة',
            'معدل نفوق منخفض'
        ],
        performance: {
            growthPeriod: '35-42 يوم',
            targetWeight: '2.0 - 2.5 كجم',
            fcr: '1.55 - 1.65',
            livability: '96-98%',
            feedConsumption: '4.0 - 4.5 كجم'
        },
        advantages: [
            'أعلى إنتاجية لحم',
            'تكاليف إنتاج منخفضة',
            'تتحمل الظروف البيئية المختلفة',
            'لون اللحم المفضل في السوق'
        ],
        disadvantages: [
            'تستهلك كمية كبيرة من العلف',
            'تتطلب رعاية صحية مكثفة',
            'حساسة للإجهاد الحراري'
        ],
        suitableFor: 'المزارع التجارية الكبيرة والمتوسطة',
        marketDemand: 'مرتفع جداً'
    },
    {
        id: 'cobb-500',
        name: 'كوب 500',
        arabicName: 'كوب ٥٠٠',
        category: 'لاحم',
        description: 'سلالة عالمية مشهورة لإنتاج اللحم الأبيض. تتميز بصلابة عالية ومقاومة للأمراض.',
        characteristics: [
            'لون جلد أبيض ناصع',
            'صدر عريض وعضلات متطورة',
            'مناعة قوية',
            'تحمل للظروف الصعبة',
            'نمو متجانس'
        ],
        performance: {
            growthPeriod: '38-42 يوم',
            targetWeight: '2.2 - 2.7 كجم',
            fcr: '1.50 - 1.60',
            livability: '97-99%',
            feedConsumption: '4.2 - 4.8 كجم'
        },
        advantages: [
            'أفضل مؤشر EPEF في الصناعة',
            'تحويل غذائي ممتاز',
            'مناعة عالية ضد الأمراض',
            'نسبة صدر عالية'
        ],
        disadvantages: [
            'سعر الكتكوت مرتفع نسبياً',
            'تتطلب تغذية متوازنة'
        ],
        suitableFor: 'جميع أنواع المزارع',
        marketDemand: 'مرتفع عالمياً'
    },
    {
        id: 'ross-308',
        name: 'روس 308',
        arabicName: 'روس ٣٠٨',
        category: 'لاحم',
        description: 'سلالة أوروبية مشهورة، مناسبة للظروف المناخية الحارة ولها قدرة تحمل عالية.',
        characteristics: [
            'جسم قوي وعضلات متطورة',
            'ريش أبيض كثيف',
            'قدرة تحمل للحرارة',
            'نمو سريع في المراحل الأولى',
            'لون جلد وردي'
        ],
        performance: {
            growthPeriod: '40-45 يوم',
            targetWeight: '2.3 - 2.8 كجم',
            fcr: '1.60 - 1.70',
            livability: '95-97%',
            feedConsumption: '4.5 - 5.0 كجم'
        },
        advantages: [
            'تتحمل الحرارة العالية',
            'مناسبة للمناطق الحارة',
            'لون اللحم محبب للمستهلك',
            'تكاليف إنتاج معقولة'
        ],
        disadvantages: [
            'حساسة للرطوبة العالية',
            'تتطلب تهوية جيدة'
        ],
        suitableFor: 'المناطق الحارة والمعتدلة',
        marketDemand: 'مرتفع في الشرق الأوسط'
    },
    {
        id: 'lohmann-brown',
        name: 'لومان براون',
        arabicName: 'لومان براون',
        category: 'بياض',
        description: 'سلالة ألمانية مشهورة لإنتاج البيض البني. تتميز بإنتاج عالي وكفاءة غذائية ممتازة.',
        characteristics: [
            'ريش بني محمر',
            'بيض بني كبير',
            'إنتاج عالي',
            'هادئة الطباع',
            'تتحمل الأقفاص'
        ],
        performance: {
            eggProduction: '300-320 بيضة/سنة',
            eggWeight: '62-64 جرام',
            fcr: '2.0 - 2.2',
            livability: '94-96%',
            feedConsumption: '110-120 جرام/يوم'
        },
        advantages: [
            'إنتاج بيض عالي الجودة',
            'بيض بني مرغوب في السوق',
            'تتحمل أنظمة التربية المختلفة',
            'كفاءة تحويل غذائي جيدة'
        ],
        disadvantages: [
            'لا تصلح لإنتاج اللحم',
            'تتطلب رعاية متخصصة'
        ],
        suitableFor: 'مزارع البيض التجارية',
        marketDemand: 'مرتفع للبيض البني'
    },
    {
        id: 'hy-line',
        name: 'هاي لاين',
        arabicName: 'هاي لاين',
        category: 'بياض',
        description: 'سلالة أمريكية لإنتاج البيض الأبيض. تتميز بالإنتاج العالي والمناعة القوية.',
        characteristics: [
            'ريش أبيض',
            'بيض أبيض كبير',
            'صغر حجم الجسم',
            'استهلاك علف منخفض',
            'إنتاج مبكر'
        ],
        performance: {
            eggProduction: '310-330 بيضة/سنة',
            eggWeight: '60-62 جرام',
            fcr: '1.9 - 2.1',
            livability: '95-97%',
            feedConsumption: '105-115 جرام/يوم'
        },
        advantages: [
            'أعلى إنتاج بيض',
            'استهلاك علف منخفض',
            'مناعة ممتازة',
            'تتحمل درجات الحرارة'
        ],
        disadvantages: [
            'حساسة للإجهاد',
            'تتطفل إضاءة متحكم بها'
        ],
        suitableFor: 'مزارع البيض المكثفة',
        marketDemand: 'مرتفع للبيض الأبيض'
    },
    {
        id: 'baladi',
        name: 'بلدي',
        arabicName: 'بلدي',
        category: 'مزدوج',
        description: 'سلالة محلية تقليدية، مناسبة للتربية المنزلية والصغيرة. تتميز بمقاومة عالية للأمراض.',
        characteristics: [
            'ألوان متنوعة',
            'حجم صغير إلى متوسط',
            'مقاومة عالية',
            'قدرة على البحث عن الغذاء',
            'تحمل الظروف القاسية'
        ],
        performance: {
            growthPeriod: '70-90 يوم',
            targetWeight: '1.5 - 2.0 كجم',
            eggProduction: '150-180 بيضة/سنة',
            livability: '85-90%',
            feedConsumption: 'منخفض'
        },
        advantages: [
            'مقاومة عالية للأمراض',
            'تتحمل الظروف الصعبة',
            'لا تحتاج رعاية مكثفة',
            'طعم اللحم مميز'
        ],
        disadvantages: [
            'نمو بطيء',
            'إنتاج منخفض',
            'غير متجانسة'
        ],
        suitableFor: 'التربية المنزلية والصغيرة',
        marketDemand: 'متوسط (للسوق المحلي)'
    }
];

// فئات السلالات
export const BREED_CATEGORIES = [
    { id: 'all', name: 'جميع السلالات' },
    { id: 'broiler', name: 'لاحم' },
    { id: 'layer', name: 'بياض' },
    { id: 'dual', name: 'مزدوج' }
];

// الحصول على سلالة بالاسم
export const getBreedByName = (name) => {
    return CHICKEN_BREEDS.find(breed => 
        breed.name === name || breed.arabicName === name
    );
};

// الحصول على سلالات حسب الفئة
export const getBreedsByCategory = (category) => {
    if (category === 'all') return CHICKEN_BREEDS;
    const categoryMap = {
        'broiler': 'لاحم',
        'layer': 'بياض',
        'dual': 'مزدوج'
    };
    return CHICKEN_BREEDS.filter(breed => breed.category === categoryMap[category]);
};
