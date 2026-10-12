import { WALLPAPERS_MOCK, WallpaperItem } from './wallpapers.js';

export interface DailyVerseQuoteResponse {
  wallpaperId: string;
  quote: string;
  sermonExcerpt: string;
  authorOrPreacher: string;
  theme: string;
  scriptureRef: string;
  contextNote?: string;
}

// Curated theological reflections, sermon excerpts, and inspiring quotes
const THEMATIC_QUOTES: Record<string, {
  quote: string;
  sermonExcerpt: string;
  author: string;
}> = {
  "Peace & Comfort": {
    quote: "Peace is not the absence of trouble in your life, but the unwavering presence of God.",
    sermonExcerpt: "When life's storms surge and billows roll, remember the Master in the vessel. His peace is not quietness born of ignorance, but deep tranquility resting in sovereign grace.",
    author: "Charles Spurgeon"
  },
  "Strength & Courage": {
    quote: "Faith does not eliminate questions; faith knows who holds the answer and rises with divine courage.",
    sermonExcerpt: "God never promised that the battle would be effortless, but He promised that you would never face it alone. When you are weak in yourself, His divine strength is made perfect.",
    author: "A.W. Tozer"
  },
  "Faith & Trust": {
    quote: "To trust God in the darkest night is to honor Him as Lord of eternal light.",
    sermonExcerpt: "Faith steps out on the seeming void and finds the unshakable rock beneath its feet. Cast your cares unreservedly upon Him, for His faithfulness spans from everlasting to everlasting.",
    author: "D.L. Moody"
  },
  "Love & Compassion": {
    quote: "Though our human emotions ebb and flow, God's boundless love for us never wavers.",
    sermonExcerpt: "Love is the true badge of Christ's disciples. As grace has been freely poured into your heart, let mercy and forgiveness overflow to every soul you meet today.",
    author: "C.S. Lewis"
  },
  "Hope & Renewal": {
    quote: "Every morning arrives with fresh mercies from the throne of heaven.",
    sermonExcerpt: "Hope is the anchor of the soul, sure and steadfast. Even when winter lingers in your circumstances, God is already preparing the springtime of His redemption.",
    author: "Corrie ten Boom"
  },
  "Healing & Restoration": {
    quote: "The Lord's promises are the sacred medicine that heals fear and mends the brokenhearted.",
    sermonExcerpt: "By His stripes we are healed. No wound is too deep for the Great Physician's touch, and no tear shed in secret goes unseen by our compassionate Redeemer.",
    author: "John Wesley"
  },
  "Guidance & Wisdom": {
    quote: "God never leads His beloved where His sustaining grace cannot keep them.",
    sermonExcerpt: "His Word is a lamp unto our feet—not a blinding spotlight for miles ahead, but gentle and faithful illumination for the very next step of obedience.",
    author: "Elisabeth Elliot"
  },
  "Praise & Worship": {
    quote: "Worship is the highest calling of the soul, turning our eyes from the trial to the King.",
    sermonExcerpt: "When you lift your voice in genuine praise, the atmosphere of defeat is shattered. Praise acknowledges that God is greater than anything the world can present against you.",
    author: "A.W. Tozer"
  },
  "Protection & Safety": {
    quote: "He who watches over you neither slumbers nor sleeps; you dwell under the Almighty's shadow.",
    sermonExcerpt: "The Lord is your fortress and high tower. No fiery dart can penetrate the shield of faith when your life is hidden securely with Christ in God.",
    author: "John Bunyan"
  },
  "Joy & Rejoicing": {
    quote: "Joy is not dependent on circumstances; joy is rooted in the triumph of the Cross.",
    sermonExcerpt: "Rejoice in the Lord always! Worldly happiness shifts like sand, but the joy of the Lord is an unquenchable spring and the divine strength of your everyday walk.",
    author: "Charles Spurgeon"
  },
  "Grace & Mercy": {
    quote: "Grace is God giving us what we could never earn and could never repay.",
    sermonExcerpt: "At the Cross, perfect justice and infinite mercy met in divine harmony. You are justified by faith, welcomed into sonship, and clothed in the righteousness of Christ.",
    author: "Martin Luther"
  },
  "Prayer & Devotion": {
    quote: "Prayer is not overcoming God's reluctance; it is laying hold of His highest willingness.",
    sermonExcerpt: "When knees bow in secret prayer, heaven listens with tender attentiveness. Bring your deepest petitions boldly to the throne of grace, for your Father delights in your fellowship.",
    author: "George Müller"
  },
  "Creation & Nature": {
    quote: "The heavens declare the glory of God, and every sunrise sings of His faithfulness.",
    sermonExcerpt: "Walk through this world with reverent wonder. From towering mountains to the smallest flower, all creation proclaims the majesty and tender care of the Creator.",
    author: "Jonathan Edwards"
  },
  "Patience & Perseverance": {
    quote: "Wait on the Lord; what He is crafting in the quiet season is greater than your rush.",
    sermonExcerpt: "Patience is faith in the process of time. When you wait patiently upon God, you are not wasting time—you are allowing divine strength to be renewed within your spirit.",
    author: "Andrew Murray"
  },
  "Victory & Overcoming": {
    quote: "In all these things we are more than conquerors through Him who loved us.",
    sermonExcerpt: "The empty tomb guarantees that the final word never belongs to sorrow, sin, or death. Walk in victory today, knowing that Christ has overcome the world.",
    author: "Billy Graham"
  },
  "Righteousness & Holiness": {
    quote: "Holiness is not a burdensome duty, but the joyful fragrance of a life walking with God.",
    sermonExcerpt: "Blessed are the pure in heart, for they shall see God. Seek first His righteousness, and let the beauty of Christ shine through your thoughts, words, and actions.",
    author: "J.C. Ryle"
  },
  "Kingdom & Eternal Life": {
    quote: "This world is not our final home; we are pilgrims journeying toward the celestial city.",
    sermonExcerpt: "Fix your eyes on things above, where Christ sits at the right hand of God. The trials of this present time are not worthy to be compared with the eternal weight of glory.",
    author: "Richard Baxter"
  },
  "Family & Fellowship": {
    quote: "A Christ-centered home is an oasis of peace and a beacon of hope to the surrounding world.",
    sermonExcerpt: "Bear one another's burdens and so fulfill the law of Christ. True Christian fellowship knits hearts together in selfless love, prayer, and mutual encouragement.",
    author: "Francis Schaeffer"
  }
};

