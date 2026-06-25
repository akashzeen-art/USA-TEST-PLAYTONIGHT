import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Checkout.css';
import { getProductDetails, saveUserDataProduct, initiateCheckout, initiateS2SCheckout, checkTransactionStatus, isAndroidDevice, generateClickid } from '../utils/productApi';
import { formatPrice } from '../utils/priceFormatter';
import {
  sanitizeTelInput,
  validateCheckoutPhone,
  defaultCountryFromProduct,
  phoneDigitsForApi,
} from '../../utils/phoneValidation';

// Global popup state context
const PopupStateContext = createContext<{
  hasManualPopupOpened: boolean;
  setHasManualPopupOpened: (value: boolean) => void;
  isManualPopupOpen: boolean;
  setIsManualPopupOpen: (value: boolean) => void;
  isAnyPopupVisible: boolean;
  setIsAnyPopupVisible: (value: boolean) => void;
}>({ 
  hasManualPopupOpened: false, 
  setHasManualPopupOpened: () => {}, 
  isManualPopupOpen: false, 
  setIsManualPopupOpen: () => {},
  isAnyPopupVisible: false,
  setIsAnyPopupVisible: () => {}
});

// Provider component
export const PopupStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasManualPopupOpened, setHasManualPopupOpened] = useState(false);
  const [isManualPopupOpen, setIsManualPopupOpen] = useState(false);
  const [isAnyPopupVisible, setIsAnyPopupVisible] = useState(false);
  return (
    <PopupStateContext.Provider value={{ 
      hasManualPopupOpened, 
      setHasManualPopupOpened, 
      isManualPopupOpen, 
      setIsManualPopupOpen,
      isAnyPopupVisible,
      setIsAnyPopupVisible
    }}>
      {children}
    </PopupStateContext.Provider>
  );
};

// Hook to use popup state
export const usePopupState = () => useContext(PopupStateContext);

// ── S2S UPI Payment Screen ───────────────────────────────────────────────────
interface S2SPaymentScreenProps {
  intentUrl: string;
  processingUrl: string;
  successUrl: string;
  onCancel: () => void;
}

const S2SPaymentScreen: React.FC<S2SPaymentScreenProps> = ({ intentUrl, processingUrl, successUrl, onCancel }) => {
  const [status, setStatus] = useState<'waiting' | 'polling' | 'success' | 'failed'>('waiting');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);

  const stopAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const pollOnce = useCallback(async () => {
    if (doneRef.current) return;
    try {
      const txStatus = await checkTransactionStatus(processingUrl);
      console.log('Transaction Status:', txStatus);
      if (txStatus === 'SUCCESS' || txStatus === 'ACTIVE' || txStatus === 'CAPTURED') {
        doneRef.current = true;
        stopAll();
        setStatus('success');
        window.location.replace(successUrl);
        return;
      }
      if (txStatus === 'FAILED' || txStatus === 'FAILURE' || txStatus === 'CANCELLED') {
        doneRef.current = true;
        stopAll();
        setStatus('failed');
      }
    } catch (error) {
      console.error('Status Check Error:', error);
    }
  }, [processingUrl, successUrl, stopAll]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    setStatus('polling');
    pollOnce();
    intervalRef.current = setInterval(pollOnce, 3000);
    timeoutRef.current = setTimeout(() => { if (!doneRef.current) stopAll(); }, 300000);
  }, [pollOnce, stopAll]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && status === 'polling') pollOnce(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [status, pollOnce]);

  useEffect(() => () => stopAll(), [stopAll]);

  const handleOpenUPI = () => {
    startPolling();
    setTimeout(() => { window.location.href = intentUrl; }, 100);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '16px', padding: '32px 24px', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>UPI Payment</h2>
        {status === 'waiting' && (
          <>
            <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '24px' }}>Tap the button below — your UPI app will open. This page redirects automatically after payment.</p>
            <button onClick={handleOpenUPI} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(45deg, #ff6b35, #f7931e)', color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Pay via UPI</button>
            <br />
            <button onClick={onCancel} style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          </>
        )}
        {status === 'polling' && (
          <>
            <p style={{ fontSize: '14px', color: '#f7931e', marginBottom: '12px' }}>⏳ Verifying payment...</p>
            <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>Complete payment in UPI app, then return here.</p>
            <button onClick={onCancel} style={{ background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
          </>
        )}
        {status === 'success' && <p style={{ fontSize: '16px', color: '#2ecc71' }}>✅ Payment successful! Redirecting...</p>}
        {status === 'failed' && (
          <>
            <p style={{ fontSize: '16px', color: '#e74c3c', marginBottom: '16px' }}>❌ Payment failed. Please try again.</p>
            <button onClick={onCancel} style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(255,107,53,0.2)', color: '#ff6b35', fontSize: '14px' }}>Go Back</button>
          </>
        )}
      </div>
    </div>
  );
};

