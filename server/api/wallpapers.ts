import { Request, Response } from 'express';

export interface WallpaperItem {
  id: string;
  imageUrl: string;
  verseText: string;
  verseReference: string;
  language: string;
  category: string;
  visualTheme: string;
  testament: 'Old' | 'New';
  isPremium: boolean;
  downloads?: number;
  tags?: string[];
}

export const WALLPAPERS_MOCK: WallpaperItem[] = [
  // ==========================================
  // ENGLISH (en) - Covering All 18 Bible Topics & All Themes
  // ==========================================
  {
    id: "wal_en_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures, he leads me beside quiet waters.",
    verseReference: "Psalm 23:1-2",
    language: "en",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 4120,
    tags: ["ocean", "waves", "comfort", "psalms", "shepherd", "peace"]
  },
  {
    id: "wal_en_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "I can do all things through Christ who strengthens me.",
    verseReference: "Philippians 4:13",
    language: "en",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 5890,
    tags: ["mountains", "stars", "strength", "courage", "christ"]
  },
  {
    id: "wal_en_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
    verseReference: "Psalm 46:10",
    language: "en",
    category: "Peace & Comfort",
    visualTheme: "Quiet Forest & Valleys",
    testament: "Old",
    isPremium: false,
    downloads: 4720,
    tags: ["forest", "waterfall", "tranquility", "stillness", "anxiety"]
  },
  {
    id: "wal_en_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
    verseReference: "Jeremiah 29:11",
    language: "en",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 7500,
    tags: ["fog", "sunrise", "future", "hope", "plans", "tomorrow"]
  },
  {
    id: "wal_en_05",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1080&q=80",
    verseText: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways acknowledge him, and he will direct your paths.",
    verseReference: "Proverbs 3:5-6",
    language: "en",
    category: "Faith & Trust",
    visualTheme: "Desert & Sand Dunes",
    testament: "Old",
    isPremium: true,
    downloads: 4980,
    tags: ["desert", "dune", "trust", "path", "proverbs", "faith"]
  },
  {
    id: "wal_en_06",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1080&q=80",
    verseText: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud... Love never fails.",
    verseReference: "1 Corinthians 13:4-8",
    language: "en",
    category: "Love & Grace",
    visualTheme: "Wildflowers & Meadows",
    testament: "New",
    isPremium: false,
    downloads: 5310,
    tags: ["flowers", "golden-hour", "love", "grace", "kindness", "marriage"]
  },
  {
    id: "wal_en_07",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
    verseText: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
    verseReference: "Lamentations 3:22-23",
    language: "en",
    category: "Praise & Worship",
    visualTheme: "Mountain Summits",
    testament: "Old",
    isPremium: true,
    downloads: 6450,
    tags: ["peaks", "morning", "sunrise", "mercy", "faithfulness", "worship"]
  },
  {
    id: "wal_en_08",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    verseReference: "John 3:16",
    language: "en",
    category: "Salvation & Eternal Life",
    visualTheme: "Sunrise & Dawn",
    testament: "New",
    isPremium: false,
    downloads: 8200,
    tags: ["light", "cross", "salvation", "love", "eternal-life", "gospel"]
  },
  {
    id: "wal_en_09",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1080&q=80",
    verseText: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not faint.",
    verseReference: "Isaiah 40:31",
    language: "en",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "Old",
    isPremium: false,
    downloads: 6800,
    tags: ["eagle", "flight", "strength", "wings", "soar", "endurance"]
  },
  {
    id: "wal_en_10",
    imageUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1080&q=80",
    verseText: "Your word is a lamp for my feet, a light on my path.",
    verseReference: "Psalm 119:105",
    language: "en",
    category: "Wisdom & Guidance",
    visualTheme: "Forest Pathways & Trails",
    testament: "Old",
    isPremium: false,
    downloads: 4600,
    tags: ["lantern", "path", "light", "word", "guidance", "wisdom"]
  },
  {
    id: "wal_en_11",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, 'He is my refuge and my fortress.'",
    verseReference: "Psalm 91:1-2",
    language: "en",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 5100,
    tags: ["stars", "cosmos", "shelter", "almighty", "protection", "refuge"]
  },
  {
    id: "wal_en_12",
    imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1080&q=80",
    verseText: "He heals the brokenhearted and binds up their wounds.",
    verseReference: "Psalm 147:3",
    language: "en",
    category: "Healing & Restoration",
    visualTheme: "Living Waterfalls & Streams",
    testament: "Old",
    isPremium: false,
    downloads: 5200,
    tags: ["waterfall", "healing", "comfort", "restoration", "heart"]
  },
  {
    id: "wal_en_13",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1080&q=80",
    verseText: "The name of the Lord is a fortified tower; the righteous run to it and are safe.",
    verseReference: "Proverbs 18:10",
    language: "en",
    category: "Refuge & Protection",
    visualTheme: "Ancient Fortress & Cliffs",
    testament: "Old",
    isPremium: true,
    downloads: 4780,
    tags: ["fortress", "tower", "safe", "shield", "rock"]
  },
  {
    id: "wal_en_14",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1080&q=80",
    verseText: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
    verseReference: "Philippians 4:19",
    language: "en",
    category: "Provision & Blessings",
    visualTheme: "Golden Harvest Fields",
    testament: "New",
    isPremium: false,
    downloads: 6100,
    tags: ["harvest", "wheat", "provision", "abundance", "blessings"]
  },
  {
    id: "wal_en_15",
    imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&q=80",
    verseText: "In all these things we are more than conquerors through him who loved us.",
    verseReference: "Romans 8:37",
    language: "en",
    category: "Victory & Overcoming",
    visualTheme: "Cathedral Skies & Sunbeams",
    testament: "New",
    isPremium: true,
    downloads: 5400,
    tags: ["victory", "conquerors", "sunbeams", "clouds", "overcome"]
  },
  {
    id: "wal_en_16",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80",
    verseText: "The heavens declare the glory of God; the skies proclaim the work of his hands.",
    verseReference: "Psalm 19:1",
    language: "en",
    category: "Creation & God's Majesty",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: false,
    downloads: 7100,
    tags: ["galaxy", "stars", "creation", "majesty", "space"]
  },
  {
    id: "wal_en_17",
    imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1080&q=80",
    verseText: "As far as the east is from the west, so far has he removed our transgressions from us.",
    verseReference: "Psalm 103:12",
    language: "en",
    category: "Forgiveness & Mercy",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 4320,
    tags: ["ocean", "horizon", "forgiveness", "mercy", "clean"]
  },
  {
    id: "wal_en_18",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1080&q=80",
    verseText: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    verseReference: "Philippians 4:6",
    language: "en",
    category: "Prayer & Fasting",
    visualTheme: "Quiet Forest & Valleys",
    testament: "New",
    isPremium: false,
    downloads: 5800,
    tags: ["prayer", "forest", "anxiety", "peace", "thanksgiving"]
  },
  {
    id: "wal_en_19",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1080&q=80",
    verseText: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.",
    verseReference: "Galatians 6:9",
    language: "en",
    category: "Patience & Endurance",
    visualTheme: "Desert & Sand Dunes",
    testament: "New",
    isPremium: true,
    downloads: 4200,
    tags: ["patience", "endurance", "perseverance", "harvest", "faith"]
  },
  {
    id: "wal_en_20",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1080&q=80",
    verseText: "As for me and my household, we will serve the Lord.",
    verseReference: "Joshua 24:15",
    language: "en",
    category: "Family & Marriage",
    visualTheme: "Wildflowers & Meadows",
    testament: "Old",
    isPremium: false,
    downloads: 6350,
    tags: ["family", "household", "home", "serve", "marriage"]
  },
  {
    id: "wal_en_21",
    imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1080&q=80",
    verseText: "The joy of the Lord is your strength.",
    verseReference: "Nehemiah 8:10",
    language: "en",
    category: "Joy & Rejoicing",
    visualTheme: "Living Waterfalls & Streams",
    testament: "Old",
    isPremium: false,
    downloads: 5900,
    tags: ["joy", "strength", "rejoice", "gladness", "waterfall"]
  },

  // ==========================================
  // SPANISH (es)
  // ==========================================
  {
    id: "wal_es_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "El Señor es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar.",
    verseReference: "Salmo 23:1-2",
    language: "es",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 3200,
    tags: ["pastor", "paz", "descanso", "salmo"]
  },
  {
    id: "wal_es_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Todo lo puedo en Cristo que me fortalece.",
    verseReference: "Filipenses 4:13",
    language: "es",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 4100,
    tags: ["fuerza", "cristo", "montaña", "valor"]
  },
  {
    id: "wal_es_03",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Porque yo sé muy bien los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.",
    verseReference: "Jeremías 29:11",
    language: "es",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 3890,
    tags: ["esperanza", "futuro", "planes", "amanecer"]
  },
  {
    id: "wal_es_04",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, sino que tenga vida eterna.",
    verseReference: "Juan 3:16",
    language: "es",
    category: "Salvation & Eternal Life",
    visualTheme: "Sunrise & Dawn",
    testament: "New",
    isPremium: false,
    downloads: 4950,
    tags: ["salvacion", "amor", "vida-eterna", "gracia"]
  },
  {
    id: "wal_es_05",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. Diré yo del Señor: Esperanza mía, y castillo mío; mi Dios, en quien confiaré.",
    verseReference: "Salmo 91:1-2",
    language: "es",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 3410,
    tags: ["refugio", "proteccion", "abrigo", "estrellas"]
  },
  {
    id: "wal_es_06",
    imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&q=80",
    verseText: "Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó.",
    verseReference: "Romanos 8:37",
    language: "es",
    category: "Victory & Overcoming",
    visualTheme: "Cathedral Skies & Sunbeams",
    testament: "New",
    isPremium: false,
    downloads: 3900,
    tags: ["victoria", "vencedores", "cielo", "triunfo"]
  },

  // ==========================================
  // PORTUGUESE (pt)
  // ==========================================
  {
    id: "wal_pt_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
    verseReference: "Salmo 23:1-2",
    language: "pt",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 2950,
    tags: ["pastor", "paz", "salmo", "mar"]
  },
  {
    id: "wal_pt_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Tudo posso naquele que me fortalece.",
    verseReference: "Filipenses 4:13",
    language: "pt",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 3670,
    tags: ["forca", "cristo", "montanha", "coragem"]
  },
  {
    id: "wal_pt_03",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
    verseReference: "Jeremias 29:11",
    language: "pt",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 4100,
    tags: ["esperanca", "futuro", "deus", "planos"]
  },
  {
    id: "wal_pt_04",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
    verseReference: "João 3:16",
    language: "pt",
    category: "Salvation & Eternal Life",
    visualTheme: "Sunrise & Dawn",
    testament: "New",
    isPremium: false,
    downloads: 4320,
    tags: ["salvacao", "amor", "vida-eterna"]
  },
  {
    id: "wal_pt_05",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-Poderoso pode dizer ao Senhor: Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.",
    verseReference: "Salmo 91:1-2",
    language: "pt",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 3100,
    tags: ["refugio", "protecao", "estrelas"]
  },

  // ==========================================
  // FRENCH (fr)
  // ==========================================
  {
    id: "wal_fr_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "L'Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.",
    verseReference: "Psaume 23:1-2",
    language: "fr",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 2450,
    tags: ["berger", "paix", "psaume", "eaux"]
  },
  {
    id: "wal_fr_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Je puis tout par celui qui me fortifie.",
    verseReference: "Philippiens 4:13",
    language: "fr",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 3120,
    tags: ["force", "christ", "montagne"]
  },
  {
    id: "wal_fr_03",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.",
    verseReference: "Jérémie 29:11",
    language: "fr",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 2780,
    tags: ["esperance", "avenir", "projets"]
  },
  {
    id: "wal_fr_04",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    verseReference: "Jean 3:16",
    language: "fr",
    category: "Salvation & Eternal Life",
    visualTheme: "Sunrise & Dawn",
    testament: "New",
    isPremium: false,
    downloads: 3400,
    tags: ["salut", "amour", "vie-eternelle"]
  },
  {
    id: "wal_fr_05",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "Celui qui demeure sous l'abri du Très-Haut repose à l'ombre du Tout-Puissant. Je dis à l'Éternel: Mon refuge et ma forteresse, mon Dieu en qui je me confie!",
    verseReference: "Psaume 91:1-2",
    language: "fr",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 2650,
    tags: ["refuge", "protection", "etoiles"]
  },

  // ==========================================
  // GERMAN (de)
  // ==========================================
  {
    id: "wal_de_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "Der HERR ist mein Hirte, mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser.",
    verseReference: "Psalm 23:1-2",
    language: "de",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 2100,
    tags: ["hirte", "frieden", "psalm", "wasser"]
  },
  {
    id: "wal_de_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "Ich vermag alles durch den, der mich mächtig macht, Christus.",
    verseReference: "Philipper 4:13",
    language: "de",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 2420,
    tags: ["kraft", "berge", "hoffnung"]
  },
  {
    id: "wal_de_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "Seid stille und erkennet, dass ich Gott bin.",
    verseReference: "Psalm 46:10",
    language: "de",
    category: "Peace & Comfort",
    visualTheme: "Quiet Forest & Valleys",
    testament: "Old",
    isPremium: false,
    downloads: 1820,
    tags: ["stille", "see", "natur"]
  },
  {
    id: "wal_de_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.",
    verseReference: "Jeremia 29:11",
    language: "de",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 2340,
    tags: ["zukunft", "hoffnung", "frieden"]
  },
  {
    id: "wal_de_05",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, auf dass alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.",
    verseReference: "Johannes 3:16",
    language: "de",
    category: "Salvation & Eternal Life",
    visualTheme: "Sunrise & Dawn",
    testament: "New",
    isPremium: false,
    downloads: 2890,
    tags: ["liebe", "ewiges-leben", "glaube"]
  },
  {
    id: "wal_de_06",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "Wer unter dem Schirm des Höchsten sitzt und unter dem Schatten des Allmächtigen bleibt.",
    verseReference: "Psalm 91:1",
    language: "de",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 2150,
    tags: ["schutz", "schirm", "allmaechtiger"]
  },

  // ==========================================
  // TAMIL (ta) - தமிழ் வேத வசனங்கள் (Holy Bible Tamil Scripture Wallpapers)
  // ==========================================
  {
    id: "wal_ta_01",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
    verseText: "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன். அவர் என்னைப் பசும்புல் மேய்ச்சல்களில் படுக்கப்பண்ணி, அமர்ந்த தண்ணீர்கள் அண்டையில் என்னைக் கொண்டுபோய் விடுகிறார்.",
    verseReference: "சங்கீதம் 23:1-2",
    language: "ta",
    category: "Peace & Comfort",
    visualTheme: "Ocean & Waters",
    testament: "Old",
    isPremium: false,
    downloads: 5120,
    tags: ["சங்கீதம்", "மேய்ப்பர்", "சமாதானம்", "ஆறுதல்", "தண்ணீர்", "psalm", "shepherd", "peace"]
  },
  {
    id: "wal_ta_02",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
    verseText: "என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ் செய்ய எனக்குப் பெலனுண்டு.",
    verseReference: "பிலிப்பியர் 4:13",
    language: "ta",
    category: "Strength & Courage",
    visualTheme: "Mountain Summits",
    testament: "New",
    isPremium: true,
    downloads: 6240,
    tags: ["கிறிஸ்து", "பெலன்", "தைரியம்", "மலை", "பிலிப்பியர்", "strength", "courage", "christ"]
  },
  {
    id: "wal_ta_03",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
    verseText: "நீங்கள் அமர்ந்திருந்து, நானே தேவனென்று அறிந்துகொள்ளுங்கள்; ஜாதிகளுக்குள்ளே உயர்ந்திருப்பேன், பூமியிலே உயர்ந்திருப்பேன்.",
    verseReference: "சங்கீதம் 46:10",
    language: "ta",
    category: "Peace & Comfort",
    visualTheme: "Quiet Forest & Valleys",
    testament: "Old",
    isPremium: false,
    downloads: 4890,
    tags: ["அமர்ந்திருந்து", "தேவன்", "அமைதி", "காடு", "சங்கீதம்", "stillness", "god"]
  },
  {
    id: "wal_ta_04",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
    verseText: "நீங்கள் எதிர்பார்த்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு நான் உங்கள்பேரில் நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்; அவைகள் தீமைக்கல்ல, சமாதானத்துக்கேதுவான நினைவுகளே.",
    verseReference: "எரேமியா 29:11",
    language: "ta",
    category: "Hope & Future",
    visualTheme: "Sunrise & Dawn",
    testament: "Old",
    isPremium: false,
    downloads: 7810,
    tags: ["நம்பிக்கை", "எதிர்காலம்", "சமாதானம்", "சூரியோதயம்", "எரேமியா", "hope", "future"]
  },
  {
    id: "wal_ta_05",
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1080&q=80",
    verseText: "உன் சுயபுத்தியின்மேல் சாயாமல், உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிருந்து; உன் வழிகளிலெல்லாம் அவரை நினைத்துக்கொள்; அப்பொழுது அவர் உன் பாதைகளைச் செவ்வைப்படுத்துவார்.",
    verseReference: "நீதிமொழிகள் 3:5-6",
    language: "ta",
    category: "Faith & Trust",
    visualTheme: "Desert & Sand Dunes",
    testament: "Old",
    isPremium: true,
    downloads: 5310,
    tags: ["விசுவாசம்", "நம்பிக்கை", "நீதிமொழிகள்", "பாலைவனம்", "பாதை", "trust", "faith"]
  },
  {
    id: "wal_ta_06",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1080&q=80",
    verseText: "அன்பு நீடிய சாந்தமும் தயவுமுள்ளது; அன்புக்குப் பொறாமையில்லை; அன்பு தன்னைத்தானே புகழாது, இறுமாப்பாயிராது... அன்பு ஒருக்காலும் ஒழியாது.",
    verseReference: "1 கொரிந்தியர் 13:4-8",
    language: "ta",
    category: "Love & Grace",
    visualTheme: "Wildflowers & Meadows",
    testament: "New",
    isPremium: false,
    downloads: 5920,
    tags: ["அன்பு", "கிருபை", "தயவு", "மலர்கள்", "கொரிந்தியர்", "love", "grace"]
  },
  {
    id: "wal_ta_07",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1080&q=80",
    verseText: "தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.",
    verseReference: "யோவான் 3:16",
    language: "ta",
    category: "Salvation & Eternal Life",
    visualTheme: "Cathedral Skies & Sunbeams",
    testament: "New",
    isPremium: false,
    downloads: 8200,
    tags: ["இரட்சிப்பு", "நித்தியஜீவன்", "இயேசு", "யோவான்", "வானம்", "salvation", "eternal-life"]
  },
  {
    id: "wal_ta_08",
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1080&q=80",
    verseText: "உன்னதமானவரின் மறைவிலிருக்கிறவன் சர்வவல்லவருடைய நிழலில் தங்குவான். நான் கர்த்தரை நோக்கி: நீர் என் அடைக்கலம், என் கோட்டை, என் தேவன், நான் நம்பியிருக்கிறவர் என்று சொல்லுவேன்.",
    verseReference: "சங்கீதம் 91:1-2",
    language: "ta",
    category: "Refuge & Protection",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 6450,
    tags: ["அடைக்கலம்", "கோட்டை", "சங்கீதம்", "நட்சத்திரங்கள்", "refuge", "protection"]
  },
  {
    id: "wal_ta_09",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1080&q=80",
    verseText: "உம்முடைய வசனம் என் கால்களுக்குத் தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது.",
    verseReference: "சங்கீதம் 119:105",
    language: "ta",
    category: "Wisdom & Guidance",
    visualTheme: "Forest Pathways & Trails",
    testament: "Old",
    isPremium: false,
    downloads: 5740,
    tags: ["வசனம்", "தீபம்", "வெளிச்சம்", "பாதை", "ஞானம்", "guidance", "wisdom"]
  },
  {
    id: "wal_ta_10",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1080&q=80",
    verseText: "பூமியின் குடிகளே, நீங்கள் எல்லாரும் கர்த்தரைக் கெம்பீரமாய்ப் பாடுங்கள். மகிழ்ச்சியோடே கர்த்தருக்கு ஆராதனை செய்து, ஆனந்தசத்தத்தோடே அவர் சந்நிதிமுன் வாருங்கள்.",
    verseReference: "சங்கீதம் 100:1-2",
    language: "ta",
    category: "Praise & Worship",
    visualTheme: "Cathedral Skies & Sunbeams",
    testament: "Old",
    isPremium: false,
    downloads: 4980,
    tags: ["துதி", "ஆராதனை", "மகிழ்ச்சி", "சங்கீதம்", "praise", "worship"]
  },
  {
    id: "wal_ta_11",
    imageUrl: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1080&q=80",
    verseText: "கர்த்தருக்குள் மகிழ்ச்சியாயிருப்பதே உங்களுடைய பெலன்.",
    verseReference: "நெகேமியா 8:10",
    language: "ta",
    category: "Joy & Rejoicing",
    visualTheme: "Living Waterfalls & Streams",
    testament: "Old",
    isPremium: false,
    downloads: 5390,
    tags: ["மகிழ்ச்சி", "பெலன்", "நெகேமியா", "அருவி", "joy", "strength"]
  },
  {
    id: "wal_ta_12",
    imageUrl: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1080&q=80",
    verseText: "கர்த்தாவே, என்னைக் குணமாக்கும், அப்பொழுது குணமாகுவேன்; என்னை இரட்சியும், அப்பொழுது இரட்சிக்கப்படுவேன்; நீரே என் துதி.",
    verseReference: "எரேமியா 17:14",
    language: "ta",
    category: "Healing & Restoration",
    visualTheme: "Living Waterfalls & Streams",
    testament: "Old",
    isPremium: true,
    downloads: 4620,
    tags: ["சுகம்", "குணம்", "இரட்சிப்பு", "எரேமியா", "healing", "restoration"]
  },
  {
    id: "wal_ta_13",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80",
    verseText: "கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்; அவர்கள் ஓடினாலும் இளைப்படையார்கள், நடந்தாலும் சோர்ந்துபோகார்கள்.",
    verseReference: "ஏசாயா 40:31",
    language: "ta",
    category: "Patience & Endurance",
    visualTheme: "Mountain Summits",
    testament: "Old",
    isPremium: true,
    downloads: 6730,
    tags: ["புதுப்பெலன்", "கழுகு", "ஏசாயா", "பொறுமை", "patience", "endurance", "isaiah"]
  },
  {
    id: "wal_ta_14",
    imageUrl: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1080&q=80",
    verseText: "இவை எல்லாவற்றிலேயும் நாம் நம்மில் அன்புகூருகிறவராலே முற்றும் ஜெயங்கொள்ளுகிறவர்களாயிருக்கிறோமே.",
    verseReference: "ரோமர் 8:37",
    language: "ta",
    category: "Victory & Overcoming",
    visualTheme: "Ancient Fortress & Cliffs",
    testament: "New",
    isPremium: false,
    downloads: 5120,
    tags: ["வெற்றி", "ஜெயம்", "ரோமர்", "கிறிஸ்து", "victory", "conqueror"]
  },
  {
    id: "wal_ta_15",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1080&q=80",
    verseText: "என் தேவன் தம்முடைய ஐசுவரியத்தின்படி கிறிஸ்து இயேசுவுக்குள் மகிமையிலே உங்கள் குறைவையெல்லாம் நிறைவாக்குவார்.",
    verseReference: "பிலிப்பியர் 4:19",
    language: "ta",
    category: "Provision & Blessings",
    visualTheme: "Golden Harvest Fields",
    testament: "New",
    isPremium: false,
    downloads: 5880,
    tags: ["நிறைவு", "ஆசீர்வாதம்", "பிலிப்பியர்", "அறுவடை", "provision", "blessing"]
  },
  {
    id: "wal_ta_16",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1080&q=80",
    verseText: "நீங்கள் ஒன்றுக்குங் கவலைப்படாமல், எல்லாவற்றையுங்குறித்து உங்கள் விண்ணப்பங்களை ஸ்தோத்திரத்தோடே கூடிய ஜெபத்தினாலும் வேண்டுதலினாலும் தேவனுக்குத் தெரியப்படுத்துங்கள்.",
    verseReference: "பிலிப்பியர் 4:6",
    language: "ta",
    category: "Prayer & Fasting",
    visualTheme: "Quiet Forest & Valleys",
    testament: "New",
    isPremium: false,
    downloads: 6010,
    tags: ["ஜெபம்", "விண்ணப்பம்", "ஸ்தோத்திரம்", "பிலிப்பியர்", "prayer", "peace"]
  },
  {
    id: "wal_ta_17",
    imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1080&q=80",
    verseText: "நானும் என் வீட்டாருமோவென்றால், கர்த்தரையே சேவிப்போம்.",
    verseReference: "யோசுவா 24:15",
    language: "ta",
    category: "Family & Marriage",
    visualTheme: "Wildflowers & Meadows",
    testament: "Old",
    isPremium: false,
    downloads: 6540,
    tags: ["குடும்பம்", "வீடு", "சேவிப்போம்", "யோசுவா", "family", "household"]
  },
  {
    id: "wal_ta_18",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80",
    verseText: "வானங்கள் தேவனுடைய மகிமையை வெளிப்படுத்துகிறது, ஆகாயவிரிவு அவருடைய கரங்களின் கிரியையை அறிவிக்கிறது.",
    verseReference: "சங்கீதம் 19:1",
    language: "ta",
    category: "Creation & God's Majesty",
    visualTheme: "Starry Night & Cosmos",
    testament: "Old",
    isPremium: true,
    downloads: 7120,
    tags: ["வானங்கள்", "மகிமை", "சங்கீதம்", "ஆகாயவிரிவு", "நட்சத்திரங்கள்", "creation", "majesty"]
  }
];

