import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShoppingBag, Search, User, X, ChevronDown, Menu,
  Instagram, Youtube, Check, Package, 
  LogOut, Smartphone, Loader2, UserCircle, Truck, RefreshCw,
  Mail, Ruler, Settings2, Send, CreditCard, ShieldCheck, Database,
  Plus, Edit, Trash2, Image as ImageIcon, Settings, ArrowRight, ArrowLeft, ChevronRight,
  Target, Award, Fingerprint, Shirt, Scissors, Sparkles, Box, Wind, 
  Layers, Gem, Feather, Shield, Activity,
  Infinity as InfinityIcon, Zap, LayoutGrid, Heart, History, Info, Users, Link as LinkIcon, BarChart, Calendar, Copy, Percent, MessageCircle, MapPin, TrendingUp, TrendingDown, Eye,
  Lock, Unlock, AlertTriangle
} from 'lucide-react';

// --- INITIALIZE FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyBBN9EEE34s83C8gFyBYbiLnmlMPJUrKIw",
  authDomain: "sliniavskiybrand-690c4.firebaseapp.com",
  databaseURL: "https://sliniavskiybrand-690c4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sliniavskiybrand-690c4",
  storageBucket: "sliniavskiybrand-690c4.firebasestorage.app",
  messagingSenderId: "59545429664",
  appId: "1:59545429664:web:f326aee406c79bfd4ecbc5",
  measurementId: "G-X0JM8VZWK0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'sliniavskiy-app';

const getProductsRef = () => collection(db, 'artifacts', appId, 'public', 'data', 'products');
const getOrdersRef = () => collection(db, 'artifacts', appId, 'public', 'data', 'orders');
const getReferralsRef = () => collection(db, 'artifacts', appId, 'public', 'data', 'referrals');

const ADMIN_EMAIL = 'sliniavskiy.brand@gmail.com';
const DEFAULT_CATEGORIES = ['Футболка', 'Світшот', 'Худі', 'Штани', 'Шорти'];

const GROUP_TOP = ['Футболка', 'Футболки', 'Сорочка', 'Світшот', 'Худі', 'Толстовка', 'Джемпер', 'Жилетка', 'Светр', 'Піджак', 'Куртка', 'Пальто', 'Вітрівка'];
const GROUP_BOTTOM = ['Брюки', 'Джинси', 'Штани', 'Шорти'];
const GROUP_ACC = ['Шапка', 'Кепка', 'Капелюх', 'Шарф', 'Рукавички', 'Ремінь', 'Аксесуари', 'Сумка', 'Рюкзак'];

const SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = [
  { name: 'Black', hex: '#000000', label: 'Чорний', imageIndexes: [0] },
  { name: 'White', hex: '#ffffff', label: 'Білий', imageIndexes: [0] }
];
const DEFAULT_SIZES_AVAILABILITY = { S: true, M: true, L: true, XL: true };

const STATUS_MAP = {
  'new': { label: 'Нове', color: 'text-blue-400' },
  'processing': { label: 'В обробці', color: 'text-yellow-400' },
  'shipped': { label: 'Відправлено', color: 'text-purple-400' },
  'completed': { label: 'Отримано', color: 'text-green-400' },
  'cancelled': { label: 'Скасовано', color: 'text-red-500' }
};

const TELEGRAM_BOT_TOKEN = '8618039263:AAEiEu3o5TyHpatvjsBU_5CjOJqb0VVHHRA';
const TELEGRAM_CHAT_ID = '863728460';

const DEFAULT_SIZE_GUIDE = "Розмір,Груди (см),Довжина (см),Плечі (см)\nS,52,70,48\nM,54,72,50\nL,56,74,52\nXL,58,76,54";

const sendTelegramMessage = async (text) => {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.warn("Помилка відправки Telegram", err);
  }
};

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    <path d="M15 8.5a5.5 5.5 0 0 0-5.5-5.5" />
  </svg>
);

const TelegramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

// Універсальний компонент для відображення фото або відео
const isVideo = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.match(/\.(mp4|webm|mov)(\?.*)?$/i) || url.includes('video%2F') || url.includes('video/');
};

const MediaElement = ({ src, className, alt, autoPlay = true, ...props }) => {
  if (!src) return null;
  if (isVideo(src)) {
    return (
      <video 
        src={src} 
        className={className} 
        autoPlay={autoPlay}
        loop 
        muted 
        playsInline 
        {...props} 
      />
    );
  }
  return <img src={src} alt={alt} className={className} {...props} />;
};

