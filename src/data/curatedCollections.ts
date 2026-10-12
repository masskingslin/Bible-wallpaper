export interface CuratedCollectionInfo {
  id: string;
  name: string;
  nameTamil: string;
  shortDesc: string;
  count: number;
  iconName: string;
  gradient: string;
  badgeColor: string;
  resolution: string;
  versesRange: string;
  highlightPassages: string[];
}

export const CURATED_COLLECTIONS: CuratedCollectionInfo[] = [
  {
    id: 'Jesus_Christ',
    name: 'Jesus Christ',
    nameTamil: 'இயேசு கிறிஸ்து',
    shortDesc: 'The Way, Truth, Life & Resurrection of our Lord Savior',
    count: 30,
    iconName: 'Crown',
    gradient: 'from-amber-500 via-yellow-500 to-amber-600',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    resolution: '2160x3840 4K UHD',
    versesRange: 'John 3:16, John 14:6, Matthew 11:28, Colossians 1:17 & Revelation 22:13',
    highlightPassages: ['John 3:16', 'John 14:6', 'John 11:25', 'Matthew 28:20']
  },
  {
    id: 'Blessings_Miracles',
    name: 'Blessings & Miracles',
    nameTamil: 'ஆசீர்வாதங்கள் & அற்புதங்கள்',
    shortDesc: 'Divine favor, supernatural wonders, and opened floodgates of heaven',
    count: 30,
    iconName: 'Sparkles',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    resolution: '2160x3840 4K UHD',
    versesRange: 'Numbers 6:24–26, Deuteronomy 28:2, Psalm 77:14, Malachi 3:10 & Ephesians 3:20',
    highlightPassages: ['Numbers 6:24-26', 'Deuteronomy 28:2', 'Psalm 126:3', 'Ephesians 3:20']
  },
  {
    id: 'Success_Strength_Prosperity',
    name: 'Success, Strength & Prosperity',
    nameTamil: 'வெற்றி, பெலன் & செழிப்பு',
    shortDesc: 'Flourishing in God’s calling, spiritual fortitude, and abundance',
    count: 30,
    iconName: 'Flame',
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    resolution: '2160x3840 4K UHD',
    versesRange: 'Joshua 1:8, Isaiah 40:31, Philippians 4:13, Psalm 23:1 & Matthew 6:33',
    highlightPassages: ['Joshua 1:8', 'Isaiah 40:31', 'Philippians 4:13', 'Matthew 6:33']
  },
  {
    id: 'Love_Peace_Hope',
    name: 'Love, Peace & Hope',
    nameTamil: 'அன்பு, சமாதானம் & நம்பிக்கை',
    shortDesc: 'Unfailing agape love, peaceful stillness, and unshakeable hope',
    count: 30,
    iconName: 'Heart',
    gradient: 'from-rose-500 via-pink-500 to-purple-600',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    resolution: '2160x3840 4K UHD',
    versesRange: '1 Corinthians 13, Romans 8:38, John 14:27, Jeremiah 29:11 & Revelation 21:4',
    highlightPassages: ['1 Corinthians 13:4-7', 'John 14:27', 'Romans 8:38-39', 'Jeremiah 29:11']
  },
  {
    id: 'Healing_Protection',
    name: 'Healing & Protection',
    nameTamil: 'சுகம் & தெய்வீக பாதுகாப்பு',
    shortDesc: 'The Great Physician’s restoration and refuge under Almighty wings',
    count: 30,
    iconName: 'Shield',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    resolution: '2160x3840 4K UHD',
    versesRange: 'Exodus 15:26, Psalm 91:1-4, Isaiah 53:5, Psalm 23:4 & Proverbs 18:10',
    highlightPassages: ['Exodus 15:26', 'Psalm 91:1-2', 'Isaiah 53:5', 'Psalm 121:7-8']
  }
];
