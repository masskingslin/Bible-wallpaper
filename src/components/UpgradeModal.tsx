import React, { useState, useEffect } from 'react';
import { 
  X, Check, Crown, Sparkles, ShieldCheck, Zap, 
  Download, Clock, HardDrive, Star, CheckCircle2, ArrowRight,
  CreditCard, Smartphone, CheckCheck, ExternalLink, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: () => void;
  featureReason?: string;
}

interface RazorpayConfigResponse {
  isConfigured: boolean;
  keyId: string;
  currency: string;
  plans: {
    monthly: { amount: number; displayAmount: string; usdEquivalent: string; name: string };
    lifetime: { amount: number; displayAmount: string; usdEquivalent: string; name: string };
  };
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
  featureReason,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ paymentId: string; plan: string } | null>(null);
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayConfigResponse | null>(null);
  const [showSandboxConfirm, setShowSandboxConfirm] = useState<{ orderId: string; plan: string; amount: number } | null>(null);

  // Load Razorpay checkout.js script and fetch gateway status
  useEffect(() => {
    if (!isOpen) return;

    // Fetch config
    fetch('/api/razorpay/config')
      .then(res => res.json())
      .then(data => setRazorpayConfig(data))
      .catch(console.warn);

    // Dynamically inject Razorpay Checkout script if not already present
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPayment = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setShowSandboxConfirm(null);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          userEmail: 'devotional@biblewallpapers.app',
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay order');
      }

      // Check if real Razorpay SDK is loaded and keys are active
      const hasRazorpayScript = typeof (window as any).Razorpay === 'function';
      const isLiveKey = orderData.isLiveKey && hasRazorpayScript;

      if (isLiveKey) {
        // Launch official Razorpay Checkout popup
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Bible Wallpapers VIP',
          description: orderData.planName || 'VIP Scripture Access',
          image: '/app-icon.png',
          order_id: orderData.orderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            });
          },
          prefill: {
            name: 'Scripture Devotional Reader',
            email: 'reader@biblewallpapers.app',
            contact: '9999999999',
          },
          notes: {
            plan: selectedPlan,
            platform: 'Bible Wallpapers Web',
          },
          theme: {
            color: '#d97706', // Warm Amber Gold
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setErrorMsg(resp.error?.description || 'Payment was cancelled or failed.');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Sandbox / Test Mode when API keys are pending in environment
        setShowSandboxConfirm({
          orderId: orderData.orderId,
          plan: selectedPlan,
          amount: orderData.amount,
        });
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message || 'Failed to connect to Razorpay payment gateway.');
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    plan: string;
  }) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.isValid) {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#d97706', '#10b981'],
        });

        localStorage.setItem('bible_wallpapers_vip_token', data.paymentId || 'active');
        localStorage.setItem('bible_wallpapers_vip_plan', payload.plan);

        setSuccessInfo({
          paymentId: data.paymentId || 'pay_demo_success',
          plan: payload.plan,
        });

        setTimeout(() => {
          onSubscriptionSuccess();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(data.error || 'Payment signature verification failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to complete payment verification on server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateSandboxSuccess = () => {
    if (!showSandboxConfirm) return;
    const simPaymentId = `pay_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    verifyPayment({
      razorpay_order_id: showSandboxConfirm.orderId,
      razorpay_payment_id: simPaymentId,
      plan: showSandboxConfirm.plan,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden my-8">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Reason banner if triggered by a specific feature */}
        {featureReason && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>VIP Required:</strong> {featureReason}</span>
          </div>
        )}

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-stone-950 mb-3 shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white font-cinzel">
            Unlock Bible Wallpapers VIP
          </h2>
          <p className="text-sm text-stone-300 mt-1 max-w-md mx-auto">
            Upgrade your daily spiritual walk with unlimited 4K bulk downloads, hourly automatic lock screen changer, and complete offline library.
          </p>

          {/* Razorpay Gateway Badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-850 border border-amber-500/30 text-[11px] text-amber-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Razorpay Verified Gateway</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-300">UPI, Cards, NetBanking</span>
          </div>
        </div>

        {/* Value Privileges Table */}
        <div className="mb-6 rounded-2xl bg-stone-950/80 border border-stone-800 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
            <span>VIP Membership Privileges</span>
            <span className="text-[10px] text-stone-400">Free vs VIP</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-stone-850">
              <span className="text-stone-300 flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Bulk 1-Click ZIP Collection Downloads
              </span>
              <div className="flex items-center gap-4">
                <span className="text-stone-500 line-through">1 by 1</span>
                <span className="font-bold text-emerald-400">Unlimited ZIP</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-850">
              <span className="text-stone-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Auto Lock Screen & Verse Rotation
              </span>
              <div className="flex items-center gap-4">
                <span className="text-stone-500">24 Hours</span>
                <span className="font-bold text-amber-400">Every 1 Hour ⚡</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-850">
              <span className="text-stone-300 flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Gold VIP Scripture Wallpapers (4K UHD)
              </span>
              <div className="flex items-center gap-4">
                <span className="text-stone-500">Locked</span>
                <span className="font-bold text-emerald-400">All Unlocked</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-stone-850">
              <span className="text-stone-300 flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                Complete Multilingual Offline Pack
              </span>
              <div className="flex items-center gap-4">
                <span className="text-stone-500">Basic</span>
                <span className="font-bold text-emerald-400">All 6 Languages</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-stone-300 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Typography Customizer & Zero Ads
              </span>
              <div className="flex items-center gap-4">
                <span className="text-stone-500">Standard</span>
                <span className="font-bold text-emerald-400">Full Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-stone-300">Choose VIP Plan</span>
          <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800 text-[11px]">
            <button
              onClick={() => setCurrencyMode('INR')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                currencyMode === 'INR'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrencyMode('USD')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                currencyMode === 'USD'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Plan selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-2xl border text-left transition relative ${
              selectedPlan === 'monthly'
                ? 'bg-stone-800 border-amber-500 text-white shadow-md'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="text-xs text-stone-400 font-medium">Monthly Pass</div>
            <div className="text-xl font-bold text-white mt-1">
              {currencyMode === 'INR' ? '₹199' : '$2.49'} 
              <span className="text-xs font-normal text-stone-400"> / mo</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              {currencyMode === 'INR' ? '(~$2.49 USD) Cancel anytime' : '(₹199 INR) Cancel anytime'}
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-4 rounded-2xl border text-left transition relative overflow-hidden ${
              selectedPlan === 'lifetime'
                ? 'bg-amber-950/30 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl-lg shadow">
              Best Value
            </div>
            <div className="text-xs text-amber-400 font-bold">Lifetime VIP Access</div>
            <div className="text-xl font-bold text-white mt-1">
              {currencyMode === 'INR' ? '₹999' : '$11.99'} 
              <span className="text-xs font-normal text-stone-400"> one-time</span>
            </div>
            <div className="text-[11px] text-amber-300 mt-1">
              {currencyMode === 'INR' ? '(~$11.99 USD) Pay once, keep forever' : '(₹999 INR) Pay once, keep forever'}
            </div>
          </button>
        </div>

        {/* Razorpay Payment Channels List */}
        <div className="mb-5 p-3 rounded-2xl bg-stone-950/50 border border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>UPI: GPay, PhonePe, Paytm</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Visa, MC, RuPay, NetBanking</span>
          </div>
        </div>

        {/* Success Confirmation Toast */}
        {successInfo && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-bounce">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Payment Verified! Activating VIP Privileges...</span>
          </div>
        )}

        {/* Sandbox Dialog if testing before adding live keys */}
        {showSandboxConfirm && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Razorpay Test Sandbox Ready</span>
            </div>
            <p className="text-stone-300 text-[11px]">
              Razorpay Order created: <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300">{showSandboxConfirm.orderId}</code> (Amount: ₹{showSandboxConfirm.amount / 100}).
            </p>
            <p className="text-stone-400 text-[11px]">
              To process live transactions to your bank, add your <code className="text-amber-400">RAZORPAY_KEY_ID</code> and <code className="text-amber-400">RAZORPAY_KEY_SECRET</code> to your environment variables.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSimulateSandboxSuccess}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Successful Payment (Unlock VIP)</span>
              </button>
              <button
                onClick={() => setShowSandboxConfirm(null)}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Main Pay Button */}
        {!showSandboxConfirm && (
          <button
            onClick={handleStartPayment}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            <span>
              {isProcessing 
                ? 'Connecting to Razorpay...' 
                : `Pay ${selectedPlan === 'monthly' ? (currencyMode === 'INR' ? '₹199' : '$2.49') : (currencyMode === 'INR' ? '₹999' : '$11.99')} with Razorpay`}
            </span>
          </button>
        )}

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 mt-4 px-1">
          <span className="flex items-center gap-1">
            <span>🛡️</span>
            <span>Razorpay 256-bit Encrypted Checkout</span>
          </span>
          <span className="text-amber-400">✨ Instant VIP Activation</span>
        </div>
      </div>
    </div>
  );
};
