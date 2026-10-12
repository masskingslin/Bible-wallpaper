export interface Wallpaper {
  id: string;
  imageUrl: string;
  verseText: string;
  verseReference: string;
  language: string;
  category: string;
  collection?: string;
  visualTheme?: string;
  testament?: 'Old' | 'New';
  isPremium: boolean;
  downloads?: number;
  tags?: string[];
  wallpaperQuote?: string;
  caption?: string;
  resolution?: string;
  file?: string;
  sermonExcerpt?: string;
}

export interface VerseQuoteData {
  wallpaperId: string;
  quote: string;
  sermonExcerpt: string;
  authorOrPreacher: string;
  theme: string;
  scriptureRef: string;
  contextNote?: string;
}

export interface LanguageOption {
  code: string;
  displayName: string;
  flag: string;
}

export type PreviewMode = 'clean' | 'lockscreen' | 'homescreen';
export type FontStyle = 'playfair' | 'cinzel' | 'script' | 'sans';
export type TextPosition = 'top' | 'center' | 'bottom';
export type TextColor = 'white' | 'ivory' | 'gold';
export type AppThemeMode = 'dark' | 'light';
export type ThemePreference = 'dark' | 'light' | 'auto_sun';

export interface SolarThemeConfig {
  mode: ThemePreference; // 'dark' | 'light' | 'auto_sun'
  useGeolocation: boolean;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  customScheduleEnabled: boolean;
  customSunrise: string; // "06:30"
  customSunset: string; // "18:45"
  manualSimulation?: {
    active: boolean;
    isDaytime: boolean;
  };
}

export type ImageFilter = 'none' | 'grayscale' | 'sepia';
export type WallpaperFadeMode = 'none' | 'soft' | 'deep' | 'dreamy';
export type WallpaperSortOption = 'newest' | 'downloads' | 'reference';

export type FontThemeId = 'cathedral' | 'sacred_script' | 'heritage_serif' | 'modern_clarity' | 'golden_gothic';

export interface FontThemeOption {
  id: FontThemeId;
  name: string;
  subtitle: string;
  verseFontClass: string;
  refFontClass: string;
  description: string;
}

export interface CustomizationSettings {
  fontStyle: FontStyle;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  textPosition: TextPosition;
  overlayDarkness: number; // 0 to 80
  textColor: TextColor;
  showShadow: boolean;
  imageFilter?: ImageFilter;
  fontTheme?: FontThemeId;
  wallpaperFade?: WallpaperFadeMode;
}

export interface BibleTopicInfo {
  id: string;
  name: string;
  shortDesc: string;
  biblicalContext: string;
  keyVerseRef: string;
  keyVerseText: string;
  recommendedThemes: string[];
  themeRationale: string;
  gradient: string;
  accentColor: string;
  tag: string;
}

