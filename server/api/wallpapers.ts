import { Request, Response } from 'express';

export interface WallpaperItem {
  id: string;
  imageUrl: string;
  verseText: string;
  verseReference: string;
  language: string;
  isPremium: boolean;
}

const WALLPAPERS_MOCK: WallpaperItem[] = [
  {
    id: "wal_01",
    imageUrl: "[https://images.unsplash.com/photo-1507525428034-b723cf961d3e](https://images.unsplash.com/photo-1507525428034-b723cf961d3e)",
    verseText: "The Lord is my shepherd; I shall not want.",
    verseReference: "Psalm 23:1",
    language: "en",
    isPremium: false
  },
  {
    id: "wal_02",
    imageUrl: "[https://images.unsplash.com/photo-1519681393784-d120267933ba](https://images.unsplash.com/photo-1519681393784-d120267933ba)",
    verseText: "I can do all things through Christ who strengthens me.",
    verseReference: "Philippians 4:13",
    language: "en",
    isPremium: true
  }
];

export function handleWallpapersRequest(req: Request, res: Response) {
  const language = (req.query.language as string) || 'en';
  const filtered = WALLPAPERS_MOCK.filter(w => w.language === language);
  res.status(200).json(filtered);
}