// Offline Cache settings
let autoChangerSettings = {
  enabled: true,
  intervalMinutes: 60, // 1 hour auto rotation
  targetScreen: 'lockscreen',
  includedCategories: ['All'],
  lastChangedTimestamp: Date.now()
};

export function handleWallpapersRequest(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  const language = (req.query.language as string) || 'en';
  const category = req.query.category as string;
  const visualTheme = req.query.visualTheme as string;
  const testament = req.query.testament as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '60', 10);

  let filtered = WALLPAPERS_MOCK.filter(w => w.language === language);

  if (filtered.length === 0) {
    filtered = WALLPAPERS_MOCK.filter(w => w.language === 'en');
  }

  // Flexible category matching across topics
  if (category && category !== 'All') {
    const cleanCat = category.toLowerCase().replace(/[^a-z0-9]/g, '');
    filtered = filtered.filter(w => {
      const wClean = w.category.toLowerCase().replace(/[^a-z0-9]/g, '');
      return wClean.includes(cleanCat) || cleanCat.includes(wClean);
    });
  }

  // Flexible theme matching across visual styles
  if (visualTheme && visualTheme !== 'All' && visualTheme !== 'All Aesthetics') {
    const cleanTheme = visualTheme.toLowerCase().replace(/[^a-z0-9]/g, '');
    filtered = filtered.filter(w => {
      const wClean = w.visualTheme.toLowerCase().replace(/[^a-z0-9]/g, '');
      return wClean.includes(cleanTheme) || cleanTheme.includes(wClean);
    });
  }

  if (testament && testament !== 'All') {
    filtered = filtered.filter(w => w.testament === testament);
  }

  if (search) {
    filtered = filtered.filter(w => 
      w.verseText.toLowerCase().includes(search) || 
      w.verseReference.toLowerCase().includes(search) ||
      w.category.toLowerCase().includes(search) ||
      w.visualTheme.toLowerCase().includes(search) ||
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
    languages: ["en", "ta", "es", "pt", "fr", "de"],
    offlineReady: true
  });
}