// =====================================================
// CHECKOUT MODAL - Manual trigger modal
// =====================================================

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}



export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsAnyPopupVisible } = usePopupState();
  
  const productId = searchParams.get('id') || '';
  const clickid = searchParams.get('clickid') || '';

  const [product, setProduct] = useState<{ price: number; priceDisplay: string; name: string; currency?: string; description?: string; checkouturl?: string; successurl?: string; failurl?: string; qty?: string | number; flow?: string; discount?: number; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s2sData, setS2sData] = useState<{ intentUrl: string; processingUrl: string; successUrl: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });

  // Fetch product details
  useEffect(() => {
    if (!isOpen) return;
    
    setIsAnyPopupVisible(isOpen);
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductDetails({ id: productId, clickid });
        
        const priceRaw = productData?.price;
        const priceNumber = Number(priceRaw);
        
        if (Number.isFinite(priceNumber)) {
          setProduct({
            price: priceNumber,
            priceDisplay: typeof priceRaw === 'string' || typeof priceRaw === 'number'
              ? String(priceRaw)
              : String(priceNumber),
            name: productData?.name || productData?.productName || productData?.product_name || 'Product',
            currency: productData?.currency || 'INR',
            description: productData?.description,
            checkouturl: productData?.checkouturl,
            successurl: productData?.successurl,
            failurl: productData?.failurl,
            qty: productData?.qty ?? 1,
            flow: String(productData?.flow || '').trim().toLowerCase(),
            discount: productData?.discount,
          });
        } else {
          console.error('Invalid price from API:', priceRaw);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        // Don't set fallback - let it remain null to show loading state
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isOpen, productId, clickid]);

  const unitPrice = product?.price || 0;
  const currency = product?.currency || 'INR';
  const discountPercent = (product as { discount?: number })?.discount ?? 50;
  // price and qty come directly from API
  const totalPrice = unitPrice;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        phoneNumber: sanitizeTelInput(value),
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!productId || !clickid) {
      alert('Missing required parameters. Please refresh the page.');
      return;
    }
    
    if (!product || !Number.isFinite(product.price)) {
      alert('Product details not loaded yet. Please wait and try again.');
      return;
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      alert('Invalid product ID');
      return;
    }

    const phoneCountry = defaultCountryFromProduct(product);
    const phoneResult = validateCheckoutPhone(formData.phoneNumber, phoneCountry);
    if (!phoneResult.valid) {
      alert(phoneResult.message);
      return;
    }
    const phoneForApi = phoneDigitsForApi(phoneResult.e164);

    try {
      setIsSubmitting(true);

      // Save user data first
      await saveUserDataProduct({
        msisdn: phoneForApi,
        productId: numericProductId,
        clickId: clickid,
        productName: product.name,
      });

      // Prepare checkout payload
      const payload = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: '', // Not required in WA PlayTonight UI
        phone: phoneForApi,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        amount: (product?.price || 0).toFixed(2),
        currency: product?.currency || 'INR',
        qty: Number(product?.qty) || 1,
        shippingMethod: 'free',
        clickid,
        productInfo: null,
      };

      // Device + flow based routing
      const apiFlow = String((await getProductDetails({ id: productId, clickid }))?.flow || '').trim().toLowerCase();
      console.log('Checkout | flow:', apiFlow, '| isAndroid:', isAndroidDevice(), '| useS2S:', apiFlow === 's2s' && isAndroidDevice());

      if (apiFlow === 's2s' && isAndroidDevice()) {
        const s2s = await initiateS2SCheckout({ productId: numericProductId, payload });
        setS2sData({ intentUrl: s2s.intentUrl, processingUrl: s2s.processingUrl, successUrl: s2s.successUrl });
      } else {
        const data = await initiateCheckout({ productId: numericProductId, payload });
        navigate('/checkout/payu-redirect', {
          state: { actionUrl: 'https://secure.payu.in/_payment', params: data, successurl: data.successurl, failurl: data.failurl },
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  if (s2sData) return <S2SPaymentScreen {...s2sData} onCancel={() => setS2sData(null)} />;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button - Inside the modal */}
        <button className="modal-close-btn-outer" onClick={onClose} type="button">×</button>
        
        <div className="modal-header">
          <h2 className="modal-title">Complete Your Order</h2>
        </div>
        
        <div className="modal-logo-section">
          <img
            src={`${import.meta.env.BASE_URL}productlogo.png`}
            alt="Play Tonight"
            className="modal-product-logo-img"
          />
        </div>

        <div className="payment-info-box" style={{textAlign: 'center'}}>
          <p className="payment-text">
            <span style={{fontSize: '12px'}}>Proceed further to complete the payment of </span>
            <span className="highlight" style={{fontSize: '18px', fontWeight: 'bold'}}>
              {loading ? '...' : (
                <>
                  <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>
                    {formatPrice(Math.round(unitPrice / (1 - discountPercent / 100)), currency)}
                  </span>
                  <span style={{color: '#e74c3c', fontWeight: 'bold'}}>
                    {formatPrice(unitPrice, currency)} ({discountPercent}% OFF)
                  </span>
                </>
              )}
            </span>
          </p>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Mobile Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter You WhatsApp Number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input type="number" readOnly className="quantity-input" value={Number(product?.qty) || 1} min="1" style={{textAlign:"center",width:"60px"}} />
          </div>

          <button 
            type="submit" 
            className="complete-order-btn"
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? 'Processing...' : 'Complete Order'}
          </button>
          
          <div className="whatsapp-message-info">
            On successful purchase, you will get a WhatsApp message on your registered mobile number. Reply with your complete shipping address.
          </div>
        </form>
      </div>
    </div>
  );
};

