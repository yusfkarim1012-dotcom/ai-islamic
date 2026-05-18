export type Language = 'ku' | 'ar';

export interface Translations {
    appName: string;
    subtitle: string;
    welcomeMessage: string;
    welcomeSubtitle: string;
    bismillah: string;
    placeholder: string;
    settings: string;
    fontSize: string;
    fontSizeSmall: string;
    fontSizeMedium: string;
    fontSizeLarge: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    download: string;
    downloadApp: string;
    aboutApp: string;
    aboutDescription: string;
    version: string;
    language: string;
    connect: string;
    history: string;
    newChat: string;
    noChats: string;
    rename: string;
    renameTitle: string;
    newName: string;
    cancel: string;
    save: string;
    delete: string;
    deleteConfirm: string;
    yes: string;
    no: string;
    copied: string;
    fast: string;
    detailed: string;
    goBack: string;
    createdBy: string;
    // Install page
    installTitle: string;
    installSubtitle: string;
    alreadyInstalled: string;
    alreadyInstalledDesc: string;
    quickInstall: string;
    quickInstallDesc: string;
    forAndroid: string;
    forIOS: string;
    forDesktop: string;
    step1Android: string;
    step2Android: string;
    step3Android: string;
    step1IOS: string;
    step2IOS: string;
    step3IOS: string;
    step1Desktop: string;
    step2Desktop: string;
    installBenefits: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
    backToApp: string;
    // Messages
    puterAuthMessage: string;
    errorMessage: string;
    // Model Selector
    selectModel: string;
    veryDetailed: string;
    veryDetailedDesc: string;
    fastDesc: string;
    detailedDesc: string;
    // Full names for Modal
    fastFull: string;
    detailedFull: string;
    veryDetailedFull: string;
    // Premium Model
    premium: string;
    premiumDesc: string;
    premiumFull: string;
    // Manus Model
    manus: string;
    manusDesc: string;
    manusFull: string;
    close: string;
}