const TAMIL_THEMATIC_QUOTES: Record<string, {
  quote: string;
  sermonExcerpt: string;
  author: string;
}> = {
  default: {
    quote: "கர்த்தருக்குக் காத்திருக்கிறவர்கள் புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்.",
    sermonExcerpt: "தேவனுடைய கிருபை காலைதோறும் புதியது. உங்கள் பாரங்களை கர்த்தர்மேல் வைத்துவிடுங்கள்; அவர் உங்களை ஆதரிப்பார். அவர் நீதிமானை ஒருபோதும் தள்ளாடவொட்டார்.",
    author: "சாது சுந்தர் சிங் (Sadhu Sundar Singh)"
  },
  "அன்பு": {
    quote: "அன்பு ஒருக்காலும் ஒழியாது; தேவனுடைய அன்பு நம் இருதயங்களில் ஊற்றப்பட்டிருக்கிறது.",
    sermonExcerpt: "கிறிஸ்துவின் அன்பு மனித அறிவுக்கு அப்பாற்பட்டது. அவர் முதலில் நம்மை நேசித்தபடியால், நாமும் ஒருவரையொருவர் மனதார நேசித்து மன்னிக்கக் கடவோம்.",
    author: "தேவ ஊழியர் பவுல் (Apostle Paul Tradition)"
  },
  "சமாதானம்": {
    quote: "எல்லா புத்திக்கும் மேலான தேவசமாதானம் உங்கள் இருதயங்களையும் சிந்தைகளையும் காத்துக்கொள்ளும்.",
    sermonExcerpt: "உலகம் தருகிற சமாதானம்போல அல்ல, கிறிஸ்து மெய்யான சமாதானத்தை அருளுகிறார். எந்தக் கவலையாயினும் ஜெபத்தினாலும் விண்ணப்பத்தினாலும் தேவனுக்குத் தெரியப்படுத்துங்கள்.",
    author: "சாது சுந்தர் சிங் (Sadhu Sundar Singh)"
  },
  "நம்பிக்கை": {
    quote: "நம்பிக்கை வெட்கப்படுத்தாது; தேவனுடைய வாக்குத்தத்தங்கள் என்றென்றைக்கும் மாறாதவை.",
    sermonExcerpt: "கர்த்தர் உங்கள்மேல் நினைவாயிருக்கிறார், அவர் ஆசீர்வதிப்பார். உங்கள் எதிர்காலத்தைக் குறித்த தேவனுடைய நினைவுகள் சமாதானத்துக்கேதுவான நல்நினைவுகள்.",
    author: "போதகர் விக்டர் (Pastor Devotional)"
  },
  "சுகம் & பாதுகாப்பு": {
    quote: "நானே உன் பரிகாரியாகிய கர்த்தர்; உன்னைக் குணமாக்கிப் புதுவாழ்வு தருவேன்.",
    sermonExcerpt: "உன்னதமானவரின் மறைவிலிருக்கிறவன் சர்வவல்லவருடைய நிழலில் தங்குவான். எந்தப் பொல்லாப்பும் உனக்கு நேரிடாது, எந்த வாதையும் உன் கூடாரத்தை அணுகாது.",
    author: "சங்கீத தியானம் (Psalms Meditation)"
  }
};

