import { Request, Response } from 'express';

export interface WallpaperItem {
  id: string;
  imageUrl: string;
  verseText: string;
  verseReference: string;
  language: string;
  category: string;
  isPremium: boolean;
  downloads?: number;
  tags?: string[];
}

export const WALLPAPERS_MOCK: WallpaperItem[] = [
  // --- ENGLISH (en) ---
  {
    id: "wal_en_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "The Lord is my shepherd; I shall not want.",
    verseReference: "Psalm 23:1",
    language: "en",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 1420,
    tags: ["ocean", "sunset", "comfort", "psalms"]
  },
  {
    id: "wal_en_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "I can do all things through Christ who strengthens me.",
    verseReference: "Philippians 4:13",
    language: "en",
    category: "Strength",
    isPremium: true,
    downloads: 2890,
    tags: ["mountains", "stars", "strength", "courage"]
  },
  {
    id: "wal_en_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Be still, and know that I am God.",
    verseReference: "Psalm 46:10",
    language: "en",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 3120,
    tags: ["forest", "waterfall", "tranquility"]
  },
  {
    id: "wal_en_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    verseReference: "Jeremiah 29:11",
    language: "en",
    category: "Hope",
    isPremium: false,
    downloads: 4500,
    tags: ["fog", "sunrise", "future", "hope"]
  },
  {
    id: "wal_en_05",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1080&q=80",
    verseText: "Trust in the Lord with all your heart and lean not on your own understanding.",
    verseReference: "Proverbs 3:5",
    language: "en",
    category: "Faith",
    isPremium: true,
    downloads: 1980,
    tags: ["desert", "dune", "trust", "path"]
  },
  {
    id: "wal_en_06",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1080&q=80",
    verseText: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
    verseReference: "1 Corinthians 13:4",
    language: "en",
    category: "Love & Grace",
    isPremium: false,
    downloads: 2310,
    tags: ["flowers", "golden-hour", "love", "grace"]
  },
  {
    id: "wal_en_07",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
    verseText: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.",
    verseReference: "Lamentations 3:22-23",
    language: "en",
    category: "Praise",
    isPremium: true,
    downloads: 3450,
    tags: ["peaks", "morning", "sunrise", "mercy"]
  },

  // --- SPANISH (es) ---
  {
    id: "wal_es_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "Jehová es mi pastor; nada me faltará.",
    verseReference: "Salmo 23:1",
    language: "es",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 1200,
    tags: ["playa", "mar", "paz"]
  },
  {
    id: "wal_es_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Todo lo puedo en Cristo que me fortalece.",
    verseReference: "Filipenses 4:13",
    language: "es",
    category: "Strength",
    isPremium: true,
    downloads: 2100,
    tags: ["montañas", "fuerza", "estrellas"]
  },
  {
    id: "wal_es_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Estad quietos, y conoced que yo soy Dios.",
    verseReference: "Salmo 46:10",
    language: "es",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 1850,
    tags: ["quietud", "bosque", "naturaleza"]
  },
  {
    id: "wal_es_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.",
    verseReference: "Jeremías 29:11",
    language: "es",
    category: "Hope",
    isPremium: false,
    downloads: 2900,
    tags: ["esperanza", "futuro", "fe"]
  },
  {
    id: "wal_es_05",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
    verseText: "Nuevas son cada mañana; grande es tu fidelidad.",
    verseReference: "Lamentaciones 3:23",
    language: "es",
    category: "Praise",
    isPremium: true,
    downloads: 1670,
    tags: ["fidelidad", "amanecer", "gloria"]
  },

  // --- PORTUGUESE (pt) ---
  {
    id: "wal_pt_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "O Senhor é o meu pastor; de nada terei falta.",
    verseReference: "Salmos 23:1",
    language: "pt",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 1140,
    tags: ["mar", "pastor", "paz"]
  },
  {
    id: "wal_pt_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Tudo posso naquele que me fortalece.",
    verseReference: "Filipenses 4:13",
    language: "pt",
    category: "Strength",
    isPremium: true,
    downloads: 2400,
    tags: ["força", "estrelas", "cristo"]
  },
  {
    id: "wal_pt_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Aquietai-vos e sabei que eu sou Deus.",
    verseReference: "Salmos 46:10",
    language: "pt",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 1300,
    tags: ["quietude", "lago", "serenidade"]
  },
  {
    id: "wal_pt_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Pois eu bem sei os planos que tenho para vós, diz o Senhor; planos de paz, e não de mal, para vos dar um futuro e uma esperança.",
    verseReference: "Jeremias 29:11",
    language: "pt",
    category: "Hope",
    isPremium: false,
    downloads: 2100,
    tags: ["esperanca", "futuro"]
  },

  // --- FRENCH (fr) ---
  {
    id: "wal_fr_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "L'Éternel est mon berger: je ne manquerai de rien.",
    verseReference: "Psaumes 23:1",
    language: "fr",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 870,
    tags: ["berger", "ocean", "paix"]
  },
  {
    id: "wal_fr_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Je puis tout par celui qui me fortifie.",
    verseReference: "Philippiens 4:13",
    language: "fr",
    category: "Strength",
    isPremium: true,
    downloads: 1540,
    tags: ["force", "montagne", "foi"]
  },
  {
    id: "wal_fr_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Arrêtez, et sachez que je suis Dieu.",
    verseReference: "Psaumes 46:10",
    language: "fr",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 990,
    tags: ["calme", "dieu", "serenite"]
  },

  // --- GERMAN (de) ---
  {
    id: "wal_de_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "Der Herr ist mein Hirte, mir wird nichts mangeln.",
    verseReference: "Psalm 23:1",
    language: "de",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 910,
    tags: ["hirte", "meer", "ruhe"]
  },
  {
    id: "wal_de_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Ich vermag alles durch den, der mich mächtig macht, Christus.",
    verseReference: "Philipper 4:13",
    language: "de",
    category: "Strength",
    isPremium: true,
    downloads: 1420,
    tags: ["kraft", "berge", "hoffnung"]
  },
  {
    id: "wal_de_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Seid stille und erkennet, dass ich Gott bin.",
    verseReference: "Psalm 46:10",
    language: "de",
    category: "Peace & Comfort",
    isPremium: false,
    downloads: 820,
    tags: ["stille", "see", "natur"]
  }
];

export function handleWallpapersRequest(req: Request, res: Response) {
  const language = (req.query.language as string) || 'en';
  const category = req.query.category as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);

  let filtered = WALLPAPERS_MOCK.filter(w => w.language === language);

  // Fallback to English if no items for requested language
  if (filtered.length === 0) {
    filtered = WALLPAPERS_MOCK.filter(w => w.language === 'en');
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(w => w.category === category);
  }

  if (search) {
    filtered = filtered.filter(w => 
      w.verseText.toLowerCase().includes(search) || 
      w.verseReference.toLowerCase().includes(search) ||
      (w.tags && w.tags.some(t => t.toLowerCase().includes(search)))
    );
  }

  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.status(200).json({
    data: paginated,
    total: filtered.length,
    page,
    limit,
    languages: ["en", "es", "pt", "fr", "de"]
  });
}