// =====================================================
// CHECKOUT POPUP MODAL - Auto-appearing center-screen checkout popup
// =====================================================

/**
 * CheckoutPopupModal - Auto-appearing center-screen checkout popup
 * 
 * Features:
 * - Automatically appears every 20 seconds
 * - Center-positioned with smooth animations
 * - Uses existing checkout form functionality
 * - Separate styling (does not affect existing components)
 */

const POPUP_INTERVAL_MS = 10000; // 10 seconds

interface CheckoutPopupModalProps {
  showOnMount?: boolean;
  productId?: string;
  clickid?: string;
}

export const CheckoutPopupModal: React.FC<CheckoutPopupModalProps> = ({
  showOnMount = false,
  productId: productIdProp = '',
  clickid: clickidProp = '',
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isManualPopupOpen, isAnyPopupVisible, setIsAnyPopupVisible } = usePopupState();
  
  const productId = productIdProp || searchParams.get('id') || (() => {
    try {
      return localStorage.getItem('pt_product_id') || '';
    } catch {
      return '';
    }
  })();

  const clickid = clickidProp || (() => {
    const urlClickid = searchParams.get('clickid') || '';
    if (urlClickid) return urlClickid;
    
    try {
      const stored = localStorage.getItem(`pt_clickid_${productId}`);
      if (stored) return stored;
      const globalClickid = localStorage.getItem('playtonight_clickid');
      if (globalClickid) return globalClickid;
    } catch {}
    
    let generatedClickid: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      generatedClickid = crypto.randomUUID();
    } else {
      generatedClickid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    
    try {
      localStorage.setItem(`pt_clickid_${productId}`, generatedClickid);
    } catch {}
    
    return generatedClickid;
  })();

  const [product, setProduct] = useState<{ price: number; priceDisplay: string; name: string; currency?: string; description?: string; checkouturl?: string; successurl?: string; failurl?: string; qty?: string | number; flow?: string; discount?: number; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s2sData, setS2sData] = useState<{ intentUrl: string; processingUrl: string; successUrl: string } | null>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPopupActiveRef = useRef(false);
  const hasShownInitialRef = useRef(false);

  // Reset stale popup context on unmount (fixes React StrictMode double-mount)
  useEffect(() => {
    return () => {
      isPopupActiveRef.current = false;
      setIsAnyPopupVisible(false);
      document.body.classList.remove('popup-modal-open');
    };
  }, [setIsAnyPopupVisible]);

  // Fetch product details when popup becomes visible
  useEffect(() => {
    if (!isVisible || !productId || !clickid) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductDetails({ id: productId, clickid });
        
        const priceRaw = productData?.price;
        const priceNumber = Number(priceRaw);
        
        if (Number.isFinite(priceNumber)) {
          setProduct({
            price: priceNumber,
            priceDisplay: typeof priceRaw === 'string' || typeof priceRaw === 'number'
              ? String(priceRaw)
              : String(priceNumber),
            name: productData?.name || productData?.productName || productData?.product_name || 'Product',
            currency: productData?.currency || 'INR',
            description: productData?.description,
            checkouturl: productData?.checkouturl,
            successurl: productData?.successurl,
            failurl: productData?.failurl,
            qty: productData?.qty ?? 1,
            flow: String(productData?.flow || '').trim().toLowerCase(),
            discount: productData?.discount,
          });
        } else {
          setProduct({
            price: 0,
            priceDisplay: '0',
            name: 'Product'
          });
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct({
          price: 0,
          priceDisplay: '0',
          name: 'Product'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isVisible, productId, clickid]);

  const unitPrice = product?.price || 0;
  const currency = product?.currency || 'INR';
  const discountPercent = (product as { discount?: number })?.discount ?? 50;
  // price and qty come directly from API
  const totalPrice = unitPrice;

  // Show popup function
  const showPopup = useCallback(() => {
    if (isPopupActiveRef.current) return;
    // On checkout page (showOnMount), ignore stale context from StrictMode remount
    if (!showOnMount && isAnyPopupVisible) return;
    
    isPopupActiveRef.current = true;
    setIsAnyPopupVisible(true);
    setIsVisible(true);
    setIsClosing(false);
    
    document.body.classList.add('popup-modal-open');
  }, [isAnyPopupVisible, setIsAnyPopupVisible, showOnMount]);

  // Hide popup function with animation
  const hidePopup = useCallback(() => {
    setIsClosing(true);
    
    // Wait for close animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      isPopupActiveRef.current = false;
      setIsAnyPopupVisible(false);
      
      // Re-enable background scroll
      document.body.classList.remove('popup-modal-open');
    }, 400); // Match CSS transition duration
  }, [setIsAnyPopupVisible]);

  // Checkout page: show popup immediately when id + clickid are ready
  useEffect(() => {
    if (!showOnMount || !productId || !clickid) return;
    if (isManualPopupOpen) return;
    if (hasShownInitialRef.current) return;

    showPopup();
    hasShownInitialRef.current = true;
  }, [showOnMount, productId, clickid, isManualPopupOpen, showPopup]);

  // Auto-popup timer (re-show after close, or delayed first show on landing pages)
  useEffect(() => {
    if (showOnMount) return;
    if (isManualPopupOpen || isAnyPopupVisible) return;
    if (!productId) return;

    const delayMs = POPUP_INTERVAL_MS;
    
    const timer = setTimeout(() => {
      if (!isManualPopupOpen && !isAnyPopupVisible) {
        showPopup();
      }
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [showPopup, isManualPopupOpen, isAnyPopupVisible, showOnMount, productId]);

  // Checkout page: re-show popup after user closes it
  useEffect(() => {
    if (!showOnMount || !productId || !clickid) return;
    if (isVisible || isClosing || isManualPopupOpen) return;

    const timer = setTimeout(() => {
      isPopupActiveRef.current = false;
      setIsAnyPopupVisible(false);
      showPopup();
    }, POPUP_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [showOnMount, productId, clickid, isVisible, isClosing, isManualPopupOpen, showPopup, setIsAnyPopupVisible]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        phoneNumber: sanitizeTelInput(value),
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!productId || !clickid) {
      alert('Missing required parameters. Please refresh the page.');
      return;
    }
    
    if (!product || !Number.isFinite(product.price)) {
      alert('Product details not loaded yet. Please wait and try again.');
      return;
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      alert('Invalid product ID');
      return;
    }

    const phoneCountry = defaultCountryFromProduct(product);
    const phoneResult = validateCheckoutPhone(formData.phoneNumber, phoneCountry);
    if (!phoneResult.valid) {
      alert(phoneResult.message);
      return;
    }
    const phoneForApi = phoneDigitsForApi(phoneResult.e164);

    try {
      setIsSubmitting(true);

      // Save user data first
      await saveUserDataProduct({
        msisdn: phoneForApi,
        productId: numericProductId,
        clickId: clickid,
        productName: product.name,
      });

      // Prepare checkout payload
      const payload = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: '',
        phone: phoneForApi,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        amount: (product?.price || 0).toFixed(2),
        currency: product?.currency || 'INR',
        qty: Number(product?.qty) || 1,
        shippingMethod: 'free',
        clickid,
        productInfo: null,
      };

      // Device + flow based routing
      const apiFlow = String((await getProductDetails({ id: productId, clickid }))?.flow || '').trim().toLowerCase();
      console.log('Checkout | flow:', apiFlow, '| isAndroid:', isAndroidDevice(), '| useS2S:', apiFlow === 's2s' && isAndroidDevice());

      if (apiFlow === 's2s' && isAndroidDevice()) {
        const s2s = await initiateS2SCheckout({ productId: numericProductId, payload });
        setS2sData({ intentUrl: s2s.intentUrl, processingUrl: s2s.processingUrl, successUrl: s2s.successUrl });
      } else {
        const data = await initiateCheckout({ productId: numericProductId, payload });
        navigate('/checkout/payu-redirect', {
          state: { actionUrl: 'https://secure.payu.in/_payment', params: data, successurl: data.successurl, failurl: data.failurl },
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle overlay click (close popup)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      hidePopup();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hidePopup();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isVisible, hidePopup]);

  // Don't render if not visible
  if (!isVisible) return null;
  if (s2sData) return <S2SPaymentScreen {...s2sData} onCancel={() => { setS2sData(null); hidePopup(); }} />;

  return (
    <div 
      className={`popup-checkout-overlay${showOnMount ? ' popup-checkout-overlay--page' : ''} ${isVisible && !isClosing ? 'popup-visible' : ''} ${isClosing ? 'popup-closing' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-checkout-title"
    >
      <div className={`popup-checkout-modal${showOnMount ? ' popup-checkout-modal--page' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Close button - Inside the modal */}
        <button 
          className="popup-close-btn-outer" 
          onClick={hidePopup}
          aria-label="Close popup"
          type="button"
        >
          ×
        </button>

        {/* Header */}
        <div className="popup-modal-header">
          <h2 id="popup-checkout-title" className="popup-modal-title">
            Complete Your Order
          </h2>
        </div>

        {/* Body */}
        <div className="popup-modal-body">
          {/* Payment Info Card */}
          <div className="popup-payment-card" style={{textAlign: 'center'}}>
            <p className="popup-payment-text">
              <span style={{fontSize: '12px'}}>Proceed further to complete the payment of </span>
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>
                {loading ? '...' : (
                  <>
                    <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>
                      {formatPrice(Math.round(unitPrice / (1 - discountPercent / 100)), currency)}
                    </span>
                    <span style={{color: '#e74c3c', fontWeight: 'bold'}}>
                      {formatPrice(unitPrice, currency)} ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Checkout Form */}
          <form className="popup-checkout-form" onSubmit={handleSubmit}>
            <div className="popup-form-group">
              <label htmlFor="popup-name">Your Name</label>
              <input
                type="text"
                id="popup-name"
                name="name"
                className="popup-form-input"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            <div className="popup-form-group">
              <label htmlFor="popup-phone">Mobile Number</label>
              <input
                type="tel"
                id="popup-phone"
                name="phoneNumber"
                className="popup-form-input"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter You WhatsApp Number"
                required
                autoComplete="tel"
              />
            </div>

            <div className="popup-form-group">
              <label htmlFor="popup-quantity">Quantity</label>
              <input type="number" id="popup-quantity" readOnly className="quantity-input" value={Number(product?.qty) || 1} min="1" style={{textAlign:"center",width:"60px"}} />
            </div>

            <button 
              type="submit" 
              className="popup-submit-btn"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
            
            <div className="whatsapp-message-info">
              On successful purchase, you will get a WhatsApp message on your registered mobile number. Reply with your complete shipping address.
            </div>

            {/* Timer Badge */}
            {/* <div className="popup-timer-badge">
              <span className="popup-timer-icon">⏰</span>
              <span className="popup-timer-text">Offer expires soon - Don't miss out!</span>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// SCROLL TO BOTTOM POPUP - Auto-appearing when user reaches page end
// =====================================================

export const ScrollToBottomPopup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasManualPopupOpened, isManualPopupOpen, isAnyPopupVisible, setIsAnyPopupVisible } = usePopupState();
  
  const productId = searchParams.get('id') || '';
  const clickid = (() => {
    const urlClickid = searchParams.get('clickid') || '';
    if (urlClickid) return urlClickid;
    
    try {
      const stored = localStorage.getItem(`pt_clickid_${productId}`);
      if (stored) return stored;
      const globalClickid = localStorage.getItem('playtonight_clickid');
      if (globalClickid) return globalClickid;
    } catch {}
    
    let generatedClickid: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      generatedClickid = crypto.randomUUID();
    } else {
      generatedClickid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    
    try {
      localStorage.setItem(`pt_clickid_${productId}`, generatedClickid);
    } catch {}
    
    return generatedClickid;
  })();

  const [product, setProduct] = useState<{ price: number; priceDisplay: string; name: string; currency?: string; description?: string; checkouturl?: string; successurl?: string; failurl?: string; qty?: string | number; flow?: string; discount?: number; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s2sData, setS2sData] = useState<{ intentUrl: string; processingUrl: string; successUrl: string } | null>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });

  // Fetch product details when popup becomes visible
  useEffect(() => {
    if (!isVisible) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductDetails({ id: productId, clickid });
        
        const priceRaw = productData?.price;
        const priceNumber = Number(priceRaw);
        
        if (Number.isFinite(priceNumber)) {
          setProduct({
            price: priceNumber,
            priceDisplay: typeof priceRaw === 'string' || typeof priceRaw === 'number'
              ? String(priceRaw)
              : String(priceNumber),
            name: productData?.name || productData?.productName || productData?.product_name || 'Product',
            currency: productData?.currency || 'INR',
            description: productData?.description,
            checkouturl: productData?.checkouturl,
            successurl: productData?.successurl,
            failurl: productData?.failurl,
            qty: productData?.qty ?? 1,
            flow: String(productData?.flow || '').trim().toLowerCase(),
            discount: productData?.discount,
          });
        } else {
          setProduct({
            price: 0,
            priceDisplay: '0',
            name: 'Product'
          });
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct({
          price: 0,
          priceDisplay: '0',
          name: 'Product'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isVisible, productId, clickid]);

  const unitPrice = product?.price || 0;
  const currency = product?.currency || 'INR';
  const discountPercent = (product as { discount?: number })?.discount ?? 50;
  // price and qty come directly from API
  const totalPrice = unitPrice;

  // Show popup function
  const showPopup = useCallback(() => {
    if (hasTriggered || hasManualPopupOpened || isManualPopupOpen || isAnyPopupVisible) return;
    
    setHasTriggered(true);
    setIsAnyPopupVisible(true);
    setIsVisible(true);
    setIsClosing(false);
    
    // Disable background scroll
    document.body.classList.add('popup-modal-open');
  }, [hasTriggered, hasManualPopupOpened, isManualPopupOpen, isAnyPopupVisible, setIsAnyPopupVisible]);

  // Hide popup function with animation
  const hidePopup = useCallback(() => {
    setIsClosing(true);
    
    // Wait for close animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      setIsAnyPopupVisible(false);
      
      // Re-enable background scroll
      document.body.classList.remove('popup-modal-open');
    }, 400); // Match CSS transition duration
  }, [setIsAnyPopupVisible]);

  // Setup scroll listener for page end detection
  useEffect(() => {
    if (hasTriggered || hasManualPopupOpened || isManualPopupOpen || isAnyPopupVisible) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if user has reached the bottom of the page
      if (scrollTop + windowHeight >= documentHeight - 10) {
        showPopup();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('popup-modal-open');
    };
  }, [showPopup, hasTriggered, hasManualPopupOpened, isManualPopupOpen, isAnyPopupVisible]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      setFormData(prev => ({
        ...prev,
        phoneNumber: sanitizeTelInput(value),
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!productId || !clickid) {
      alert('Missing required parameters. Please refresh the page.');
      return;
    }
    
    if (!product || !Number.isFinite(product.price)) {
      alert('Product details not loaded yet. Please wait and try again.');
      return;
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      alert('Invalid product ID');
      return;
    }

    const phoneCountry = defaultCountryFromProduct(product);
    const phoneResult = validateCheckoutPhone(formData.phoneNumber, phoneCountry);
    if (!phoneResult.valid) {
      alert(phoneResult.message);
      return;
    }
    const phoneForApi = phoneDigitsForApi(phoneResult.e164);

    try {
      setIsSubmitting(true);

      // Save user data first
      await saveUserDataProduct({
        msisdn: phoneForApi,
        productId: numericProductId,
        clickId: clickid,
        productName: product.name,
      });

      // Prepare checkout payload
      const payload = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: '',
        phone: phoneForApi,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        amount: (product?.price || 0).toFixed(2),
        currency: product?.currency || 'INR',
        qty: Number(product?.qty) || 1,
        shippingMethod: 'free',
        clickid,
        productInfo: null,
      };

      // Device + flow based routing
      const apiFlow = String((await getProductDetails({ id: productId, clickid }))?.flow || '').trim().toLowerCase();
      console.log('Checkout | flow:', apiFlow, '| isAndroid:', isAndroidDevice(), '| useS2S:', apiFlow === 's2s' && isAndroidDevice());

      if (apiFlow === 's2s' && isAndroidDevice()) {
        const s2s = await initiateS2SCheckout({ productId: numericProductId, payload });
        setS2sData({ intentUrl: s2s.intentUrl, processingUrl: s2s.processingUrl, successUrl: s2s.successUrl });
      } else {
        const data = await initiateCheckout({ productId: numericProductId, payload });
        navigate('/checkout/payu-redirect', {
          state: { actionUrl: 'https://secure.payu.in/_payment', params: data, successurl: data.successurl, failurl: data.failurl },
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle overlay click (close popup)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      hidePopup();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hidePopup();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isVisible, hidePopup]);

  // Don't render if not visible
  if (!isVisible) return null;
  if (s2sData) return <S2SPaymentScreen {...s2sData} onCancel={() => { setS2sData(null); hidePopup(); }} />;

  return (
    <div 
      className={`popup-checkout-overlay ${isVisible && !isClosing ? 'popup-visible' : ''} ${isClosing ? 'popup-closing' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scroll-popup-checkout-title"
    >
      <div className="popup-checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button - Inside the modal */}
        <button 
          className="popup-close-btn-outer" 
          onClick={hidePopup}
          aria-label="Close popup"
          type="button"
        >
          ×
        </button>

        {/* Header */}
        <div className="popup-modal-header">
          <h2 id="scroll-popup-checkout-title" className="popup-modal-title">
            Complete Your Order
          </h2>
        </div>

        {/* Body */}
        <div className="popup-modal-body">
          <div className="popup-logo-section">
            <img
              src={`${import.meta.env.BASE_URL}productlogo.png`}
              alt="Play Tonight"
              className="modal-product-logo-img"
            />
          </div>

          {/* Payment Info Card */}
          <div className="popup-payment-card" style={{textAlign: 'center'}}>
            <p className="popup-payment-text">
              <span style={{fontSize: '12px'}}>Proceed further to complete the payment of </span>
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>
                {loading ? '...' : (
                  <>
                    <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>
                      {formatPrice(Math.round(unitPrice / (1 - discountPercent / 100)), currency)}
                    </span>
                    <span style={{color: '#e74c3c', fontWeight: 'bold'}}>
                      {formatPrice(unitPrice, currency)} ({discountPercent}% OFF)
                    </span>
                  </>
                )}
              </span>
            </p>
          </div>

          {/* Checkout Form */}
          <form className="popup-checkout-form" onSubmit={handleSubmit}>
            <div className="popup-form-group">
              <label htmlFor="scroll-popup-name">Your Name</label>
              <input
                type="text"
                id="scroll-popup-name"
                name="name"
                className="popup-form-input"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                autoComplete="name"
              />
            </div>

            <div className="popup-form-group">
              <label htmlFor="scroll-popup-phone">Mobile Number</label>
              <input
                type="tel"
                id="scroll-popup-phone"
                name="phoneNumber"
                className="popup-form-input"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter You WhatsApp Number"
                required
                autoComplete="tel"
              />
            </div>

            <div className="popup-form-group">
              <label htmlFor="scroll-popup-quantity">Quantity</label>
              <input type="number" id="scroll-popup-quantity" readOnly className="quantity-input" value={Number(product?.qty) || 1} min="1" style={{textAlign:"center",width:"60px"}} />
            </div>

            <button 
              type="submit" 
              className="popup-submit-btn"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
            
            <div className="whatsapp-message-info">
              On successful purchase, you will get a WhatsApp message on your registered mobile number. Reply with your complete shipping address.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const WhatsAppWidget: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setHasManualPopupOpened, setIsManualPopupOpen, setIsAnyPopupVisible } = usePopupState();
  
  const productId = searchParams.get('id') || '';
  const clickid = (() => {
    const urlClickid = searchParams.get('clickid') || '';
    if (urlClickid) return urlClickid;
    
    try {
      const stored = localStorage.getItem(`pt_clickid_${productId}`);
      if (stored) return stored;
      const globalClickid = localStorage.getItem('playtonight_clickid');
      if (globalClickid) return globalClickid;
    } catch {}
    
    let generatedClickid: string;
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      generatedClickid = crypto.randomUUID();
    } else {
      generatedClickid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    
    try {
      localStorage.setItem(`pt_clickid_${productId}`, generatedClickid);
    } catch {}
    
    return generatedClickid;
  })();

  const [product, setProduct] = useState<{ price: number; priceDisplay: string; name: string; currency?: string; description?: string; checkouturl?: string; successurl?: string; failurl?: string; qty?: string | number; flow?: string; discount?: number; } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [s2sData, setS2sData] = useState<{ intentUrl: string; processingUrl: string; successUrl: string } | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
  });

  // Track manual popup state
  useEffect(() => {
    setIsManualPopupOpen(isOpen);
    setIsAnyPopupVisible(isOpen);
  }, [isOpen, setIsManualPopupOpen, setIsAnyPopupVisible]);

  // Fetch product details when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductDetails({ id: productId, clickid });
        
        const priceRaw = productData?.price;
        const priceNumber = Number(priceRaw);
        
        if (Number.isFinite(priceNumber)) {
          setProduct({
            price: priceNumber,
            priceDisplay: typeof priceRaw === 'string' || typeof priceRaw === 'number'
              ? String(priceRaw)
              : String(priceNumber),
            name: productData?.name || productData?.productName || productData?.product_name || 'Product',
            currency: productData?.currency || 'INR',
            description: productData?.description,
            checkouturl: productData?.checkouturl,
            successurl: productData?.successurl,
            failurl: productData?.failurl,
            qty: productData?.qty ?? 1,
            flow: String(productData?.flow || '').trim().toLowerCase(),
            discount: productData?.discount,
          });
        } else {
          setProduct({
            price: 0,
            priceDisplay: '0',
            name: 'Product'
          });
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct({
          price: 0,
          priceDisplay: '0',
          name: 'Product'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isOpen, productId, clickid]);
  
  const currency = product?.currency || 'INR';
  const unitPrice = product?.price || 0;
  const discountPercent = (product as { discount?: number })?.discount ?? 50;
  // price and qty come directly from API
  const totalPrice = unitPrice;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!productId || !clickid) {
      alert('Missing required parameters. Please refresh the page.');
      return;
    }
    
    if (!product || !Number.isFinite(product.price)) {
      alert('Product details not loaded yet. Please wait and try again.');
      return;
    }

    const numericProductId = Number(productId);
    if (!Number.isFinite(numericProductId)) {
      alert('Invalid product ID');
      return;
    }

    const phoneCountry = defaultCountryFromProduct(product);
    const phoneResult = validateCheckoutPhone(formData.phoneNumber, phoneCountry);
    if (!phoneResult.valid) {
      alert(phoneResult.message);
      return;
    }
    const phoneForApi = phoneDigitsForApi(phoneResult.e164);

    try {
      setIsSubmitting(true);

      // Save user data first
      await saveUserDataProduct({
        msisdn: phoneForApi,
        productId: numericProductId,
        clickId: clickid,
        productName: product.name,
      });

      // Prepare checkout payload
      const payload = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: '',
        phone: phoneForApi,
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        amount: (product?.price || 0).toFixed(2),
        currency: product?.currency || 'INR',
        qty: Number(product?.qty) || 1,
        shippingMethod: 'free',
        clickid,
        productInfo: null,
      };

      // Device + flow based routing
      const apiFlow = String((await getProductDetails({ id: productId, clickid }))?.flow || '').trim().toLowerCase();
      console.log('Checkout | flow:', apiFlow, '| isAndroid:', isAndroidDevice(), '| useS2S:', apiFlow === 's2s' && isAndroidDevice());

      if (apiFlow === 's2s' && isAndroidDevice()) {
        const s2s = await initiateS2SCheckout({ productId: numericProductId, payload });
        setS2sData({ intentUrl: s2s.intentUrl, processingUrl: s2s.processingUrl, successUrl: s2s.successUrl });
      } else {
        const data = await initiateCheckout({ productId: numericProductId, payload });
        navigate('/checkout/payu-redirect', {
          state: { actionUrl: 'https://secure.payu.in/_payment', params: data, successurl: data.successurl, failurl: data.failurl },
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (s2sData) return <S2SPaymentScreen {...s2sData} onCancel={() => { setS2sData(null); setIsOpen(false); }} />;

  return (
    <div className="whatsapp-widget">
      <button 
        className="whatsapp-button"
        onClick={() => {
          setHasManualPopupOpened(true);
          setIsOpen(!isOpen);
        }}
      >
        Order Now
      </button>
      
      {isOpen && (
        <div className="whatsapp-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close button - Inside the modal */}
            <button className="whatsapp-close-btn-outer" onClick={() => setIsOpen(false)} type="button">×</button>
            
            <div className="modal-header">
              <h2 className="modal-title">Complete Your Order</h2>
            </div>
            <div className="modal-logo-section">
              <img
                src={`${import.meta.env.BASE_URL}productlogo.png`}
                alt="Play Tonight"
                className="modal-product-logo-img"
              />
            </div>
            <div className="payment-info-box" style={{textAlign: 'center'}}>
              <p className="payment-text">
                <span style={{fontSize: '12px'}}>Proceed further to complete the payment of </span>
                <span className="highlight" style={{fontSize: '18px', fontWeight: 'bold'}}>
                  {loading ? '...' : (
                    <>
                      <span style={{textDecoration: 'line-through', color: '#999', marginRight: '8px'}}>
                        {formatPrice(Math.round((product?.price || 0) / (1 - discountPercent / 100)), currency)}
                      </span>
                      <span style={{color: '#e74c3c', fontWeight: 'bold'}}>
                        {formatPrice(product?.price || 0, currency)} ({discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </span>
              </p>
            </div>
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                id="name" 
                name="name"
                placeholder="Enter your name" 
                required 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Mobile Number</label>
              <input 
                id="phoneNumber" 
                name="phoneNumber"
                placeholder="Enter You WhatsApp Number" 
                required 
                type="tel" 
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneNumber: sanitizeTelInput(e.target.value),
                  })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="whatsapp-quantity">Quantity</label>
              <input type="number" id="whatsapp-quantity" readOnly className="quantity-input" value={Number(product?.qty) || 1} min="1" style={{textAlign:"center",width:"60px"}} />
            </div>
            <button 
              type="submit" 
              className="complete-order-btn"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>
            
            <div className="whatsapp-message-info">
              On successful purchase, you will get a WhatsApp message on your registered mobile number. Reply with your complete shipping address.
            </div>
          </form>
          </div>
        </div>
      )}
    </div>
  );
};