export function getQuoteForWallpaper(wallpaperId: string, preferredLanguage?: string): DailyVerseQuoteResponse | null {
  const wallpaper = WALLPAPERS_MOCK.find((w) => w.id === wallpaperId);
  if (!wallpaper) {
    // If not found by exact ID, fallback to first item
    return null;
  }

  const isTamil = wallpaper.language === 'ta' || preferredLanguage === 'ta';

  if (isTamil) {
    let matchedTamil = TAMIL_THEMATIC_QUOTES.default;
    if (wallpaper.category.includes('அன்பு') || wallpaper.category.toLowerCase().includes('love')) {
      matchedTamil = TAMIL_THEMATIC_QUOTES['அன்பு'];
    } else if (wallpaper.category.includes('சமாதானம்') || wallpaper.category.toLowerCase().includes('peace')) {
      matchedTamil = TAMIL_THEMATIC_QUOTES['சமாதானம்'];
    } else if (wallpaper.category.includes('நம்பிக்கை') || wallpaper.category.toLowerCase().includes('hope')) {
      matchedTamil = TAMIL_THEMATIC_QUOTES['நம்பிக்கை'];
    } else if (wallpaper.category.includes('குணம்') || wallpaper.category.includes('பாதுகாப்பு') || wallpaper.category.toLowerCase().includes('healing')) {
      matchedTamil = TAMIL_THEMATIC_QUOTES['சுகம் & பாதுகாப்பு'];
    }

    return {
      wallpaperId: wallpaper.id,
      quote: wallpaper.wallpaperQuote || matchedTamil.quote,
      sermonExcerpt: matchedTamil.sermonExcerpt,
      authorOrPreacher: matchedTamil.author,
      theme: wallpaper.category,
      scriptureRef: wallpaper.verseReference,
      contextNote: "தினசரி வேத தியானம் மற்றும் ஆவிக்குரிய ஆசீர்வாதம்"
    };
  }

  // English & other multilingual translations
  const thematic = THEMATIC_QUOTES[wallpaper.category] || THEMATIC_QUOTES["Peace & Comfort"];

  return {
    wallpaperId: wallpaper.id,
    quote: wallpaper.wallpaperQuote || thematic.quote,
    sermonExcerpt: thematic.sermonExcerpt,
    authorOrPreacher: thematic.author,
    theme: wallpaper.category,
    scriptureRef: wallpaper.verseReference,
    contextNote: `Pastoral devotion on ${wallpaper.verseReference} (${wallpaper.category})`
  };
}

export function getAllQuotesList(language?: string): DailyVerseQuoteResponse[] {
  const list = language 
    ? WALLPAPERS_MOCK.filter((w) => w.language === language)
    : WALLPAPERS_MOCK;

  return list.slice(0, 100).map((w) => {
    return getQuoteForWallpaper(w.id, language) || {
      wallpaperId: w.id,
      quote: w.wallpaperQuote || "Trust in the Lord with all your heart.",
      sermonExcerpt: "God's promises are yes and amen in Jesus Christ. Walk in faith today.",
      authorOrPreacher: "Charles Spurgeon",
      theme: w.category,
      scriptureRef: w.verseReference
    };
  });
}
