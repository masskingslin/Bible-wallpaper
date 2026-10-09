import React, { useState } from 'react';
import { 
  X, Check, Crown, Sparkles, ShieldCheck, Zap, 
  Download, Clock, HardDrive, Star, CheckCircle2, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionSuccess: () => void;
  featureReason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionSuccess,
  featureReason,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePurchase = async () => {
    setIsVerifying(true);
    setErrorMsg(null);

    try {
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
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff', '#d97706', '#10b981'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden my-8">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition"
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
        </div>

        {/* Why Upgrade - Value Comparison Table */}
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
                Gold VIP Scripture Wallpapers (4K)
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
                <span className="font-bold text-emerald-400">All 5 Languages</span>
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
              $1.99 <span className="text-xs font-normal text-stone-400">/ mo</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Billed monthly, cancel anytime</div>
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
              Most Popular
            </div>
            <div className="text-xs text-amber-400 font-bold">Lifetime VIP Access</div>
            <div className="text-xl font-bold text-white mt-1">
              $9.99 <span className="text-xs font-normal text-stone-400">one-time</span>
            </div>
            <div className="text-[11px] text-amber-300 mt-1">Pay once, keep forever</div>
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition active:scale-98"
        >
          {isVerifying ? (
            <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
          <span>{isVerifying ? 'Verifying with Google Play Billing...' : 'Unlock VIP Access Now'}</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-stone-400 mt-4 px-1">
          <span>🔒 Google Play 256-bit Secure Billing</span>
          <span>✨ Instant Access to All Features</span>
        </div>
      </div>
    </div>
  );
};