export function handleOfflinePackRequest(_req: Request, res: Response) {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).json({
    version: '1.3.0',
    generatedAt: new Date().toISOString(),
    total: WALLPAPERS_MOCK.length,
    wallpapers: WALLPAPERS_MOCK,
    autoChangeIntervalMinutes: 60,
    offlineServerStatus: 'OPERATIONAL'
  });
}

export function handleAutoChangeSettings(req: Request, res: Response) {
  if (req.method === 'POST') {
    const { enabled, intervalMinutes, targetScreen, includedCategories } = req.body;
    if (typeof enabled === 'boolean') autoChangerSettings.enabled = enabled;
    if (typeof intervalMinutes === 'number') autoChangerSettings.intervalMinutes = intervalMinutes;
    if (targetScreen) autoChangerSettings.targetScreen = targetScreen;
    if (Array.isArray(includedCategories)) autoChangerSettings.includedCategories = includedCategories;
    autoChangerSettings.lastChangedTimestamp = Date.now();
    return res.status(200).json({ success: true, settings: autoChangerSettings });
  }

  res.status(200).json(autoChangerSettings);
}

/**
 * Daily verse of the day endpoint:
 * Refreshes every 24 hours for standard users.
 * Refreshes every 1 hour for subscribers!
 */
export function handleDailyVerseRequest(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'public, max-age=60');

  const language = (req.query.language as string) || 'en';
  const isPremium = req.query.isPremium === 'true';

  let list = WALLPAPERS_MOCK.filter(w => w.language === language);
  if (list.length === 0) {
    list = WALLPAPERS_MOCK.filter(w => w.language === 'en');
  }

  const now = Date.now();
  // 1 hour for subscribers, 24 hours for standard users
  const intervalMs = isPremium ? (60 * 60 * 1000) : (24 * 60 * 60 * 1000);
  const bucket = Math.floor(now / intervalMs);
  const nextRefreshTimestamp = (bucket + 1) * intervalMs;

  const charSum = language.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = Math.abs((bucket * 9301 + 49297 + charSum) % 233280);
  const index = Math.floor((seed / 233280) * list.length) % list.length;
  const verse = list[index];

  res.status(200).json({
    verse,
    intervalHours: isPremium ? 1 : 24,
    cadence: isPremium ? 'HOURLY_SUBSCRIBER' : 'DAILY_STANDARD',
    nextRefreshTimestamp,
    remainingSeconds: Math.max(0, Math.floor((nextRefreshTimestamp - now) / 1000)),
    serverTime: new Date().toISOString()
  });
}