export const translations: Record<Language, Translations> = {
    ku: {
        appName: 'پرسیارو وەڵامی شەرعی',
        subtitle: 'لەسەر مەنهەجی سەلەفی صالح',
        welcomeMessage: 'السلام علیکم! چۆن دەتوانم یارمەتیت بدەم؟',
        welcomeSubtitle: 'پرسیارەکەت لەبارەی فیقه، عەقیدە، و ئیسلام بنووسە',
        bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        placeholder: 'پرسیارەکەت لێرە بنووسە...',
        settings: 'ڕێکخستنەکان',
        fontSize: 'قەبارەی نووسین',
        fontSizeSmall: 'بچووک',
        fontSizeMedium: 'مامناوەند',
        fontSizeLarge: 'گەورە',
        theme: 'ڕووکار',
        themeLight: 'ڕووناک',
        themeDark: 'تاریک',
        download: 'دابەزاندن',
        downloadApp: 'دابەزاندنی ئەپ',
        aboutApp: 'دەربارەی ئەپ',
        aboutDescription: 'ئەم ئەپە یارمەتیدەرێکی زیرەکە بۆ وەڵامدانەوەی پرسیارە شەرعییەکان لەسەر بنەمای قورئان و سوننەت و لەسەر مەنهەجی سەلەفی صالح.',
        version: 'وەشانی ١.٠',
        language: 'زمان',
        connect: 'پەیوەندیکردن',
        history: 'مێژووی گفتوگۆکان',
        newChat: 'گفتوگۆی نوێ',
        noChats: 'هیچ گفتوگۆیەک نییە',
        rename: 'گۆڕینی ناو',
        renameTitle: 'گۆڕینی ناو',
        newName: 'ناوی نوێ',
        cancel: 'پاشگەزبوونەوە',
        save: 'پاشەکەوتکردن',
        delete: 'سڕینەوە',
        deleteConfirm: 'دڵنیایت دەتەوێت ئەم گفتوگۆیە بسڕیتەوە؟',
        yes: 'بەڵێ',
        no: 'نەخێر',
        copied: 'کۆپی کرا!',
        fast: 'وردبین',
        detailed: 'ورد',
        goBack: 'گەڕانەوە',
        createdBy: 'لەلایەن یوسف دەربەندیەوە',
        // Install page
        installTitle: 'دابەزاندنی ئەپەکە',
        installSubtitle: 'ئەپەکە لەسەر مۆبایلەکەت دابەزێنە بۆ ئەزموونێکی باشتر',
        alreadyInstalled: 'ئەپەکە دابەزێنراوە!',
        alreadyInstalledDesc: 'ئەپەکە لەسەر ئامێرەکەت دابەزێنراوە. دەتوانیت لە Home Screen بیکەیتەوە.',
        quickInstall: 'دابەزاندنی خێرا',
        quickInstallDesc: 'کرتە بکە بۆ دابەزاندنی ئەپەکە لەسەر ئامێرەکەت',
        forAndroid: 'بۆ ئەندرۆید (Chrome)',
        forIOS: 'بۆ ئایفۆن و ئایپاد (Safari)',
        forDesktop: 'بۆ کۆمپیوتەر (Chrome/Edge)',
        step1Android: 'کرتە لەسەر مێنوو بکە',
        step2Android: 'کرتە لەسەر "Install app" یان "Add to Home screen" بکە',
        step3Android: 'کرتە لەسەر "Install" بکە',
        step1IOS: 'کرتە لەسەر مێنوو بکە',
        step2IOS: 'کرتە لەسەر "Add to Home Screen" بکە',
        step3IOS: 'کرتە لەسەر "Add" بکە',
        step1Desktop: 'لە بارەی ناونیشان، کرتە لەسەر ئایکۆنی دابەزاندن بکە',
        step2Desktop: 'کرتە لەسەر "Install" بکە',
        installBenefits: 'سوودەکانی دابەزاندن',
        benefit1: 'کردنەوەی خێرا وەک ئەپی ئاسایی',
        benefit2: 'بەبێ پێویستی بە براوزەر',
        benefit3: 'ئایکۆن لەسەر Home Screen',
        benefit4: 'ئەزموونی باشتر و خێراتر',
        backToApp: 'گەڕانەوە بۆ ئەپەکە',
        // Messages
        puterAuthMessage: 'بۆ ئەوەی puter.com لە تابێکی نوێ نەکرێتەوە، سەرەتا کرتە لە دوگمەی پەیوەندیکردن (🔑) بکە لە سەرەوە، پاشان دووبارە پرسیارەکەت بنێرە.',
        errorMessage: 'ببوورە، هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدە.',
        // Model Selector
        selectModel: 'هەڵبژاردنی مۆدێل',
        veryDetailed: 'زۆر ورد',
        veryDetailedDesc: 'بەهێزترین مۆدێل (Claude Opus) بۆ وەڵامی قوڵ',
        fastDesc: 'بۆ وەڵامی خێرا و پوخت',
        detailedDesc: 'بۆ وەڵامی زیرەک و هاوسەنگ',
        fastFull: 'مۆدێلی وردبین',
        detailedFull: 'مۆدێلی ورد',
        veryDetailedFull: 'زۆر ورد (قوڵ)',
        // Premium Model
        premium: 'GLM-4.7',
        premiumDesc: 'مۆدێلی Zhipu بۆ وەڵامی ناوازە',
        premiumFull: 'GLM-4.7',
        // Manus Model
        manus: 'پێشەنگ',
        manusDesc: 'مۆدێلی پێشەنگ بۆ وەڵامدانەوەی خێرا',
        manusFull: 'مۆدێلی پێشەنگ',
        close: 'داخستن',
    },
    ar: {
        appName: 'سؤال وجواب شرعي',
        subtitle: 'على منهج السلف الصالح',
        welcomeMessage: 'السلام عليكم! كيف يمكنني مساعدتك؟',
        welcomeSubtitle: 'اكتب سؤالك عن الفقه والعقيدة والإسلام',
        bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        placeholder: 'اكتب سؤالك هنا...',
        settings: 'الإعدادات',
        fontSize: 'حجم الخط',
        fontSizeSmall: 'صغير',
        fontSizeMedium: 'متوسط',
        fontSizeLarge: 'كبير',
        theme: 'المظهر',
        themeLight: 'فاتح',
        themeDark: 'داكن',
        download: 'تحميل',
        downloadApp: 'تحميل التطبيق',
        aboutApp: 'عن التطبيق',
        aboutDescription: 'هذا التطبيق مساعد ذكي للإجابة على الأسئلة الشرعية على أساس القرآن والسنة ومنهج السلف الصالح.',
        version: 'الإصدار ١.٠',
        language: 'اللغة',
        connect: 'الاتصال',
        history: 'سجل المحادثات',
        newChat: 'محادثة جديدة',
        noChats: 'لا توجد محادثات',
        rename: 'إعادة التسمية',
        renameTitle: 'إعادة التسمية',
        newName: 'الاسم الجديد',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        deleteConfirm: 'هل أنت متأكد من حذف هذه المحادثة؟',
        yes: 'نعم',
        no: 'لا',
        copied: 'تم النسخ!',
        fast: 'دقيق',
        detailed: 'مفصل',
        goBack: 'العودة',
        createdBy: 'بواسطة يوسف دربندي',
        // Install page
        installTitle: 'تحميل التطبيق',
        installSubtitle: 'حمّل التطبيق على جهازك لتجربة أفضل',
        alreadyInstalled: 'تم تحميل التطبيق!',
        alreadyInstalledDesc: 'التطبيق محمّل على جهازك. يمكنك فتحه من الشاشة الرئيسية.',
        quickInstall: 'تحميل سريع',
        quickInstallDesc: 'انقر لتحميل التطبيق على جهازك',
        forAndroid: 'لأندرويد (Chrome)',
        forIOS: 'لآيفون وآيباد (Safari)',
        forDesktop: 'للكمبيوتر (Chrome/Edge)',
        step1Android: 'انقر على القائمة',
        step2Android: 'انقر على "Install app" أو "Add to Home screen"',
        step3Android: 'انقر على "Install"',
        step1IOS: 'انقر على القائمة',
        step2IOS: 'انقر على "Add to Home Screen"',
        step3IOS: 'انقر على "Add"',
        step1Desktop: 'في شريط العنوان، انقر على أيقونة التحميل',
        step2Desktop: 'انقر على "Install"',
        installBenefits: 'فوائد التحميل',
        benefit1: 'فتح سريع كتطبيق عادي',
        benefit2: 'بدون الحاجة للمتصفح',
        benefit3: 'أيقونة على الشاشة الرئيسية',
        benefit4: 'تجربة أفضل وأسرع',
        backToApp: 'العودة للتطبيق',
        // Messages
        puterAuthMessage: 'لتجنب فتح puter.com في علامة تبويب جديدة، انقر أولاً على زر الاتصال (🔑) في الأعلى، ثم أعد إرسال سؤالك.',
        errorMessage: 'عفواً، حدث خطأ. حاول مرة أخرى.',
        // Model Selector
        selectModel: 'اختيار النموذج',
        veryDetailed: 'دقيق جداً',
        veryDetailedDesc: 'أقوى نموذج (Claude Opus) لإجابات عميقة',
        fastDesc: 'للإجابات السريعة والمختصرة',
        detailedDesc: 'للإجابات الذكية والمتوازنة',
        fastFull: 'النموذج الدقيق',
        detailedFull: 'مفصل',
        veryDetailedFull: 'دقيق جداً',
        // Premium Model
        premium: 'GLM-4.7',
        premiumDesc: 'نموذج Zhipu لإجابات استثنائية',
        premiumFull: 'GLM-4.7',
        // Manus Model
        manus: 'الرائد',
        manusDesc: 'نموذج الرائد للإجابات السريعة',
        manusFull: 'نموذج الرائد',
        close: 'إغلاق',
    },
};

export const getLanguageName = (lang: Language): string => {
    switch (lang) {
        case 'ku':
            return 'کوردی';
        case 'ar':
            return 'العربية';
        default:
            return 'کوردی';
    }
};