const MaintenanceScreen = ({ onSecretClick }) => (
  <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
    <div className="mb-12 cursor-pointer group" onClick={onSecretClick}>
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-[0.3em] hover:text-[#d4af37] transition-colors">
        SLINIAVSKIY
      </h1>
    </div>
    <div className="relative mb-8">
      <div className="w-20 h-20 border-2 border-white/10 border-t-[#d4af37] rounded-full animate-spin"></div>
      <Lock className="absolute inset-0 m-auto text-[#d4af37]" size={24} />
    </div>
    <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4">Технічні роботи</h2>
    <p className="text-zinc-500 text-[10px] md:text-xs max-w-sm font-bold uppercase tracking-widest leading-relaxed">
      Ми оновлюємо асортимент та покращуємо сервіс. <br />
      Завітайте до нас трохи пізніше.
    </p>
  </div>
);

// --- TRANSLATION DICTIONARY ---
const DICT = {
  uk: {
    collection: 'Колекція', brand: 'Бренд', all_products: 'Усі товари',
    outerwear: 'Верхній одяг', bottoms: 'Низ', accessories: 'Аксесуари', other: 'Інше',
    catalog: 'Каталог', view_all: 'Переглянути всі', new_arrivals: 'Новинки',
    sold_out: 'Немає в наявності', in_stock: 'В наявності', add_to_cart: 'Додати у кошик',
    no_size: 'Немає розміру', color: 'Колір', size: 'Розмір', size_guide: 'Розмірна сітка',
    wishlist: 'Список бажань', in_wishlist: 'У бажаному', add_to_wishlist: 'В бажане',
    cart: 'Кошик', empty_cart: 'Кошик порожній', checkout: 'Оформити замовлення',
    total: 'До сплати', delivery_details: 'Далі до оплати', tracking: 'Мої замовлення',
    contacts: 'Контакти та реквізити', delivery: 'Доставка та оплата', returns: 'Обмін та повернення',
    terms: 'Публічна оферта', privacy: 'Політика конфіденційності', socials: 'Соцмережі',
    clients: 'Клієнтам', info: 'Інформація', support: 'Підтримка', to_collection: 'До Колекції',
    language: 'Мова сайту / Language',
    
    brand_quote: '"Не знаю моди, створюю свій стиль"',
    brand_founder: '— Засновник SLINIAVSKIY',
    brand_goal_title: 'Ціль бренду',
    brand_p1: 'Наша головна ціль — забезпечити вас преміальним базовим гардеробом, який не підвладний швидкоплинним трендам. Ми віримо, що справжній стиль починається з бездоганного крою та виняткового комфорту.',
    brand_p2: 'Кожна річ SLINIAVSKIY створена для того, щоб підкреслити вашу індивідуальність. Використовуючи кращі матеріали за європейськими стандартами, ми гарантуємо довговічність та естетичне задоволення від кожного дотику до тканини.',
    quality: 'Якість',
    quality_desc: 'Використання виключно преміальних тканин та фурнітури.',
    comfort: 'Комфорт',
    comfort_desc: 'Ергономічний крій, який не сковує рухів і дарує свободу.',
    durability: 'Довговічність',
    durability_desc: 'Речі, які зберігають свій вигляд навіть після сотень циклів прання.',
    
    login_title: 'Кабінет Клієнта',
    login_desc: 'Увійдіть, щоб відстежувати замовлення та мати доступ до персональних налаштувань.',
    login_google: 'Увійти через Google',
    or_email: 'Або за допомогою Email',
    email_label: 'Електронна пошта',
    pass_label: 'Пароль',
    login_btn: 'Увійти через Email',
    register_btn: 'Зареєструватися через Email',
    already_have: 'Вже є акаунт?',
    dont_have: 'Немає акаунта?',
    login_link: 'Увійти',
    register_link: 'Створити акаунт',
    logout: 'Вийти з акаунта',
    order_history: 'Історія замовлень',
    no_orders: 'Замовлень поки немає',
    history_empty: 'Ваша історія порожня',
    to_shopping: 'До покупок',
    
    product_desc: 'Базовий елемент вашого гардеробу. Виконано з преміальних матеріалів за європейськими стандартами якості.',
    search_placeholder: 'Що ви шукаєте?',
    search_title: 'Пошук',
    rights: '© 2026 SLINIAVSKIY BRAND. ВСІ ПРАВА ЗАХИЩЕНО.',
    empty_cat: 'Товарів в цій категорії ще немає',
    
    checkout_title: 'Оформлення',
    delivery_data: 'Дані доставки (Нова Пошта)',
    full_name: 'ПІБ',
    phone: 'Номер телефону',
    city_placeholder: 'Місто (почніть вводити...)',
    branch_placeholder: 'Відділення або поштомат...',
    branch_disabled: 'Спочатку оберіть місто',
    agree_terms: 'Я погоджуюсь з',
    and: 'та',
    mandatory: '(обов\'язково)',
    back_to_cart: 'Назад до кошика',
    test_payment: 'Режим симуляції (Тестова оплата)',
    test_desc: 'Ця форма є імітацією для перевірки роботи. Реальні кошти не списуються.',
    pay_amount: 'Сума до оплати',
    pay_btn: 'Оплатити (Симуляція)',
    processing: 'Обробка...',
    back_to_data: 'Назад до даних',
    
    tracking_desc: 'Тут відображаються замовлення, автоматично збережені на цьому пристрої.',
    tracking_empty_title: 'Історія порожня',
    tracking_empty_desc: 'Ви ще не робили замовлень або очистили пам\'ять браузера.',
    order_num: 'Замовлення',
    copied: '✅ Скопійовано!',
    copy: 'Копіювати',
    
    added_to_cart: 'Додано',
    added_to_wishlist: 'Додано до списку бажань',
    removed_from_wishlist: 'Видалено зі списку бажань',
    wishlist_empty: 'Список порожній'
  }
};

// --- HEADER ---
function Header({ navigate, goBack, route, setIsSearchOpen, cart, wishlist, setIsWishlistOpen, isCatalogOpen, setIsCatalogOpen, setIsCartOpen, user, groupedCategories, t, tCat }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = useMemo(() => cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0), [cart]);
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <header className={`fixed top-0 w-full z-[500] transition-[padding] duration-700 ease-in-out ${scrolled ? 'py-3 md:py-4' : 'py-5 md:py-8'}`}>
      
      {/* SMOOTH BACKGROUND LAYER FOR PREMIUM FADE - GLASSMORPHISM EFFECT */}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-opacity duration-700 ease-in-out ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />

      <div className="relative z-10 max-w-[1920px] w-full mx-auto px-4 md:px-10 flex justify-between items-center">
        
        {/* LEFT SECTION */}
        <div className="flex-1 flex items-center justify-start relative z-50">
          {route !== 'home' && (
            <button onClick={goBack} className="mr-3 md:mr-4 hover:opacity-50 transition-opacity text-white flex items-center justify-center">
              <ArrowLeft size={22} className="md:w-6 md:h-6" />
            </button>
          )}
          
          {/* Mobile direct catalog link */}
          {route !== 'catalog' && (
            <button onClick={() => navigate('catalog')} className="md:hidden text-[10px] xs:text-xs font-black uppercase tracking-widest text-white hover:opacity-70 transition-opacity border-b border-white/30 pb-1">
              {t('catalog')}
            </button>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center text-[11px] font-black uppercase tracking-[0.2em]">
            <div className="relative group" onMouseEnter={() => setIsCatalogOpen(true)} onMouseLeave={() => setIsCatalogOpen(false)}>
              <button onClick={() => navigate('catalog')} className="flex items-center gap-2 hover:opacity-50 transition-opacity py-2 text-white font-black">
                {t('collection')} <ChevronDown size={12} className={`transition-transform duration-300 ${isCatalogOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="absolute top-full left-0 w-full h-4 bg-transparent"></div>
              
              <div className={`absolute top-[calc(100%+4px)] left-0 w-64 bg-[#0a0a0a] border border-white/10 shadow-2xl transition-all duration-300 origin-top overflow-hidden ${isCatalogOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="flex flex-col py-2 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <button onClick={() => navigate('catalog', { category: null })} className="text-left px-6 py-4 hover:bg-white hover:text-black transition-colors text-white font-black uppercase text-[10px] tracking-widest border-b border-white/5">{t('all_products')}</button>
                  
                  {groupedCategories.top.length > 0 && (
                     <div className="flex flex-col mt-3">
                       <span className="px-6 py-2 text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{t('outerwear')}</span>
                       {groupedCategories.top.map(c => <button key={c} onClick={() => navigate('catalog', { category: c })} className="text-left px-6 py-2 hover:bg-white/10 transition-colors text-zinc-300 font-bold uppercase text-[9px] tracking-widest">{tCat(c)}</button>)}
                     </div>
                  )}
                  {groupedCategories.bottom.length > 0 && (
                     <div className="flex flex-col mt-3">
                       <span className="px-6 py-2 text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{t('bottoms')}</span>
                       {groupedCategories.bottom.map(c => <button key={c} onClick={() => navigate('catalog', { category: c })} className="text-left px-6 py-2 hover:bg-white/10 transition-colors text-zinc-300 font-bold uppercase text-[9px] tracking-widest">{tCat(c)}</button>)}
                     </div>
                  )}
                  {groupedCategories.acc.length > 0 && (
                     <div className="flex flex-col mt-3">
                       <span className="px-6 py-2 text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{t('accessories')}</span>
                       {groupedCategories.acc.map(c => <button key={c} onClick={() => navigate('catalog', { category: c })} className="text-left px-6 py-2 hover:bg-white/10 transition-colors text-zinc-300 font-bold uppercase text-[9px] tracking-widest">{tCat(c)}</button>)}
                     </div>
                  )}
                  {groupedCategories.other.length > 0 && (
                     <div className="flex flex-col mt-3 mb-3">
                       <span className="px-6 py-2 text-[8px] text-[#d4af37] font-black uppercase tracking-widest">{t('other')}</span>
                       {groupedCategories.other.map(c => <button key={c} onClick={() => navigate('catalog', { category: c })} className="text-left px-6 py-2 hover:bg-white/10 transition-colors text-zinc-300 font-bold uppercase text-[9px] tracking-widest">{tCat(c)}</button>)}
                     </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => navigate('brand')} className="hover:opacity-50 transition-opacity text-white font-black">{t('brand')}</button>
            {isAdmin && <button onClick={() => navigate('admin')} className="text-[#d4af37] font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-opacity">Admin</button>}
          </nav>
        </div>

        {/* CENTER SECTION: Logo */}
        <div className="flex-none flex justify-center cursor-pointer group relative z-50 px-2" onClick={() => navigate('home')}>
          <h1 className={`text-[14px] xs:text-[16px] sm:text-xl md:text-3xl font-black tracking-normal md:tracking-tighter uppercase md:group-hover:tracking-widest transition-all duration-700 ease-in-out origin-center text-white whitespace-nowrap ${scrolled ? 'scale-90 md:scale-95' : 'scale-100'}`}>SLINIAVSKIY</h1>
        </div>

        {/* RIGHT SECTION: Icons */}
        <div className="flex-1 flex items-center justify-end gap-3 xs:gap-4 md:gap-6 text-white relative z-50">
          <button onClick={() => navigate('tracking')} className="hover:opacity-50 transition-opacity p-1" title={t('tracking')}>
            <Package size={20} className="w-5 h-5 md:w-5 md:h-5" />
          </button>

          <button onClick={() => setIsWishlistOpen(true)} className="relative hover:opacity-50 transition-opacity p-1">
            <Heart size={20} className="w-5 h-5 md:w-5 md:h-5" />
            {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </button>

          <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity p-1">
            <Search size={20} className="w-5 h-5 md:w-5 md:h-5" />
          </button>
          
          <button onClick={() => setIsCartOpen(true)} className="relative hover:opacity-50 transition-opacity p-1">
            <ShoppingBag size={20} className="w-5 h-5 md:w-5 md:h-5" />
            {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

// --- MAIN APP COMPONENT ---
function MainApp() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [minLoadTimePassed, setMinLoadTimePassed] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  
  const [lang, setLang] = useState(() => localStorage.getItem('sliniavskiy_lang') || 'uk');
  useEffect(() => localStorage.setItem('sliniavskiy_lang', lang), [lang]);
  const t = useCallback((key) => DICT[lang]?.[key] || key, [lang]);
  
  // Translation for dynamic categories
  const tCat = useCallback((cat) => {
    if(lang === 'uk' || !cat) return cat;
    const map = {
      'Футболки':'T-Shirts', 'Футболка':'T-Shirt', 'Сорочка':'Shirt', 'Світшот':'Sweatshirt', 'Худі':'Hoodie', 'Толстовка':'Hoodie',
      'Джемпер':'Jumper', 'Жилетка':'Vest', 'Светр':'Sweater', 'Піджак':'Jacket', 'Куртка':'Jacket', 'Пальто':'Coat', 'Вітрівка':'Windbreaker',
      'Брюки':'Trousers', 'Джинси':'Jeans', 'Штани':'Pants', 'Шорти':'Shorts',
      'Шапка':'Beanie', 'Кепка':'Cap', 'Капелюх':'Hat', 'Шарф':'Scarf', 'Рукавички':'Gloves', 'Ремінь':'Belt', 'Аксесуари':'Accessories', 'Сумка':'Bag', 'Рюкзак':'Backpack'
    };
    return map[cat] || cat;
  }, [lang]);

  // Loading animations state
  const [showLoader, setShowLoader] = useState(true);
  const [fadeLoader, setFadeLoader] = useState(false);
  
  // Lang switch animation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const [route, setRoute] = useState(() => sessionStorage.getItem('sliniavskiy_route') || 'home');
  const [routeParams, setRouteParams] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('sliniavskiy_routeParams') || '{}'); } 
    catch { return {}; }
  });

  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setShowAllProducts(false); }, [route, routeParams]);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadTimePassed(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sliniavskiy_cart') || '[]');
      return Array.isArray(stored) ? stored.filter(item => item && typeof item === 'object' && item.id) : [];
    } catch { return []; }
  });
  
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('sliniavskiy_wishlist') || '[]');
      return Array.isArray(stored) ? stored.filter(item => item && typeof item === 'object' && item.id) : [];
    } catch { return []; }
  });
  
  const [dbProducts, setDbProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [visitsData, setVisitsData] = useState([]);
  
  const [localOrders, setLocalOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sliniavskiy_local_orders') || '[]'); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem('sliniavskiy_local_orders', JSON.stringify(localOrders)); }, [localOrders]);
  
  const activeProducts = dbProducts;
  const storefrontProducts = useMemo(() => activeProducts.filter(p => p.isVisible !== false), [activeProducts]);
  
  const randomStorefrontProducts = useMemo(() => {
    return [...storefrontProducts].sort(() => 0.5 - Math.random());
  }, [storefrontProducts]);
  
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem('sliniavskiy_cookie_consent_v2'));
  const [cookiePrefs, setCookiePrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sliniavskiy_cookie_prefs') || '{"analytics":true,"marketing":false}'); }
    catch { return {analytics:true,marketing:false}; }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState('');

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(null);
  
  const [isCheckoutForm, setIsCheckoutForm] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [deliveryForm, setDeliveryForm] = useState({ name: '', phone: '', city: '', cityRef: '', branch: '' });
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [showCities, setShowCities] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [isNpLoading, setIsNpLoading] = useState(false);

  const NP_API_KEY = '8208cf2c74ddc570769381a82649fb8c'; 

  const [adminTab, setAdminTab] = useState('analytics'); 
  const [orderSubTab, setOrderSubTab] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Добавляем состояния для управления скидками
  const [discountSearch, setDiscountSearch] = useState('');
  const [discountEdits, setDiscountEdits] = useState({});

  const [discountSubTab, setDiscountSubTab] = useState('products');
  const [refDiscountEdits, setRefDiscountEdits] = useState({});
  const [promoInput, setPromoInput] = useState(() => localStorage.getItem('sliniavskiy_ref') || '');

  // НОВІ СТАНИ ДЛЯ СКЛАДУ
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('all'); 
  const [inventoryCategory, setInventoryCategory] = useState('all');
  const [inventoryEdits, setInventoryEdits] = useState({});

  const [siteSettings, setSiteSettings] = useState({ 
    heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80', 
    heroImageMobile: '', 
    brandImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    heroAnimation: true,
    categories: DEFAULT_CATEGORIES 
  });
  const activeCategories = siteSettings.categories?.length > 0 ? siteSettings.categories : DEFAULT_CATEGORIES;
  
  const groupedCategories = useMemo(() => {
    const top = [];
    const bottom = [];
    const acc = [];
    const other = [];

    activeCategories.forEach(c => {
       const catName = c.trim();
       if (GROUP_TOP.includes(catName)) top.push(catName);
       else if (GROUP_BOTTOM.includes(catName)) bottom.push(catName);
       else if (GROUP_ACC.includes(catName)) acc.push(catName);
       else other.push(catName);
    });

    return { top, bottom, acc, other };
  }, [activeCategories]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: DEFAULT_CATEGORIES[0], images: '', sizeGuide: DEFAULT_SIZE_GUIDE, isVisible: true, inStock: true, colors: [], sizes: DEFAULT_SIZES_AVAILABILITY });
  
  const [settingsFormUrl, setSettingsFormUrl] = useState('');
  const [settingsFormUrlMobile, setSettingsFormUrlMobile] = useState('');
  const [settingsBrandUrl, setSettingsBrandUrl] = useState('');
  const [settingsPromoUrl, setSettingsPromoUrl] = useState('');
  const [settingsHeroAnimation, setSettingsHeroAnimation] = useState(true);
  const [settingsCategories, setSettingsCategories] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [newReferralName, setNewReferralName] = useState('');
  // ДОБАВЛЯЕМ НОВЫЕ СТЕЙТЫ ДЛЯ СКИДОК И ЛИМИТОВ РЕФЕРАЛОВ
  const [newRefDiscount, setNewRefDiscount] = useState('');
  const [newRefLimit, setNewRefLimit] = useState('');
  
  const [refFilterPartner, setRefFilterPartner] = useState('');
  const [refFilterDateFrom, setRefFilterDateFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [refFilterDateTo, setRefFilterDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [refFilterStatus, setRefFilterStatus] = useState('all');
  const [refSortConfig, setRefSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [refPercent, setRefPercent] = useState(10);
  const [refCalcResult, setRefCalcResult] = useState(null);

  // Stats filter states
  const [statsDateFrom, setStatsDateFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [statsDateTo, setStatsDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const showToast = useCallback((msg) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 4000); 
  }, []);

  const toggleMaintenance = async () => {
    try {
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), 
        { isMaintenance: !isMaintenance }, { merge: true });
      showToast(!isMaintenance ? '🛑 Магазин закрито на технічні роботи' : '✅ Магазин відкрито для покупців');
    } catch (err) {
      console.warn(err);
      showToast('❌ Помилка зміни статусу');
    }
  };
  
  const handleLangChange = (newLang) => {
    if (lang === newLang) return;
    setIsTranslating(true);
    setTimeout(() => {
      setLang(newLang);
      setTimeout(() => setIsTranslating(false), 50);
    }, 300);
  };

  // --- Real Visit Tracking ---
  useEffect(() => {
    if (!user) return; // Wait for user auth to prevent permission issues

    const trackVisit = async () => {
       const today = new Date().toISOString().slice(0,10);
       const visitRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', today);
       try {
          const snap = await getDoc(visitRef);
          if(snap.exists()) {
             await updateDoc(visitRef, { count: increment(1) });
          } else {
             await setDoc(visitRef, { count: 1, date: today });
          }
       } catch(e) { 
           console.warn("Analytics update skipped due to permissions"); 
       }
    };
    if(!sessionStorage.getItem('sliniavskiy_visited')) {
       trackVisit();
       sessionStorage.setItem('sliniavskiy_visited', 'true');
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.removeItem('sliniavskiy_ref');
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
      localStorage.setItem('sliniavskiy_ref', refCode);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => { localStorage.setItem('sliniavskiy_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sliniavskiy_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  useEffect(() => { setRefCalcResult(null); }, [refFilterPartner, refFilterDateFrom, refFilterDateTo, refPercent]);

  // Глобальная функция расчета актуальной цены товара с учетом скидки
  const getProductPrice = useCallback((p) => {
    const original = Number(p.price) || 0;
    let final = original;
    let isDiscounted = false;
    let percent = Number(p.discountPercent) || 0;

    if (percent > 0 && percent <= 100) {
      // Если дата не указана ИЛИ дата еще не наступила
      if (!p.discountEndsAt || new Date(p.discountEndsAt).getTime() > new Date().getTime()) {
        final = Math.round(original * (1 - percent / 100));
        isDiscounted = true;
      }
    }
    return { original, final, isDiscounted, percent };
  }, []);

  useEffect(() => {
    if (!isUserDataLoaded || !user) return;
    const userStoreRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'store');
    setDoc(userStoreRef, { cart, wishlist }, { merge: true }).catch(console.warn);
  }, [cart, wishlist, user, isUserDataLoaded]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Очікуємо, поки Firebase перевірить кеш і відновить збережену сесію
        await auth.authStateReady();
        
        // Створюємо нову сесію ТІЛЬКИ якщо користувач ще не авторизований
        if (!auth.currentUser) {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth); 
          }
        }
      } catch (err) {
        console.warn("Auth init error", err);
        setAuthLoading(false);
      }
    };
    
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Словник для авто-перекладу старих російських категорій з БД
    const ukrMap = {
      'Рубашка': 'Сорочка', 'Свитшот': 'Світшот', 'Худи': 'Худі', 'Жилет': 'Жилетка', 'Свитер': 'Светр', 
      'Пиджак': 'Піджак', 'Ветровка': 'Вітрівка', 'Джинсы': 'Джинси', 'Штаны': 'Штани', 'Шорты': 'Шорти', 
      'Шляпа': 'Капелюх', 'Перчатки': 'Рукавички', 'Ремень': 'Ремінь'
    };

    const unsubProducts = onSnapshot(getProductsRef(), 
      (s) => {
        setDbProducts(s.docs.map(d => {
           const data = d.data();
           // Авто-переклад категорій у існуючих товарів
           if (ukrMap[data.category]) data.category = ukrMap[data.category];
           return { id: d.id, ...data };
        }));
        setIsProductsLoaded(true);
      },
      (err) => { console.warn(err); setIsProductsLoaded(true); }
    );

    const unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), 
      (d) => {
        if (d.exists()) {
          const data = d.data();
          setIsMaintenance(data.isMaintenance || false);
          
          // ЖОРСТКА ФІЛЬТРАЦІЯ ТА АВТО-ПЕРЕКЛАД
          let rawCats = data.categories || DEFAULT_CATEGORIES;
          let cleanCats = Array.isArray(rawCats) ? rawCats : String(rawCats).split(',').map(c => c.trim());
          
          // Перекладаємо старі назви в налаштуваннях
          cleanCats = cleanCats.map(c => ukrMap[c] || c);
          
          const VALID_CATS = [...GROUP_TOP, ...GROUP_BOTTOM, ...GROUP_ACC];
          
          // Залишаємо ТІЛЬКИ ті категорії, які є в стандартних списках
          cleanCats = cleanCats.filter(c => VALID_CATS.includes(c));
          // Видаляємо дублікати
          cleanCats = Array.from(new Set(cleanCats));

          if (cleanCats.length === 0) cleanCats = DEFAULT_CATEGORIES;

          setSiteSettings({
            heroImage: data.heroImage || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
            heroImageMobile: data.heroImageMobile || '',
            brandImage: data.brandImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
            promoMediaUrl: data.promoMediaUrl || '',
            heroAnimation: data.heroAnimation !== false,
            categories: cleanCats
          });
          setSettingsFormUrl(data.heroImage || '');
          setSettingsFormUrlMobile(data.heroImageMobile || '');
          setSettingsBrandUrl(data.brandImage || '');
          setSettingsPromoUrl(data.promoMediaUrl || '');
          setSettingsHeroAnimation(data.heroAnimation !== false);
          setSettingsCategories(cleanCats.join(', '));
        } else {
          setSettingsCategories(DEFAULT_CATEGORIES.join(', '));
        }
        setIsSettingsLoaded(true);
      },
      (err) => { console.warn(err); setIsSettingsLoaded(true); }
    );

    const unsubOrders = onSnapshot(getOrdersRef(), 
      (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => console.warn(err)
    );

    const unsubReferrals = onSnapshot(getReferralsRef(), 
      (s) => {
        const refs = s.docs.map(d => ({ id: d.id, ...d.data() }));
        setReferrals(refs);
        if (refs.length > 0 && !refFilterPartner) {
           setRefFilterPartner(refs[0].code);
        }
      },
      (err) => console.warn(err)
    );

    let unsubVisits = () => {};
    if (user.email === ADMIN_EMAIL) {
       unsubVisits = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'analytics'), 
         (s) => setVisitsData(s.docs.map(d => ({ id: d.id, ...d.data() }))),
         (err) => console.warn(err)
       );
    }

    const loadUserData = async () => {
      try {
        const userStoreRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'store');
        const snap = await getDoc(userStoreRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.cart && Array.isArray(data.cart)) setCart(data.cart.filter(i=>i&&i.id));
          if (data.wishlist && Array.isArray(data.wishlist)) setWishlist(data.wishlist.filter(i=>i&&i.id));
        } else {
          await setDoc(userStoreRef, { cart, wishlist }, { merge: true });
        }
      } catch (err) {
        console.warn("Error loading user store", err);
      } finally {
        setIsUserDataLoaded(true);
      }
    };
    loadUserData();

    return () => { unsubProducts(); unsubSettings(); unsubOrders(); unsubReferrals(); unsubVisits(); };
  }, [user]);

  const isReady = !authLoading && isProductsLoaded && isSettingsLoaded && isUserDataLoaded && minLoadTimePassed;
  
  useEffect(() => {
    if (isReady && showLoader) {
      setFadeLoader(true); 
      const timer = setTimeout(() => setShowLoader(false), 1200); 
      return () => clearTimeout(timer);
    }
  }, [isReady, showLoader]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return storefrontProducts.filter(p => 
      p.name.toLowerCase().includes(q)
    );
  }, [searchQuery, storefrontProducts]);

  const navigate = (r, p = {}, isBack = false) => {
    // Запускаем плавное исчезновение текущей страницы
    setIsNavigating(true);
    
    // Ждем 400мс, пока страница плавно растворится, и только потом меняем раздел
    setTimeout(() => {
      if (!isBack) {
        const stack = JSON.parse(sessionStorage.getItem('sliniavskiy_history') || '[]');
        stack.push({ route, params: routeParams });
        sessionStorage.setItem('sliniavskiy_history', JSON.stringify(stack));
      }
      
      setRoute(r); 
      setRouteParams(p);
      sessionStorage.setItem('sliniavskiy_route', r);
      sessionStorage.setItem('sliniavskiy_routeParams', JSON.stringify(p));
      
      setIsCartOpen(false); 
      setIsSearchOpen(false); 
      setIsWishlistOpen(false); 
      setIsCatalogOpen(false);
      setSearchQuery('');
      setAuthError(''); 
      setActiveImageIndex(0);
      setSelectedColor(null);
      
      // Мгновенно перебрасываем скролл наверх, пока экран затемнен
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Даем React миллисекунду на отрисовку и плавно проявляем новую страницу
      setTimeout(() => {
        setIsNavigating(false);
      }, 50);
    }, 400);
  };

  const goBack = () => {
    const stack = JSON.parse(sessionStorage.getItem('sliniavskiy_history') || '[]');
    if (stack.length > 0) {
      const prev = stack.pop();
      sessionStorage.setItem('sliniavskiy_history', JSON.stringify(stack));
      navigate(prev.route, prev.params, true);
    } else {
      navigate('home');
    }
  };

  const toggleWishlist = (p, e) => {
    if (e) e.stopPropagation();
    setWishlist(prev => {
      const exists = prev.find(item => item.id === p.id);
      if (exists) {
        showToast(t('removed_from_wishlist'));
        return prev.filter(item => item.id !== p.id);
      } else {
        showToast(t('added_to_wishlist'));
        return [...prev, p];
      }
    });
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  const handleCookieAction = (action) => {
    localStorage.setItem('sliniavskiy_cookie_consent_v2', action);
    setCookieConsent(action);
    if (action === 'settings') {
      navigate('legal', {type: 'cookies'});
    } else if (action === 'save_custom') {
      localStorage.setItem('sliniavskiy_cookie_prefs', JSON.stringify(cookiePrefs));
      showToast("Налаштування Cookies збережено");
      navigate('home');
    } else {
      showToast(action === 'accepted' ? "Дякуємо! Cookies прийнято." : "Cookies відхилено.");
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      showToast('Успішний вхід через Google');
    } catch (err) {
      console.warn("Google Auth Error:", err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setAuthError('Ваш браузер заблокував вікно входу. Якщо ви відкрили сайт з Instagram/Telegram, будь ласка, відкрийте його у звичайному браузері Safari або Chrome.');
      } else {
        setAuthError(`Помилка Google: ${err.message}`);
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authPassword) {
      setAuthError('Заповніть всі поля');
      return;
    }
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        showToast('Реєстрація успішна');
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        showToast('Успішний вхід');
      }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(`Помилка: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      showToast('Ви вийшли з аккаунту');
      navigate('account');
    } catch (err) {
      showToast('Помилка виходу');
    }
  };

  const appliedRefCodeStr = localStorage.getItem('sliniavskiy_ref');
  const activePromo = useMemo(() => referrals.find(r => r.code === appliedRefCodeStr), [referrals, appliedRefCodeStr, isCartOpen]);

  const promoDiscountPercent = useMemo(() => {
    if (activePromo && activePromo.discountPercent > 0) {
       // Проверка: не истекло ли время действия скидки
       if (activePromo.expiresAt && new Date(activePromo.expiresAt).getTime() < new Date().getTime()) return 0;
       
       if (!activePromo.usageLimit || (activePromo.usageCount || 0) < activePromo.usageLimit) {
           return activePromo.discountPercent;
       }
    }
    return 0;
  }, [activePromo]);

  const cartSubtotal = useMemo(() => cart.reduce((total, item) => {
    const realProduct = activeProducts.find(p => p.id === item.id);
    const pInfo = realProduct ? getProductPrice(realProduct) : { final: Number(item.price) || 0 };
    const qty = Number(item.quantity) || 1;
    return total + (pInfo.final * qty);
  }, 0), [cart, activeProducts, getProductPrice]);

  const promoDiscountAmount = Math.round(cartSubtotal * (promoDiscountPercent / 100));
  const cartTotal = Math.max(0, Math.round(cartSubtotal) - promoDiscountAmount);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) {
        localStorage.removeItem('sliniavskiy_ref');
        showToast('Промокод видалено');
        return;
    }
    const code = promoInput.trim().toUpperCase();
    const found = referrals.find(r => r.code.toUpperCase() === code || (r.name && r.name.toUpperCase() === code));
    if (found) {
        if (found.expiresAt && new Date(found.expiresAt).getTime() < new Date().getTime()) {
            showToast('❌ Термін дії цього промокоду минув');
        } else if (found.usageLimit && (found.usageCount || 0) >= found.usageLimit) {
            showToast('❌ Ліміт використання цього промокоду вичерпано');
        } else {
            localStorage.setItem('sliniavskiy_ref', found.code);
            setPromoInput(found.code);
            if (found.discountPercent > 0) {
              showToast(`✅ Знижка ${found.discountPercent}% успішно застосована!`);
            } else {
              showToast(`✅ Реферальний код успішно підключено!`);
            }
        }
    } else {
        showToast('❌ Промокод не знайдено');
    }
  };

  const addToCart = (p) => {
    if (p.inStock === false) return showToast(t('sold_out'));
    if (p.sizes && p.sizes[selectedSize] === false) return showToast(`${t('no_size')} ${selectedSize}`);
    
    const availableStock = p.stockCounts?.[selectedSize] || 0;
    if (availableStock <= 0) return showToast(`Розмір ${selectedSize} закінчився на складі`);

    const colors = p.colors?.length > 0 ? p.colors : DEFAULT_COLORS;
    const activeColor = selectedColor || colors[0];
    const colorName = lang === 'uk' ? activeColor.label : activeColor.name;
    
    const productToAdd = {
      id: String(p.id),
      name: String(p.name),
      price: Number(p.price) || 0,
      selectedSize: String(selectedSize),
      selectedColor: String(colorName),
      cartId: `${p.id}-${selectedSize}-${activeColor.name}-${activeColor.hex}`
    };

    const imgUrl = p.images && activeColor.imageIndexes && activeColor.imageIndexes.length > 0 && p.images[activeColor.imageIndexes[0]] 
      ? p.images[activeColor.imageIndexes[0]] 
      : (p.images ? p.images[0] : 'https://via.placeholder.com/800');

    setCart(prev => {
      const idx = prev.findIndex(i => i.cartId === productToAdd.cartId);
      const currentQty = idx > -1 ? (Number(prev[idx].quantity) || 0) : 0;
      
      if (currentQty >= availableStock) {
        showToast(`На складі доступно лише ${availableStock} шт. цього розміру`);
        return prev;
      }

      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity = currentQty + 1;
        showToast(`${t('added_to_cart')}: ${p.name} (${selectedSize})`);
        return next;
      }
      showToast(`${t('added_to_cart')}: ${p.name} (${selectedSize})`);
      return [...prev, { ...productToAdd, quantity: 1, image: String(imgUrl) }];
    });
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const realProduct = activeProducts.find(p => p.id === item.id);
        const availableStock = realProduct?.stockCounts?.[item.selectedSize] || 0;
        const newQ = (Number(item.quantity) || 0) + delta;
        
        if (delta > 0 && newQ > availableStock) {
           showToast(`На складі всього ${availableStock} шт.`);
           return item;
        }

        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const fetchNpCities = async (query) => {
    setDeliveryForm(prev => ({...prev, city: query, branch: '', cityRef: ''}));
    setNpWarehouses([]); 
    
    if (query.length < 2) { setNpCities([]); setShowCities(false); return; }
    
    setIsNpLoading(true);
    try {
      const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: NP_API_KEY,
          modelName: 'Address',
          calledMethod: 'getCities',
          methodProperties: { FindByString: query, Limit: 20 }
        })
      });
      const data = await res.json();
      setNpCities(data.data || []);
      setShowCities(true);
    } catch (e) {
      console.warn("Помилка НП (Міста)", e);
    }
    setIsNpLoading(false);
  };

  const selectNpCity = (city) => {
    setDeliveryForm(prev => ({...prev, city: city.Description, cityRef: city.Ref, branch: ''}));
    setShowCities(false);
    fetchNpWarehouses('', city.Ref); 
  };

  const fetchNpWarehouses = async (query, cityRef = deliveryForm.cityRef) => {
    setDeliveryForm(prev => ({...prev, branch: query}));
    if (!cityRef) return;

    setIsNpLoading(true);
    try {
      const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        body: JSON.stringify({
          apiKey: NP_API_KEY,
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties: { CityRef: cityRef, FindByString: query, Limit: 50 }
        })
      });
      const data = await res.json();
      setNpWarehouses(data.data || []);
      setShowWarehouses(true);
    } catch (e) {
      console.warn("Помилка НП (Відділення)", e);
    }
    setIsNpLoading(false);
  };

  const selectNpWarehouse = (wh) => {
    setDeliveryForm(prev => ({...prev, branch: wh.Description}));
    setShowWarehouses(false);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !user.uid) {
      showToast('Помилка: Зачекайте, йде з\'єднання з сервером. Спробуйте ще раз.');
      return;
    }
    
    const itemsToSave = cart.map(item => {
      const realProduct = activeProducts.find(p => p.id === item.id);
      const pInfo = realProduct ? getProductPrice(realProduct) : { final: Number(item.price) || 0 };
      return { 
        id: String(item.id || ''),
        name: String(item.name || 'Товар'),
        selectedSize: String(item.selectedSize || 'OS'),
        selectedColor: String(item.selectedColor || ''),
        quantity: Number(item.quantity) || 1,
        price: pInfo.final,
        image: String(item.image || 'https://via.placeholder.com/100')
      };
    }).filter(item => item.id && item.price >= 0); 

    const safeTotal = itemsToSave.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (itemsToSave.length === 0 || safeTotal <= 0) {
      showToast('Помилка: Кошик порожній або дані пошкоджені. Будь ласка, очистіть кошик.');
      return;
    }

    const appliedRef = localStorage.getItem('sliniavskiy_ref') || null;

    const orderData = {
      userId: user.uid,
      customer: {
        name: String(deliveryForm.name || ''),
        phone: String(deliveryForm.phone || ''),
        city: String(deliveryForm.city || ''),
        branch: String(deliveryForm.branch || '')
      },
      items: itemsToSave,
      total: safeTotal,
      status: 'pending_payment', 
      referralCode: appliedRef,
      createdAt: new Date().toISOString()
    };

    try {
      const safeData = JSON.parse(JSON.stringify(orderData));
      
      setPendingOrderData(safeData);
      setCheckoutStep(2); 
      
      setTimeout(() => {
        const cartContainer = document.getElementById('cart-scroll-container');
        if (cartContainer) cartContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);

    } catch (err) {
      console.warn("Помилка збереження попереднього замовлення", err);
      showToast('Помилка обробки замовлення. Можливо проблема зі з\'єднанням.');
    }
  };

  const handleFinalizePayment = async () => {
    if (!user) {
      showToast('Помилка: сесія користувача не знайдена.');
      return;
    }
    if (!pendingOrderData) {
      showToast('Помилка: Замовлення не знайдено (сесія скинута). Оформіть заново.');
      setCheckoutStep(1);
      return;
    }

    setIsProcessingPayment(true);

    // 1. ФІНАЛЬНА ПЕРЕВІРКА НАЯВНОСТІ (Щоб не продати те, чого вже немає)
    for (const item of pendingOrderData.items) {
       const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id));
       if (snap.exists()) {
         const p = snap.data();
         const currentStock = p.stockCounts?.[item.selectedSize] || 0;
         if (currentStock < item.quantity) {
            showToast(`❌ Помилка: "${item.name}" (Розмір ${item.selectedSize}) залишилось лише ${currentStock} шт. Оновіть кошик.`);
            setIsProcessingPayment(false);
            setCheckoutStep(1);
            return;
         }
       }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const finalOrderData = { ...pendingOrderData, status: 'new' };
      const newOrderRef = await addDoc(getOrdersRef(), finalOrderData);

      setLocalOrders(prev => [newOrderRef.id, ...prev]);

      // 2. АВТОМАТИЧНЕ СПИСАННЯ ЗІ СКЛАДУ ПІСЛЯ ПОКУПКИ
      // Групуємо товари, щоб правильно відняти, якщо купили різні розміри однієї речі
      const updates = {};
      for (const item of finalOrderData.items) {
         if (!updates[item.id]) {
           const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', item.id));
           updates[item.id] = snap.data()?.stockCounts || { S: 0, M: 0, L: 0, XL: 0 };
         }
         const current = Number(updates[item.id][item.selectedSize]) || 0;
         updates[item.id][item.selectedSize] = Math.max(0, current - item.quantity);
      }

      // Зберігаємо нові залишки в базу даних
      for (const [prodId, newStock] of Object.entries(updates)) {
         const totalQty = Object.values(newStock).reduce((a, b) => a + b, 0);
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', prodId), {
           stockCounts: newStock,
           inStock: totalQty > 0
         });
      }

      const appliedRef = localStorage.getItem('sliniavskiy_ref') || null;
      
      // Оновлюємо лічильник використань промокоду
      if (appliedRef) {
         const foundRef = referrals.find(r => r.code === appliedRef);
         if (foundRef && foundRef.discountPercent > 0) {
             try {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'referrals', foundRef.id), {
                   usageCount: increment(1)
                });
             } catch(e) { console.warn("Не вдалося оновити ліміт", e); }
         }
      }

      let text = `🔥 <b>Нове ОПЛАЧЕНЕ замовлення!</b>\n\n`;
      text += `👤 <b>ПІБ:</b> ${deliveryForm.name}\n`;
      text += `📞 <b>Телефон:</b> ${deliveryForm.phone}\n`;
      text += `📍 <b>Місто:</b> ${deliveryForm.city}\n`;
      text += `🏢 <b>Відділення:</b> ${deliveryForm.branch}\n`;
      if (appliedRef) {
        const promoForTelegram = referrals.find(r => r.code === appliedRef);
        if (promoForTelegram && promoForTelegram.discountPercent > 0) {
          text += `🎁 <b>Промокод:</b> ${appliedRef} (-${promoForTelegram.discountPercent}%)\n`;
        } else {
          text += `🤝 <b>Реферал:</b> ${appliedRef}\n`;
        }
      }
      text += `\n🛒 <b>Товари:</b>\n`;
      cart.forEach(item => {
        text += `- ${item.name} (${item.selectedSize} / ${item.selectedColor}) x${item.quantity}\n`;
      });
      text += `\n💳 <b>Сплачено:</b> ${cartTotal} ₴`;

      await sendTelegramMessage(text);

      showToast('Тестова оплата успішна! Замовлення оформлено.');
      
      localStorage.removeItem('sliniavskiy_ref');
      
      setCart([]);
      setDeliveryForm({ name: '', phone: '', city: '', cityRef: '', branch: '' });
      setPendingOrderData(null);
      setIsCartOpen(false);
      setIsCheckoutForm(false);
      setCheckoutStep(1);
      setIsProcessingPayment(false);
      
      navigate('home');
      
    } catch (err) {
      console.warn("Помилка підтвердження оплати", err);
      showToast(`Помилка оплати: ${err.message || 'Спробуйте ще раз'}`);
      setIsProcessingPayment(false);
    }
  };

  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    try {
      const parsedImages = editForm.images ? editForm.images.split('\n').map(u => u.trim()).filter(Boolean) : [];
      
      const cleanColors = (editForm.colors || []).map(c => ({
         name: c.name || 'Color',
         label: c.label || 'Колір',
         hex: c.hex || '#ffffff',
         imageIndexes: Array.isArray(c.imageIndexes) ? c.imageIndexes : []
      }));

      const productData = {
        name: editForm.name || 'Новий товар',
        price: Number(editForm.price) || 0,
        category: activeCategories.includes(editForm.category) ? editForm.category : (activeCategories[0] || 'Категорія'),
        images: parsedImages.length > 0 ? parsedImages : ['https://via.placeholder.com/800x1000?text=No+Image'],
        sizeGuide: editForm.sizeGuide || DEFAULT_SIZE_GUIDE,
        isVisible: Boolean(editForm.isVisible !== false),
        inStock: Boolean(editForm.inStock !== false),
        colors: cleanColors.length > 0 ? cleanColors : DEFAULT_COLORS,
        sizes: {
          S: Boolean(editForm.sizes?.S !== false),
          M: Boolean(editForm.sizes?.M !== false),
          L: Boolean(editForm.sizes?.L !== false),
          XL: Boolean(editForm.sizes?.XL !== false)
        },
        discountPercent: editingProduct?.discountPercent || null,
        discountEndsAt: editingProduct?.discountEndsAt || null
      };

      const safeData = JSON.parse(JSON.stringify(productData));

      if (editingProduct?.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProduct.id), safeData);
        showToast('✅ Товар успішно оновлено!');
      } else {
        await addDoc(getProductsRef(), safeData);
        showToast('✅ Новий товар успішно додано на сайт!');
      }
      setEditingProduct(null);
    } catch(err) { 
      console.warn(err); 
      showToast(`❌ Помилка бази: ${err.message}`); 
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setIsUploadingFile(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileRef = ref(storage, `artifacts/${appId}/products/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        uploadedUrls.push(url);
      }
      const currentImages = editForm.images ? editForm.images.split('\n').filter(i=>i.trim()) : [];
      const newImagesList = [...currentImages, ...uploadedUrls].join('\n');
      setEditForm({ ...editForm, images: newImagesList });
      showToast('⚠️ Фото завантажено в хмару! Тепер обов\'язково натисніть "Зберегти товар" внизу');
    } catch (error) {
      console.warn("Помилка завантаження:", error);
      showToast('❌ Помилка завантаження фото!');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleImageSettingUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const fileRef = ref(storage, `artifacts/${appId}/settings/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      if (type === 'desktop') setSettingsFormUrl(url);
      if (type === 'mobile') setSettingsFormUrlMobile(url);
      if (type === 'brand') setSettingsBrandUrl(url);
      if (type === 'promo') setSettingsPromoUrl(url);
      showToast('⚠️ Медіа завантажено! Натисніть "Зберегти налаштування"');
    } catch (error) {
      console.warn("Помилка завантаження зображення", error);
      showToast('❌ Помилка завантаження');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Видалити товар?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id));
      showToast('✅ Товар видалено');
    } catch(err) { console.warn(err); showToast('❌ Помилка видалення'); }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const parsedCategories = settingsCategories.split(',').map(c => c.trim()).filter(Boolean);
      
      const dataToSave = { 
        heroImage: settingsFormUrl || '',
        heroImageMobile: settingsFormUrlMobile || '',
        brandImage: settingsBrandUrl || '',
        heroAnimation: settingsHeroAnimation,
        categories: parsedCategories.length > 0 ? parsedCategories : DEFAULT_CATEGORIES
      };
      
      const safeData = JSON.parse(JSON.stringify(dataToSave));
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), safeData, { merge: true });
      showToast('✅ Налаштування успішно збережено!');
    } catch(err) { 
      console.warn(err); 
      showToast(`❌ Помилка налаштувань: ${err.message}`); 
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
      showToast('✅ Статус замовлення оновлено');
    } catch (e) {
      console.warn(e);
      showToast('❌ Помилка оновлення статусу');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('⚠️ Ви впевнені, що хочете ОСТАТОЧНО видалити це замовлення з бази даних? Цю дію неможливо скасувати!')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId));
      setLocalOrders(prev => prev.filter(id => id !== orderId)); // Clean local history if present
      showToast('✅ Замовлення успішно видалено з бази');
    } catch (e) {
      console.warn(e);
      showToast('❌ Помилка при видаленні замовлення');
    }
  };

  const translitCyrillicToLatin = (str) => {
    const map = {
      'а':'a', 'б':'b', 'в':'v', 'г':'g', 'ґ':'g', 'д':'d', 'е':'e', 'є':'ye', 'ж':'zh', 'з':'z', 'и':'y', 'і':'i', 'ї':'yi', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'kh', 'ц':'ts', 'ч':'ch', 'ш':'shch', 'ь':'', 'ю':'yu', 'я':'ya', ' ':'-'
    };
    return str.toLowerCase().split('').map(char => map[char] || char).join('');
  };

  const handleAddReferral = async (e) => {
    e.preventDefault();
    if (!newReferralName.trim()) return;
    
    // Auto-generate clean code from name
    let baseCode = translitCyrillicToLatin(newReferralName).replace(/[^a-z0-9-]/g, '');
    if (!baseCode) baseCode = 'partner';
    
    let finalCode = baseCode;
    // Basic collision check in local state
    if (referrals.some(r => r.code === finalCode)) {
      finalCode = `${baseCode}-${Math.floor(Math.random()*1000)}`;
    }
    
    try {
      const safeData = JSON.parse(JSON.stringify({
        name: newReferralName,
        code: finalCode,
        discountPercent: 0,
        usageLimit: null,
        usageCount: 0,
        createdAt: new Date().toISOString()
      }));
      await addDoc(getReferralsRef(), safeData);
      setNewReferralName('');
      showToast('✅ Реферала успішно створено');
      setRefFilterPartner(finalCode); // auto select new partner
    } catch (err) {
      console.warn(err);
      showToast('❌ Помилка створення реферала');
    }
  };

  const handleDeleteReferral = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього партнера? Його існуючі замовлення збережуться, але нові не будуть фіксуватися.')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'referrals', id));
      showToast('✅ Партнера видалено');
      if (refFilterPartner === id) setRefFilterPartner('');
    } catch (e) {
      console.warn(e);
      showToast('❌ Помилка видалення');
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      showToast(t('copied'));
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("Copy");
      textArea.remove();
      showToast(t('copied'));
    }
  };

  const handleRefSort = (key) => {
    setRefSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleSaveDiscount = async (productId, percent, endsAt) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), {
        discountPercent: percent ? Number(percent) : null,
        discountEndsAt: endsAt || null
      });
      showToast('✅ Знижку успішно збережено!');
    } catch (e) {
      console.warn(e);
      showToast('❌ Помилка збереження знижки');
    }
  };

  const handleLocalStockChange = (productId, size, value) => {
    setInventoryEdits(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [size]: value
      }
    }));
  };

  const saveInventoryEdits = async (productId) => {
    const product = dbProducts.find(p => p.id === productId);
    if (!product) return;

    const currentStock = product.stockCounts || { S: 0, M: 0, L: 0, XL: 0 };
    const edits = inventoryEdits[productId] || {};
    const newStock = { ...currentStock };
    let hasChanges = false;

    SIZES.forEach(s => {
      if (edits[s] !== undefined) {
        const newQty = edits[s] === '' ? 0 : Math.max(0, parseInt(edits[s], 10) || 0);
        if (newStock[s] !== newQty) {
          newStock[s] = newQty;
          hasChanges = true;
        }
      }
    });

    if (!hasChanges) {
      setInventoryEdits(prev => { const next = {...prev}; delete next[productId]; return next; });
      return;
    }

    const totalQty = Object.values(newStock).reduce((a, b) => a + b, 0);

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), {
        stockCounts: newStock,
        inStock: totalQty > 0
      });
      showToast('✅ Склад успішно оновлено!');
      setInventoryEdits(prev => { const next = {...prev}; delete next[productId]; return next; });
    } catch (e) {
      showToast('❌ Помилка оновлення складу');
    }
  };

  const toggleColorImage = (colorIndex, imgIndex) => {
    const nc = [...editForm.colors];
    if (!nc[colorIndex].imageIndexes) {
      nc[colorIndex].imageIndexes = [];
    }
    
    const indexPos = nc[colorIndex].imageIndexes.indexOf(imgIndex);
    if (indexPos > -1) {
      nc[colorIndex].imageIndexes.splice(indexPos, 1);
    } else {
      nc[colorIndex].imageIndexes.push(imgIndex);
      nc[colorIndex].imageIndexes.sort((a, b) => a - b);
    }
    setEditForm({...editForm, colors: nc});
  };

  return (
    <>
      {/* FULL SCREEN LOADER - WITH FADE OUT ANIMATION */}
      {showLoader && (
        <div className={`fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center font-sans transition-opacity duration-1000 ease-in-out ${fadeLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <style>{`
            @keyframes fillText {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            @keyframes slideUpPopup {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.2em] px-4 cursor-default selection:bg-transparent">
            <span className="relative inline-block text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}>
              SLINIAVSKIY
              <span 
                className="absolute top-0 left-0 h-full text-white overflow-hidden whitespace-nowrap"
                style={{ width: '0%', animation: 'fillText 2s cubic-bezier(0.7, 0, 0.3, 1) forwards', WebkitTextStroke: '0px' }}
              >
                SLINIAVSKIY
              </span>
            </span>
          </div>
        </div>
      )}

      {isReady && isMaintenance && user?.email !== ADMIN_EMAIL && route !== 'account' && (
        <MaintenanceScreen onSecretClick={() => navigate('account')} />
      )}

      {/* MAIN APP CONTENT */}
      {isReady && (!isMaintenance || user?.email === ADMIN_EMAIL || route === 'account') && (
        <>
          {/* THE SCROLLABLE PAGE BASE */}
          <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-white selection:text-black antialiased overflow-x-hidden">
            <style>{`
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .search-overlay { animation: fadeIn 0.4s ease-out; }
              @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <Header 
              navigate={navigate} 
              goBack={goBack}
              route={route}
              setIsSearchOpen={setIsSearchOpen} 
              cart={cart} 
              wishlist={wishlist}
              setIsWishlistOpen={setIsWishlistOpen}
              isCatalogOpen={isCatalogOpen} 
              setIsCatalogOpen={setIsCatalogOpen} 
              setIsCartOpen={setIsCartOpen} 
              user={user} 
              groupedCategories={groupedCategories}
              t={t}
              tCat={tCat}
            />

            {/* CONTENT WITH BLUR EFFECT DURING TRANSLATION OR NAVIGATION */}
            <div className={`transition-all duration-500 ease-in-out ${isTranslating || isNavigating ? 'opacity-0 blur-md scale-[0.98]' : 'opacity-100 blur-0 scale-100'}`}>
              <style>{`
                @keyframes premiumPageReveal {
                  0% { 
                    opacity: 0; 
                    transform: translateY(15px);
                    filter: blur(8px);
                  }
                  100% { 
                    opacity: 1; 
                    transform: translateY(0);
                    filter: blur(0);
                  }
                }
                .page-transition-wrapper {
                  animation: premiumPageReveal 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
              `}</style>
              <main key={route} className="page-transition-wrapper min-h-screen">
                {/* HOME ROUTE */}
                {route === 'home' && (
                  <div className="animate-in fade-in duration-1000">
                    {/* Добавляем стили для плавной анимации картинки */}
                    <style>{`
                      @keyframes smoothReveal {
                        0% { opacity: 0; }
                        100% { opacity: 0.5; }
                      }
                      @keyframes ytmBreathe {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.08); }
                        100% { transform: scale(1); }
                      }
                      .hero-image-smooth {
                        animation: smoothReveal 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                      }
                      .hero-image-breathe {
                        animation: smoothReveal 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards, ytmBreathe 20s ease-in-out infinite alternate;
                        will-change: transform, opacity;
                      }
                      @keyframes smoothTextReveal {
                        0% { opacity: 0; transform: translateY(20px); }
                        100% { opacity: 1; transform: translateY(0); }
                      }
                      .hero-text-smooth {
                        opacity: 0;
                        animation: smoothTextReveal 2s ease-out 0.5s forwards;
                      }
                    `}</style>
                    
                    <section className="relative h-[100svh] flex flex-col items-center justify-center overflow-hidden">
                      {/* Картинки теперь используют класс hero-image-smooth или hero-image-breathe и поддерживают видео */}
                      <MediaElement src={siteSettings.heroImage} className={`hidden md:block absolute inset-0 w-full h-full object-cover opacity-0 ${siteSettings.heroAnimation ? 'hero-image-breathe' : 'hero-image-smooth'}`} alt="Hero Desktop" />
                      <MediaElement src={siteSettings.heroImageMobile || siteSettings.heroImage} className={`md:hidden absolute inset-0 w-full h-full object-cover opacity-0 ${siteSettings.heroAnimation ? 'hero-image-breathe' : 'hero-image-smooth'}`} alt="Hero Mobile" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-[#1c1c1c]/40" />
                      
                      {/* Текст также плавно выплывает с небольшой задержкой */}
                      <div className="relative z-10 text-center px-4 w-full overflow-hidden hero-text-smooth">
                        <h1 className="text-[11vw] sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[9rem] font-black tracking-tighter uppercase leading-none mb-8 md:mb-12 text-white whitespace-nowrap">SLINIAVSKIY</h1>
                        <button onClick={() => navigate('catalog')} className="px-8 py-4 md:px-12 md:py-5 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors text-[10px] md:text-xs active:scale-95">{t('to_collection')}</button>
                      </div>
                    </section>

                  <section className="max-w-[1920px] w-full mx-auto px-4 md:px-10 py-20 md:py-32 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 border-b border-white/10 pb-6 md:pb-8 gap-4">
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-center md:text-left">{t('new_arrivals')}</h2>
                      <button onClick={() => navigate('catalog')} className="hidden md:block px-12 py-5 bg-white text-black text-[12px] font-black uppercase tracking-widest hover:scale-110 transition-all active:scale-95">{t('view_all')}</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10 lg:px-16 xl:px-32">
                      {randomStorefrontProducts.slice(0, 6).map((p, idx) => {
                        const priceInfo = getProductPrice(p);
                        return (
                        <div 
                          key={p.id} 
                          className="group cursor-pointer animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-1000 ease-out" 
                          style={{ animationDelay: `${idx * 120}ms`, animationFillMode: 'both' }}
                          onClick={() => navigate('product', { id: p.id })}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-3 md:mb-5 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all border border-white/5">
                            {priceInfo.isDiscounted && <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-[#d4af37] text-black text-[9px] md:text-[11px] font-black uppercase px-2 py-1 shadow-lg">-{priceInfo.percent}%</div>}
                            {p.inStock === false && <div className={`absolute left-2 md:left-4 z-10 bg-black/80 text-white text-[8px] md:text-[10px] font-black uppercase px-2 py-1 border border-white/10 ${priceInfo.isDiscounted ? 'top-8 md:top-12' : 'top-2 md:top-4'}`}>{t('sold_out')}</div>}
                            <MediaElement src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/800'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 md:group-hover:scale-105" alt="" />
                            <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-1.5 md:p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                              <Heart size={14} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={`md:w-4 md:h-4 ${isInWishlist(p.id) ? "text-white" : "text-white/50"}`} />
                            </button>
                          </div>
                          <h3 className="font-bold uppercase tracking-widest text-[9px] md:text-xs mb-1">{p.name}</h3>
                          <p className="font-medium text-[10px] md:text-sm flex gap-2">
                             {priceInfo.isDiscounted ? (
                               <>
                                 <span className="line-through text-zinc-600">{priceInfo.original} ₴</span>
                                 <span className="text-[#d4af37] font-black">{priceInfo.final} ₴</span>
                               </>
                             ) : (
                               <span className="text-zinc-500">{priceInfo.final} ₴</span>
                             )}
                          </p>
                        </div>
                      )})}
                    </div>
                    {randomStorefrontProducts.length > 6 && (
                      <div className="mt-12 md:mt-16 flex justify-center w-full">
                        <button onClick={() => navigate('catalog')} className="group flex flex-col items-center gap-3 pb-2">
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">
                            {t('view_all')}
                          </span>
                          <div className="w-8 h-[1px] bg-zinc-700 group-hover:bg-white group-hover:w-16 transition-all duration-300" />
                        </button>
                      </div>
                    )}
                  </section>

                  {/* ДОПОЛНИТЕЛЬНЫЙ ПРОМО-БЛОК (ВИДЕО/ФОТО) */}
                  {siteSettings.promoMediaUrl && (
                    <section className="relative w-full aspect-video md:aspect-[21/9] bg-zinc-900 border-t border-white/5 overflow-hidden group">
                       <MediaElement src={siteSettings.promoMediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 md:group-hover:opacity-80 md:group-hover:scale-105 transition-all duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.2em] text-white mb-6 drop-shadow-2xl">Нова Колекція</h2>
                          <button onClick={() => navigate('catalog')} className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-zinc-200 transition-colors shadow-2xl active:scale-95">
                            Дивитись зараз
                          </button>
                       </div>
                    </section>
                  )}
                </div>
              )}

              {/* CATALOG ROUTE */}
              {route === 'catalog' && (
                 <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-[1920px] w-full mx-auto px-4 md:px-10">
                    <div className="flex flex-col mb-10 md:mb-16 border-b border-white/10 pb-6 md:pb-10">
                      <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-widest mb-8 md:mb-12 leading-none break-words">
                        {routeParams.category ? tCat(routeParams.category) : t('collection')}
                      </h2>
                      
                      {/* ENHANCED PREMIUM CATEGORY SELECTOR */}
                      <div className="w-full flex flex-col gap-4 md:gap-6 mt-4">
                        <button 
                          onClick={() => navigate('catalog', { category: null })} 
                          className={`self-start px-8 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-300 rounded-sm border ${!routeParams.category ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-400 border-white/20 hover:border-white hover:text-white'}`}
                        >
                          {t('all_products')}
                        </button>

                        <div className="flex flex-col gap-5 md:gap-6 border-t border-white/5 pt-5 md:pt-6">
                          {groupedCategories.top.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37] w-24 shrink-0">{t('outerwear')}</span>
                              <div className="flex flex-wrap gap-2 md:gap-3">
                                {groupedCategories.top.map(c => (
                                  <button key={c} onClick={() => navigate('catalog', { category: c })} className={`px-5 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border ${routeParams.category === c ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white hover:text-white'}`}>
                                    {tCat(c)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {groupedCategories.bottom.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37] w-24 shrink-0">{t('bottoms')}</span>
                               <div className="flex flex-wrap gap-2 md:gap-3">
                                 {groupedCategories.bottom.map(c => (
                                    <button key={c} onClick={() => navigate('catalog', { category: c })} className={`px-5 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border ${routeParams.category === c ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white hover:text-white'}`}>
                                      {tCat(c)}
                                    </button>
                                 ))}
                               </div>
                            </div>
                          )}

                          {groupedCategories.acc.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37] w-24 shrink-0">{t('accessories')}</span>
                               <div className="flex flex-wrap gap-2 md:gap-3">
                                 {groupedCategories.acc.map(c => (
                                    <button key={c} onClick={() => navigate('catalog', { category: c })} className={`px-5 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border ${routeParams.category === c ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white hover:text-white'}`}>
                                      {tCat(c)}
                                    </button>
                                 ))}
                               </div>
                            </div>
                          )}

                          {groupedCategories.other.length > 0 && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4af37] w-24 shrink-0">{t('other')}</span>
                               <div className="flex flex-wrap gap-2 md:gap-3">
                                 {groupedCategories.other.map(c => (
                                    <button key={c} onClick={() => navigate('catalog', { category: c })} className={`px-5 py-2.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all rounded-sm border ${routeParams.category === c ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white hover:text-white'}`}>
                                      {tCat(c)}
                                    </button>
                                 ))}
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                      {(() => {
                        const baseProducts = routeParams.category ? storefrontProducts : randomStorefrontProducts;
                        const filteredProducts = baseProducts.filter(p => !routeParams.category || p.category === routeParams.category);
                        
                        if (filteredProducts.length === 0) {
                           return <div className="col-span-3 py-20 text-center text-zinc-500 uppercase font-black tracking-widest text-xs">{t('empty_cat')}</div>;
                        }

                        return (
                          <>
                            {filteredProducts.map((p, idx) => {
                              const animationDelay = Math.min(idx * 80, 800);
                              const priceInfo = getProductPrice(p);

                              return (
                              <div 
                                key={p.id} 
                                onClick={() => navigate('product', { id: p.id })} 
                                className="cursor-pointer group animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out"
                                style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'both' }}
                              >
                                <div className="relative aspect-[3/4] bg-zinc-900 mb-4 md:mb-6 overflow-hidden border border-white/5">
                                  {priceInfo.isDiscounted && <div className="absolute top-4 left-4 z-10 bg-[#d4af37] text-black text-[10px] md:text-[11px] font-black uppercase px-3 py-1 shadow-lg">-{priceInfo.percent}%</div>}
                                  {p.inStock === false && <div className={`absolute left-4 z-10 bg-black/80 text-white text-[10px] font-black uppercase px-3 py-2 border border-white/10 ${priceInfo.isDiscounted ? 'top-12' : 'top-4'}`}>{t('sold_out')}</div>}
                                  <MediaElement src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/800'} className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={p.name}/>
                                  <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-4 right-4 z-20 p-2 md:p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                                    <Heart size={16} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : "text-white/50"} />
                                  </button>
                                </div>
                                <h3 className="font-bold uppercase text-[11px] md:text-sm tracking-widest mb-1">{p.name}</h3>
                                <p className="font-medium text-xs md:text-base flex gap-2">
                                   {priceInfo.isDiscounted ? (
                                     <>
                                       <span className="line-through text-zinc-600">{priceInfo.original} ₴</span>
                                       <span className="text-[#d4af37] font-black">{priceInfo.final} ₴</span>
                                     </>
                                   ) : (
                                     <span className="text-zinc-500">{priceInfo.final} ₴</span>
                                   )}
                                </p>
                              </div>
                            )})}
                          </>
                        );
                      })()}
                    </div>
                 </div>
              )}

              {/* BRAND ROUTE */}
              {route === 'brand' && (
                <div className="pt-28 md:pt-48 pb-20 md:pb-32 max-w-4xl mx-auto px-4 md:px-6 text-center">
                  
                  <div className="mb-12 md:mb-24 px-2">
                     <h2 className="text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.1em] md:tracking-[0.2em] leading-snug md:leading-relaxed mb-6 md:mb-8">
                       {t('brand_quote')}
                     </h2>
                     <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[11px]">{t('brand_founder')}</p>
                  </div>

                  <div className="w-full aspect-[4/3] md:aspect-video bg-zinc-900 mb-16 md:mb-32 overflow-hidden border border-white/10 shadow-2xl relative">
                     <img src={siteSettings.brandImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80'} alt="Brand Image" className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-1000" />
                  </div>

                  <div className="border-t border-white/10 pt-16 md:pt-32 px-2">
                     <h3 className="text-lg md:text-3xl font-black uppercase tracking-[0.3em] mb-8 md:mb-12 text-[#d4af37]">{t('brand_goal_title')}</h3>
                     <div className="space-y-6 md:space-y-10 text-zinc-300 text-sm md:text-lg leading-relaxed md:leading-loose max-w-3xl mx-auto font-medium text-left md:text-center">
                       <p>
                         {t('brand_p1')}
                       </p>
                       <p>
                         {t('brand_p2')}
                       </p>
                     </div>
                     
                     <div className="mt-16 md:mt-24 pt-8 md:pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                       <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5">
                          <Shield size={32} className="mb-4 text-[#d4af37]" />
                          <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">{t('quality')}</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed text-center">{t('quality_desc')}</p>
                       </div>
                       <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5">
                          <Feather size={32} className="mb-4 text-[#d4af37]" />
                          <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">{t('comfort')}</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed text-center">{t('comfort_desc')}</p>
                       </div>
                       <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-white/5">
                          <InfinityIcon size={32} className="mb-4 text-[#d4af37]" />
                          <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest mb-2">{t('durability')}</h4>
                          <p className="text-[10px] text-zinc-500 leading-relaxed text-center">{t('durability_desc')}</p>
                       </div>
                     </div>
                     
                     <div className="mt-16 md:mt-24">
                       <button onClick={() => navigate('catalog')} className="w-full sm:w-auto px-12 py-5 bg-white text-black text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl">
                         {t('to_collection')}
                       </button>
                     </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT ROUTE */}
              {route === 'account' && (
                <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-[1920px] w-full mx-auto px-4 md:px-10">
                  {!user || user.isAnonymous ? (
                    <div className="max-w-md mx-auto text-center py-12 md:py-16 border border-white/5 p-6 md:p-10 bg-zinc-900/20 shadow-2xl">
                       <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4">{t('login_title')}</h2>
                       <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-8 md:mb-10 leading-relaxed">
                         {t('login_desc')}
                       </p>
                       
                       <button 
                         onClick={handleGoogleLogin}
                         className="w-full py-4 mb-8 bg-white text-black font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-xl"
                       >
                         <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                           <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                           <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                           <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                         </svg>
                         {t('login_google')}
                       </button>

                       <div className="relative flex items-center justify-center mb-8">
                          <div className="absolute border-t border-white/10 w-full"></div>
                          <span className="relative bg-[#0a0a0a] px-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500">{t('or_email')}</span>
                       </div>

                       <form onSubmit={handleEmailAuth} className="space-y-4 mb-8 text-left">
                          {authError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                              {authError}
                            </div>
                          )}
                          <div>
                            <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">{t('email_label')}</label>
                            <input 
                              type="email" 
                              value={authEmail} 
                              onChange={e => setAuthEmail(e.target.value)} 
                              className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none transition-colors text-white"
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">{t('pass_label')}</label>
                            <input 
                              type="password" 
                              value={authPassword} 
                              onChange={e => setAuthPassword(e.target.value)} 
                              className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none transition-colors text-white"
                              required 
                              minLength={6}
                            />
                          </div>
                          <button type="submit" className="w-full py-4 border border-white/20 bg-transparent text-white font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 shadow-xl mt-2">
                            {isRegistering ? t('register_btn') : t('login_btn')}
                          </button>
                       </form>

                       <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 gap-4">
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            {isRegistering ? t('already_have') : t('dont_have')}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setIsRegistering(!isRegistering)} 
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:text-zinc-400 underline underline-offset-4"
                          >
                            {isRegistering ? t('login_link') : t('register_link')}
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                      <div className="lg:col-span-1 space-y-8 md:space-y-12">
                         <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-6 md:gap-8 text-center sm:text-left">
                            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 shrink-0 bg-zinc-800 flex items-center justify-center">
                               {user.photoURL ? (
                                 <img src={user.photoURL} className="w-full h-full object-cover" alt="Avatar" />
                               ) : (
                                 <User size={32} className="text-zinc-500" />
                               )}
                            </div>
                            <div className="overflow-hidden w-full max-w-full">
                               <h3 className="text-lg md:text-xl font-black uppercase tracking-widest truncate">{user.displayName || 'Клієнт'}</h3>
                               <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-2 truncate break-all">{user.email || 'Гість'}</p>
                            </div>
                         </div>
                         
                         <nav className="flex flex-col gap-4 border-t border-white/5 pt-8 md:pt-12">
                            <button 
                              onClick={handleLogout}
                              className="flex items-center justify-center sm:justify-start gap-4 py-4 text-red-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                              <LogOut size={16}/>
                              <span>{t('logout')}</span>
                            </button>
                         </nav>
                      </div>

                      <div className="lg:col-span-2 space-y-8 md:space-y-12">
                         <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-center sm:text-left">{t('order_history')}</h2>
                         
                         {(() => {
                            const myOrders = orders.filter(o => o.userId === user.uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                            
                            if (myOrders.length === 0) {
                               return (
                                 <div className="space-y-6">
                                    <div className="p-6 md:p-10 border border-white/5 bg-zinc-900/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                                       <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                                          <History size={24} className="text-zinc-700" />
                                          <div>
                                             <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{t('no_orders')}</p>
                                             <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest">{t('history_empty')}</h4>
                                          </div>
                                       </div>
                                       <button onClick={() => navigate('catalog')} className="w-full md:w-auto px-8 py-4 border border-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                                          {t('to_shopping')}
                                       </button>
                                    </div>
                                 </div>
                               );
                            }

                            return (
                               <div className="space-y-6">
                                  {myOrders.map(order => (
                                     <div key={order.id} className="p-5 md:p-6 border border-white/10 bg-zinc-900/40 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                        <div className="w-full">
                                           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 break-words">
                                              {t('order_num')} #{order.id.slice(0, 8)} <span className="mx-1 md:mx-2">•</span> {new Date(order.createdAt).toLocaleDateString()}
                                           </p>
                                           <div className="space-y-2">
                                              {order.items.map((item, idx) => (
                                                 <p key={idx} className="text-[11px] md:text-xs font-bold text-zinc-300">
                                                    {item.name} ({item.selectedColor}, {item.selectedSize}) <span className="text-zinc-500 ml-1 md:ml-2">x{item.quantity}</span>
                                              </p>
                                              ))}
                                           </div>
                                        </div>
                                        <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                           <p className="text-lg md:text-xl font-black">{order.total} ₴</p>
                                           <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 md:mt-2 ${STATUS_MAP[order.status]?.color || 'text-white'}`}>
                                              {STATUS_MAP[order.status]?.label || order.status}
                                           </p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            );
                         })()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCT PAGE */}
              {route === 'product' && (
                <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-[1920px] w-full mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 text-left">
                  {(() => {
                    const p = activeProducts.find(i => i.id === routeParams.id);
                    if (!p) return <div className="py-40 text-center font-black uppercase tracking-widest col-span-1 lg:col-span-2">Товар не знайдено</div>;
                    
                    const colors = p.colors?.length > 0 ? p.colors : DEFAULT_COLORS;
                    const activeColor = selectedColor || colors[0];
                    const colorLabel = lang === 'uk' ? activeColor.label : activeColor.name;
                    const isSizeAvailable = p.sizes ? p.sizes[selectedSize] !== false : true;
                    const inStockGlobal = p.inStock !== false;
                    const priceInfo = getProductPrice(p);

                    const galleryImages = (activeColor.imageIndexes && activeColor.imageIndexes.length > 0 && p.images) 
                      ? activeColor.imageIndexes.filter(i => i < p.images.length).map(i => p.images[i]) 
                      : (p.images || []);

                    const safeImageIndex = activeImageIndex < galleryImages.length ? activeImageIndex : 0;

                    return (
                      <>
                        <div className="w-full max-w-[300px] md:max-w-[420px] mx-auto space-y-4">
                          <div className="aspect-[3/4] bg-zinc-900 overflow-hidden border border-white/5 relative group">
                            {!inStockGlobal && <div className="absolute top-4 left-4 z-10 bg-black/80 text-white text-[10px] font-black uppercase px-3 py-2 border border-white/10">{t('sold_out')}</div>}
                            
                            {/* Плавный Crossfade-переход между фото/відео */}
                            {galleryImages.length > 0 ? (
                              galleryImages.map((img, idx) => (
                                <MediaElement 
                                  key={idx}
                                  src={img} 
                                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${safeImageIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
                                  alt={`${p.name} view ${idx + 1}`} 
                                />
                              ))
                            ) : (
                              <MediaElement 
                                src="https://via.placeholder.com/800" 
                                className="absolute inset-0 w-full h-full object-cover" 
                                alt={p.name} 
                              />
                            )}
                          </div>
                          {galleryImages.length > 1 && (
                            <div className="flex justify-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                              {galleryImages.map((img, idx) => (
                                <button 
                                  key={idx} 
                                  onClick={() => setActiveImageIndex(idx)} 
                                  className={`snap-start w-16 h-20 md:w-20 md:h-24 shrink-0 bg-zinc-900 overflow-hidden border-2 transition-all ${safeImageIndex === idx ? 'border-white opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                  <MediaElement src={img} autoPlay={false} className="w-full h-full object-cover" alt={`${p.name} view ${idx + 1}`} />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col pt-4 md:pt-10">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest mb-3 md:mb-4 leading-none">{p.name}</h1>
                          
                          <div className="flex justify-between items-center mb-8 md:mb-12">
                            <div className="flex items-center gap-3">
                              {priceInfo.isDiscounted ? (
                                <>
                                  <p className="text-xl md:text-2xl font-black text-[#d4af37]">{priceInfo.final} ₴</p>
                                  <p className="text-sm md:text-base font-bold text-zinc-600 line-through">{priceInfo.original} ₴</p>
                                  <span className="text-[10px] md:text-xs bg-[#d4af37] text-black px-2 py-1 font-black uppercase tracking-widest shadow-lg">
                                    -{priceInfo.percent}%
                                  </span>
                                </>
                              ) : (
                                <p className="text-xl md:text-2xl font-bold text-zinc-400">{priceInfo.final} ₴</p>
                              )}
                            </div>
                            <button onClick={() => toggleWishlist(p)} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                               <Heart size={18} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : ""} />
                               <span className="hidden sm:inline">{isInWishlist(p.id) ? t('in_wishlist') : t('add_to_wishlist')}</span>
                            </button>
                          </div>
                          
                          <div className="mb-8 md:mb-10">
                            <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-6">{t('color')}: {colorLabel}</h4>
                            <div className="flex gap-4">
                              {colors.map((color, i) => {
                                const isSelected = activeColor.name === color.name && activeColor.hex === color.hex;
                                return (
                                <button
                                  key={i}
                                  onClick={() => { setSelectedColor(color); setActiveImageIndex(0); }} 
                                  className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${isSelected ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 hover:border-white/50'}`}
                                >
                                  <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                                </button>
                              )})}
                            </div>
                          </div>

                          <div className="mb-10 md:mb-12">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{t('size')}</h4>
                              <button onClick={() => setIsSizeGuideOpen(p)} className="text-[9px] md:text-[10px] text-white font-black uppercase tracking-widest border-b border-white/20 hover:border-white transition-all flex items-center gap-2">
                                <Ruler size={14} /> {t('size_guide')}
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-3 md:gap-4">
                              {SIZES.map(size => {
                                const avail = p.sizes ? p.sizes[size] !== false : true;
                                return (
                                  <button key={size} disabled={!inStockGlobal || !avail} onClick={() => setSelectedSize(size)} className={`py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest border transition-all ${(!inStockGlobal || !avail) ? 'opacity-30 cursor-not-allowed border-white/5' : selectedSize === size ? 'bg-white text-black border-white shadow-[0_10px_20px_rgba(255,255,255,0.05)]' : 'border-white/10 text-zinc-400 hover:border-white hover:text-white'}`}>{size}</button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-8 md:space-y-12">
                             <p className="text-zinc-500 text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] leading-loose">{t('product_desc')}</p>
                             <button onClick={() => addToCart(p)} disabled={!inStockGlobal || !isSizeAvailable} className={`w-full py-5 md:py-6 font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] transition-all flex items-center justify-center gap-3 md:gap-4 ${(inStockGlobal && isSizeAvailable) ? 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                              <ShoppingBag size={18} /> {inStockGlobal ? (isSizeAvailable ? t('add_to_cart') : t('no_size')) : t('sold_out')}
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* TRACKING ROUTE */}
              {route === 'tracking' && (
                <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-[1920px] w-full mx-auto px-4 md:px-10">
                   <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-4 text-center">{t('tracking')}</h1>
                   <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center mb-10 md:mb-16 leading-relaxed max-w-2xl mx-auto">
                     {t('tracking_desc')}
                   </p>

                   <div className="space-y-6 max-w-4xl mx-auto">
                      {(() => {
                         const myOrders = orders.filter(o => localOrders.includes(o.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                         
                         if (myOrders.length === 0) {
                            return (
                               <div className="p-8 border border-white/5 bg-zinc-900/20 text-center">
                                  <History size={32} className="mx-auto text-zinc-700 mb-4" />
                                  <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-2">{t('tracking_empty_title')}</h4>
                                  <p className="text-[9px] md:text-[10px] text-zinc-500 uppercase tracking-widest">{t('tracking_empty_desc')}</p>
                               </div>
                            );
                         }

                         return myOrders.map(order => (
                            <div key={order.id} className="p-5 md:p-6 border border-white/10 bg-zinc-900/40 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                               <div className="w-full">
                                  <div className="flex items-center gap-3 mb-3">
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 break-words">
                                       {t('order_num')} <span className="text-white">#{order.id.slice(0, 8)}</span>
                                    </p>
                                    <button onClick={() => copyToClipboard(order.id)} className="text-zinc-500 hover:text-white transition-colors" title={t('copy')}>
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                                     {new Date(order.createdAt).toLocaleDateString()} <span className="mx-2">•</span> {order.customer.city}
                                  </p>
                                  <div className="space-y-2">
                                     {order.items.map((item, idx) => (
                                        <p key={idx} className="text-[11px] md:text-xs font-bold text-zinc-300">
                                           {item.name} ({item.selectedColor}, {item.selectedSize}) <span className="text-zinc-500 ml-1 md:ml-2">x{item.quantity}</span>
                                        </p>
                                     ))}
                                  </div>
                               </div>
                               <div className="text-left md:text-right mt-2 md:mt-0 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                                  <p className="text-lg md:text-xl font-black">{order.total} ₴</p>
                                  <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1 md:mt-2 ${STATUS_MAP[order.status]?.color || 'text-white'}`}>
                                     {STATUS_MAP[order.status]?.label || order.status}
                                  </p>
                               </div>
                            </div>
                         ));
                      })()}
                   </div>
                </div>
              )}

              {/* LEGAL PAGES */}
              {route === 'legal' && (
                <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-4xl mx-auto px-4 md:px-6 text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-8 md:mb-12 leading-tight">
                    {routeParams.type === 'privacy' && t('privacy')}
                    {routeParams.type === 'terms' && t('terms')}
                    {routeParams.type === 'cookies' && (lang === 'uk' ? 'Налаштування Cookies' : 'Cookies Settings')}
                    {routeParams.type === 'delivery' && t('delivery')}
                    {routeParams.type === 'returns' && t('returns')}
                    {routeParams.type === 'contacts' && t('contacts')}
                  </h1>
                  
                  {lang === 'en' ? (
                    <div className="border border-white/10 bg-zinc-900/40 p-8 text-center text-zinc-400">
                      <p className="font-bold uppercase tracking-widest text-sm mb-4">Content currently available in Ukrainian only</p>
                      <p className="text-xs leading-relaxed">The legal documents are currently being translated and reviewed. Please switch the language back to Ukrainian to read the original text, or use your browser's translation feature.</p>
                    </div>
                  ) : (
                  <div className="prose prose-invert max-w-none text-zinc-400 space-y-8 md:space-y-10 text-xs sm:text-sm md:text-base leading-relaxed font-medium">
                    
                    {routeParams.type === 'privacy' && (
                      <div className="space-y-6 md:space-y-8">
                        <p>Ця Політика конфіденційності регулює збір та захист персональних даних користувачів інтернет-магазину SLINIAVSKIY BRAND відповідно до законодавства України, зокрема Закону України «Про захист персональних даних».</p>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">1. Збір інформації</h3>
                          <p>Ми збираємо персональні данные (ПІБ, телефон, e-mail, адреса доставки) виключно для обробки, підтвердження та відправки замовлень. Здійснюючи замовлення, ви надаєте згоду на обробку своїх персональних даних.</p>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">2. Передача третім особам</h3>
                          <p>Ми не передаємо ваші данные третім особам, за винятком логістичних партнерів (ТОВ «Нова Пошта») для доставки та фінансових установ/платіжних систем (для обробки транзакцій Visa/Mastercard).</p>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">3. Захист данных</h3>
                          <p>Всі транзакції та особисті дані захищені протоколами шифрування (SSL). Фінансові дані карт не зберігаються на нашому сервері, а обробляються виключно на боці сертифікованого платіжного шлюзу (PCI DSS).</p>
                        </section>
                      </div>
                    )}

                    {routeParams.type === 'terms' && (
                      <div className="space-y-6 md:space-y-8">
                        <p>Цей договір є публічною офертою. Натискаючи кнопку "Оформити замовлення", ви погоджуєтесь з наступними умовами відповідно до ст. 633 Цивільного кодексу України.</p>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">1. Предмет договору</h3>
                          <p>Інтернет-магазин продає товари, представлені на сайті, а Покупець оплачує та приймає товари відповідно до умов этого Договору.</p>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">2. Оформлення замовлення</h3>
                          <p>Замовлення вважається прийнятим после підтвердження оплати на сайті через інтегровану платіжну систему. Продавець залишає за собою право скасувати замовлення у разі відсутності товару, повернувши кошти Покупцю у повному обсязі.</p>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">3. Права та обов'язки сторін</h3>
                          <p>Продавець зобов'язується передати товар відповідно до замовлення. Покупець зобов'язується надати достовірні дані для доставки (ПІБ, телефон, відділення) та своєчасно отримати товар.</p>
                        </section>
                      </div>
                    )}

                    {routeParams.type === 'delivery' && (
                      <div className="space-y-6 md:space-y-8">
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Способи оплати</h3>
                          <p>Для вашої зручності та безпеки ми приймаємо оплату виключно онлайн через захищений платіжний шлюз.</p>
                          <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Оплата банківською картою Visa / Mastercard (через Apple Pay, Google Pay або введення реквізитів).</li>
                            <li>Оплата відбувається без прихованих комісій з нашого боку.</li>
                            <li>Транзакції захищені за стандартом безпеки PCI DSS.</li>
                          </ul>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Доставка</h3>
                          <p>Всі замовлення відправляються логістичною компанією <strong>«Нова Пошта»</strong>.</p>
                          <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Термін відправки: 1-3 робочих дні після підтвердження оплати.</li>
                            <li>Вартість доставки розраховується за тарифами перевізника та оплачується Покупцем при отриманні.</li>
                            <li>Після відправки ви отримаєте SMS/Viber повідомлення з номером ТТН для відстеження посилки.</li>
                          </ul>
                        </section>
                      </div>
                    )}

                    {routeParams.type === 'returns' && (
                      <div className="space-y-6 md:space-y-8">
                        <p>Відповідно до Закону України «Про захист прав споживачів», ви маєте право на обмін або повернення товару належної якості протягом <strong>14 днів</strong> з моменту його отримання.</p>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Умови повернення</h3>
                          <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Товар не був у вжитку і не имеет слідів носіння (подряпин, плям, потертостей, запаху парфумів/прання).</li>
                            <li>Збережено товарний вигляд, споживчі властивості, фабричні ярлики, пломби та оригінальне пакування.</li>
                            <li>Наявний розрахунковий документ (електронна квитанція про оплату або чек).</li>
                          </ul>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Процедура повернення</h3>
                          <ol className="list-decimal pl-5 mt-4 space-y-2">
                            <li>Зв'яжіться з нашою підтримкою через Telegram або Email, вказавши номер замовлення та причину повернення.</li>
                            <li>Наш менеджер надасть вам реквізити для відправки товару «Новою Поштою» (доставку оплачує покупець).</li>
                            <li>Після отримання та перевірки товару на складі, кошти будуть повернуті на вашу банківську карту (з якої була здійснена оплата) протягом 3-7 робочих днів.</li>
                          </ol>
                        </section>
                      </div>
                    )}

                    {routeParams.type === 'contacts' && (
                      <div className="space-y-6 md:space-y-8">
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Служба підтримки</h3>
                          <p>Час роботи: Пн-Пт, 10:00 - 19:00</p>
                          <ul className="list-none mt-4 space-y-2">
                            <li><strong>Email:</strong> sliniavskiy.support@gmail.com</li>
                            <li><strong>Телефон:</strong> +380 (99) 802-85-00 (Для консультацій та питань)</li>
                          </ul>
                        </section>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Юридичні та банківські реквізити</h3>
                          <p className="text-[11px] md:text-xs text-zinc-400 uppercase tracking-widest leading-loose">
                            <strong>Суб'єкт господарювання:</strong> ФОП Слінявський Іван Леонідович<br/>
                            <strong>РНОКПП (ІПН):</strong> 3955107331<br/>
                            <strong>Юридична адреса:</strong> Україна, м. Кропивницький, вул. Михайла Грушевського, 57<br/>
                            <strong>Офіційний телефон:</strong> +380 (99) 802-85-00<br/>
                            <strong>Електронна пошта:</strong> sliniavskiy.support@gmail.com<br/>
                          </p>
                          <p className="mt-4 text-[9px] md:text-[10px] text-zinc-600">
                            *Ця інформація є публічною та розміщена згідно з правилами еквайрингу платіжних систем (Visa, Mastercard, WayForPay, MonoPay) для забезпечення прозорості та безпеки ваших платежів.
                          </p>
                        </section>
                      </div>
                    )}

                    {routeParams.type === 'cookies' && (
                      <div className="space-y-6 md:space-y-8">
                        <p>Файли cookie — це невеликі текстові файли, які зберігаються на вашому пристрої для покращення взаємодії з сайтом.</p>
                        <section>
                          <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Керування файлами</h3>
                          <p>Ми використовуємо технічні (необхідні) та аналітичні cookies. Ви можете будь-якої миті змінити налаштування нижче.</p>
                          
                          <div className="mt-8 space-y-4 border border-white/10 p-6 bg-zinc-900/20">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-widest">Технічні (Обов'язкові)</h4>
                                <p className="text-[10px] text-zinc-500 mt-1">Необхідні для роботи кошика та авторизації.</p>
                              </div>
                              <div className="w-10 h-5 bg-zinc-700 rounded-full relative opacity-50 cursor-not-allowed">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                              <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-widest">Аналітичні</h4>
                                <p className="text-[10px] text-zinc-500 mt-1">Допомагають нам покращувати сайт (Google Analytics).</p>
                              </div>
                              <button onClick={() => setCookiePrefs({...cookiePrefs, analytics: !cookiePrefs.analytics})} className={`w-10 h-5 rounded-full relative transition-colors ${cookiePrefs.analytics ? 'bg-white' : 'bg-zinc-700'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${cookiePrefs.analytics ? 'right-1' : 'left-1 bg-white'}`}></div>
                              </button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-white font-bold text-xs uppercase tracking-widest">Маркетингові</h4>
                                <p className="text-[10px] text-zinc-500 mt-1">Використовуються для персоналізації реклами.</p>
                              </div>
                              <button onClick={() => setCookiePrefs({...cookiePrefs, marketing: !cookiePrefs.marketing})} className={`w-10 h-5 rounded-full relative transition-colors ${cookiePrefs.marketing ? 'bg-white' : 'bg-zinc-700'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${cookiePrefs.marketing ? 'right-1' : 'left-1 bg-white'}`}></div>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8">
                            <button onClick={() => handleCookieAction('accepted')} className="w-full sm:w-auto px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 active:scale-95 transition-all text-center">Прийняти всі</button>
                            <button onClick={() => handleCookieAction('save_custom')} className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-black uppercase text-[10px] tracking-widest hover:border-white active:scale-95 transition-all text-center">Зберегти вибір</button>
                          </div>
                        </section>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}

              {/* ADMIN ROUTE */}
              {route === 'admin' && user?.email === ADMIN_EMAIL && (
                <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-[1920px] w-full mx-auto px-4 md:px-10">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest text-[#d4af37]">Панель Адміністратора</h1>
                    
                    <button
                      onClick={toggleMaintenance}
                      className={`flex items-center justify-center gap-2 px-6 py-4 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto ${
                        isMaintenance
                        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {isMaintenance ? <Lock size={14} /> : <Unlock size={14} />}
                      {isMaintenance ? 'Відкрити магазин' : 'Закрити на тех. роботи'}
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-8 md:mb-12 border-b border-white/10 snap-x">
                    {[
                      { id: 'orders', label: 'Замовлення', icon: <Package size={16} /> },
                      { id: 'analytics', label: 'Аналітика', icon: <BarChart size={16} /> },
                      { id: 'inventory', label: 'Склад', icon: <Database size={16} /> },
                      { id: 'products', label: 'Товари', icon: <Box size={16} /> },
                      { id: 'discounts', label: 'Знижки', icon: <Percent size={16} /> },
                      { id: 'referrals', label: 'Реферали', icon: <Users size={16} /> },
                      { id: 'settings', label: 'Налаштування', icon: <Settings size={16} /> }
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`snap-start shrink-0 flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${adminTab === tab.id ? 'text-[#d4af37] border-[#d4af37] bg-white/5' : 'text-zinc-500 border-transparent hover:text-white hover:bg-white/5'}`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-12">
                    
                    {/* --- ORDERS TAB --- */}
                    {adminTab === 'orders' && (
                      <section>
                        {/* КНОПКИ ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ПО СТАТУСАМ */}
                        <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-2 mb-8 border-b border-white/10">
                           {[
                             { id: 'all', label: 'Всі замовлення' },
                             { id: 'new', label: 'Нове' },
                             { id: 'processing', label: 'В обробці' },
                             { id: 'shipped', label: 'Відправлено' },
                             { id: 'completed', label: 'Отримано' },
                             { id: 'cancelled', label: 'Скасовано' }
                           ].map(tab => (
                             <button 
                               key={tab.id}
                               onClick={() => setOrderSubTab(tab.id)} 
                               className={`px-4 py-3 mb-2 text-[9px] md:text-[10px] uppercase font-black tracking-widest border transition-all whitespace-nowrap flex-1 sm:flex-none ${orderSubTab === tab.id ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 text-zinc-500 hover:border-white/50 hover:text-white bg-black/50'}`}
                             >
                               {tab.label}
                             </button>
                           ))}
                        </div>

                        {/* SEARCH INPUT FOR ORDERS */}
                        <div className="mb-6 relative">
                           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                           <input 
                             type="text" 
                             placeholder="Пошук за унікальним кодом замовлення..." 
                             value={orderSearch}
                             onChange={(e) => setOrderSearch(e.target.value)}
                             className="w-full bg-black/50 border border-white/10 pl-12 pr-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors text-white"
                           />
                        </div>

                        <div className="space-y-6">
                          {orders
                            .filter(o => o.status !== 'pending_payment')
                            // Фильтрация по выбранной вкладке
                            .filter(o => orderSubTab === 'all' ? true : o.status === orderSubTab)
                            // Фильтрация по поисковому запросу ID
                            .filter(o => !orderSearch.trim() || o.id?.toLowerCase().includes(orderSearch.toLowerCase()))
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map(order => (
                             <div key={order.id} className="border border-white/10 bg-zinc-900/40 shadow-xl overflow-hidden flex flex-col group transition-all hover:border-white/20 relative">
                                 
                                 {/* HEADER ЗАКАЗА */}
                                 <div className="bg-black/60 px-4 md:px-6 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                       <span className="font-black text-[#d4af37] tracking-widest text-xs md:text-sm">#{order.id.slice(0,8)}</span>
                                       <span className="text-zinc-500 text-[10px] md:text-xs">{new Date(order.createdAt).toLocaleString()}</span>
                                       {/* ВЫДЕЛЕННЫЙ БЕЙДЖ РЕФЕРАЛА */}
                                       {order.referralCode && (
                                          <span className="px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[9px] font-black uppercase tracking-widest rounded-sm flex items-center gap-1 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                                             <LinkIcon size={10} /> Реферал: {order.referralCode}
                                          </span>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-white text-sm md:text-base">{order.total} ₴</span>
                                    </div>
                                 </div>

                                 {/* BODY ЗАКАЗА (СЕТКА) */}
                                 <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                                    
                                    {/* КОЛОНКА КЛИЕНТА */}
                                    <div className="md:col-span-3 p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-3 flex flex-col justify-center">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Клієнт</p>
                                       <p className="text-xs md:text-sm font-bold text-white flex items-center gap-2"><User size={14} className="text-zinc-400 shrink-0"/> <span className="truncate">{order.customer.name}</span></p>
                                       <p className="text-xs text-zinc-400 flex items-center gap-2"><Smartphone size={14} className="text-zinc-400 shrink-0"/> <span>{order.customer.phone}</span></p>
                                    </div>

                                    {/* КОЛОНКА ДОСТАВКИ */}
                                    <div className="md:col-span-3 p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-3 flex flex-col justify-center">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Доставка</p>
                                       <p className="text-xs md:text-sm text-white flex items-center gap-2"><MapPin size={14} className="text-zinc-400 shrink-0"/> <span className="truncate" title={order.customer.city}>{order.customer.city}</span></p>
                                       <p className="text-xs text-zinc-400 flex items-center gap-2"><Package size={14} className="text-zinc-400 shrink-0"/> <span className="line-clamp-2" title={order.customer.branch}>{order.customer.branch}</span></p>
                                    </div>

                                    {/* КОЛОНКА ТОВАРОВ */}
                                    <div className="md:col-span-4 p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-center">
                                       <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Товари ({order.items.length})</p>
                                       <div className="max-h-32 overflow-y-auto no-scrollbar space-y-3 pr-2">
                                          {order.items.map((item, idx) => (
                                             <div key={idx} className="flex items-center gap-3 text-xs">
                                                <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/100'} className="w-8 h-10 object-cover bg-zinc-800 border border-white/10 shrink-0" alt="item" />
                                                <div className="flex-1 min-w-0">
                                                   <p className="text-white font-bold truncate">{item.name}</p>
                                                   <p className="text-zinc-500 text-[10px] mt-0.5">{item.selectedColor}, {item.selectedSize}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                   <p className="text-zinc-400">x{item.quantity}</p>
                                                   <p className="text-white font-bold text-[10px]">{item.price * item.quantity} ₴</p>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* КОЛОНКА ДЕЙСТВИЙ */}
                                    <div className="md:col-span-2 p-4 md:p-6 flex flex-col justify-center gap-3 bg-black/20">
                                       <div>
                                           <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Статус</p>
                                           <select 
                                             value={order.status}
                                             onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                             className={`w-full bg-black border border-white/20 text-[10px] font-black uppercase tracking-widest py-3 px-3 outline-none focus:border-white transition-colors cursor-pointer ${STATUS_MAP[order.status]?.color || 'text-white'}`}
                                           >
                                             {Object.entries(STATUS_MAP).map(([val, {label}]) => (
                                               <option key={val} value={val} className="bg-black text-white">{label}</option>
                                              ))}
                                           </select>
                                       </div>
                                       
                                       {/* КНОПКА ПОЛНОГО УДАЛЕНИЯ ЗАКАЗА (Для Отримано / Скасовано) */}
                                       {(order.status === 'completed' || order.status === 'cancelled') && (
                                         <button 
                                           onClick={() => handleDeleteOrder(order.id)}
                                           className="flex items-center justify-center gap-2 w-full py-2 mt-auto border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest"
                                           title="Остаточно видалити"
                                         >
                                           <Trash2 size={12} /> Видалити
                                         </button>
                                       )}
                                    </div>

                                 </div>
                             </div>
                          ))}
                          {orders.filter(o => o.status !== 'pending_payment' && (orderSubTab === 'all' ? true : o.status === orderSubTab)).length === 0 && (
                            <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center py-10 border border-white/5 bg-zinc-900/20">
                              Замовлень за цим статусом не знайдено
                            </p>
                          )}
                        </div>
                      </section>
                    )}

                    {/* --- ANALYTICS TAB --- */}
                    {adminTab === 'analytics' && (() => {
                       // 1. Фільтрація валідних замовлень за обраний період дат
                       const validOrders = orders.filter(o => {
                          if (o.status === 'pending_payment' || o.status === 'cancelled') return false;
                          const oDate = o.createdAt.slice(0, 10);
                          return oDate >= statsDateFrom && oDate <= statsDateTo;
                       });
                       
                       // 2. Розрахунок загального доходу за період
                       const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

                       // 3. Розрахунок реальної відвідуваності за період
                       const totalVisits = visitsData
                          .filter(v => v.date >= statsDateFrom && v.date <= statsDateTo)
                          .reduce((sum, v) => sum + (v.count || 0), 0);

                       // 4. Повна статистика по кожному товару
                       const itemStatsMap = {};
                       
                       // Спочатку заповнюємо мапу всіма існуючими товарами
                       dbProducts.forEach(p => {
                          itemStatsMap[p.id] = { 
                             id: p.id, 
                             name: p.name, 
                             category: p.category, 
                             image: p.images?.[0] || 'https://via.placeholder.com/100', 
                             count: 0, 
                             revenue: 0 
                          };
                       });

                       // Проходимо по всіх проданих товарах і додаємо їм кількість та суму
                       validOrders.forEach(o => {
                          o.items.forEach(item => {
                             if (!itemStatsMap[item.id]) {
                                // Якщо товар був видалений з бази, але є в історії замовлень
                                itemStatsMap[item.id] = { 
                                   id: item.id, 
                                   name: item.name, 
                                   category: 'Видалено', 
                                   image: item.image || 'https://via.placeholder.com/100', 
                                   count: 0, 
                                   revenue: 0 
                                };
                             }
                             itemStatsMap[item.id].count += item.quantity;
                             itemStatsMap[item.id].revenue += (item.price * item.quantity);
                          });
                       });

                       const allItemStats = Object.values(itemStatsMap);
                       
                       // Ті, що хоча б раз купили, сортовані за кількістю
                       const soldItems = allItemStats.filter(i => i.count > 0).sort((a, b) => b.count - a.count);
                       
                       // Топ 5 продажів
                       const topSelling = soldItems.slice(0, 5);
                       
                       // Найменше продано (враховуючи ті, що 0 разів)
                       const leastSelling = [...allItemStats].sort((a, b) => a.count - b.count).slice(0, 5);

                       return (
                          <section className="space-y-8 animate-in fade-in">
                             {/* Фільтр дат */}
                             <div className="bg-zinc-900/40 border border-white/10 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 justify-between items-start md:items-center">
                                <div>
                                   <h2 className="text-xl font-black uppercase tracking-widest mb-2">Статистика сайту</h2>
                                   <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Виберіть період для аналізу доходів та відвідуваності</p>
                                </div>
                                <div className="flex gap-2 items-center w-full md:w-auto">
                                   <input type="date" value={statsDateFrom} onChange={e => setStatsDateFrom(e.target.value)} className="bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer" />
                                   <span className="text-zinc-500 font-bold">-</span>
                                   <input type="date" value={statsDateTo} onChange={e => setStatsDateTo(e.target.value)} className="bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer" />
                                </div>
                             </div>

                             {/* Основні метрики */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="border border-white/10 bg-black/50 p-6 md:p-8 flex items-center gap-6">
                                   <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0 border border-[#d4af37]/30">
                                      <Database size={28} className="text-[#d4af37]" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Загальний дохід (за період)</p>
                                      <p className="text-3xl md:text-4xl font-black text-white">{totalRevenue.toLocaleString()} ₴</p>
                                      <p className="text-[9px] text-zinc-500 mt-2">Успішних замовлень: <span className="text-white">{validOrders.length} шт.</span></p>
                                   </div>
                                </div>
                                
                                <div className="border border-white/10 bg-black/50 p-6 md:p-8 flex items-center gap-6">
                                   <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                                      <Eye size={28} className="text-blue-500" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Відвідуваність сайту</p>
                                      <p className="text-3xl md:text-4xl font-black text-white">{totalVisits}</p>
                                      <p className="text-[9px] text-zinc-500 mt-2">Унікальних сесій за період</p>
                                   </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* ТОП ПРОДАЖ */}
                                <div className="border border-white/10 bg-zinc-900/20 p-6 md:p-8">
                                   <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                      <TrendingUp className="text-green-500" size={20}/> Топ продажів
                                   </h3>
                                   <div className="space-y-4">
                                      {topSelling.length === 0 ? (
                                         <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest text-center py-4">Продажів за період немає</p>
                                      ) : (
                                         topSelling.map((p, index) => (
                                            <div key={p.id} className="flex items-center gap-4 bg-black/50 p-3 border border-white/5 hover:border-white/20 transition-colors">
                                               <div className="w-6 font-black text-zinc-600 text-lg text-center">{index + 1}</div>
                                               <img src={p.image} className="w-10 h-12 object-cover bg-zinc-800" alt="" />
                                               <div className="flex-1 truncate">
                                                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                  <p className="text-[9px] text-zinc-500 uppercase mt-0.5">{p.category}</p>
                                               </div>
                                               <div className="text-right shrink-0">
                                                   <p className="text-xs font-black text-green-400">{p.count} шт.</p>
                                                   <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{p.revenue.toLocaleString()} ₴</p>
                                               </div>
                                            </div>
                                         ))
                                      )}
                                   </div>
                                </div>

                                {/* АУТСАЙДЕРЫ */}
                                <div className="border border-white/10 bg-zinc-900/20 p-6 md:p-8">
                                   <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                      <TrendingDown className="text-red-500" size={20}/> Найменше купують
                                   </h3>
                                   <div className="space-y-4">
                                      {leastSelling.length === 0 ? (
                                         <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest text-center py-4">Товарів ще немає</p>
                                      ) : (
                                         leastSelling.map((p, index) => (
                                            <div key={p.id} className="flex items-center gap-4 bg-black/50 p-3 border border-white/5 hover:border-white/20 transition-colors">
                                               <div className="w-6 font-black text-zinc-600 text-lg text-center">{index + 1}</div>
                                               <img src={p.image} className="w-10 h-12 object-cover bg-zinc-800" alt="" />
                                               <div className="flex-1 truncate">
                                                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                  <p className="text-[9px] text-zinc-500 uppercase mt-0.5">{p.category}</p>
                                               </div>
                                               <div className="text-right shrink-0">
                                                  <p className="text-xs font-black text-red-400">{p.count} шт.</p>
                                                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{p.revenue.toLocaleString()} ₴</p>
                                               </div>
                                            </div>
                                         ))
                                      )}
                                   </div>
                                </div>
                             </div>

                             {/* ПОВНА ТАБЛИЦЯ ТОВАРІВ ЗА ПЕРІОД */}
                             <div className="border border-white/10 bg-zinc-900/20 p-6 md:p-8 overflow-hidden">
                                 <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-3">
                                    <BarChart className="text-[#d4af37]" size={20}/> Повна статистика товарів за період
                                 </h3>
                                 <div className="overflow-x-auto no-scrollbar border border-white/5 w-full">
                                    <table className="w-full text-left text-xs min-w-[600px]">
                                       <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                          <tr>
                                             <th className="p-4">Товар</th>
                                             <th className="p-4">Категорія</th>
                                             <th className="p-4 text-center">Продано (шт)</th>
                                             <th className="p-4 text-right">Сума (₴)</th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          {allItemStats.length === 0 ? (
                                             <tr><td colSpan="4" className="p-4 text-center text-zinc-500 font-black uppercase tracking-widest text-[10px]">Товарів немає в базі</td></tr>
                                          ) : (
                                             allItemStats.sort((a,b) => b.revenue - a.revenue).map(p => (
                                                <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                                   <td className="p-4 flex items-center gap-3">
                                                      <img src={p.image} className="w-10 h-12 object-cover bg-zinc-800 border border-white/10" alt=""/>
                                                      <span className="font-bold truncate max-w-[250px]" title={p.name}>{p.name}</span>
                                                   </td>
                                                   <td className="p-4 text-zinc-400 uppercase tracking-widest text-[9px]">{p.category}</td>
                                                   <td className="p-4 text-center font-black text-white">{p.count}</td>
                                                   <td className={`p-4 text-right font-black ${p.revenue > 0 ? 'text-[#d4af37]' : 'text-zinc-600'}`}>{p.revenue.toLocaleString()} ₴</td>
                                                </tr>
                                             ))
                                          )}
                                       </tbody>
                                    </table>
                                 </div>
                             </div>

                          </section>
                       );
                    })()}

                    {/* --- INVENTORY TAB (СКЛАД) --- */}
                    {adminTab === 'inventory' && (() => {
                       const items = dbProducts.filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
                          const matchesCat = inventoryCategory === 'all' || p.category === inventoryCategory;
                          
                          const stock = p.stockCounts || { S: 0, M: 0, L: 0, XL: 0 };
                          const total = Object.values(stock).reduce((a,b) => a+b, 0);
                          
                          let matchesFilter = true;
                          if (inventoryFilter === 'low') {
                             matchesFilter = SIZES.some(s => p.sizes?.[s] !== false && (Number(stock[s]) || 0) <= 3 && (Number(stock[s]) || 0) > 0);
                          }
                          if (inventoryFilter === 'out') {
                             matchesFilter = total === 0 || SIZES.some(s => p.sizes?.[s] !== false && (Number(stock[s]) || 0) === 0);
                          }
                          
                          return matchesSearch && matchesCat && matchesFilter;
                       });

                       const totalStockQty = dbProducts.reduce((sum, p) => sum + Object.values(p.stockCounts || {}).reduce((a,b)=>a+b, 0), 0);
                       const totalStockValue = dbProducts.reduce((sum, p) => sum + (Object.values(p.stockCounts || {}).reduce((a,b)=>a+b, 0) * (p.price || 0)), 0);
                       const lowStockCount = dbProducts.filter(p => {
                          const stock = p.stockCounts || { S: 0, M: 0, L: 0, XL: 0 };
                          return SIZES.some(s => p.sizes?.[s] !== false && (Number(stock[s]) || 0) <= 3 && (Number(stock[s]) || 0) > 0);
                       }).length;

                       return (
                          <section className="space-y-8 animate-in fade-in">
                             {/* Stats Grid */}
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-zinc-900/40 border border-white/10 p-6">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Капіталізація складу</p>
                                   <p className="text-2xl font-black text-[#d4af37]">{totalStockValue.toLocaleString()} ₴</p>
                                   <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">Собівартість залишків</p>
                                </div>
                                <div className="bg-zinc-900/40 border border-white/10 p-6">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Всього одиниць</p>
                                   <p className="text-2xl font-black text-white">{totalStockQty} шт.</p>
                                   <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">Загальна кількість речей</p>
                                </div>
                                <div className={`bg-zinc-900/40 border p-6 transition-colors ${lowStockCount > 0 ? 'border-red-500/30' : 'border-white/10'}`}>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Критичний залишок</p>
                                   <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>{lowStockCount} тов.</p>
                                   <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">Закінчуються (&le;3)</p>
                                </div>
                             </div>

                             {/* Filters Bar */}
                             <div className="bg-black/40 border border-white/10 p-4 flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                   <input 
                                     type="text" 
                                     placeholder="Пошук у базі складу..." 
                                     value={inventorySearch}
                                     onChange={e => setInventorySearch(e.target.value)}
                                     className="w-full bg-black border border-white/10 pl-12 pr-4 py-3 text-xs focus:border-white outline-none"
                                   />
                                </div>
                                <select 
                                  value={inventoryCategory} 
                                  onChange={e => setInventoryCategory(e.target.value)}
                                  className="bg-black border border-white/10 px-4 py-3 text-xs outline-none focus:border-white"
                                >
                                   <option value="all">Усі категорії</option>
                                   {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="flex bg-black border border-white/10 p-1">
                                   <button onClick={() => setInventoryFilter('all')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${inventoryFilter === 'all' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>Всі</button>
                                   <button onClick={() => setInventoryFilter('low')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${inventoryFilter === 'low' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-red-500'}`}>Дефіцит</button>
                                   <button onClick={() => setInventoryFilter('out')} className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${inventoryFilter === 'out' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}>Немає</button>
                                </div>
                             </div>

                             {/* Inventory Table */}
                             <div className="overflow-x-auto no-scrollbar border border-white/10 shadow-2xl">
                                <table className="w-full text-left text-xs min-w-[800px] border-collapse">
                                   <thead className="bg-zinc-900/80 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                      <tr>
                                         <th className="p-4 sticky left-0 bg-zinc-900 z-10 border-r border-white/5">Товар / Категорія</th>
                                         {SIZES.map(s => <th key={s} className="p-4 text-center">Розмір {s}</th>)}
                                         <th className="p-4 text-center">Разом</th>
                                         <th className="p-4 text-right">Ціна</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {items.length === 0 ? (
                                         <tr><td colSpan="7" className="p-10 text-center text-zinc-600 uppercase font-black tracking-widest">База порожня за цими фільтрами</td></tr>
                                      ) : (
                                         items.map(p => {
                                            const stock = p.stockCounts || { S: 0, M: 0, L: 0, XL: 0 };
                                            const total = Object.values(stock).reduce((a,b)=>a+b,0);
                                            const isDeficit = SIZES.some(s => p.sizes?.[s] !== false && (Number(stock[s]) || 0) <= 3 && (Number(stock[s]) || 0) > 0);
                                            
                                            return (
                                               <tr key={p.id} className={`border-t border-white/5 transition-colors group ${isDeficit ? 'bg-[#d4af37]/5 hover:bg-[#d4af37]/10' : 'hover:bg-white/[0.02]'}`}>
                                                  <td className={`p-4 sticky left-0 z-10 border-r border-white/5 transition-colors ${isDeficit ? 'bg-[#0f0c05] group-hover:bg-[#1a1505]' : 'bg-[#0a0a0a] group-hover:bg-zinc-900'}`}>
                                                     <div className="flex items-center gap-3">
                                                        <MediaElement src={p.images?.[0]} className="w-10 h-12 object-cover bg-zinc-800 border border-white/10" alt=""/>
                                                        <div className="min-w-0">
                                                           <p className={`font-bold uppercase tracking-wider truncate max-w-[150px] ${isDeficit ? 'text-[#d4af37]' : 'text-white'}`}>{p.name}</p>
                                                           <p className="text-[9px] text-zinc-500 uppercase font-black mt-1">{p.category}</p>
                                                        </div>
                                                     </div>
                                                  </td>
                                                  {SIZES.map(s => {
                                                     const qty = Number(stock[s]) || 0;
                                                     const isAvailable = p.sizes?.[s] !== false;
                                                     const editValue = inventoryEdits[p.id]?.[s];
                                                     const displayValue = editValue !== undefined ? editValue : (qty === 0 ? '' : qty);
                                                     
                                                     return (
                                                        <td key={s} className="p-4">
                                                           <div className={`flex flex-col items-center gap-2 ${!isAvailable ? 'opacity-20 pointer-events-none' : ''}`}>
                                                              <input 
                                                                type="number"
                                                                min="0"
                                                                placeholder="0"
                                                                value={displayValue}
                                                                onChange={(e) => handleLocalStockChange(p.id, s, e.target.value)}
                                                                className={`w-16 h-10 bg-black border border-white/20 text-center font-black text-sm outline-none focus:border-white transition-colors placeholder:text-zinc-700 ${qty <= 3 && qty > 0 ? 'text-[#d4af37]' : qty === 0 ? 'text-zinc-600' : 'text-white'}`}
                                                              />
                                                           </div>
                                                        </td>
                                                     )
                                                  })}
                                                  <td className="p-4 text-center">
                                                     {inventoryEdits[p.id] && Object.keys(inventoryEdits[p.id]).length > 0 ? (
                                                        <button 
                                                          onClick={() => saveInventoryEdits(p.id)}
                                                          className="px-4 py-2 bg-[#d4af37] text-black font-black uppercase tracking-widest text-[9px] hover:bg-white transition-colors shadow-lg animate-in zoom-in"
                                                        >
                                                          Зберегти
                                                        </button>
                                                     ) : (
                                                        <span className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest ${total === 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                                           {total} шт.
                                                        </span>
                                                     )}
                                                  </td>
                                                  <td className="p-4 text-right font-black text-[#d4af37]">
                                                     {p.price} ₴
                                                  </td>
                                               </tr>
                                            )
                                         })
                                      )}
                                   </tbody>
                                </table>
                             </div>
                          </section>
                       );
                    })()}

                    {/* --- PRODUCTS TAB --- */}
                    {adminTab === 'products' && (
                      <section>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">Каталог</h2>
                          <button onClick={() => { 
                            setEditingProduct({}); 
                            setEditForm({ 
                              name: '', price: '', category: activeCategories[0] || 'Категорія', 
                              images: '', sizeGuide: DEFAULT_SIZE_GUIDE, isVisible: true, inStock: true, 
                              colors: JSON.parse(JSON.stringify(DEFAULT_COLORS)), 
                              sizes: { ...DEFAULT_SIZES_AVAILABILITY } 
                            }); 
                          }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 border border-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            <Plus size={14}/> Додати товар
                          </button>
                        </div>

                        {editingProduct && (
                          <div className="border border-white/10 p-4 md:p-8 bg-zinc-900/40 mb-8 md:mb-12 space-y-6">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="font-black uppercase tracking-widest text-[#d4af37] text-xs md:text-sm">{editingProduct.id ? 'Редагувати товар' : 'Новий товар'}</h3>
                              <button type="button" onClick={() => setEditingProduct(null)} className="p-2 hover:opacity-50 transition-opacity"><X size={20}/></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                              <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Назва</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-black border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none" />
                              </div>
                              <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ціна (₴)</label>
                                <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-black border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none" />
                              </div>
                              <div>
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Категорія</label>
                                <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full bg-black border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none">
                                  {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="flex flex-col justify-center gap-4 bg-black border border-white/10 p-4 w-full">
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input type="checkbox" checked={editForm.isVisible} onChange={e => setEditForm({...editForm, isVisible: e.target.checked})} className="accent-white w-4 h-4 cursor-pointer" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Показувати на вітрині</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                  <input type="checkbox" checked={editForm.inStock} onChange={e => setEditForm({...editForm, inStock: e.target.checked})} className="accent-white w-4 h-4 cursor-pointer" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">В наявності (Загалом)</span>
                                </label>
                              </div>

                              {/* Colors Settings - ВИЗУАЛЬНАЯ ПРИВЯЗКА ФОТО (МНОЖЕСТВЕННАЯ) */}
                              <div className="md:col-span-2 border border-white/10 p-4 bg-black/50 space-y-4">
                                 <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Кольори товару</h4>
                                 <p className="text-[8px] md:text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                                   Додайте колір, а потім <strong>клікніть на мініатюри фотографій</strong> нижче, щоб прив'язати їх до этого кольору. Ви можете обрати декілька фото для одного кольору!
                                 </p>
                                 
                                 {(editForm.colors || []).map((c, idx) => {
                                   const parsedImagesForColors = editForm.images ? editForm.images.split('\n').map(i=>i.trim()).filter(Boolean) : [];
                                   const selectedIndexes = Array.isArray(c.imageIndexes) ? c.imageIndexes : (c.imageIndex !== undefined ? [c.imageIndex] : []);
                                   
                                   return (
                                   <div key={idx} className="flex flex-col gap-3 border border-white/5 p-4 bg-black/30 shadow-lg">
                                     <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                       <input type="text" placeholder="Назва (Eng)" value={c.name} onChange={e => { const nc = JSON.parse(JSON.stringify(editForm.colors)); nc[idx].name=e.target.value; setEditForm({...editForm, colors:nc}) }} className="bg-black border border-white/10 p-3 text-xs w-full sm:flex-1 outline-none focus:border-white" />
                                       <input type="text" placeholder="Лейбл (Укр)" value={c.label} onChange={e => { const nc = JSON.parse(JSON.stringify(editForm.colors)); nc[idx].label=e.target.value; setEditForm({...editForm, colors:nc}) }} className="bg-black border border-white/10 p-3 text-xs w-full sm:flex-1 outline-none focus:border-white" />
                                       <input type="color" value={c.hex} onChange={e => { const nc = JSON.parse(JSON.stringify(editForm.colors)); nc[idx].hex=e.target.value; setEditForm({...editForm, colors:nc}) }} className="h-10 w-full sm:w-16 bg-black border border-white/10 cursor-pointer" />
                                       
                                       <button type="button" onClick={() => { const nc=editForm.colors.filter((_,i)=>i!==idx); setEditForm({...editForm, colors:nc}); }} className="text-red-500 p-3 border border-red-500/30 hover:bg-red-500 hover:text-white w-full sm:w-auto flex justify-center transition-colors"><Trash2 size={16}/></button>
                                     </div>

                                     <div className="flex flex-col gap-2 mt-2">
                                       <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                                         Оберіть фотографії для галереї цього кольору (обрано: {selectedIndexes.length}):
                                       </span>
                                       {parsedImagesForColors.length === 0 ? (
                                         <span className="text-[8px] text-red-400 mt-1">Спочатку додайте/завантажте медіа товару нижче 👇</span>
                                       ) : (
                                         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
                                           {parsedImagesForColors.map((imgUrl, imgIdx) => {
                                             const isSelected = selectedIndexes.includes(imgIdx);
                                             return (
                                             <button
                                               key={imgIdx}
                                               type="button"
                                               onClick={(e) => { e.preventDefault(); toggleColorImage(idx, imgIdx); }}
                                               className={`w-12 h-16 shrink-0 border-2 transition-all overflow-hidden relative ${isSelected ? 'border-[#d4af37] opacity-100 shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                             >
                                               <MediaElement src={imgUrl} autoPlay={false} className="w-full h-full object-cover" alt="Color thumbnail" />
                                               {isSelected && (
                                                  <div className="absolute top-0 right-0 bg-[#d4af37] text-black w-4 h-4 flex items-center justify-center">
                                                   <Check size={12} strokeWidth={4} />
                                                 </div>
                                               )}
                                             </button>
                                           )})}
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 )})}
                                 
                                 <button type="button" onClick={() => setEditForm({...editForm, colors: [...(editForm.colors || []), {name:'New', hex:'#888888', label:'Новий', imageIndexes:[]}]})} className="text-[9px] md:text-[10px] uppercase font-black tracking-widest px-6 py-4 border border-white/20 hover:bg-white hover:text-black mt-2 w-full sm:w-auto transition-colors">+ Додати колір</button>
                              </div>

                              {/* Sizes Settings */}
                              <div className="md:col-span-2 border border-white/10 p-4 bg-black/50">
                                 <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-4">Наявність розмірів</h4>
                                 <div className="flex flex-wrap gap-6">
                                   {SIZES.map(s => (
                                     <label key={s} className="flex items-center gap-2 cursor-pointer text-[10px] font-black uppercase tracking-widest">
                                       <input type="checkbox" checked={editForm.sizes?.[s] !== false} onChange={e => setEditForm({...editForm, sizes: {...editForm.sizes, [s]: e.target.checked}})} className="accent-white w-4 h-4 cursor-pointer" />
                                       {s}
                                     </label>
                                   ))}
                                 </div>
                              </div>
                              
                              {/* Image Upload Section */}
                              <div className="md:col-span-2 border border-white/10 p-4 bg-black/50">
                                <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 p-4 mb-6 rounded-sm">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-2">📸 Вимоги до медіафайлів</h4>
                                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 leading-relaxed">
                                    Для ідеального вигляду карток товару завантажуйте строго <strong>вертикальні фото або відео (пропорція 3:4)</strong>.<br/>
                                    Ідеальний розмір: <span className="text-white">800x1067 px</span> або <span className="text-white">1200x1600 px</span>. Для відео підтримуються стандартні формати (mp4, webm).
                                  </p>
                                </div>
                                
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Завантажити фото/відео з пристрою</label>
                                <input 
                                  type="file" 
                                  multiple 
                                  accept="image/*,video/*" 
                                  onChange={handleImageUpload} 
                                  disabled={isUploadingFile}
                                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer mb-2 transition-colors"
                                />
                                {isUploadingFile && <p className="text-[10px] font-bold text-yellow-500 animate-pulse mt-2">Завантаження файлів у хмару. Зачекайте...</p>}
                                
                                {/* NEW INTERACTIVE LINK SECTION */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                   <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Управління медіа товару</label>
                                   
                                   {(() => {
                                      const currentImages = editForm.images ? editForm.images.split('\n').map(i=>i.trim()).filter(Boolean) : [];
                                      if (currentImages.length > 0) {
                                        return (
                                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-6">
                                            {currentImages.map((imgUrl, idx) => (
                                              <div key={idx} className="relative group aspect-[3/4] bg-zinc-900 border border-white/10 overflow-hidden">
                                                <MediaElement src={imgUrl} alt={`Preview ${idx}`} autoPlay={false} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                       const newArr = currentImages.filter((_, i) => i !== idx);
                                                       setEditForm({...editForm, images: newArr.join('\n')});
                                                    }}
                                                    className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg border border-red-500/50"
                                                    title="Видалити фото"
                                                  >
                                                    <Trash2 size={16} />
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      }
                                      return null;
                                   })()}

                                   <div className="flex gap-2">
                                      <input
                                        type="url"
                                        placeholder="Вставте посилання на фото (URL)..."
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        onKeyDown={e => {
                                           if(e.key === 'Enter') {
                                              e.preventDefault();
                                              if(newImageUrl.trim()){
                                                 const current = editForm.images ? editForm.images.split('\n').filter(i=>i.trim()) : [];
                                                 setEditForm({...editForm, images: [...current, newImageUrl.trim()].join('\n')});
                                                 setNewImageUrl('');
                                              }
                                           }
                                        }}
                                        className="flex-1 bg-black/50 border border-white/10 px-4 py-3 text-xs md:text-sm focus:border-white outline-none transition-colors"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                           if(newImageUrl.trim()){
                                              const current = editForm.images ? editForm.images.split('\n').filter(i=>i.trim()) : [];
                                              setEditForm({...editForm, images: [...current, newImageUrl.trim()].join('\n')});
                                              setNewImageUrl('');
                                           }
                                        }}
                                        disabled={!newImageUrl.trim()}
                                        className="px-6 bg-white text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-zinc-200 transition-colors"
                                      >
                                        Додати
                                      </button>
                                   </div>
                                </div>
                              </div>

                              <div className="md:col-span-2">
                                <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-2">Індивідуальна розмірна сітка (CSV)</label>
                                <textarea value={editForm.sizeGuide} onChange={e => setEditForm({...editForm, sizeGuide: e.target.value})} className="w-full bg-black border border-white/10 px-4 py-3 md:py-4 text-xs focus:border-white outline-none min-h-[120px] whitespace-pre" placeholder="Розмір,Груди,Довжина..."></textarea>
                              </div>
                            </div>
                            <button type="button" onClick={handleSaveProduct} className="w-full py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-all flex justify-center items-center">
                              Крок 2. ЗБЕРЕГТИ ТОВАР
                            </button>
                          </div>
                        )}

                        {!editingProduct && (
                          <div className="space-y-12">
                            {activeCategories.map(cat => {
                              const catProducts = dbProducts.filter(p => p.category === cat);
                              return (
                                <div key={cat} className="space-y-4">
                                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                    <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                                       <LayoutGrid size={16}/> {cat} <span className="text-zinc-600 text-[10px]">({catProducts.length})</span>
                                    </h3>
                                    <button 
                                      onClick={() => { 
                                        setEditingProduct({}); 
                                        setEditForm({ 
                                          name: '', price: '', category: cat, 
                                          images: '', sizeGuide: DEFAULT_SIZE_GUIDE, isVisible: true, inStock: true, 
                                          colors: JSON.parse(JSON.stringify(DEFAULT_COLORS)), 
                                          sizes: { ...DEFAULT_SIZES_AVAILABILITY } 
                                        }); 
                                      }} 
                                      className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                                    >
                                      <Plus size={12}/> Додати сюди
                                    </button>
                                  </div>

                                  {catProducts.length === 0 ? (
                                    <div className="text-zinc-600 text-[9px] uppercase tracking-widest font-bold py-4">У цій категорії поки немає товарів</div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                      {catProducts.map(p => (
                                        <div key={p.id} className={`border border-white/5 bg-zinc-900/20 p-4 relative group ${p.isVisible === false ? 'opacity-50' : ''}`}>
                                          <div className="aspect-[3/4] overflow-hidden mb-4"><img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover opacity-70" alt={p.name} /></div>
                                          <h4 className="font-bold uppercase tracking-widest text-[10px] md:text-[11px] mb-1 truncate">{p.name}</h4>
                                          <p className="text-zinc-500 text-[10px] mb-2">{p.price} ₴ | {p.category}</p>
                                          <p className="text-zinc-500 text-[9px] mb-4 uppercase tracking-widest">{p.inStock === false ? 'Немає в наявності' : 'В наявності'}</p>
                                          <div className="flex gap-2 w-full">
                                            <button onClick={() => { 
                                              const mappedColors = (p.colors || DEFAULT_COLORS).map(c => ({
                                                ...c,
                                                imageIndexes: Array.isArray(c.imageIndexes) ? [...c.imageIndexes] : (c.imageIndex !== undefined ? [c.imageIndex] : [])
                                              }));
                                              setEditingProduct(p); 
                                              setEditForm({ name: p.name, price: p.price, category: p.category, images: p.images ? p.images.join('\n') : '', sizeGuide: p.sizeGuide || DEFAULT_SIZE_GUIDE, isVisible: p.isVisible !== false, inStock: p.inStock !== false, colors: JSON.parse(JSON.stringify(mappedColors)), sizes: p.sizes || { ...DEFAULT_SIZES_AVAILABILITY } }); 
                                            }} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:border-white transition-colors flex justify-center w-full"><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest text-red-500 hover:border-red-500 transition-colors flex justify-center w-full"><Trash2 size={14}/></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Товари без категорії або з видаленою категорією */}
                            {(() => {
                              const uncategorized = dbProducts.filter(p => !activeCategories.includes(p.category));
                              if (uncategorized.length === 0) return null;
                              return (
                                <div className="space-y-4 pt-8 border-t border-red-500/20">
                                  <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                                     <Box size={16}/> Інші товари (Без категорії) <span className="text-zinc-600 text-[10px]">({uncategorized.length})</span>
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                      {uncategorized.map(p => (
                                        <div key={p.id} className={`border border-white/5 bg-zinc-900/20 p-4 relative group ${p.isVisible === false ? 'opacity-50' : ''}`}>
                                          <div className="aspect-[3/4] overflow-hidden mb-4"><img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover opacity-70" alt={p.name} /></div>
                                          <h4 className="font-bold uppercase tracking-widest text-[10px] md:text-[11px] mb-1 truncate">{p.name}</h4>
                                          <p className="text-zinc-500 text-[10px] mb-2">{p.price} ₴ | {p.category}</p>
                                          <p className="text-zinc-500 text-[9px] mb-4 uppercase tracking-widest">{p.inStock === false ? 'Немає в наявності' : 'В наявності'}</p>
                                          <div className="flex gap-2 w-full">
                                            <button onClick={() => { 
                                              const mappedColors = (p.colors || DEFAULT_COLORS).map(c => ({
                                                ...c,
                                                imageIndexes: Array.isArray(c.imageIndexes) ? [...c.imageIndexes] : (c.imageIndex !== undefined ? [c.imageIndex] : [])
                                              }));
                                              setEditingProduct(p); 
                                              setEditForm({ name: p.name, price: p.price, category: p.category, images: p.images ? p.images.join('\n') : '', sizeGuide: p.sizeGuide || DEFAULT_SIZE_GUIDE, isVisible: p.isVisible !== false, inStock: p.inStock !== false, colors: JSON.parse(JSON.stringify(mappedColors)), sizes: p.sizes || { ...DEFAULT_SIZES_AVAILABILITY } }); 
                                            }} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:border-white transition-colors flex justify-center w-full"><Edit size={14}/></button>
                                            <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest text-red-500 hover:border-red-500 transition-colors flex justify-center w-full"><Trash2 size={14}/></button>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              );
                            })()}
                            
                            {dbProducts.length === 0 && (
                               <div className="text-center py-20 text-zinc-500 uppercase font-black tracking-widest text-xs border border-dashed border-white/20">Товарів ще немає. Додайте перший товар!</div>
                            )}

                          </div>
                        )}
                      </section>
                    )}

                    {/* --- DISCOUNTS TAB --- */}
                    {adminTab === 'discounts' && (
                      <section className="space-y-6 animate-in fade-in">
                        <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-2 mb-2 border-b border-white/10">
                           <button onClick={() => setDiscountSubTab('products')} className={`px-4 py-3 text-[9px] md:text-[10px] uppercase font-black tracking-widest border transition-all whitespace-nowrap flex-1 sm:flex-none ${discountSubTab === 'products' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 text-zinc-500 hover:border-white/50 hover:text-white bg-black/50'}`}>Знижки на товари</button>
                           <button onClick={() => setDiscountSubTab('promocodes')} className={`px-4 py-3 text-[9px] md:text-[10px] uppercase font-black tracking-widest border transition-all whitespace-nowrap flex-1 sm:flex-none ${discountSubTab === 'promocodes' ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 text-zinc-500 hover:border-white/50 hover:text-white bg-black/50'}`}>Знижки рефералів</button>
                        </div>

                        {discountSubTab === 'products' && (
                          <>
                            <div className="bg-zinc-900/40 border border-white/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                               <div>
                                  <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#d4af37] mb-2">Управління знижками</h2>
                                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Налаштовуйте акції для товарів швидко та зручно</p>
                               </div>
                               <div className="relative w-full md:w-auto">
                                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                 <input 
                                   type="text" 
                                   placeholder="Пошук товару..." 
                                   value={discountSearch}
                                   onChange={(e) => setDiscountSearch(e.target.value)}
                                   className="w-full md:w-64 bg-black/50 border border-white/10 pl-12 pr-4 py-3 md:py-4 text-xs focus:border-white outline-none text-white transition-colors"
                                 />
                               </div>
                            </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {dbProducts.filter(p => p.name.toLowerCase().includes(discountSearch.toLowerCase())).map(p => {
                              const currentEdit = discountEdits[p.id] || { percent: p.discountPercent || '', endsAt: p.discountEndsAt || '' };
                              const priceInfo = getProductPrice(p);
                              
                              return (
                                <div key={p.id} className={`border p-4 flex flex-col gap-5 transition-colors ${priceInfo.isDiscounted ? 'border-[#d4af37]/50 bg-[#d4af37]/5' : 'border-white/10 bg-black/50 hover:border-white/30'}`}>
                                   <div className="flex gap-4 items-center">
                                      <img src={p.images?.[0] || 'https://via.placeholder.com/100'} className="w-16 h-20 object-cover bg-zinc-900 border border-white/5 shrink-0" alt="" />
                                      <div className="flex-1 min-w-0">
                                         <p className="text-xs font-bold uppercase truncate text-white mb-1" title={p.name}>{p.name}</p>
                                         <p className="text-[10px] text-zinc-500 font-bold">{p.price} ₴</p>
                                         {priceInfo.isDiscounted && (
                                            <p className="text-[10px] text-[#d4af37] font-black mt-2">
                                              Активна: -{priceInfo.percent}% <br/><span className="text-white mt-1 inline-block">Нова ціна: {priceInfo.final} ₴</span>
                                            </p>
                                         )}
                                      </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
                                      <div>
                                         <label className="block text-[8px] font-black uppercase text-zinc-500 mb-2">Знижка (%)</label>
                                         <input
                                            type="number"
                                            min="0" max="100"
                                            value={currentEdit.percent}
                                            onChange={e => setDiscountEdits({...discountEdits, [p.id]: {...currentEdit, percent: e.target.value}})}
                                            placeholder="Вимкнено"
                                            className="w-full bg-black border border-white/10 px-3 py-3 text-xs outline-none focus:border-white transition-colors"
                                         />
                                      </div>
                                      <div>
                                         <label className="block text-[8px] font-black uppercase text-zinc-500 mb-2">Діє до (Необов'язково)</label>
                                         <input
                                            type="date"
                                            value={currentEdit.endsAt}
                                            onChange={e => setDiscountEdits({...discountEdits, [p.id]: {...currentEdit, endsAt: e.target.value}})}
                                            className="w-full bg-black border border-white/10 px-3 py-3 text-xs outline-none focus:border-white transition-colors text-white [color-scheme:dark]"
                                         />
                                      </div>
                                   </div>
                                   
                                   <button
                                      onClick={() => handleSaveDiscount(p.id, currentEdit.percent, currentEdit.endsAt)}
                                      className="w-full py-3 bg-white/10 hover:bg-white hover:text-black text-[9px] font-black uppercase tracking-widest transition-colors mt-2"
                                   >
                                      Зберегти акцію
                                   </button>
                                </div>
                              )
                           })}
                        </div>
                        {dbProducts.filter(p => p.name.toLowerCase().includes(discountSearch.toLowerCase())).length === 0 && (
                          <div className="text-center py-20 text-zinc-500 uppercase font-black tracking-widest text-xs border border-dashed border-white/20">
                            Товарів не знайдено
                          </div>
                        )}
                          </>
                        )}

                        {discountSubTab === 'promocodes' && (
                          <div className="border border-white/10 p-4 md:p-6 bg-zinc-900/20 overflow-hidden">
                             <h3 className="font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                               <Percent size={18} className="text-[#d4af37]" /> Управління знижками рефералів
                             </h3>
                             <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-6">Тут ви можете додати знижку для існуючих партнерів або видалити їх повністю.</p>
                             
                             <div className="overflow-x-auto no-scrollbar border border-white/5 w-full">
                                <table className="w-full text-left text-xs min-w-[600px]">
                                   <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                      <tr>
                                         <th className="p-4">Код / Ім'я</th>
                                         <th className="p-4 text-center">Знижка (%)</th>
                                         <th className="p-4 text-center">Ліміт (шт)</th>
                                         <th className="p-4 text-center">Діє до (Час)</th>
                                         <th className="p-4 text-center">Використано</th>
                                         <th className="p-4 text-right">Дія</th>
                                      </tr>
                                   </thead>
                                   <tbody>
                                      {referrals.length === 0 ? (
                                         <tr><td colSpan="6" className="p-4 text-center text-zinc-500 uppercase font-bold tracking-widest text-[9px]">Немає жодного реферала</td></tr>
                                      ) : (
                                         referrals.sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(r => {
                                            const isLimitReached = r.usageLimit && (r.usageCount || 0) >= r.usageLimit;
                                            const isExpired = r.expiresAt && new Date(r.expiresAt).getTime() < new Date().getTime();
                                            const currentEdit = refDiscountEdits[r.id] || { percent: r.discountPercent || '', limit: r.usageLimit || '', expiresAt: r.expiresAt || '' };
                                            return (
                                            <tr key={r.id} className={`border-t border-white/5 transition-colors ${(isLimitReached || isExpired) ? 'opacity-50' : 'hover:bg-white/5'}`}>
                                               <td className="p-4">
                                                 <p className="font-black tracking-widest text-[#d4af37] text-sm">{r.code}</p>
                                                 <p className="text-[8px] text-zinc-500 uppercase mt-1">{r.name}</p>
                                               </td>
                                               <td className="p-4 text-center">
                                                 <input 
                                                   type="number" 
                                                   placeholder="0" 
                                                   value={currentEdit.percent}
                                                   onChange={e => setRefDiscountEdits({...refDiscountEdits, [r.id]: {...currentEdit, percent: e.target.value}})}
                                                   className="w-16 bg-black border border-white/20 px-2 py-1.5 text-center text-xs outline-none focus:border-white text-white"
                                                 />
                                               </td>
                                               <td className="p-4 text-center">
                                                 <input 
                                                   type="number" 
                                                   placeholder="∞" 
                                                   value={currentEdit.limit}
                                                   onChange={e => setRefDiscountEdits({...refDiscountEdits, [r.id]: {...currentEdit, limit: e.target.value}})}
                                                   className="w-16 bg-black border border-white/20 px-2 py-1.5 text-center text-xs outline-none focus:border-white text-white"
                                                 />
                                               </td>
                                               <td className="p-4 text-center">
                                                 <input 
                                                   type="datetime-local" 
                                                   value={currentEdit.expiresAt}
                                                   onChange={e => setRefDiscountEdits({...refDiscountEdits, [r.id]: {...currentEdit, expiresAt: e.target.value}})}
                                                   className="bg-black border border-white/20 px-2 py-1.5 text-center text-[10px] outline-none focus:border-white text-white [color-scheme:dark] w-36"
                                                 />
                                               </td>
                                               <td className="p-4 text-center font-bold text-white">
                                                  {r.usageCount || 0}
                                                  {isLimitReached && <span className="block text-[8px] text-red-500 uppercase mt-1">Ліміт вичерпано</span>}
                                                  {isExpired && <span className="block text-[8px] text-red-500 uppercase mt-1">Час вийшов</span>}
                                               </td>
                                               <td className="p-4 text-right">
                                                 <div className="flex justify-end gap-2 flex-wrap min-w-[90px]">
                                                   <button onClick={async () => {
                                                      try {
                                                         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'referrals', r.id), {
                                                            discountPercent: currentEdit.percent ? Number(currentEdit.percent) : 0,
                                                            usageLimit: currentEdit.limit ? Number(currentEdit.limit) : null,
                                                            expiresAt: currentEdit.expiresAt || null
                                                         });
                                                         showToast('✅ Збережено!');
                                                      } catch(e) { showToast('❌ Помилка'); }
                                                   }} className="px-3 py-1.5 border border-white/20 hover:bg-white hover:text-black font-black uppercase text-[8px] tracking-widest transition-colors w-full">
                                                      Зберегти
                                                   </button>

                                                   {/* Кнопка удаления ТОЛЬКО скидки */}
                                                   {r.discountPercent > 0 && (
                                                     <button onClick={async () => {
                                                        if(window.confirm('Видалити знижку для цього партнера?')) {
                                                           try {
                                                              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'referrals', r.id), {
                                                                 discountPercent: 0,
                                                                 usageLimit: null,
                                                                 expiresAt: null
                                                              });
                                                              setRefDiscountEdits({...refDiscountEdits, [r.id]: { percent: '', limit: '', expiresAt: '' }});
                                                              showToast('✅ Знижку видалено');
                                                           } catch(e) { showToast('❌ Помилка'); }
                                                        }
                                                     }} className="px-3 py-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase text-[8px] tracking-widest transition-colors w-full mt-1">
                                                        Видалити знижку
                                                     </button>
                                                   )}
                                                 </div>
                                               </td>
                                            </tr>
                                         )})
                                      )}
                                   </tbody>
                                </table>
                             </div>
                          </div>
                        )}
                      </section>
                    )}

                    {/* --- REFERRALS TAB --- */}
                    {adminTab === 'referrals' && (
                      <section className="space-y-8 md:space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                          
                          {/* Create New Referral */}
                          <div className="lg:col-span-1 border border-white/10 p-4 md:p-6 bg-zinc-900/20 h-fit w-full">
                            <h3 className="font-black uppercase tracking-widest text-sm mb-4">Створити реферала</h3>
                            <form onSubmit={handleAddReferral} className="space-y-4">
                              <div>
                                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ім'я партнера</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={newReferralName} 
                                  onChange={e => setNewReferralName(e.target.value)}
                                  placeholder="Наприклад: Ivan"
                                  className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none mb-2"
                                />
                                <p className="text-[8px] text-zinc-500 leading-relaxed uppercase tracking-widest font-bold">Система автоматично згенерує унікальне посилання.</p>
                              </div>

                              <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all flex justify-center items-center gap-2 mt-2">
                                <LinkIcon size={14} /> Згенерувати посилання
                              </button>
                            </form>

                            {/* CALCULATE SUM BY PERIOD */}
                            <div className="mt-8 pt-8 border-t border-white/10">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-4">Розрахунок прибутку та виплат</h4>
                               <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mb-4 leading-relaxed">
                                 Враховуються успішні замовлення для обраного партнера за обраний період у фільтрах праворуч.<br/>
                                 Відсоток розраховується від вартості <span className="text-white">кожного окремого товару</span> в замовленні.
                               </p>

                               <div className="mb-4">
                                  <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Відсоток партнера (%)</label>
                                  <input 
                                     type="number" 
                                     min="0"
                                     max="100"
                                     value={refPercent}
                                     onChange={e => setRefPercent(e.target.value)}
                                     className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none transition-colors"
                                  />
                               </div>

                               <button 
                                 onClick={() => {
                                    if (!refFilterPartner) return showToast('Оберіть партнера у фільтрі праворуч');
                                    
                                    const allTargetOrders = orders.filter(o => {
                                       if (o.status === 'pending_payment' || o.status === 'cancelled') return false;
                                       if (o.referralCode !== refFilterPartner) return false;
                                       const oDate = o.createdAt.slice(0, 10);
                                       if (refFilterDateFrom && oDate < refFilterDateFrom) return false;
                                       if (refFilterDateTo && oDate > refFilterDateTo) return false;
                                       return true;
                                    });

                                    const completedOrders = allTargetOrders.filter(o => o.status === 'completed');
                                    const otherOrders = allTargetOrders.filter(o => o.status !== 'completed');

                                    let totalSum = 0;
                                    let shareSum = 0;
                                    const percentValue = parseFloat(refPercent) || 0;

                                    completedOrders.forEach(o => {
                                      o.items.forEach(item => {
                                        const itemTotal = item.price * item.quantity;
                                        const itemShare = itemTotal * (percentValue / 100);
                                        totalSum += itemTotal;
                                        shareSum += itemShare;
                                      });
                                    });

                                    const netSum = totalSum - shareSum;

                                    setRefCalcResult({
                                       total: Math.round(totalSum),
                                       share: Math.round(shareSum),
                                       net: Math.round(netSum),
                                       count: completedOrders.length,
                                       otherOrders: otherOrders
                                    });
                                 }}
                                 className="w-full py-4 bg-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all mb-4"
                               >
                                 Порахувати прибуток
                               </button>

                               {refCalcResult && (
                                 <div className="bg-black/50 border border-[#d4af37]/30 p-4 space-y-3">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Загальна каса ({refCalcResult.count} отриманих)</span>
                                       <span className="text-sm font-black text-white">{refCalcResult.total} ₴</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                       <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Виплата партнеру ({refPercent}%)</span>
                                       <span className="text-sm font-black text-red-400">-{refCalcResult.share} ₴</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                       <span className="text-[9px] font-black uppercase tracking-widest text-[#d4af37]">Ваш чистий прибуток</span>
                                       <span className="text-base font-black text-green-400">{refCalcResult.net} ₴</span>
                                    </div>

                                    {/* Інші замовлення в процесі (якщо обрано категорію "Всі товари") */}
                                    {(() => {
                                      const activeRef = referrals.find(r => r.code === refFilterPartner);
                                      if (activeRef?.targetCategory === 'all' && refCalcResult.otherOrders?.length > 0) {
                                        return (
                                          <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-yellow-500 mb-3">Замовлення в процесі ({refCalcResult.otherOrders.length}):</p>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                                              {refCalcResult.otherOrders.map(o => (
                                                <div key={o.id} className="flex justify-between items-center text-[10px] bg-white/5 p-2 border border-white/5 uppercase tracking-widest">
                                                   <div>
                                                      <span className="text-zinc-300 font-bold">#{o.id.slice(0,8)}</span>
                                                      <span className="text-zinc-500 ml-2 block sm:inline mt-1 sm:mt-0">{new Date(o.createdAt).toLocaleDateString('uk-UA')}</span>
                                                   </div>
                                                   <div className="text-right">
                                                      <span className="text-yellow-500 font-black block">{o.total} ₴</span>
                                                      <span className="text-[8px] text-zinc-500">{STATUS_MAP[o.status]?.label || o.status}</span>
                                                   </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                 </div>
                               )}
                            </div>
                          </div>

                          {/* Referrals List & Stats */}
                          <div className="lg:col-span-2 border border-white/10 p-4 md:p-6 bg-zinc-900/20 w-full overflow-hidden">
                            <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                              <BarChart size={18} className="text-[#d4af37]" /> Аналітика продажів та Фільтри
                            </h3>
                            
                            {referrals.length === 0 ? (
                              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest text-center py-10">Ще немає жодного реферала</p>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                  
                                  {/* Выбор партнера + Кнопка удаления */}
                                  <div className="w-full sm:col-span-1">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Партнер</label>
                                    <div className="flex items-center gap-2">
                                      <select 
                                        value={refFilterPartner} 
                                        onChange={e => setRefFilterPartner(e.target.value)}
                                        className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none h-[42px]"
                                      >
                                        {referrals.map(r => (
                                          <option key={r.id} value={r.code}>{r.name}</option>
                                        ))}
                                      </select>
                                      {refFilterPartner && (
                                        <button 
                                          onClick={() => {
                                            const r = referrals.find(x => x.code === refFilterPartner);
                                            if(r) handleDeleteReferral(r.id);
                                          }} 
                                          title="Видалити цього партнера"
                                          className="h-[42px] px-3 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center shrink-0"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="w-full">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Статус</label>
                                    <select 
                                      value={refFilterStatus} 
                                      onChange={e => setRefFilterStatus(e.target.value)}
                                      className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none h-[42px]"
                                    >
                                      <option value="all">Всі статуси</option>
                                      {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                  </div>
                                  
                                  <div className="w-full sm:col-span-2">
                                    <div className="flex justify-between items-end mb-2">
                                      <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Період (Від - До)</label>
                                      <div className="flex gap-2">
                                        <button onClick={() => { const d = new Date(); setRefFilterDateFrom(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)); setRefFilterDateTo(d.toISOString().slice(0, 10)); }} className="text-[8px] text-[#d4af37] hover:text-white uppercase font-black tracking-widest transition-colors">Цей місяць</button>
                                        <span className="text-zinc-600 text-[8px]">|</span>
                                        <button onClick={() => { setRefFilterDateFrom(''); setRefFilterDateTo(''); }} className="text-[8px] text-zinc-400 hover:text-white uppercase font-black tracking-widest transition-colors">Весь час</button>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                      <input 
                                        type="date" 
                                        value={refFilterDateFrom}
                                        onChange={e => setRefFilterDateFrom(e.target.value)}
                                        className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer h-[42px]"
                                      />
                                      <span className="text-zinc-500 font-bold">-</span>
                                      <input 
                                        type="date" 
                                        value={refFilterDateTo}
                                        onChange={e => setRefFilterDateTo(e.target.value)}
                                        className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer h-[42px]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {(() => {
                                  const selectedRef = referrals.find(r => r.code === refFilterPartner);
                                  const refLink = selectedRef ? `${window.location.origin}?ref=${selectedRef.code}` : '';
                                  
                                  let filteredOrders = orders.filter(o => {
                                    if (o.status === 'pending_payment') return false; 
                                    if (o.referralCode !== refFilterPartner) return false;
                                    if (refFilterStatus !== 'all' && o.status !== refFilterStatus) return false;
                                    const oDate = o.createdAt.slice(0, 10);
                                    if (refFilterDateFrom && oDate < refFilterDateFrom) return false;
                                    if (refFilterDateTo && oDate > refFilterDateTo) return false;
                                    return true;
                                  });

                                  filteredOrders.sort((a, b) => {
                                    let aVal, bVal;
                                    if (refSortConfig.key === 'date') { aVal = a.createdAt; bVal = b.createdAt; }
                                    else if (refSortConfig.key === 'total') { aVal = a.total; bVal = b.total; }
                                    else if (refSortConfig.key === 'status') { aVal = STATUS_MAP[a.status]?.label || a.status; bVal = STATUS_MAP[b.status]?.label || b.status; }
                                    
                                    if (aVal < bVal) return refSortConfig.direction === 'asc' ? -1 : 1;
                                    if (aVal > bVal) return refSortConfig.direction === 'asc' ? 1 : -1;
                                    return 0;
                                  });
                                  
                                  return (
                                    <div className="space-y-6">
                                      {selectedRef && (
                                        <div className="bg-black/50 border border-white/10 p-4 flex flex-col gap-4 w-full">
                                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                                            <div className="overflow-hidden w-full">
                                              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Унікальне посилання партнера</p>
                                              <input readOnly value={refLink} className="w-full bg-transparent text-[10px] md:text-xs text-[#d4af37] font-mono outline-none truncate" />
                                            </div>
                                            <button onClick={() => copyToClipboard(refLink)} className="px-4 py-3 sm:py-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest flex justify-center items-center gap-2 shrink-0 w-full sm:w-auto">
                                              <Copy size={12}/> Копіювати
                                            </button>
                                          </div>
                                          
                                          {selectedRef.discountPercent > 0 && (
                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                               <div className="px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[9px] font-black uppercase tracking-widest rounded-sm">
                                                 Знижка за лінком: -{selectedRef.discountPercent}%
                                               </div>
                                               <div className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                                 Використано: <span className="text-white">{selectedRef.usageCount || 0}</span> / {selectedRef.usageLimit ? selectedRef.usageLimit : 'Безліміт'}
                                                 {selectedRef.usageLimit && (selectedRef.usageCount || 0) >= selectedRef.usageLimit && (
                                                   <span className="text-red-500 ml-2">(Ліміт вичерпано)</span>
                                                 )}
                                               </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="mt-8 w-full overflow-hidden">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Список замовлень (відфільтровано: {filteredOrders.length})</h4>
                                        <div className="overflow-x-auto no-scrollbar border border-white/5 w-full">
                                          <table className="w-full text-left text-xs min-w-[600px]">
                                            <thead className="bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                              <tr>
                                                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleRefSort('date')}>
                                                  Дата {refSortConfig.key === 'date' && (refSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="p-4">Клієнт</th>
                                                <th className="p-4">Товари</th>
                                                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleRefSort('status')}>
                                                  Статус {refSortConfig.key === 'status' && (refSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleRefSort('total')}>
                                                  Сума {refSortConfig.key === 'total' && (refSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {filteredOrders.length === 0 ? (
                                                <tr><td colSpan="5" className="p-4 text-center text-zinc-500">Замовлень не знайдено за цими фільтрами</td></tr>
                                              ) : (
                                                filteredOrders.map(o => (
                                                  <tr key={o.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-4">{o.customer.name}</td>
                                                    <td className="p-4 text-zinc-400 max-w-[200px] truncate" title={o.items.map(i => `${i.name} (${i.selectedSize}) x${i.quantity}`).join(', ')}>
                                                      {o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                                                    </td>
                                                    <td className={`p-4 ${STATUS_MAP[o.status]?.color || ''}`}>{STATUS_MAP[o.status]?.label}</td>
                                                    <td className="p-4 text-right font-black">{o.total} ₴</td>
                                                  </tr>
                                                ))
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* --- SETTINGS TAB --- */}
                    {adminTab === 'settings' && (
                      <section className="space-y-8 max-w-2xl w-full">
                        
                        <div className="border border-white/10 p-4 md:p-8 bg-zinc-900/20 w-full">
                          <h2 className="text-lg md:text-xl font-black uppercase tracking-widest mb-6">Головні зображення сайту</h2>
                          
                          <div className="flex flex-col gap-4 w-full">
                            
                            {/* ЗАГРУЗКА ДЛЯ ПК */}
                            <div className="border border-white/10 p-4 bg-black/50">
                              <label className="block text-[10px] font-black uppercase mb-2 text-[#d4af37]">Головне медіа (Hero) для комп'ютера</label>
                              <p className="text-[8px] text-zinc-500 mb-2">Вставте посилання на відео (.mp4) або завантажте файл (до 50МБ)</p>
                              
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                value={settingsFormUrl} 
                                onChange={e => setSettingsFormUrl(e.target.value)}
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none text-white mb-2 transition-colors"
                              />

                              <div className="flex gap-2 mb-2">
                                <input 
                                  type="file" 
                                  accept="image/*,video/mp4,video/webm" 
                                  onChange={(e) => handleImageSettingUpload(e, 'desktop')}
                                  disabled={isUploadingFile}
                                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer transition-colors"
                                />
                                {settingsFormUrl && (
                                  <button type="button" onClick={() => setSettingsFormUrl('')} className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest shrink-0">
                                    Видалити
                                  </button>
                                )}
                              </div>
                              {settingsFormUrl ? (
                                <div className="mt-2 w-full h-48 md:h-64 border border-white/10 overflow-hidden bg-zinc-900">
                                   <MediaElement src={settingsFormUrl} className="w-full h-full object-cover opacity-80" />
                                </div>
                              ) : null}
                            </div>
                            
                            {/* ЗАГРУЗКА ДЛЯ ТЕЛЕФОНА */}
                            <div className="border border-white/10 p-4 bg-black/50 mt-2">
                              <label className="block text-[10px] font-black uppercase mt-2 mb-2 text-[#d4af37]">Головне медіа (Hero) для телефону</label>
                              <p className="text-[8px] text-zinc-500 mb-2">Точний розмір: 1080x1920. Вставте посилання або завантажте файл</p>
                              
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                value={settingsFormUrlMobile} 
                                onChange={e => setSettingsFormUrlMobile(e.target.value)}
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none text-white mb-2 transition-colors"
                              />

                              <div className="flex gap-2 mb-2">
                                <input 
                                  type="file" 
                                  accept="image/*,video/mp4,video/webm" 
                                  onChange={(e) => handleImageSettingUpload(e, 'mobile')}
                                  disabled={isUploadingFile}
                                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer transition-colors"
                                />
                                {settingsFormUrlMobile && (
                                  <button type="button" onClick={() => setSettingsFormUrlMobile('')} className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest shrink-0">
                                    Видалити
                                  </button>
                                )}
                              </div>
                              {settingsFormUrlMobile ? (
                                <div className="mt-2 w-full max-w-[200px] h-64 border border-white/10 overflow-hidden bg-zinc-900">
                                   <MediaElement src={settingsFormUrlMobile} className="w-full h-full object-cover opacity-80" />
                                </div>
                              ) : null}
                            </div>

                            {/* ЗАГРУЗКА ДЛЯ РОЗДІЛУ БРЕНД */}
                            <div className="border border-white/10 p-4 bg-black/50 mt-2">
                              <label className="block text-[10px] font-black uppercase mb-2 text-[#d4af37]">Медіа для розділу "Бренд"</label>
                              <p className="text-[8px] text-zinc-500 mb-2">Вставте посилання або завантажте файл. Рекомендований розмір: 1920x1080 (або 16:9).</p>
                              
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                value={settingsBrandUrl} 
                                onChange={e => setSettingsBrandUrl(e.target.value)}
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none text-white mb-2 transition-colors"
                              />

                              <div className="flex gap-2 mb-2">
                                <input 
                                  type="file" 
                                  accept="image/*,video/mp4,video/webm" 
                                  onChange={(e) => handleImageSettingUpload(e, 'brand')}
                                  disabled={isUploadingFile}
                                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer transition-colors"
                                />
                                {settingsBrandUrl && (
                                  <button type="button" onClick={() => setSettingsBrandUrl('')} className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest shrink-0">
                                    Видалити
                                  </button>
                                )}
                              </div>
                              {settingsBrandUrl ? (
                                <div className="mt-2 w-full h-48 md:h-64 border border-white/10 overflow-hidden bg-zinc-900">
                                   <MediaElement src={settingsBrandUrl} className="w-full h-full object-cover opacity-80" />
                                </div>
                              ) : null}
                            </div>

                            {/* АНІМАЦІЯ НА ГОЛОВНІЙ */}
                            <div className="border border-white/10 p-4 bg-black/50 mt-2 mb-4">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settingsHeroAnimation}
                                  onChange={(e) => setSettingsHeroAnimation(e.target.checked)}
                                  className="w-4 h-4 accent-[#d4af37] bg-black border-white/10 cursor-pointer shrink-0"
                                />
                                <div>
                                  <span className="block text-[10px] font-black uppercase text-[#d4af37]">Плавна анімація фото/відео на головній</span>
                                  <span className="text-[8px] text-zinc-500 block mt-1">Вмикає ефект повільного наближення та віддалення (як в YouTube Music).</span>
                                </div>
                              </label>
                            </div>

                            {isUploadingFile && <p className="text-[10px] font-bold text-yellow-500 animate-pulse mt-2">Завантаження файлу в базу...</p>}

                            <div className="mt-8 border-t border-white/10 pt-6">
                              <label className="block text-[10px] font-black uppercase mb-4 text-[#d4af37]">Керування категоріями товарів</label>
                              <p className="text-[8px] text-zinc-500 mb-6 uppercase tracking-widest">Натисніть на категорію, щоб додати або видалити її з сайту. Активні категорії світяться білим.</p>

                              <div className="mb-6">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Верхній одяг</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['Футболка', 'Сорочка', 'Світшот', 'Худі', 'Толстовка', 'Джемпер', 'Жилетка', 'Светр', 'Піджак', 'Куртка', 'Пальто', 'Вітрівка'].map(cat => {
                                    const isActive = settingsCategories.split(',').map(c=>c.trim()).includes(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          let current = settingsCategories.split(',').map(c => c.trim()).filter(Boolean);
                                          if (current.includes(cat)) current = current.filter(c => c !== cat);
                                          else current.push(cat);
                                          setSettingsCategories(current.join(', '));
                                        }}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-colors ${isActive ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-white/20 text-zinc-500 hover:border-white/50'}`}
                                      >
                                        {cat}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Одяг для ніг (Низ)</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['Брюки', 'Джинси', 'Штани', 'Шорти'].map(cat => {
                                    const isActive = settingsCategories.split(',').map(c=>c.trim()).includes(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          let current = settingsCategories.split(',').map(c => c.trim()).filter(Boolean);
                                          if (current.includes(cat)) current = current.filter(c => c !== cat);
                                          else current.push(cat);
                                          setSettingsCategories(current.join(', '));
                                        }}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-colors ${isActive ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-white/20 text-zinc-500 hover:border-white/50'}`}
                                      >
                                        {cat}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="mb-6">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Головні убори та аксесуари</h4>
                                <div className="flex flex-wrap gap-2">
                                  {['Шапка', 'Кепка', 'Капелюх', 'Шарф', 'Рукавички', 'Ремінь', 'Сумка', 'Рюкзак'].map(cat => {
                                    const isActive = settingsCategories.split(',').map(c=>c.trim()).includes(cat);
                                    return (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() => {
                                          let current = settingsCategories.split(',').map(c => c.trim()).filter(Boolean);
                                          if (current.includes(cat)) current = current.filter(c => c !== cat);
                                          else current.push(cat);
                                          setSettingsCategories(current.join(', '));
                                        }}
                                        className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-colors ${isActive ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-white/20 text-zinc-500 hover:border-white/50'}`}
                                      >
                                        {cat}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                            </div>

                            <button type="button" onClick={handleSaveSettings} disabled={isUploadingFile} className="w-full sm:w-auto self-start px-8 py-4 md:py-5 mt-6 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50">ЗБЕРЕГТИ НАЛАШТУВАННЯ</button>
                          </div>
                        </div>
                      </section>
                    )}

                  </div>
                </div>
              )}

            </main>

            {/* FOOTER */}
            <footer className="bg-black border-t border-white/5 pt-20 md:pt-32 pb-10 md:pb-16 px-4 md:px-10 overflow-hidden">
              <div className="max-w-[1920px] w-full mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16 md:mb-20">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 md:mb-8 text-white">SLINIAVSKIY</h2>
                    <div className="mt-2 md:mt-8 flex flex-col gap-4">
                      <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white">{t('socials')}</h4>
                      <div className="flex gap-6">
                        <a href="https://t.me/sliniavskiybrand" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><TelegramIcon size={20} /></a>
                        <a href="https://www.instagram.com/sliniavskiy.brand?igsh=MWM4eWFxMmN3d2s1aA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Instagram size={20} /></a>
                        <a href="https://www.youtube.com/@sliniavskiybrand" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Youtube size={20} /></a>
                        <a href="https://www.tiktok.com/@sliniavskiy.brand?_r=1&_t=ZN-94f8xxnwgv0" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><TikTokIcon size={20} /></a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">{t('clients')}</h4>
                    <ul className="space-y-4 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                      <li><button onClick={() => navigate('legal', {type: 'delivery'})} className="hover:text-white transition-colors">{t('delivery')}</button></li>
                      <li><button onClick={() => navigate('legal', {type: 'returns'})} className="hover:text-white transition-colors">{t('returns')}</button></li>
                      <li><button onClick={() => navigate('legal', {type: 'terms'})} className="hover:text-white transition-colors">{t('terms')}</button></li>
                      <li><button onClick={() => navigate('legal', {type: 'privacy'})} className="hover:text-white transition-colors">{t('privacy')}</button></li>
                    </ul>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">{t('info')}</h4>
                    <ul className="space-y-4 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                      <li><button onClick={() => navigate('legal', {type: 'contacts'})} className="hover:text-white transition-colors">{t('contacts')}</button></li>
                      <li><button onClick={() => navigate('legal', {type: 'cookies'})} className="hover:text-white transition-colors">Cookies</button></li>
                    </ul>
                  </div>
                  <div className="flex flex-col items-start lg:-ml-12 xl:-ml-36">
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">{t('support')}</h4>
                    <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest break-all hover:text-white cursor-pointer transition-colors text-left mb-6">sliniavskiy.support@gmail.com</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-auto mb-3 text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                       <span className="hover:text-white transition-colors cursor-default">VISA</span>
                       <span className="text-zinc-800">|</span>
                       <span className="hover:text-white transition-colors cursor-default">MASTERCARD</span>
                       <span className="text-zinc-800">|</span>
                       <span className="hover:text-white transition-colors cursor-default">APPLE PAY</span>
                       <span className="text-zinc-800">|</span>
                       <span className="hover:text-white transition-colors cursor-default">GOOGLE PAY</span>
                    </div>
                    <p className="text-[7px] md:text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                      <ShieldCheck size={12}/> Офіційний мерчант MonoPay
                    </p>
                  </div>
                </div>
                
                {/* Переключатель языка сдвинут влево */}
                <div className="flex flex-col items-start gap-6 mt-10 md:mt-16 border-t border-white/10 pt-10">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">{t('language')}</p>
                  <div className="flex gap-4 p-1 bg-zinc-900 rounded-full border border-white/10">
                     <button onClick={() => handleLangChange('uk')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'uk' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}>УКР</button>
                     <button onClick={() => handleLangChange('en')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-white'}`}>ENG</button>
                  </div>
                </div>
                
                <div className="pt-8 md:pt-10 mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <p 
                    onDoubleClick={() => navigate('account')} 
                    title="Для входу в панель адміністратора"
                    className="text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-center cursor-default selection:bg-transparent w-full md:w-auto"
                  >
                    {t('rights')}
                  </p>
                  
                  <div className="flex gap-4 text-zinc-800 text-[8px] uppercase font-bold tracking-widest hidden md:flex">
                     <button onClick={() => navigate('legal', {type: 'terms'})} className="hover:text-zinc-500 transition-colors">{t('terms')}</button>
                     <span>|</span>
                     <button onClick={() => navigate('legal', {type: 'privacy'})} className="hover:text-zinc-500 transition-colors">{t('privacy')}</button>
                  </div>
                </div>
              </div>
            </footer>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ALL FIXED OVERLAYS MUST BE OUTSIDE THE BLURRED WRAPPER TO WORK CORRECTLY  */}
          {/* ========================================================================= */}

          {/* SIZE GUIDE MODAL */}
          {isSizeGuideOpen && (() => {
            const sizeGuideText = isSizeGuideOpen.sizeGuide || DEFAULT_SIZE_GUIDE;
            const rows = sizeGuideText.split('\n').filter(r => r.trim()).map(r => r.split(','));
            const header = rows[0] || [];
            const body = rows.slice(1);

            return (
              <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
                 <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(null)} />
                 <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-2xl p-6 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                    <button onClick={() => setIsSizeGuideOpen(null)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white p-2"><X size={20} className="md:w-6 md:h-6"/></button>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest mb-6 md:mb-10 text-left pr-8 text-white">{t('size_guide')}</h2>
                    <div className="overflow-x-auto no-scrollbar">
                       <table className="w-full text-left text-[9px] md:text-[11px] font-bold uppercase tracking-widest min-w-[300px]">
                         <thead className="text-white border-b border-white/5">
                           <tr className="py-2 md:py-4">
                             {header.map((h, i) => <th key={i} className="py-2 md:py-4 pr-2 md:pr-4 whitespace-nowrap">{h.trim()}</th>)}
                           </tr>
                         </thead>
                         <tbody className="text-white">
                            {body.map((row, i) => (
                              <tr key={i} className="border-b border-white/5">
                                {row.map((cell, j) => <td key={j} className="py-4 md:py-6 pr-2 md:pr-4">{cell.trim()}</td>)}
                              </tr>
                            ))}
                         </tbody>
                       </table>
                    </div>
                 </div>
              </div>
            );
          })()}

          {/* SEARCH OVERLAY */}
          {isSearchOpen && (
            <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col p-4 md:p-20 search-overlay overflow-y-auto no-scrollbar">
               <div className="max-w-[1920px] w-full mx-auto flex flex-col pt-10 md:pt-0">
                  <div className="flex justify-between items-center mb-8 md:mb-16">
                     <h2 className="text-xl md:text-4xl font-black uppercase tracking-[0.2em] text-[#d4af37]">{t('search_title')}</h2>
                     <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:rotate-90 transition-transform duration-300 text-white"><X size={32} className="md:w-10 md:h-10" strokeWidth={1}/></button>
                  </div>
                  <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('search_placeholder')} className="w-full bg-transparent border-b-2 border-white/10 py-4 md:py-8 text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter outline-none focus:border-white transition-colors text-white" />
                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-12 mt-8 md:mt-10">
                      {searchResults.map(p => {
                        const priceInfo = getProductPrice(p);
                        return (
                        <div key={p.id} onClick={() => navigate('product', {id: p.id})} className="cursor-pointer group text-left relative">
                          <div className="aspect-[3/4] bg-zinc-900 overflow-hidden mb-3 md:mb-6 border border-white/5 relative">
                            {priceInfo.isDiscounted && <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-[#d4af37] text-black text-[9px] md:text-[10px] font-black uppercase px-2 py-1 shadow-lg">-{priceInfo.percent}%</div>}
                            <img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover md:group-hover:scale-105 transition-all duration-700 opacity-80" alt={p.name} />
                            <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-2 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                              <Heart size={14} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : "text-white/50"} />
                            </button>
                          </div>
                          <h5 className="font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-1 md:mb-2 truncate text-white">{p.name}</h5>
                          <p className="font-bold text-[9px] md:text-[10px] flex gap-2">
                             {priceInfo.isDiscounted ? (
                               <>
                                 <span className="line-through text-zinc-600">{priceInfo.original} ₴</span>
                                 <span className="text-[#d4af37] font-black">{priceInfo.final} ₴</span>
                               </>
                             ) : (
                               <span className="text-white">{priceInfo.final} ₴</span>
                             )}
                          </p>
                        </div>
                      )})}
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* WISHLIST OVERLAY */}
          {isWishlistOpen && (
            <div className="fixed inset-0 z-[1000] animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />
              <div className="absolute top-0 right-0 w-full sm:w-full md:max-w-md h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col p-6 md:p-10 animate-in slide-in-from-right duration-500 shadow-2xl">
                <div className="flex justify-between items-center mb-8 md:mb-12">
                   <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#d4af37]">{t('wishlist')}</h2>
                   <button onClick={() => setIsWishlistOpen(false)} className="hover:opacity-50 transition-opacity p-2 text-white"><X size={24} className="md:w-6 md:h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
                   {wishlist.length === 0 ? <div className="text-center py-20 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t('wishlist_empty')}</div> :
                     wishlist.map((item, idx) => (
                       <div key={idx} className="flex gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5 cursor-pointer group" onClick={() => { setIsWishlistOpen(false); navigate('product', { id: item.id }); }}>
                          <div className="w-16 h-20 md:w-20 md:h-24 bg-zinc-900 overflow-hidden border border-white/5 shrink-0">
                            <img src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={item.name} />
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                             <h4 className="text-[9px] md:text-[10px] font-black uppercase mb-1 tracking-widest line-clamp-2 text-white">{item.name}</h4>
                             <p className="text-[8px] md:text-[9px] text-white font-bold uppercase tracking-widest mb-2 md:mb-3">{tCat(item.category)}</p>
                             <div className="flex items-center justify-between mt-auto">
                                <div className="flex flex-col items-start">
                                   {(() => {
                                      const pInfo = getProductPrice(item);
                                      return pInfo.isDiscounted ? (
                                        <div className="flex flex-col gap-0.5">
                                          <p className="text-xs md:text-sm font-black text-[#d4af37]">{pInfo.final} ₴</p>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[9px] text-zinc-600 line-through font-bold">{pInfo.original} ₴</p>
                                            <span className="text-[7px] bg-[#d4af37] text-black px-1 py-0.5 font-black uppercase tracking-widest rounded-sm">-{pInfo.percent}%</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-xs md:text-sm font-black text-white">{pInfo.final} ₴</p>
                                      );
                                   })()}
                                </div>
                                <button onClick={(e) => toggleWishlist(item, e)} className="text-white hover:text-red-500 transition-colors p-2 -mr-2"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       </div>
                     ))
                   }
                </div>
              </div>
            </div>
          )}

          {/* CART OVERLAY */}
          {isCartOpen && (
            <div className="fixed inset-0 z-[1000] animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsCartOpen(false); setIsCheckoutForm(false); setCheckoutStep(1); }} />
              <div className="absolute top-0 right-0 w-full sm:w-full md:max-w-md h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col p-6 md:p-10 animate-in slide-in-from-right duration-500 shadow-2xl">
                <div className="flex justify-between items-center mb-8 md:mb-12">
                   <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#d4af37]">
                     {isCheckoutForm ? (checkoutStep === 1 ? t('checkout_title') : t('test_payment')) : t('cart')}
                   </h2>
                   <button onClick={() => { setIsCartOpen(false); setIsCheckoutForm(false); setCheckoutStep(1); }} className="hover:opacity-50 transition-opacity p-2 text-white"><X size={24} className="md:w-6 md:h-6"/></button>
                </div>

                {isCheckoutForm ? (
                   checkoutStep === 1 ? (
                     <form id="cart-scroll-container" onSubmit={handleOrderSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-4 text-left flex flex-col pb-32">
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">{t('delivery_data')}</h3>
                        <input required type="text" placeholder={t('full_name')} value={deliveryForm.name} onChange={e => setDeliveryForm({...deliveryForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors text-white" />
                        <input required type="tel" placeholder={t('phone')} value={deliveryForm.phone} onChange={e => setDeliveryForm({...deliveryForm, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors text-white" />
                        
                        <div className="relative">
                          <input 
                            required 
                            type="text" 
                            placeholder={t('city_placeholder')} 
                            value={deliveryForm.city} 
                            onChange={e => fetchNpCities(e.target.value)} 
                            onFocus={() => { if(npCities.length > 0) setShowCities(true); else if (deliveryForm.city.length >= 2) fetchNpCities(deliveryForm.city); }}
                            onBlur={() => setTimeout(() => setShowCities(false), 200)}
                            className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors text-white" 
                          />
                          {isNpLoading && !showWarehouses && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                          {showCities && npCities.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 max-h-48 overflow-y-auto shadow-2xl no-scrollbar">
                              {npCities.map(city => (
                                <div key={city.Ref} onClick={() => selectNpCity(city)} className="px-4 py-3 text-xs md:text-sm hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors text-white">
                                  {city.Description} <span className="text-[10px] text-zinc-500">({city.AreaDescription})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <input 
                            required 
                            type="text" 
                            placeholder={deliveryForm.cityRef ? t('branch_placeholder') : t('branch_disabled')} 
                            value={deliveryForm.branch} 
                            onChange={e => fetchNpWarehouses(e.target.value)} 
                            onFocus={() => { if(npWarehouses.length > 0) setShowWarehouses(true); else if(deliveryForm.cityRef) fetchNpWarehouses(deliveryForm.branch || ''); }}
                            onBlur={() => setTimeout(() => setShowWarehouses(false), 200)}
                            disabled={!deliveryForm.cityRef}
                            className={`w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors text-white ${!deliveryForm.cityRef ? 'opacity-50 cursor-not-allowed' : ''}`} 
                          />
                          {showWarehouses && npWarehouses.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 max-h-48 overflow-y-auto shadow-2xl no-scrollbar">
                              {npWarehouses.map(wh => (
                                <div key={wh.Ref} onClick={() => selectNpWarehouse(wh)} className="px-4 py-3 text-[10px] md:text-xs hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors leading-relaxed text-white">
                                  {wh.Description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/10 space-y-4">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input required type="checkbox" className="mt-1 w-5 h-5 cursor-pointer shrink-0 appearance-none border-2 border-white/20 rounded-sm checked:bg-white checked:border-white relative flex items-center justify-center after:content-['✓'] after:text-black after:text-[14px] after:font-black after:hidden checked:after:block transition-colors" />
                            <span className="text-[9px] md:text-[10px] text-zinc-400 font-medium leading-relaxed group-hover:text-white transition-colors pt-0.5">
                              {t('agree_terms')} <button type="button" onClick={() => { setIsCartOpen(false); navigate('legal', {type: 'terms'}); }} className="underline">{t('terms')}</button> {t('and')} <button type="button" onClick={() => { setIsCartOpen(false); navigate('legal', {type: 'privacy'}); }} className="underline">{t('privacy')}</button> {t('mandatory')}
                            </span>
                          </label>
                        </div>

                        <div className="mt-auto pt-6 md:pt-8 space-y-3 md:space-y-4">
                          <div className="flex justify-between items-center mb-2 md:mb-4">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('total')}</span>
                            <span className="text-lg md:text-xl font-black text-white">{cartTotal} ₴</span>
                          </div>
                          <button type="submit" className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2 active:scale-95">
                            <CreditCard size={16} /> {t('delivery_details')}
                          </button>
                          <button type="button" onClick={() => setIsCheckoutForm(false)} className="w-full py-3 md:py-4 text-zinc-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-white transition-colors">{t('back_to_cart')}</button>
                        </div>
                     </form>
                   ) : (
                     <div id="cart-scroll-container" className="flex-1 flex flex-col animate-in slide-in-from-bottom duration-300 w-full h-full items-center justify-center overflow-y-auto pb-10">
                        <div className="w-full bg-[#111] p-6 md:p-8 rounded-sm border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] text-center relative mt-4">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0a0a] px-4">
                             <CreditCard size={24} className="text-[#d4af37]" />
                          </div>
                          <h3 className="font-black text-lg md:text-xl uppercase tracking-widest mb-2 mt-4 text-white">MonoPay</h3>
                          
                          <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 mb-4 text-yellow-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest rounded-sm flex items-center justify-center gap-2">
                            <Activity size={14} /> {t('test_payment')}
                          </div>

                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-6 leading-relaxed">{t('test_desc')}</p>
                          
                          <div className="bg-black border border-white/10 p-6 mb-8 text-center">
                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2">{t('pay_amount')}</p>
                            <p className="text-3xl md:text-4xl font-black">{cartTotal} ₴</p>
                          </div>

                          <div className="space-y-4">
                            <button 
                              onClick={handleFinalizePayment} 
                              disabled={isProcessingPayment}
                              className="w-full py-4 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2"
                            >
                              {isProcessingPayment ? <><Loader2 size={16} className="animate-spin" /> {t('processing')}</> : t('pay_btn')}
                            </button>
                            <button 
                              onClick={() => { setCheckoutStep(1); }} 
                              disabled={isProcessingPayment}
                              className="w-full py-3 text-zinc-500 font-black uppercase text-[9px] tracking-widest hover:text-white transition-opacity disabled:opacity-50"
                            >
                              {t('back_to_data')}
                            </button>
                          </div>
                        </div>
                     </div>
                   )
                ) : (
                   <>
                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
                         {cart.length === 0 ? <div className="text-center py-20 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t('empty_cart')}</div> :
                           cart.map((item, idx) => {
                             const realProduct = activeProducts.find(p => p.id === item.id);
                             const pInfo = realProduct ? getProductPrice(realProduct) : { final: Number(item.price) || 0, original: Number(item.price) || 0, isDiscounted: false, percent: 0 };
                             return (
                               <div key={idx} className="flex gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5">
                                  <div className="w-16 h-20 md:w-20 md:h-24 bg-zinc-900 overflow-hidden border border-white/5 shrink-0"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                                  <div className="flex-1 text-left flex flex-col justify-between">
                                     <div>
                                       <h4 className="text-[9px] md:text-[10px] font-black uppercase mb-1 tracking-widest line-clamp-2 text-white">{item.name}</h4>
                                       <p className="text-[8px] md:text-[9px] text-white font-bold uppercase tracking-widest mb-1 md:mb-2">{item.selectedSize} / {item.selectedColor}</p>
                                       
                                       <div className="flex flex-col items-start gap-1">
                                         <p className="text-xs md:text-sm font-black text-white">{pInfo.final * item.quantity} ₴</p>
                                         {pInfo.isDiscounted && (
                                           <div className="flex items-center gap-2">
                                             <p className="text-[10px] text-zinc-600 line-through font-bold">{pInfo.original * item.quantity} ₴</p>
                                             <span className="text-[8px] bg-[#d4af37] text-black px-1 py-0.5 font-black uppercase tracking-widest rounded-sm">
                                               -{pInfo.percent}%
                                             </span>
                                           </div>
                                         )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 mt-2">
                                       <button type="button" onClick={() => updateQuantity(item.cartId, -1)} className="text-lg md:text-[14px] font-black text-white hover:text-zinc-300 transition-colors p-1 md:p-0 w-6 h-6 flex items-center justify-center">-</button>
                                       <span className="text-[9px] md:text-[10px] font-black text-white">{item.quantity}</span>
                                       <button type="button" onClick={() => updateQuantity(item.cartId, 1)} className="text-lg md:text-[14px] font-black text-white hover:text-zinc-300 transition-colors p-1 md:p-0 w-6 h-6 flex items-center justify-center">+</button>
                                       <button type="button" onClick={() => removeItem(item.cartId)} className="ml-auto text-white hover:text-red-500 transition-colors p-2 -mr-2"><Trash2 size={16}/></button>
                                    </div>
                                 </div>
                              </div>
                            )
                          })
                        }
                     </div>
                     {cart.length > 0 && (
                        <div className="mt-auto pt-6 md:pt-10 border-t border-white/5">
                           <div className="flex gap-2 mb-4 md:mb-6">
                              <input 
                                type="text" 
                                value={promoInput} 
                                onChange={e => setPromoInput(e.target.value.toUpperCase())} 
                                placeholder="ПРОМОКОД АБО РЕФЕРАЛ" 
                                className="flex-1 bg-black/50 border border-white/10 px-4 py-3 text-xs focus:border-white outline-none transition-colors text-white uppercase font-bold tracking-widest"
                              />
                              <button 
                                onClick={handleApplyPromo} 
                                className="px-6 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                              >
                                Застосувати
                              </button>
                           </div>
                           {promoDiscountAmount > 0 && (
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Знижка (-{promoDiscountPercent}%)</span>
                                <span className="text-sm font-black text-[#d4af37]">- {promoDiscountAmount} ₴</span>
                             </div>
                           )}
                           <div className="flex justify-between items-center mb-6 md:mb-8">
                              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">{t('total')}</span>
                              <span className="text-lg md:text-xl font-black text-white">{cartTotal} ₴</span>
                           </div>
                           <button onClick={() => setIsCheckoutForm(true)} className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-colors active:scale-95">{t('checkout')}</button>
                        </div>
                     )}
                  </>
               )}
              </div>
            </div>
          )}

          {/* GLOBAL COOKIE POPUP */}
          {!cookieConsent && (
            <div className="fixed bottom-0 left-0 w-full z-[4000] p-4 md:p-6 pointer-events-none flex justify-center items-end" style={{ animation: 'slideUpPopup 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-6 md:p-8 shadow-[0_-10px_50px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 w-full max-w-[1920px] pointer-events-auto rounded-sm">
                <div className="text-left flex-1">
                  <h4 className="text-white font-black uppercase tracking-widest text-sm md:text-base mb-2">🍪 Ми використовуємо Cookies</h4>
                  <p className="text-zinc-400 text-[10px] md:text-xs font-medium leading-relaxed uppercase tracking-wider">
                    Ми використовуємо файли cookie для покращення роботи сайту. Ви можете прийняти всі файли, відхилити необов'язкові або змінити налаштування.
                  </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4 shrink-0 w-full md:w-auto">
                  <button onClick={() => handleCookieAction('declined')} className="flex-1 sm:flex-none px-6 py-4 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white transition-all text-center">Відхилити</button>
                  <button onClick={() => handleCookieAction('settings')} className="flex-1 sm:flex-none px-6 py-4 border border-white text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">Налаштувати</button>
                  <button onClick={() => handleCookieAction('accepted')} className="w-full sm:w-auto px-8 py-4 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all text-center">Прийняти все</button>
                </div>
              </div>
            </div>
          )}

          {/* TOAST */}
          {toast && (
            <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[5000] bg-white text-black px-6 md:px-8 py-3 md:py-4 font-black uppercase text-[8px] md:text-[10px] tracking-[0.3em] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 text-center w-[90%] md:w-auto rounded-sm">
              {toast}
            </div>
          )}
        </>
      )}
    </>
  );
}

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Система перехопила критичну помилку:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 text-center font-sans">
           <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 flex items-center justify-center rounded-full mb-6">
             <RefreshCw size={24} className="text-red-500" />
           </div>
           <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4">Стався збій</h2>
           <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest mb-8 leading-relaxed max-w-md">
             Система виявила пошкодження локальних данных або помилку з'єднання. Натисніть кнопку нижче, щоб автоматично відновити роботу сайту.
           </p>
           <button 
             onClick={() => {
               localStorage.removeItem('sliniavskiy_cart');
               localStorage.removeItem('sliniavskiy_wishlist');
               localStorage.removeItem('sliniavskiy_routeParams');
               sessionStorage.clear();
               window.location.reload();
             }} 
             className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-colors shadow-2xl active:scale-95"
           >
             Відновити роботу сайту
           </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

// Экспортируем приложение, обернутое в защитный барьер
export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
