import { Request, Response } from 'express';
import { google } from 'googleapis';

const androidPublisher = google.androidpublisher('v3');

export async function handleSubscriptionVerification(req: Request, res: Response) {
  const { purchaseToken, productId, packageName } = req.body;

  if (!purchaseToken || !productId || !packageName) {
    return res.status(400).json({ error: "Missing verification parameters" });
  }

  try {
    // Authenticate using service account in production
    const auth = new google.auth.GoogleAuth({
      scopes: ['[https://www.googleapis.com/auth/androidpublisher](https://www.googleapis.com/auth/androidpublisher)']
    });
    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const subscription = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken
    });

    const expiryTimeMillis = subscription.data.expiryTimeMillis;
    const isValid = !!expiryTimeMillis && Number(expiryTimeMillis) > Date.now();

    return res.status(200).json({
      isValid,
      expiryTimeMillis: Number(expiryTimeMillis) || 0
    });
  } catch (error) {
    return res.status(500).json({ 
      error: "Subscription validation failed", 
      details: (error as Error).message 
    });
  }
}
