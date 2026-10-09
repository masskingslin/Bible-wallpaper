import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  handleWallpapersRequest, 
  handleOfflinePackRequest, 
  handleAutoChangeSettings,
  handleDailyVerseRequest
} from './server/api/wallpapers.js';
import { handleSubscriptionVerification } from './server/api/verify-subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/wallpapers', handleWallpapersRequest);
  app.get('/api/offline-pack', handleOfflinePackRequest);
  app.get('/api/verse-of-the-day', handleDailyVerseRequest);
  app.all('/api/auto-change-settings', handleAutoChangeSettings);
  app.post('/api/verify-subscription', handleSubscriptionVerification);

  // Health & Offline Server Status check
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      offlineReady: true,
      autoChangerInterval: '1 hour',
      timestamp: new Date().toISOString() 
    });
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Bible Wallpapers] Server running at http://0.0.0.0:${PORT} with offline support and 1-hour auto-changer`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
