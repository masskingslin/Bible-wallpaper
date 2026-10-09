import React, { useState } from 'react';
import { X, Check, Crown, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePurchase = async () => {
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // Calls the real backend verify-subscription route from the project!
      const productId = selectedPlan === 'monthly' ? 'sub_premium_monthly' : 'sub_premium_lifetime';
      const purchaseToken = `demo_tok_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseToken,
          productId,
          packageName: 'com.example.biblewallpapers',
        }),
      });

      const data = await response.json();

      if (data.isValid) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#d97706'],
        });
        onSubscriptionSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Subscription verification failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to reach subscription verification API.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
            <Crown className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white font-cinzel">
            Bible Wallpapers VIP Pass
          </h2>
          <p className="text-sm text-stone-300 mt-1 max-w-sm mx-auto">
            Unlimited access to 4K scripture wallpapers, daily exclusive drops, and custom typography styling.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6 text-sm text-stone-200 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Access all Premium VIP wallpapers without limits</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Full HD & Ultra 4K phone resolution export</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>All 5 language editions (English, Español, Português, Français, Deutsch)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Lock screen typography customizer & zero ads</span>
          </div>
        </div>

        {/* Plan selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`p-3.5 rounded-2xl border text-left transition relative ${
              selectedPlan === 'monthly'
                ? 'bg-stone-800 border-amber-500 text-white'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="text-xs text-stone-400">Monthly Plan</div>
            <div className="text-lg font-bold text-white mt-0.5">$1.99 <span className="text-xs font-normal text-stone-400">/ mo</span></div>
            <div className="text-[11px] text-stone-400 mt-1">Cancel anytime</div>
          </button>

          <button
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-3.5 rounded-2xl border text-left transition relative overflow-hidden ${
              selectedPlan === 'lifetime'
                ? 'bg-amber-950/30 border-amber-500 text-white shadow-lg'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
              Best Value
            </div>
            <div className="text-xs text-amber-400 font-semibold">Lifetime Access</div>
            <div className="text-lg font-bold text-white mt-0.5">$9.99 <span className="text-xs font-normal text-stone-400">once</span></div>
            <div className="text-[11px] text-amber-300 mt-1">Pay once, own forever</div>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSimulatePurchase}
          disabled={isVerifying}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition active:scale-95"
        >
          {isVerifying ? (
            <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          <span>{isVerifying ? 'Verifying with Google Play...' : 'Unlock VIP Access (Instant Test)'}</span>
        </button>

        <p className="text-center text-[11px] text-stone-400 mt-3 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          Powered by Google Play Billing API Backend Integration
        </p>
      </div>
    </div>
  );
};
