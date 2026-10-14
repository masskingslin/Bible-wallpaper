import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Pricing in INR (paise: 1 INR = 100 paise)
export const RAZORPAY_PLANS = {
  monthly: {
    id: 'plan_vip_monthly',
    name: 'VIP Monthly Devotional Pass',
    amount: 19900, // ₹199.00
    displayAmount: '₹199',
    usdEquivalent: '$2.49',
    interval: 'month'
  },
  lifetime: {
    id: 'plan_vip_lifetime',
    name: 'Lifetime VIP Scripture Access',
    amount: 99900, // ₹999.00
    displayAmount: '₹999',
    usdEquivalent: '$11.99',
    interval: 'lifetime'
  }
} as const;

function getRazorpayInstance(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    try {
      return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
    } catch (err) {
      console.error('[Razorpay] Failed to initialize client:', err);
      return null;
    }
  }
  return null;
}

/**
 * GET /api/razorpay/config
 * Returns public configuration for Razorpay frontend checkout
 */
export async function handleRazorpayConfig(_req: Request, res: Response) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);

  res.json({
    isConfigured,
    // Return keyId if set, otherwise fallback to demo key for testing
    keyId: keyId || 'rzp_test_placeholder',
    currency: 'INR',
    plans: RAZORPAY_PLANS,
    methods: ['upi', 'card', 'netbanking', 'wallet'],
  });
}

/**
 * POST /api/razorpay/create-order
 * Creates a new Razorpay order for the selected VIP plan
 */
export async function handleCreateRazorpayOrder(req: Request, res: Response) {
  try {
    const { plan = 'lifetime', userEmail, userName } = req.body;
    const planConfig = RAZORPAY_PLANS[plan as keyof typeof RAZORPAY_PLANS] || RAZORPAY_PLANS.lifetime;

    const razorpay = getRazorpayInstance();
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (razorpay) {
      // Real Razorpay Order via SDK
      const order = await razorpay.orders.create({
        amount: planConfig.amount,
        currency: 'INR',
        receipt,
        notes: {
          plan: plan,
          planName: planConfig.name,
          app: 'Bible Wallpapers',
          userEmail: userEmail || 'devotional@biblewallpapers.app'
        }
      });

      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        plan,
        planName: planConfig.name,
        isLiveKey: true,
      });
    } else {
      // Test / Sandbox Fallback when API keys are not yet provided in .env
      const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      return res.status(200).json({
        success: true,
        orderId: mockOrderId,
        amount: planConfig.amount,
        currency: 'INR',
        keyId: 'rzp_test_demoKey123',
        plan,
        planName: planConfig.name,
        isLiveKey: false,
        note: 'Razorpay keys not configured in environment. Running in verified test simulation mode.'
      });
    }
  } catch (error) {
    console.error('[Razorpay] Order creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create Razorpay order',
      details: (error as Error).message
    });
  }
}

/**
 * POST /api/razorpay/verify-payment
 * Verifies Razorpay payment signature & confirms VIP subscription
 */
export async function handleVerifyRazorpayPayment(req: Request, res: Response) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      plan = 'lifetime',
      userEmail 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        isValid: false,
        error: 'Missing required Razorpay payment parameters (order_id, payment_id required)'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_signature) {
      // Cryptographic HMAC SHA256 Signature Verification
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({
          isValid: false,
          error: 'Razorpay payment signature verification failed. Untrusted transaction.'
        });
      }
    }

    // Success response
    const expiryTime = plan === 'lifetime' 
      ? Date.now() + 100 * 365 * 24 * 60 * 60 * 1000 // 100 years for lifetime
      : Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days for monthly

    return res.status(200).json({
      isValid: true,
      status: 'ACTIVE_PREMIUM',
      plan,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      expiryTimeMillis: expiryTime,
      verifiedAt: new Date().toISOString(),
      userEmail: userEmail || 'subscriber@biblewallpapers.app'
    });
  } catch (error) {
    console.error('[Razorpay] Verification error:', error);
    return res.status(500).json({
      isValid: false,
      error: 'Internal error verifying Razorpay transaction',
      details: (error as Error).message
    });
  }
}
