import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShoppingBag, Search, User, X, ChevronDown, Menu,
  Instagram, Youtube, Check, Package, 
  LogOut, Smartphone, Loader2, UserCircle, Truck, RefreshCw,
  Mail, Ruler, Settings2, Send, CreditCard, ShieldCheck, Database,
  Plus, Edit, Trash2, Image as ImageIcon, Settings, ArrowRight, ArrowLeft, ChevronRight,
  Target, Award, Fingerprint, Shirt, Scissors, Sparkles, Box, Wind, 
  Layers, Gem, Feather, Shield, Activity, Fingerprint as IconFingerprint,
  Infinity, Zap, LayoutGrid, Heart, History, Info, Users, Link as LinkIcon, BarChart, Calendar, Copy, Percent
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
  signInWithRedirect,
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
  getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
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
const DEFAULT_CATEGORIES = ['Футболки', 'Штани', 'Джинси', 'Брюки', 'Шорти'];
const SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = [
  { name: 'Black', hex: '#000000', label: 'Чорний', imageIndex: 0 },
  { name: 'White', hex: '#ffffff', label: 'Білий', imageIndex: 0 }
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
    console.error("Помилка відправки Telegram", err);
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

// --- HEADER ---
function Header({ navigate, goBack, route, setIsSearchOpen, cart, wishlist, setIsWishlistOpen, isCatalogOpen, setIsCatalogOpen, setIsCartOpen, setIsMobileMenuOpen, user, categories }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/5 py-3 md:py-4' : 'bg-transparent py-5 md:py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center w-1/4">
          {route !== 'home' && (
            <button onClick={goBack} className="mr-3 md:mr-6 hover:opacity-50 transition-opacity text-white flex items-center justify-center">
              <ArrowLeft size={22} className="md:w-6 md:h-6" />
            </button>
          )}
          <nav className="hidden md:flex gap-8 items-center text-[11px] font-black uppercase tracking-[0.2em]">
            <div className="relative group" onMouseEnter={() => setIsCatalogOpen(true)} onMouseLeave={() => setIsCatalogOpen(false)}>
              <button onClick={() => navigate('catalog')} className="flex items-center gap-2 hover:opacity-50 transition-opacity py-2 text-white font-black">
                Колекція <ChevronDown size={12} className={`transition-transform duration-300 ${isCatalogOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="absolute top-full left-0 w-full h-4 bg-transparent"></div>
              <div className={`absolute top-[calc(100%+4px)] left-0 w-56 bg-[#0a0a0a] border border-white/10 shadow-2xl transition-all duration-300 origin-top overflow-hidden ${isCatalogOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="flex flex-col py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                  <button onClick={() => navigate('catalog', { category: null })} className="text-left px-6 py-4 hover:bg-white hover:text-black transition-colors text-white font-black uppercase text-[10px] tracking-widest border-b border-white/5">Усі товари</button>
                  {categories.map(c => (
                    <button key={c} onClick={() => navigate('catalog', { category: c })} className="text-left px-6 py-4 hover:bg-white hover:text-black transition-colors text-white font-black uppercase text-[10px] tracking-widest">{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => navigate('brand')} className="hover:opacity-50 transition-opacity text-white font-black">Бренд</button>
            {isAdmin && <button onClick={() => navigate('admin')} className="text-[#d4af37] font-black uppercase tracking-widest text-[10px] hover:opacity-70 transition-opacity">Admin</button>}
          </nav>
          <button className="md:hidden p-2 -ml-2 text-white" onClick={() => setIsMobileMenuOpen(true)}><Menu size={22} /></button>
        </div>
        <div className="w-2/4 flex justify-center cursor-pointer group" onClick={() => navigate('home')}>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tighter uppercase group-hover:tracking-widest transition-all duration-700 text-white truncate px-2">SLINIAVSKIY</h1>
        </div>
        <div className="flex items-center justify-end gap-4 md:gap-6 w-1/4 text-white">
          <button onClick={() => setIsWishlistOpen(true)} className="relative hover:opacity-50 transition-opacity">
            <Heart size={18} className="md:w-5 md:h-5" />
            {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{wishlist.length}</span>}
          </button>

          <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity"><Search size={18} className="md:w-5 md:h-5" /></button>
          
          <button onClick={() => navigate('account')} className="hover:opacity-50 transition-opacity">
            {user && !user.isAnonymous && user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-5 h-5 rounded-full object-cover border border-white/20" />
            ) : (
              <User size={18} className="md:w-5 md:h-5" />
            )}
          </button>

          <button onClick={() => setIsCartOpen(true)} className="relative hover:opacity-50 transition-opacity">
            <ShoppingBag size={18} className="md:w-5 md:h-5" />
            {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [isProductsLoaded, setIsProductsLoaded] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  
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

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('sliniavskiy_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('sliniavskiy_wishlist') || '[]'));
  
  const [dbProducts, setDbProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [referrals, setReferrals] = useState([]);
  
  const activeProducts = dbProducts;
  const storefrontProducts = activeProducts.filter(p => p.isVisible !== false);
  
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem('sliniavskiy_cookie_consent'));
  const [cookiePrefs, setCookiePrefs] = useState(() => JSON.parse(localStorage.getItem('sliniavskiy_cookie_prefs') || '{"analytics":true,"marketing":false}'));

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [authError, setAuthError] = useState('');

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(null);
  
  const [isCheckoutForm, setIsCheckoutForm] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [currentPendingOrderId, setCurrentPendingOrderId] = useState(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Оновлений стан для форми доставки (додано cityRef для Нової Пошти)
  const [deliveryForm, setDeliveryForm] = useState({ name: '', phone: '', city: '', cityRef: '', branch: '' });
  
  // Стан для роботи бази Нової Пошти
  const [npCities, setNpCities] = useState([]);
  const [npWarehouses, setNpWarehouses] = useState([]);
  const [showCities, setShowCities] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [isNpLoading, setIsNpLoading] = useState(false);

  // Офіційний ключ доступу Нової Пошти
  const NP_API_KEY = '8208cf2c74ddc570769381a82649fb8c'; 

  const [adminTab, setAdminTab] = useState('orders');
  const [siteSettings, setSiteSettings] = useState({ heroImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80', heroImageMobile: '', categories: DEFAULT_CATEGORIES });
  const activeCategories = siteSettings.categories?.length > 0 ? siteSettings.categories : DEFAULT_CATEGORIES;
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: DEFAULT_CATEGORIES[0], images: '', sizeGuide: DEFAULT_SIZE_GUIDE, isVisible: true, inStock: true, colors: [], sizes: DEFAULT_SIZES_AVAILABILITY });
  const [settingsFormUrl, setSettingsFormUrl] = useState('');
  const [settingsFormUrlMobile, setSettingsFormUrlMobile] = useState('');
  const [settingsCategories, setSettingsCategories] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');

  const [newReferralName, setNewReferralName] = useState('');
  const [refFilterPartner, setRefFilterPartner] = useState('');
  const [refFilterDateFrom, setRefFilterDateFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [refFilterDateTo, setRefFilterDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [refFilterStatus, setRefFilterStatus] = useState('all');
  const [refSortConfig, setRefSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [refCalcDate, setRefCalcDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const showToast = useCallback((msg) => { 
    setToast(msg); 
    setTimeout(() => setToast(null), 4000); 
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      localStorage.setItem('sliniavskiy_ref', refCode);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => { localStorage.setItem('sliniavskiy_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('sliniavskiy_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  useEffect(() => {
    if (!isUserDataLoaded || !user) return;
    const userStoreRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'store');
    setDoc(userStoreRef, { cart, wishlist }, { merge: true }).catch(console.error);
  }, [cart, wishlist, user, isUserDataLoaded]);

  // ВИПРАВЛЕНО ВИЛІТ АКАУНТА (Логіка Авторизації)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Якщо користувач вже є в пам'яті (увійшов раніше), зберігаємо його
        setUser(currentUser);
        setAuthLoading(false);
      } else {
        // Якщо користувача немає, створюємо анонімного або заходимо по токену
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth); 
          }
        } catch (err) {
          console.error("Auth init error", err);
          setAuthLoading(false);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubProducts = onSnapshot(getProductsRef(), 
      (s) => {
        setDbProducts(s.docs.map(d => ({ id: d.id, ...d.data() })));
        setIsProductsLoaded(true);
      },
      (err) => { console.error(err); setIsProductsLoaded(true); }
    );

    const unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), 
      (d) => {
        if (d.exists()) {
          const data = d.data();
          setSiteSettings({
            heroImage: data.heroImage || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
            heroImageMobile: data.heroImageMobile || '',
            categories: data.categories || DEFAULT_CATEGORIES
          });
          setSettingsFormUrl(data.heroImage || '');
          setSettingsFormUrlMobile(data.heroImageMobile || '');
          setSettingsCategories(data.categories?.join(', ') || DEFAULT_CATEGORIES.join(', '));
        } else {
          setSettingsCategories(DEFAULT_CATEGORIES.join(', '));
        }
        setIsSettingsLoaded(true);
      },
      (err) => { console.error(err); setIsSettingsLoaded(true); }
    );

    const unsubOrders = onSnapshot(getOrdersRef(), 
      (s) => setOrders(s.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => console.error(err)
    );

    const unsubReferrals = onSnapshot(getReferralsRef(), 
      (s) => {
        const refs = s.docs.map(d => ({ id: d.id, ...d.data() }));
        setReferrals(refs);
        if (refs.length > 0 && !refFilterPartner) {
           setRefFilterPartner(refs[0].code);
        }
      },
      (err) => console.error(err)
    );

    const loadUserData = async () => {
      try {
        const userStoreRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userData', 'store');
        const snap = await getDoc(userStoreRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.cart && data.cart.length > 0) setCart(data.cart);
          if (data.wishlist && data.wishlist.length > 0) setWishlist(data.wishlist);
        } else {
          await setDoc(userStoreRef, { cart, wishlist }, { merge: true });
        }
      } catch (err) {
        console.error("Error loading user store", err);
      } finally {
        setIsUserDataLoaded(true);
      }
    };
    loadUserData();

    return () => { unsubProducts(); unsubSettings(); unsubOrders(); unsubReferrals(); };
  }, [user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return storefrontProducts.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q)
    );
  }, [searchQuery, storefrontProducts]);

  const navigate = (r, p = {}, isBack = false) => {
    if (!isBack) {
      const stack = JSON.parse(sessionStorage.getItem('sliniavskiy_history') || '[]');
      stack.push({ route, params: routeParams });
      sessionStorage.setItem('sliniavskiy_history', JSON.stringify(stack));
    }
    
    setRoute(r); 
    setRouteParams(p);
    sessionStorage.setItem('sliniavskiy_route', r);
    sessionStorage.setItem('sliniavskiy_routeParams', JSON.stringify(p));
    
    setIsCartOpen(false); setIsSearchOpen(false); setIsWishlistOpen(false); setIsMobileMenuOpen(false); setIsCatalogOpen(false);
    setSearchQuery('');
    setAuthError(''); 
    setActiveImageIndex(0);
    setSelectedColor(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        showToast('Видалено зі списку бажань');
        return prev.filter(item => item.id !== p.id);
      } else {
        showToast('Додано до списку бажань');
        return [...prev, p];
      }
    });
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  const handleCookieAction = (action) => {
    localStorage.setItem('sliniavskiy_cookie_consent', action);
    setCookieConsent(action);
    if (action === 'settings') {
      navigate('legal', {type: 'cookies'});
    } else if (action === 'save_custom') {
      localStorage.setItem('sliniavskiy_cookie_prefs', JSON.stringify(cookiePrefs));
      showToast("Налаштування Cookies збережено");
      navigate('home');
    } else {
      showToast(action === 'accepted' ? "Дякуємо! Cookies прийнято." : "Cookies відхилено.");
      navigate('home');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
        showToast('Успішний вхід');
      }
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
         setAuthError('Помилка: Цей домен не додано до списку авторизованих у Firebase Console (Authentication -> Settings -> Authorized domains).');
      } else if (err.code === 'auth/operation-not-allowed') {
         setAuthError('ПОМИЛКА FIREBASE: Увімкніть спосіб входу "Google" у налаштуваннях Firebase Console (Authentication -> Sign-in method).');
      } else {
         setAuthError(`Помилка авторизації Google: ${err.message}`);
      }
      console.error(err);
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
      console.error("Помилка авторизації:", err);
      if (err.code === 'auth/operation-not-allowed') {
         setAuthError('ПОМИЛКА FIREBASE: Увімкніть спосіб входу "Email/Password" у налаштуваннях Firebase Console (Authentication -> Sign-in method).');
      } else if (err.code === 'auth/email-already-in-use') {
         setAuthError('Помилка: Цей Email вже зареєстровано. Спробуйте увійти.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
         setAuthError('Помилка: Невірний пароль або email.');
      } else if (err.code === 'auth/user-not-found') {
         setAuthError('Помилка: Користувача не знайдено.');
      } else if (err.code === 'auth/weak-password') {
         setAuthError('Помилка: Пароль має бути мінімум 6 символів.');
      } else {
         setAuthError(`Помилка: ${err.message}`);
      }
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

  const cartSubtotal = useMemo(() => cart.reduce((total, item) => {
    const realProduct = activeProducts.find(p => p.id === item.id);
    const realPrice = realProduct ? realProduct.price : 0;
    return total + (realPrice * item.quantity);
  }, 0), [cart, activeProducts]);

  const cartTotal = cartSubtotal;

  const addToCart = (p) => {
    if (p.inStock === false) return showToast('На жаль, товару немає в наявності');
    if (p.sizes && p.sizes[selectedSize] === false) return showToast(`Розміру ${selectedSize} немає в наявності`);
    
    const colors = p.colors?.length > 0 ? p.colors : DEFAULT_COLORS;
    const activeColor = selectedColor || colors[0];
    
    const productToAdd = {
      ...p,
      selectedSize,
      selectedColor: activeColor.label,
      cartId: `${p.id}-${selectedSize}-${activeColor.name}-${activeColor.hex}`
    };

    const imgUrl = p.images && p.images[activeColor.imageIndex] ? p.images[activeColor.imageIndex] : p.images[0];

    setCart(prev => {
      const idx = prev.findIndex(i => i.cartId === productToAdd.cartId);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { ...productToAdd, quantity: 1, image: imgUrl }];
    });
    showToast(`Додано: ${p.name} (${selectedSize})`);
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  // --- ФУНКЦІЇ ДЛЯ НОВОЇ ПОШТИ ---
  const fetchNpCities = async (query) => {
    setDeliveryForm(prev => ({...prev, city: query, branch: '', cityRef: ''}));
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
      console.error("Помилка НП (Міста)", e);
    }
    setIsNpLoading(false);
  };

  const selectNpCity = (city) => {
    setDeliveryForm(prev => ({...prev, city: city.Description, cityRef: city.Ref, branch: ''}));
    setShowCities(false);
    fetchNpWarehouses('', city.Ref); // Одразу вантажимо відділення для цього міста
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
      console.error("Помилка НП (Відділення)", e);
    }
    setIsNpLoading(false);
  };

  const selectNpWarehouse = (wh) => {
    setDeliveryForm(prev => ({...prev, branch: wh.Description}));
    setShowWarehouses(false);
  };
  // ---------------------------------

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    const itemsToSave = cart.map(item => {
      const realPrice = activeProducts.find(p => p.id === item.id)?.price || item.price || 0;
      return { ...item, price: realPrice };
    });
    
    const appliedRef = localStorage.getItem('sliniavskiy_ref') || null;

    const orderData = {
      userId: user.uid,
      customer: deliveryForm,
      items: itemsToSave,
      total: cartTotal,
      status: 'pending_payment', 
      referralCode: appliedRef,
      createdAt: new Date().toISOString()
    };

    try {
      // Строга санітизація
      const safeData = JSON.parse(JSON.stringify(orderData));
      const docRef = await addDoc(getOrdersRef(), safeData);
      setCurrentPendingOrderId(docRef.id);
      
      setCheckoutStep(2); 
    } catch (err) {
      console.error("Помилка збереження попереднього замовлення", err);
      showToast('Помилка обробки замовлення.');
    }
  };

  const handleFinalizePayment = async () => {
    if (!currentPendingOrderId) return showToast('Помилка: Замовлення не знайдено');

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', currentPendingOrderId), { 
        status: 'new' 
      });

      const appliedRef = localStorage.getItem('sliniavskiy_ref') || null;
      let text = `🔥 <b>Нове ОПЛАЧЕНЕ замовлення!</b>\n\n`;
      text += `👤 <b>ПІБ:</b> ${deliveryForm.name}\n`;
      text += `📞 <b>Телефон:</b> ${deliveryForm.phone}\n`;
      text += `📍 <b>Місто:</b> ${deliveryForm.city}\n`;
      text += `🏢 <b>Відділення:</b> ${deliveryForm.branch}\n`;
      if (appliedRef) {
        text += `🤝 <b>Реферал:</b> ${appliedRef}\n`;
      }
      text += `\n🛒 <b>Товари:</b>\n`;
      cart.forEach(item => {
        text += `- ${item.name} (${item.selectedSize} / ${item.selectedColor}) x${item.quantity}\n`;
      });
      text += `\n💳 <b>Сплачено:</b> ${cartTotal} ₴`;

      await sendTelegramMessage(text);

      showToast('Оплата успішна! Замовлення оформлено.');
      setCart([]);
      setDeliveryForm({ name: '', phone: '', city: '', branch: '' });
      setCurrentPendingOrderId(null);
      setIsCartOpen(false);
      setIsCheckoutForm(false);
      setCheckoutStep(1);
      
      navigate('home');
      
    } catch (err) {
      console.error("Помилка підтвердження оплати", err);
      showToast('Помилка підтвердження оплати.');
    }
  };

  // ВИПРАВЛЕНО ЗАЙВИЙ КОД: Заміна WayForPay на MonoPay
  const handleMonoPayPayment = () => {
    // Тут буде підключення бойових ключів MonoPay
    showToast("З'єднання з MonoPay...");
    setTimeout(() => {
       handleFinalizePayment();
    }, 2000);
  };

  // 100% НАДЕЖНОЕ СОХРАНЕНИЕ ТОВАРОВ
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    try {
      const parsedImages = editForm.images ? editForm.images.split('\n').map(u => u.trim()).filter(Boolean) : [];
      
      const cleanColors = (editForm.colors || []).map(c => ({
         name: c.name || 'Color',
         label: c.label || 'Колір',
         hex: c.hex || '#ffffff',
         imageIndex: Number(c.imageIndex) || 0
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
        }
      };

      // ЖЕСТКАЯ ОЧИСТКА ДАННЫХ: Удаляет любые undefined/null, из-за которых база выдает ошибки
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
      console.error(err); 
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
      console.error("Помилка завантаження:", error);
      showToast('❌ Помилка завантаження фото!');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleHeroUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const fileRef = ref(storage, `artifacts/${appId}/settings/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      if (type === 'desktop') setSettingsFormUrl(url);
      if (type === 'mobile') setSettingsFormUrlMobile(url);
      showToast('⚠️ Зображення завантажено! Натисніть "Зберегти налаштування"');
    } catch (error) {
      console.error("Помилка завантаження зображення", error);
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
    } catch(err) { console.error(err); showToast('❌ Помилка видалення'); }
  };

  // 100% НАДЕЖНОЕ СОХРАНЕНИЕ НАСТРОЕК (Категории + Картинки)
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const parsedCategories = settingsCategories.split(',').map(c => c.trim()).filter(Boolean);
      
      const dataToSave = { 
        heroImage: settingsFormUrl || siteSettings.heroImage || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
        heroImageMobile: settingsFormUrlMobile || siteSettings.heroImageMobile || '',
        categories: parsedCategories.length > 0 ? parsedCategories : DEFAULT_CATEGORIES
      };
      
      // ЖЕСТКАЯ ОЧИСТКА ОТ ПУСТОТ
      const safeData = JSON.parse(JSON.stringify(dataToSave));
      
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'general'), safeData, { merge: true });
      showToast('✅ Налаштування успішно збережено!');
    } catch(err) { 
      console.error(err); 
      showToast(`❌ Помилка налаштувань: ${err.message}`); 
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { status: newStatus });
      showToast('✅ Статус замовлення оновлено');
    } catch (e) {
      console.error(e);
      showToast('❌ Помилка оновлення статусу');
    }
  };

  const handleAddReferral = async (e) => {
    e.preventDefault();
    if (!newReferralName.trim()) return;
    
    const code = newReferralName.trim().replace(/\s+/g, '-').toLowerCase() + '-' + Math.random().toString(36).substr(2, 4);
    
    try {
      const safeData = JSON.parse(JSON.stringify({
        name: newReferralName,
        code: code,
        createdAt: new Date().toISOString()
      }));
      await addDoc(getReferralsRef(), safeData);
      setNewReferralName('');
      showToast('✅ Реферала успішно створено');
    } catch (err) {
      console.error(err);
      showToast('❌ Помилка створення реферала');
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      showToast('✅ Посилання скопійовано!');
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("Copy");
      textArea.remove();
      showToast('✅ Посилання скопійовано!');
    }
  };

  const handleRefSort = (key) => {
    setRefSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  if (authLoading || !isProductsLoaded || !isSettingsLoaded || !isUserDataLoaded) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><Loader2 className="animate-spin w-10 h-10"/></div>;
  }

  return (
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
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        user={user} 
        categories={activeCategories}
      />

      <main>
        {/* HOME ROUTE */}
        {route === 'home' && (
          <div className="animate-in fade-in duration-1000">
            <section className="relative h-[100svh] flex flex-col items-center justify-center overflow-hidden">
              <img src={siteSettings.heroImage} className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-50" alt="Hero Desktop" />
              <img src={siteSettings.heroImageMobile || siteSettings.heroImage} className="md:hidden absolute inset-0 w-full h-full object-cover opacity-50" alt="Hero Mobile" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
              <div className="relative z-10 text-center px-4 w-full overflow-hidden">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[9rem] font-black tracking-tighter uppercase leading-none mb-8 md:mb-12 text-white whitespace-nowrap">SLINIAVSKIY</h1>
                <button onClick={() => navigate('catalog')} className="px-8 py-4 md:px-12 md:py-5 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors text-[10px] md:text-xs active:scale-95">До Колекції</button>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32 text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 md:mb-16 border-b border-white/10 pb-6 md:pb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-center md:text-left">New Arrivals</h2>
                <button onClick={() => navigate('catalog')} className="hidden md:block px-12 py-5 bg-white text-black text-[12px] font-black uppercase tracking-widest hover:scale-110 transition-all active:scale-95">Переглянути всі</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
                {storefrontProducts.slice(0, 6).map(p => (
                  <div key={p.id} className="group cursor-pointer" onClick={() => navigate('product', { id: p.id })}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-4 md:mb-6 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all border border-white/5">
                      {p.inStock === false && <div className="absolute top-4 left-4 z-10 bg-black/80 text-white text-[10px] font-black uppercase px-3 py-2 border border-white/10">Sold Out</div>}
                      <img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/800'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 md:group-hover:scale-105" alt="" />
                      <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-4 right-4 z-20 p-2 md:p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <Heart size={16} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : "text-white/50"} />
                      </button>
                    </div>
                    <h3 className="font-bold uppercase tracking-widest text-[11px] md:text-sm mb-1 md:mb-2">{p.name}</h3>
                    <p className="text-zinc-500 font-medium text-xs md:text-base">{p.price} ₴</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 md:hidden">
                <button onClick={() => navigate('catalog')} className="w-full py-4 bg-white text-black text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform">Переглянути всі</button>
              </div>
            </section>
          </div>
        )}

        {/* CATALOG ROUTE */}
        {route === 'catalog' && (
           <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6">
              <div className="flex flex-col mb-10 md:mb-16 border-b border-white/10 pb-6 md:pb-10">
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-widest mb-8 md:mb-12 leading-none break-words">
                  {routeParams.category || 'Уся Колекція'}
                </h2>
                
                <div className="flex flex-wrap gap-3 md:gap-4 pb-2">
                  <button onClick={() => navigate('catalog', { category: null })} className={`shrink-0 px-6 py-3 md:px-8 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border transition-all whitespace-nowrap ${!routeParams.category ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:border-white hover:text-white'}`}>Усі</button>
                  {activeCategories.slice(0, showAllCategories ? activeCategories.length : 7).map(c => (
                    <button key={c} onClick={() => navigate('catalog', { category: c })} className={`shrink-0 px-6 py-3 md:px-8 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border transition-all whitespace-nowrap ${routeParams.category === c ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:border-white hover:text-white'}`}>{c}</button>
                  ))}
                  {activeCategories.length > 7 && !showAllCategories && (
                    <button onClick={() => setShowAllCategories(true)} className="shrink-0 px-6 py-3 md:px-8 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border border-dashed border-white/30 text-zinc-400 hover:border-white hover:text-white transition-all whitespace-nowrap">
                      Переглянути всі ({activeCategories.length - 7})
                    </button>
                  )}
                  {activeCategories.length > 7 && showAllCategories && (
                     <button onClick={() => setShowAllCategories(false)} className="shrink-0 px-6 py-3 md:px-8 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] border border-dashed border-white/30 text-zinc-400 hover:border-white hover:text-white transition-all whitespace-nowrap">
                      Згорнути
                    </button>
                  )}
                </div>

              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
                {(() => {
                  const filteredProducts = storefrontProducts.filter(p => !routeParams.category || p.category === routeParams.category);
                  const limit = isMobileView ? 5 : 10;
                  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, limit);
                  
                  if (filteredProducts.length === 0) {
                     return <div className="col-span-3 py-20 text-center text-zinc-500 uppercase font-black tracking-widest text-xs">Товарів в цій категорії ще немає</div>;
                  }

                  return (
                    <>
                      {displayedProducts.map(p => (
                        <div key={p.id} onClick={() => navigate('product', { id: p.id })} className="cursor-pointer group">
                          <div className="relative aspect-[3/4] bg-zinc-900 mb-4 md:mb-6 overflow-hidden border border-white/5">
                            {p.inStock === false && <div className="absolute top-4 left-4 z-10 bg-black/80 text-white text-[10px] font-black uppercase px-3 py-2 border border-white/10">Sold Out</div>}
                            <img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/800'} className="w-full h-full object-cover md:group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" alt={p.name}/>
                            <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-4 right-4 z-20 p-2 md:p-3 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                              <Heart size={16} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : "text-white/50"} />
                            </button>
                          </div>
                          <h3 className="font-bold uppercase text-[11px] md:text-sm tracking-widest mb-1">{p.name}</h3>
                          <p className="text-zinc-500 font-medium text-xs md:text-base">{p.price} ₴</p>
                        </div>
                      ))}
                      {filteredProducts.length > limit && !showAllProducts && (
                        <div className="col-span-1 sm:col-span-2 md:col-span-3 mt-6 mb-4 flex justify-center w-full">
                          <button onClick={() => setShowAllProducts(true)} className="px-10 py-5 bg-white text-black text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
                            Показати всі ({filteredProducts.length})
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
           </div>
        )}

        {/* BRAND ROUTE */}
        {route === 'brand' && (
          <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-4xl mx-auto px-4 md:px-6 animate-in fade-in duration-700 text-center">
            <div className="mb-20 md:mb-32">
               <h2 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-[0.2em] leading-relaxed mb-6 md:mb-8">
                 "Ми створюємо не просто одяг. Ми створюємо форму для ваших амбіцій, де кожна деталь має значення."
               </h2>
               <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px]">— Засновник SLINIAVSKIY</p>
            </div>

            <div className="border-t border-white/10 pt-20 md:pt-32">
               <h3 className="text-lg md:text-2xl font-black uppercase tracking-[0.3em] mb-8 md:mb-10">Ціль бренду</h3>
               <div className="space-y-6 md:space-y-8 text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium text-left md:text-center px-2 md:px-0">
                 <p>
                   Наша головна ціль — забезпечити вас преміальним базовим гардеробом, який не підвладний швидкоплинним трендам. Ми віримо, що справжній стиль починається з бездоганного крою та виняткового комфорту.
                 </p>
                 <p>
                   Кожна річ SLINIAVSKIY створена для того, щоб підкреслити вашу індивідуальність. Використовуючи кращі матеріали за європейськими стандартами, ми гарантуємо довговічність та естетичне задоволення від кожного дотику до тканини.
                 </p>
               </div>
            </div>
          </div>
        )}

        {/* ACCOUNT ROUTE */}
        {route === 'account' && (
          <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6 animate-in fade-in duration-700">
            {!user || user.isAnonymous ? (
              <div className="max-w-md mx-auto text-center py-12 md:py-16 border border-white/5 p-6 md:p-10 bg-zinc-900/20 shadow-2xl">
                 <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest mb-4">Кабінет Клієнта</h2>
                 <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-8 md:mb-10 leading-relaxed">
                   Увійдіть, щоб відстежувати замовлення та мати доступ до персональних налаштувань.
                 </p>
                 
                 {/* Email & Password Form */}
                 <form onSubmit={handleEmailAuth} className="space-y-4 mb-8 text-left">
                    {authError && (
                      <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        {authError}
                      </div>
                    )}
                    <div>
                      <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Електронна пошта</label>
                      <input 
                        type="email" 
                        value={authEmail} 
                        onChange={e => setAuthEmail(e.target.value)} 
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none transition-colors"
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Пароль</label>
                      <input 
                        type="password" 
                        value={authPassword} 
                        onChange={e => setAuthPassword(e.target.value)} 
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-sm focus:border-white outline-none transition-colors"
                        required 
                        minLength={6}
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-xl mt-2">
                      {isRegistering ? 'Зареєструватися' : 'Увійти'}
                    </button>
                 </form>

                 <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 mb-8 gap-4">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {isRegistering ? 'Вже є акаунт?' : 'Немає акаунта?'}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(!isRegistering)} 
                      className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:text-zinc-400 underline underline-offset-4"
                    >
                      {isRegistering ? 'Увійти' : 'Створити акаунт'}
                    </button>
                 </div>

                 {/* Google Login Divider */}
                 <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute border-t border-white/10 w-full"></div>
                    <span className="relative bg-[#0a0a0a] px-4 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500">Або</span>
                 </div>

                 {/* Google Login Button */}
                 <button 
                   onClick={handleGoogleLogin}
                   className="w-full py-4 border border-white/20 bg-transparent text-white font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4 active:scale-95"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24">
                     <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                     <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                     <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                     <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                   </svg>
                   через Google
                 </button>
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
                        <span>Вийти з акаунта</span>
                      </button>
                   </nav>
                </div>

                <div className="lg:col-span-2 space-y-8 md:space-y-12">
                   <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-center sm:text-left">Історія замовлень</h2>
                   
                   {(() => {
                      const myOrders = orders.filter(o => o.userId === user.uid).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                      
                      if (myOrders.length === 0) {
                         return (
                           <div className="space-y-6">
                              <div className="p-6 md:p-10 border border-white/5 bg-zinc-900/20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                                 <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                                    <History size={24} className="text-zinc-700" />
                                    <div>
                                       <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Замовлень поки немає</p>
                                       <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest">Ваша історія порожня</h4>
                                    </div>
                                 </div>
                                 <button onClick={() => navigate('catalog')} className="w-full md:w-auto px-8 py-4 border border-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                                    До покупок
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
                                        Замовлення #{order.id.slice(0, 8)} <span className="mx-1 md:mx-2">•</span> {new Date(order.createdAt).toLocaleDateString()}
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
          <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 animate-in fade-in duration-700 text-left">
            {(() => {
              const p = activeProducts.find(i => i.id === routeParams.id);
              if (!p) return <div className="py-40 text-center font-black uppercase tracking-widest col-span-1 lg:col-span-2">Товар не знайдено</div>;
              
              const colors = p.colors?.length > 0 ? p.colors : DEFAULT_COLORS;
              const activeColor = selectedColor || colors[0];
              const isSizeAvailable = p.sizes ? p.sizes[selectedSize] !== false : true;
              const inStockGlobal = p.inStock !== false;

              return (
                <>
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-zinc-900 overflow-hidden border border-white/5 relative group">
                      {!inStockGlobal && <div className="absolute top-4 left-4 z-10 bg-black/80 text-white text-[10px] font-black uppercase px-3 py-2 border border-white/10">Немає в наявності</div>}
                      <img src={p.images[activeImageIndex] || p.images[0] || 'https://via.placeholder.com/800'} className="w-full h-full object-cover transition-all duration-500" alt={p.name} />
                    </div>
                    {p.images && p.images.length > 1 && (
                      <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                        {p.images.map((img, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setActiveImageIndex(idx)} 
                            className={`snap-start w-16 h-20 md:w-20 md:h-24 shrink-0 bg-zinc-900 overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-white opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                          >
                            <img src={img} className="w-full h-full object-cover" alt={`${p.name} view ${idx + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col pt-4 md:pt-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest mb-3 md:mb-4 leading-none">{p.name}</h1>
                    
                    <div className="flex justify-between items-center mb-8 md:mb-12">
                      <p className="text-xl md:text-2xl font-bold text-zinc-400">{p.price} ₴</p>
                      <button onClick={() => toggleWishlist(p)} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                         <Heart size={18} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : ""} />
                         <span className="hidden sm:inline">{isInWishlist(p.id) ? 'У бажаному' : 'В бажане'}</span>
                      </button>
                    </div>
                    
                    {/* Color Selection */}
                    <div className="mb-8 md:mb-10">
                      <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 md:mb-6">Колір: {activeColor.label}</h4>
                      <div className="flex gap-4">
                        {colors.map((color, i) => {
                          const isSelected = activeColor.name === color.name && activeColor.hex === color.hex;
                          return (
                          <button
                            key={i}
                            onClick={() => { setSelectedColor(color); setActiveImageIndex(color.imageIndex || 0); }}
                            className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${isSelected ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-white/10 hover:border-white/50'}`}
                          >
                            <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                          </button>
                        )})}
                      </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-10 md:mb-12">
                      <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Розмір</h4>
                        <button onClick={() => setIsSizeGuideOpen(p)} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-white/20 hover:border-white transition-all flex items-center gap-2">
                          <Ruler size={14} /> Розмірна сітка
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
                       <p className="text-zinc-500 text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] leading-loose">Базовий елемент вашого гардеробу. Виконано з преміальних матеріалів за європейськими стандартами якості.</p>
                       <button onClick={() => addToCart(p)} disabled={!inStockGlobal || !isSizeAvailable} className={`w-full py-5 md:py-6 font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] transition-all flex items-center justify-center gap-3 md:gap-4 ${(inStockGlobal && isSizeAvailable) ? 'bg-white text-black hover:bg-zinc-200 active:scale-[0.98] shadow-[0_20px_40px_rgba(255,255,255,0.1)]' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                        <ShoppingBag size={18} /> {inStockGlobal ? (isSizeAvailable ? 'Додати у кошик' : 'Немає розміру') : 'Немає в наявності'}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* LEGAL PAGES */}
        {route === 'legal' && (
          <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-4xl mx-auto px-4 md:px-6 animate-in fade-in duration-500 text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-8 md:mb-12 leading-tight">
              {routeParams.type === 'privacy' && 'Політика конфіденційності'}
              {routeParams.type === 'terms' && 'Публічна оферта (Умови надання послуг)'}
              {routeParams.type === 'cookies' && 'Налаштування Cookies'}
              {routeParams.type === 'delivery' && 'Доставка та оплата'}
              {routeParams.type === 'returns' && 'Обмін та повернення'}
              {routeParams.type === 'contacts' && 'Контакти та Реквізити'}
            </h1>
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
                    <p>Ми не передаємо ваші дані третім особам, за винятком логістичних партнерів (ТОВ «Нова Пошта») для доставки та фінансових установ/платіжних систем (для обробки транзакцій Visa/Mastercard).</p>
                  </section>
                  <section>
                    <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">3. Захист даних</h3>
                    <p>Всі транзакції та особисті дані захищені протоколами шифрування (SSL). Фінансові дані карт не зберігаються на нашому сервері, а обробляються виключно на боці сертифікованого платіжного шлюзу (PCI DSS).</p>
                  </section>
                </div>
              )}

              {routeParams.type === 'terms' && (
                <div className="space-y-6 md:space-y-8">
                  <p>Цей договір є публічною офертою. Натискаючи кнопку "Оформити замовлення", ви погоджуєтесь з наступними умовами відповідно до ст. 633 Цивільного кодексу України.</p>
                  <section>
                    <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">1. Предмет договору</h3>
                    <p>Інтернет-магазин продає товари, представлені на сайті, а Покупець оплачує та приймає товари відповідно до умов цього Договору.</p>
                  </section>
                  <section>
                    <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">2. Оформлення замовлення</h3>
                    <p>Замовлення вважається прийнятим після підтвердження оплати на сайті через інтегровану платіжну систему. Продавець залишає за собою право скасувати замовлення у разі відсутності товару, повернувши кошти Покупцю у повному обсязі.</p>
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
                      <li>Товар не був у вжитку і не має слідів носіння (подряпин, плям, потертостей, запаху парфумів/прання).</li>
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
                      <li><strong>Телефон:</strong> +380 (XX) XXX-XX-XX (Для консультацій)</li>
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-white uppercase font-black tracking-widest mb-3 md:mb-4 text-sm md:text-base">Юридичні реквізити</h3>
                    <p className="text-[11px] md:text-xs text-zinc-500 uppercase tracking-widest leading-loose">
                      ФОП Слінявський Іван Леонідович<br/>
                      РНОКПП (ІПН): 3955107331<br/>
                      Юридична адреса: Україна, м. Кропивницький, вул. Михайла Грушевського, 57<br/>
                    </p>
                    <p className="mt-4 text-[9px] md:text-[10px] text-zinc-600">
                      *Юридична адреса є обов'язковою вимогою банків для підключення еквайрингу.
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
          </div>
        )}

        {/* ADMIN ROUTE */}
        {route === 'admin' && user?.email === ADMIN_EMAIL && (
          <div className="pt-32 md:pt-48 pb-20 md:pb-32 max-w-7xl mx-auto px-4 md:px-6 animate-in fade-in duration-700">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-8 md:mb-12 text-[#d4af37]">Панель Адміністратора</h1>
            
            {/* Admin Tabs Navigation */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-8 md:mb-12 border-b border-white/10 snap-x">
              {[
                { id: 'orders', label: 'Замовлення', icon: <Package size={16} /> },
                { id: 'products', label: 'Товари', icon: <Box size={16} /> },
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
                <section className="animate-in fade-in duration-500">
                  
                  {/* ORDERS FILTER */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-black/50 p-4 border border-white/10 shadow-xl">
                    <div className="flex-1 w-full">
                       <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Фільтр за статусом</label>
                       <select value={orderFilterStatus} onChange={e=>setOrderFilterStatus(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-[10px] uppercase font-black outline-none focus:border-white transition-colors cursor-pointer">
                          <option value="all">Всі статуси</option>
                          {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {orders
                      .filter(o => o.status !== 'pending_payment')
                      .filter(o => orderFilterStatus === 'all' || o.status === orderFilterStatus)
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map(order => (
                      <div key={order.id} className="border border-white/10 p-4 md:p-6 bg-zinc-900/40 shadow-xl flex flex-col">
                         <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                            <div className="w-full">
                               <h4 className="font-black text-[#d4af37] mb-2 uppercase tracking-widest text-xs md:text-sm break-words">Замовлення #{order.id.slice(0,8)}</h4>
                               <p className="text-[9px] md:text-[10px] text-zinc-400 uppercase tracking-widest mb-3">{new Date(order.createdAt).toLocaleString()}</p>
                               <p className="text-[11px] md:text-xs font-bold mb-1 break-words">👤 {order.customer.name} <span className="text-zinc-500 mx-1 md:mx-2">|</span> 📞 {order.customer.phone}</p>
                               <p className="text-[11px] md:text-xs text-zinc-400 break-words mb-2">📍 {order.customer.city}, Відділення: {order.customer.branch}</p>
                               <div className="flex flex-wrap gap-2 mt-2">
                                 {order.referralCode && (
                                   <p className="inline-block px-3 py-1 bg-white/10 text-[#d4af37] text-[9px] font-black uppercase tracking-widest rounded-sm border border-[#d4af37]/30 break-all">Реферал: {order.referralCode}</p>
                                 )}
                               </div>
                            </div>
                            <div className="text-left lg:text-right flex flex-col lg:items-end w-full lg:w-auto mt-4 lg:mt-0">
                               <p className="text-lg md:text-xl font-black mb-3">{order.total} ₴</p>
                               <select 
                                 value={order.status}
                                 onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                 className={`w-full lg:w-auto bg-black border border-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest py-3 px-4 outline-none focus:border-white transition-colors cursor-pointer ${STATUS_MAP[order.status]?.color || 'text-white'}`}
                               >
                                 {Object.entries(STATUS_MAP).map(([val, {label}]) => (
                                   <option key={val} value={val} className="bg-black text-white">{label}</option>
                                 ))}
                               </select>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-white/5 space-y-3 w-full">
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Придбані товари:</p>
                            {order.items.map((item, idx) => (
                               <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs border-b border-white/5 pb-3">
                                 <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/100'} className="w-10 h-12 md:w-8 md:h-10 object-cover bg-zinc-900 border border-white/10 shrink-0" alt="" />
                                    <span className="font-bold flex-1 break-words">{item.name} <span className="text-zinc-500 font-normal">({item.selectedColor}, {item.selectedSize})</span></span>
                                 </div>
                                 <div className="text-left sm:text-right w-full sm:w-auto bg-white/5 sm:bg-transparent p-2 sm:p-0 flex justify-between sm:block">
                                    <span className="text-zinc-400 sm:mr-4">Кількість: x{item.quantity}</span>
                                    <span className="font-black text-white">{item.price * item.quantity} ₴</span>
                                 </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    ))}
                    {orders.filter(o => o.status !== 'pending_payment' && (orderFilterStatus === 'all' || o.status === orderFilterStatus)).length === 0 && (
                      <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center py-10">Замовлень не знайдено</p>
                    )}
                  </div>
                </section>
              )}

              {/* --- PRODUCTS TAB --- */}
              {adminTab === 'products' && (
                <section className="animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">Каталог</h2>
                    <button onClick={() => { setEditingProduct({}); setEditForm({ name: '', price: '', category: activeCategories[0] || 'Категорія', images: '', sizeGuide: DEFAULT_SIZE_GUIDE, isVisible: true, inStock: true, colors: DEFAULT_COLORS, sizes: DEFAULT_SIZES_AVAILABILITY }); }} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 border border-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
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

                        {/* Colors Settings */}
                        <div className="md:col-span-2 border border-white/10 p-4 bg-black/50 space-y-4">
                           <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Кольори товару</h4>
                           {(editForm.colors || []).map((c, idx) => (
                             <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center border-b border-white/10 pb-4 sm:border-none sm:pb-0">
                               <input type="text" placeholder="Назва (Eng)" value={c.name} onChange={e => { const nc=[...editForm.colors]; nc[idx].name=e.target.value; setEditForm({...editForm, colors:nc}) }} className="bg-black border border-white/10 p-3 text-xs w-full sm:flex-1 outline-none focus:border-white" />
                               <input type="text" placeholder="Лейбл (Укр)" value={c.label} onChange={e => { const nc=[...editForm.colors]; nc[idx].label=e.target.value; setEditForm({...editForm, colors:nc}) }} className="bg-black border border-white/10 p-3 text-xs w-full sm:flex-1 outline-none focus:border-white" />
                               <input type="color" value={c.hex} onChange={e => { const nc=[...editForm.colors]; nc[idx].hex=e.target.value; setEditForm({...editForm, colors:nc}) }} className="h-10 w-full sm:w-16 bg-black border border-white/10 cursor-pointer" />
                               <input type="number" min="0" placeholder="№ Фото" title="Індекс фото (0 = перше)" value={c.imageIndex} onChange={e => { const nc=[...editForm.colors]; nc[idx].imageIndex=Number(e.target.value); setEditForm({...editForm, colors:nc}) }} className="bg-black border border-white/10 p-3 text-xs w-full sm:w-24 outline-none focus:border-white" />
                               <button type="button" onClick={() => { const nc=editForm.colors.filter((_,i)=>i!==idx); setEditForm({...editForm, colors:nc}); }} className="text-red-500 p-3 border border-red-500/30 hover:bg-red-500 hover:text-white w-full sm:w-auto flex justify-center transition-colors"><Trash2 size={16}/></button>
                             </div>
                           ))}
                           <button type="button" onClick={() => setEditForm({...editForm, colors: [...(editForm.colors || []), {name:'New', hex:'#888888', label:'Новий', imageIndex:0}]})} className="text-[9px] md:text-[10px] uppercase font-black tracking-widest px-6 py-3 border border-white/20 hover:bg-white hover:text-black mt-2 w-full sm:w-auto transition-colors">+ Додати колір</button>
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
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-2">📸 Вимоги до фотографій</h4>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 leading-relaxed">
                              Для ідеального вигляду карток товару завантажуйте строго <strong>вертикальні фото (пропорція 3:4)</strong>.<br/>
                              Ідеальний розмір: <span className="text-white">800x1067 px</span> або <span className="text-white">1200x1600 px</span>.
                            </p>
                          </div>
                          
                          <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Завантажити фото з пристрою</label>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={isUploadingFile}
                            className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer mb-2 transition-colors"
                          />
                          {isUploadingFile && <p className="text-[10px] font-bold text-yellow-500 animate-pulse mt-2">Завантаження файлів у хмару. Зачекайте...</p>}
                          
                          <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-6 mb-2">Або посилання на фото (кожне з нового рядка)</label>
                          <textarea value={editForm.images} onChange={e => setEditForm({...editForm, images: e.target.value})} rows={4} className="w-full bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none mt-4" placeholder="https://image1.jpg&#10;https://image2.jpg" />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-2">Індивідуальна розмірна сітка</label>
                          <p className="text-[8px] text-zinc-500 mb-2">Формат CSV: Рядок 1 - Заголовки, далі Дані.</p>
                          <textarea value={editForm.sizeGuide} onChange={e => setEditForm({...editForm, sizeGuide: e.target.value})} rows={6} className="w-full bg-black border border-white/10 px-4 py-3 text-xs focus:border-white outline-none font-mono text-zinc-300" placeholder={DEFAULT_SIZE_GUIDE} />
                        </div>
                      </div>
                      
                      {/* КНОПКА СОХРАНЕНИЯ */}
                      <button type="button" onClick={handleSaveProduct} className="w-full py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-all flex justify-center items-center">
                        Крок 2. ЗБЕРЕГТИ ТОВАР
                      </button>
                    </div>
                  )}

                  {dbProducts.length === 0 && !editingProduct ? (
                     <div className="text-center py-20 text-zinc-500 uppercase font-black tracking-widest text-xs border border-dashed border-white/20">Товарів ще немає. Додайте перший товар!</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {dbProducts.map(p => (
                        <div key={p.id} className={`border border-white/5 bg-zinc-900/20 p-4 relative group ${p.isVisible === false ? 'opacity-50' : ''}`}>
                          <div className="aspect-[3/4] overflow-hidden mb-4"><img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover opacity-70" alt={p.name} /></div>
                          <h4 className="font-bold uppercase tracking-widest text-[10px] md:text-[11px] mb-1 truncate">{p.name}</h4>
                          <p className="text-zinc-500 text-[10px] mb-2">{p.price} ₴ | {p.category}</p>
                          <p className="text-zinc-500 text-[9px] mb-4 uppercase tracking-widest">{p.inStock === false ? 'Немає в наявності' : 'В наявності'}</p>
                          <div className="flex gap-2 w-full">
                            <button onClick={() => { setEditingProduct(p); setEditForm({ name: p.name, price: p.price, category: p.category, images: p.images ? p.images.join('\n') : '', sizeGuide: p.sizeGuide || DEFAULT_SIZE_GUIDE, isVisible: p.isVisible !== false, inStock: p.inStock !== false, colors: p.colors || DEFAULT_COLORS, sizes: p.sizes || DEFAULT_SIZES_AVAILABILITY }); }} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest hover:border-white transition-colors flex justify-center w-full"><Edit size={14}/></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 py-3 border border-white/20 text-[9px] font-black uppercase tracking-widest text-red-500 hover:border-red-500 transition-colors flex justify-center w-full"><Trash2 size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* --- REFERRALS TAB --- */}
              {adminTab === 'referrals' && (
                <section className="animate-in fade-in duration-500 space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    
                    {/* Create New Referral */}
                    <div className="lg:col-span-1 border border-white/10 p-4 md:p-6 bg-zinc-900/20 h-fit w-full">
                      <h3 className="font-black uppercase tracking-widest text-sm mb-4">Створити реферала</h3>
                      <form onSubmit={handleAddReferral} className="space-y-4">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">ПІБ або Нікнейм партнера</label>
                          <input 
                            type="text" 
                            required 
                            value={newReferralName} 
                            onChange={e => setNewReferralName(e.target.value)}
                            placeholder="Наприклад: Ivan Ivanov"
                            className="w-full bg-black/50 border border-white/10 px-4 py-3 text-sm focus:border-white outline-none"
                          />
                        </div>
                        <button type="submit" className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all flex justify-center items-center gap-2">
                          <LinkIcon size={14} /> Згенерувати посилання
                        </button>
                      </form>

                      {/* CALCULATE SUM BY MONTH (USING FULL DATE PICKER) */}
                      <div className="mt-8 pt-8 border-t border-white/10">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] mb-4">Підрахунок суми за місяць</h4>
                         <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Оберіть будь-яку дату (порахує за весь її місяць)</label>
                         <input 
                            type="date" 
                            value={refCalcDate}
                            onChange={e => setRefCalcDate(e.target.value)}
                            className="w-full bg-black border border-white/10 px-4 py-3 text-sm focus:border-white outline-none mb-4 text-white [color-scheme:dark] cursor-pointer"
                         />
                         {(() => {
                           if (!refFilterPartner || !refCalcDate) return null;
                           
                           // Отримуємо "YYYY-MM" з обраної дати
                           const targetMonth = refCalcDate.slice(0, 7);
                           
                           const calcOrders = orders.filter(o => 
                             o.referralCode === refFilterPartner && 
                             o.createdAt.startsWith(targetMonth) && 
                             o.status !== 'cancelled' && 
                             o.status !== 'pending_payment'
                           );
                           const calcSum = calcOrders.reduce((sum, o) => sum + o.total, 0);
                           return (
                             <div className="bg-black/50 border border-white/10 p-4 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Загальний дохід за {targetMonth}</p>
                                <p className="text-2xl font-black text-green-400">{calcSum} ₴</p>
                                <p className="text-[8px] text-zinc-600 mt-2 uppercase tracking-widest">({calcOrders.length} успішних замовлень)</p>
                             </div>
                           )
                         })()}
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
                            <div className="w-full">
                              <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Партнер</label>
                              <select 
                                value={refFilterPartner} 
                                onChange={e => setRefFilterPartner(e.target.value)}
                                className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none"
                              >
                                {referrals.map(r => (
                                  <option key={r.id} value={r.code}>{r.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full">
                              <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Статус</label>
                              <select 
                                value={refFilterStatus} 
                                onChange={e => setRefFilterStatus(e.target.value)}
                                className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none"
                              >
                                <option value="all">Всі статуси</option>
                                {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                              </select>
                            </div>
                            
                            {/* Оновлене зручне меню вибору дат */}
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
                                  className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer"
                                />
                                <span className="text-zinc-500 font-bold">-</span>
                                <input 
                                  type="date" 
                                  value={refFilterDateTo}
                                  onChange={e => setRefFilterDateTo(e.target.value)}
                                  className="w-full bg-black border border-white/10 px-3 py-3 text-xs focus:border-white outline-none text-white [color-scheme:dark] cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          {(() => {
                            const selectedRef = referrals.find(r => r.code === refFilterPartner);
                            const refLink = selectedRef ? `${window.location.origin}?ref=${selectedRef.code}` : '';
                            
                            // Filter orders
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
                                  <div className="bg-black/50 border border-white/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                                    <div className="overflow-hidden w-full">
                                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Унікальне посилання партнера</p>
                                      <input readOnly value={refLink} className="w-full bg-transparent text-[10px] md:text-xs text-[#d4af37] font-mono outline-none truncate" />
                                    </div>
                                    <button onClick={() => copyToClipboard(refLink)} className="px-4 py-3 sm:py-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-[9px] font-black uppercase tracking-widest flex justify-center items-center gap-2 shrink-0 w-full sm:w-auto">
                                      <Copy size={12}/> Копіювати
                                    </button>
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
                <section className="animate-in fade-in duration-500 space-y-8 max-w-2xl w-full">
                  
                  <div className="border border-white/10 p-4 md:p-8 bg-zinc-900/20 w-full">
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-widest mb-6">Головне фото сайту (Hero Image)</h2>
                    
                    <div className="flex flex-col gap-4 w-full">
                      
                      {/* ЗАГРУЗКА ДЛЯ ПК */}
                      <div className="border border-white/10 p-4 bg-black/50">
                        <label className="block text-[10px] font-black uppercase mb-2">Для комп'ютера (Точний розмір: 1920x1080)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleHeroUpload(e, 'desktop')}
                          disabled={isUploadingFile}
                          className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer mb-2 transition-colors"
                        />
                        {settingsFormUrl || siteSettings.heroImage ? (
                          <img src={settingsFormUrl || siteSettings.heroImage} alt="Preview PC" className="w-full h-48 md:h-64 object-cover border border-white/10 mt-2 opacity-80" />
                        ) : null}
                      </div>
                      
                      {/* ЗАГРУЗКА ДЛЯ ТЕЛЕФОНА */}
                      <div className="border border-white/10 p-4 bg-black/50">
                        <label className="block text-[10px] font-black uppercase mt-2 mb-2">Для телефону (Точний розмір: 1080x1920)</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleHeroUpload(e, 'mobile')}
                          disabled={isUploadingFile}
                          className="w-full text-xs text-zinc-500 file:mr-4 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-white file:text-black hover:file:bg-zinc-200 cursor-pointer mb-2 transition-colors"
                        />
                        {settingsFormUrlMobile || siteSettings.heroImageMobile ? (
                          <img src={settingsFormUrlMobile || siteSettings.heroImageMobile} alt="Preview Mobile" className="w-full max-w-[200px] h-64 object-cover border border-white/10 mt-2 opacity-80" />
                        ) : null}
                      </div>

                      {isUploadingFile && <p className="text-[10px] font-bold text-yellow-500 animate-pulse mt-2">Завантаження файлу в базу...</p>}

                      <div className="mt-8 border-t border-white/10 pt-6">
                        <label className="block text-[10px] font-black uppercase mb-4 text-[#d4af37]">Керування категоріями товарів</label>
                        <p className="text-[8px] text-zinc-500 mb-6 uppercase tracking-widest">Натисніть на категорію, щоб додати або видалити її з сайту. Активні категорії світяться білим.</p>

                        {/* Верхній одяг */}
                        <div className="mb-6">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Верхній одяг</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Футболка', 'Рубашка', 'Свитшот', 'Худи', 'Толстовка', 'Джемпер', 'Жилет', 'Свитер', 'Пиджак', 'Куртка', 'Пальто', 'Ветровка'].map(cat => {
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

                        {/* Низ */}
                        <div className="mb-6">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Одяг для ніг (Низ)</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Брюки', 'Джинсы', 'Штаны', 'Шорты'].map(cat => {
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

                        {/* Головні убори та аксесуари */}
                        <div className="mb-6">
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Головні убори та аксесуари</h4>
                          <div className="flex flex-wrap gap-2">
                            {['Шапка', 'Кепка', 'Шляпа', 'Шарф', 'Перчатки', 'Ремень'].map(cat => {
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

                        {/* Custom / Ручне введення */}
                        <div>
                           <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Власні категорії (ручне введення через кому)</h4>
                           <textarea
                            value={settingsCategories}
                            onChange={e => setSettingsCategories(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs focus:border-white outline-none transition-colors h-16"
                            placeholder="Інші категорії..."
                          />
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
      <footer className="bg-black border-t border-white/5 pt-20 md:pt-32 pb-10 md:pb-16 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16 md:mb-20">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black tracking-tighter uppercase mb-6 md:mb-8 text-white">SLINIAVSKIY</h2>
              <div className="mt-2 md:mt-8 flex flex-col gap-4">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-white">Соцмережі</h4>
                <div className="flex gap-6">
                  <a href="https://t.me/sliniavskiybrand" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><TelegramIcon size={20} /></a>
                  <a href="https://www.instagram.com/sliniavskiy.brand?igsh=MWM4eWFxMmN3d2s1aA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Instagram size={20} /></a>
                  <a href="https://www.youtube.com/@sliniavskiybrand" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><Youtube size={20} /></a>
                  <a href="https://www.tiktok.com/@sliniavskiy.brand?_r=1&_t=ZN-94f8xxnwgv0" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors"><TikTokIcon size={20} /></a>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">Клієнтам</h4>
              <ul className="space-y-4 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                <li><button onClick={() => navigate('legal', {type: 'delivery'})} className="hover:text-white transition-colors">Доставка та оплата</button></li>
                <li><button onClick={() => navigate('legal', {type: 'returns'})} className="hover:text-white transition-colors">Обмін та повернення</button></li>
                <li><button onClick={() => navigate('legal', {type: 'terms'})} className="hover:text-white transition-colors">Публічна оферта</button></li>
                <li><button onClick={() => navigate('legal', {type: 'privacy'})} className="hover:text-white transition-colors">Політика конфіденційності</button></li>
              </ul>
            </div>
            <div className="flex flex-col">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">Інформація</h4>
              <ul className="space-y-4 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                <li><button onClick={() => navigate('legal', {type: 'contacts'})} className="hover:text-white transition-colors">Контакти та реквізити</button></li>
                <li><button onClick={() => navigate('legal', {type: 'cookies'})} className="hover:text-white transition-colors">Налаштування Cookies</button></li>
              </ul>
            </div>
            <div className="flex flex-col items-start lg:-ml-12 xl:-ml-36">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white">Підтримка</h4>
              <p className="text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest break-all hover:text-white cursor-pointer transition-colors text-left mb-6">sliniavskiy.support@gmail.com</p>
              
              {/* Іконки платіжних систем (Красивий шрифт) */}
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
          
          {/* Очищений підвал згідно закону */}
          <div className="pt-8 md:pt-10 border-t border-white/5 flex flex-col justify-center items-center">
            <p className="text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-center mb-2">© {new Date().getFullYear()} SLINIAVSKIY BRAND. ВСІ ПРАВА ЗАХИЩЕНО.</p>
            <div className="flex gap-4 text-zinc-800 text-[8px] uppercase font-bold tracking-widest">
               <button onClick={() => navigate('legal', {type: 'terms'})} className="hover:text-zinc-500 transition-colors">Публічна оферта</button>
               <span>|</span>
               <button onClick={() => navigate('legal', {type: 'privacy'})} className="hover:text-zinc-500 transition-colors">Політика конфіденційності</button>
            </div>
          </div>
        </div>
      </footer>

      {/* COOKIE CONSENT BANNER */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 w-full z-[500] bg-[#0a0a0a] border-t border-white/10 p-4 sm:p-6 md:p-10 animate-in slide-in-from-bottom duration-700 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
            <div className="text-left max-w-2xl">
              <h4 className="text-white font-black uppercase tracking-widest text-sm md:text-lg mb-2">Ми використовуємо Cookies</h4>
              <p className="text-zinc-500 text-[10px] md:text-xs font-medium leading-relaxed uppercase tracking-wider">Ми використовуємо файли cookie для покращення роботи сайту. Ви можете прийняти всі файли, відхилити необов'язкові або змінити налаштування.</p>
            </div>
            <div className="flex flex-wrap lg:flex-nowrap gap-3 md:gap-4 shrink-0 w-full lg:w-auto">
              <button onClick={() => handleCookieAction('declined')} className="flex-1 lg:flex-none px-4 py-3 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white transition-all text-center">Відхилити</button>
              <button onClick={() => handleCookieAction('settings')} className="flex-1 lg:flex-none px-4 py-3 border border-white text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-center">Налаштувати</button>
              <button onClick={() => handleCookieAction('accepted')} className="w-full lg:w-auto px-6 py-3 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all text-center">Прийняти все</button>
            </div>
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (() => {
        const sizeGuideText = isSizeGuideOpen.sizeGuide || DEFAULT_SIZE_GUIDE;
        const rows = sizeGuideText.split('\n').filter(r => r.trim()).map(r => r.split(','));
        const header = rows[0] || [];
        const body = rows.slice(1);

        return (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
             <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsSizeGuideOpen(null)} />
             <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-2xl p-6 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={() => setIsSizeGuideOpen(null)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-500 hover:text-white p-2"><X size={20} className="md:w-6 md:h-6"/></button>
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-widest mb-6 md:mb-10 text-left pr-8">Розмірна сітка</h2>
                <div className="overflow-x-auto no-scrollbar">
                   <table className="w-full text-left text-[9px] md:text-[11px] font-bold uppercase tracking-widest min-w-[300px]">
                     <thead className="text-zinc-600 border-b border-white/5">
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
           <div className="max-w-7xl mx-auto w-full flex flex-col pt-10 md:pt-0">
              <div className="flex justify-between items-center mb-8 md:mb-16">
                 <h2 className="text-xl md:text-4xl font-black uppercase tracking-[0.2em]">Пошук</h2>
                 <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:rotate-90 transition-transform duration-300"><X size={32} className="md:w-10 md:h-10" strokeWidth={1}/></button>
              </div>
              <input autoFocus type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Що ви шукаєте?" className="w-full bg-transparent border-b-2 border-white/10 py-4 md:py-8 text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter outline-none focus:border-white transition-colors" />
              {searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-12 mt-8 md:mt-10">
                  {searchResults.map(p => (
                    <div key={p.id} onClick={() => navigate('product', {id: p.id})} className="cursor-pointer group text-left relative">
                      <div className="aspect-[3/4] bg-zinc-900 overflow-hidden mb-3 md:mb-6 border border-white/5 relative">
                        <img src={p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover md:group-hover:scale-105 transition-all duration-700 opacity-80" />
                        <button onClick={(e) => toggleWishlist(p, e)} className="absolute top-2 right-2 md:top-3 md:right-3 z-20 p-2 bg-black/50 rounded-full hover:bg-white hover:text-black transition-colors backdrop-blur-md opacity-100 md:opacity-0 md:group-hover:opacity-100">
                          <Heart size={14} fill={isInWishlist(p.id) ? "currentColor" : "none"} className={isInWishlist(p.id) ? "text-white" : "text-white/50"} />
                        </button>
                      </div>
                      <h5 className="font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-1 md:mb-2 truncate">{p.name}</h5>
                      <p className="text-zinc-500 font-bold text-[9px] md:text-[10px]">{p.price} ₴</p>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      )}

      {/* WISHLIST OVERLAY */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[300] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)} />
          <div className="absolute top-0 right-0 w-full sm:w-full md:max-w-md h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col p-6 md:p-10 animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-8 md:mb-12">
               <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">Список бажань</h2>
               <button onClick={() => setIsWishlistOpen(false)} className="hover:opacity-50 transition-opacity p-2"><X size={20} className="md:w-6 md:h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
               {wishlist.length === 0 ? <div className="text-center py-20 text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Список порожній</div> :
                 wishlist.map((item, idx) => (
                   <div key={idx} className="flex gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5 cursor-pointer group" onClick={() => { setIsWishlistOpen(false); navigate('product', { id: item.id }); }}>
                      <div className="w-16 h-20 md:w-20 md:h-24 bg-zinc-900 overflow-hidden border border-white/5 shrink-0">
                        <img src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/400'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 text-left flex flex-col justify-center">
                         <h4 className="text-[9px] md:text-[10px] font-black uppercase mb-1 tracking-widest line-clamp-2">{item.name}</h4>
                         <p className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2 md:mb-3">{item.category}</p>
                         <div className="flex items-center justify-between mt-auto">
                            <p className="text-xs md:text-sm font-black">{item.price} ₴</p>
                            <button onClick={(e) => toggleWishlist(item, e)} className="text-zinc-600 hover:text-red-500 transition-colors p-2 -mr-2"><Trash2 size={14}/></button>
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
        <div className="fixed inset-0 z-[300] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsCartOpen(false); setIsCheckoutForm(false); setCheckoutStep(1); }} />
          <div className="absolute top-0 right-0 w-full sm:w-full md:max-w-md h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col p-6 md:p-10 animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-8 md:mb-12">
               <h2 className="text-lg md:text-xl font-black uppercase tracking-widest">
                 {isCheckoutForm ? (checkoutStep === 1 ? 'Оформлення' : 'Оплата') : 'Кошик'}
               </h2>
               <button onClick={() => { setIsCartOpen(false); setIsCheckoutForm(false); setCheckoutStep(1); }} className="hover:opacity-50 transition-opacity p-2"><X size={20} className="md:w-6 md:h-6"/></button>
            </div>

            {isCheckoutForm ? (
               checkoutStep === 1 ? (
                 <form onSubmit={handleOrderSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-4 text-left flex flex-col pb-32">
                    <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Дані доставки (Нова Пошта)</h3>
                    <input required type="text" placeholder="ПІБ" value={deliveryForm.name} onChange={e => setDeliveryForm({...deliveryForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors" />
                    <input required type="tel" placeholder="Номер телефону" value={deliveryForm.phone} onChange={e => setDeliveryForm({...deliveryForm, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors" />
                    
                    {/* РОЗУМНИЙ ПОШУК МІСТА */}
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        placeholder="Місто (почніть вводити...)" 
                        value={deliveryForm.city} 
                        onChange={e => fetchNpCities(e.target.value)} 
                        onFocus={() => { if(npCities.length > 0) setShowCities(true); }}
                        onBlur={() => setTimeout(() => setShowCities(false), 200)}
                        className="w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors" 
                      />
                      {isNpLoading && !showWarehouses && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                      {showCities && npCities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 max-h-48 overflow-y-auto shadow-2xl">
                          {npCities.map(city => (
                            <div key={city.Ref} onClick={() => selectNpCity(city)} className="px-4 py-3 text-xs md:text-sm hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                              {city.Description} <span className="text-[10px] text-zinc-500">({city.AreaDescription} обл.)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* РОЗУМНИЙ ПОШУК ВІДДІЛЕННЯ */}
                    <div className="relative">
                      <input 
                        required 
                        type="text" 
                        placeholder={deliveryForm.cityRef ? "Відділення або поштомат..." : "Спочатку оберіть місто"} 
                        value={deliveryForm.branch} 
                        onChange={e => fetchNpWarehouses(e.target.value)} 
                        onFocus={() => { if(npWarehouses.length > 0) setShowWarehouses(true); else if(deliveryForm.cityRef) fetchNpWarehouses(''); }}
                        onBlur={() => setTimeout(() => setShowWarehouses(false), 200)}
                        disabled={!deliveryForm.cityRef}
                        className={`w-full bg-black/50 border border-white/10 px-4 py-3 md:py-4 text-xs md:text-sm focus:border-white outline-none transition-colors ${!deliveryForm.cityRef ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      />
                      {showWarehouses && npWarehouses.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-[#111] border border-white/10 max-h-48 overflow-y-auto shadow-2xl">
                          {npWarehouses.map(wh => (
                            <div key={wh.Ref} onClick={() => selectNpWarehouse(wh)} className="px-4 py-3 text-[10px] md:text-xs hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors leading-relaxed">
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
                          Я погоджуюсь з <button type="button" onClick={() => { setIsCartOpen(false); navigate('legal', {type: 'terms'}); }} className="underline">Умовами надання послуг</button> та <button type="button" onClick={() => { setIsCartOpen(false); navigate('legal', {type: 'privacy'}); }} className="underline">Політикою конфіденційності</button> (обов'язково)
                        </span>
                      </label>
                    </div>

                    <div className="mt-auto pt-6 md:pt-8 space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center mb-2 md:mb-4">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">До сплати</span>
                        <span className="text-lg md:text-xl font-black">{cartTotal} ₴</span>
                      </div>
                      <button type="submit" className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-colors flex justify-center items-center gap-2 active:scale-95">
                        <CreditCard size={16} /> Перейти до оплати
                      </button>
                      <button type="button" onClick={() => setIsCheckoutForm(false)} className="w-full py-3 md:py-4 text-zinc-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-white transition-colors">Назад до кошика</button>
                    </div>
                 </form>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                    <ShieldCheck size={48} className="text-zinc-500 mb-6 md:mb-8 md:w-16 md:h-16" />
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4">Оплата онлайн</h3>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 leading-relaxed mb-8 md:mb-12">
                      Безпечний платіжний шлюз.<br/>
                      <span className="text-[#d4af37] mt-2 block">Інтеграція MonoPay</span>
                    </p>
                    
                    <div className="w-full space-y-3 md:space-y-4 mt-auto">
                      <div className="p-4 border border-white/10 bg-white/5 flex justify-between items-center mb-6 md:mb-8">
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">До сплати</span>
                        <span className="text-base md:text-lg font-black text-white">{cartTotal} ₴</span>
                      </div>
                      <button onClick={handleMonoPayPayment} className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-colors active:scale-95">
                        Оплатити замовлення
                      </button>
                      <button onClick={() => setCheckoutStep(1)} className="w-full py-3 md:py-4 text-zinc-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-white transition-colors">
                        Назад до деталей доставки
                      </button>
                    </div>
                 </div>
               )
            ) : (
               <>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 md:space-y-8">
                     {cart.length === 0 ? <div className="text-center py-20 text-zinc-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Кошик порожній</div> :
                       cart.map((item, idx) => {
                         const realProduct = activeProducts.find(p => p.id === item.id);
                         const realPrice = realProduct ? realProduct.price : 0;
                         return (
                           <div key={idx} className="flex gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5">
                              <div className="w-16 h-20 md:w-20 md:h-24 bg-zinc-900 overflow-hidden border border-white/5 shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                              <div className="flex-1 text-left flex flex-col justify-between">
                                 <div>
                                   <h4 className="text-[9px] md:text-[10px] font-black uppercase mb-1 tracking-widest line-clamp-2">{item.name}</h4>
                                   <p className="text-[8px] md:text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1 md:mb-2">{item.selectedSize} / {item.selectedColor}</p>
                                   <p className="text-xs md:text-sm font-black">{realPrice * item.quantity} ₴</p>
                                 </div>
                                 <div className="flex items-center gap-3 md:gap-4 mt-2">
                                    <button onClick={() => updateQuantity(item.cartId, -1)} className="text-lg md:text-[14px] font-black text-zinc-500 hover:text-white transition-colors p-1 md:p-0 w-6 h-6 flex items-center justify-center">-</button>
                                    <span className="text-[9px] md:text-[10px] font-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.cartId, 1)} className="text-lg md:text-[14px] font-black text-zinc-500 hover:text-white transition-colors p-1 md:p-0 w-6 h-6 flex items-center justify-center">+</button>
                                    <button onClick={() => removeItem(item.cartId)} className="ml-auto text-zinc-600 hover:text-red-500 transition-colors p-2 -mr-2"><Trash2 size={14}/></button>
                                 </div>
                              </div>
                           </div>
                         )
                       })
                     }
                  </div>
                  {cart.length > 0 && (
                     <div className="mt-auto pt-6 md:pt-10 border-t border-white/5">
                        <div className="flex justify-between items-center mb-6 md:mb-8"><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Загальна сума</span><span className="text-lg md:text-xl font-black">{cartTotal} ₴</span></div>
                        <button onClick={() => setIsCheckoutForm(true)} className="w-full py-4 md:py-5 bg-white text-black font-black uppercase text-[10px] md:text-[11px] tracking-widest hover:bg-zinc-200 transition-colors active:scale-95">Оформити замовлення</button>
                     </div>
                  )}
               </>
            )}
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-[1000] bg-black p-6 md:p-10 flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-end mb-12 md:mb-20"><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2"><X size={32}/></button></div>
            <nav className="flex flex-col gap-8 md:gap-10">
               <button onClick={() => { setIsMobileMenuOpen(false); navigate('catalog'); }} className="text-3xl md:text-4xl font-black uppercase tracking-widest text-left hover:text-[#d4af37] transition-colors">Колекція</button>
               <button onClick={() => { setIsMobileMenuOpen(false); navigate('brand'); }} className="text-3xl md:text-4xl font-black uppercase tracking-widest text-left hover:text-[#d4af37] transition-colors">Бренд</button>
               {isAdmin && <button onClick={() => { setIsMobileMenuOpen(false); navigate('admin'); }} className="text-xl md:text-2xl text-[#d4af37] font-black uppercase tracking-widest text-left mt-8 border-t border-white/10 pt-8">Панель Адміністратора</button>}
            </nav>
         </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-white text-black px-6 md:px-8 py-3 md:py-4 font-black uppercase text-[8px] md:text-[10px] tracking-[0.3em] shadow-2xl animate-in slide-in-from-bottom-5 duration-300 text-center w-[90%] md:w-auto rounded-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
