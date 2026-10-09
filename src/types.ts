export interface Wallpaper {
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

export interface LanguageOption {
  code: string;
  displayName: string;
  flag: string;
}

export type PreviewMode = 'clean' | 'lockscreen' | 'homescreen';
export type FontStyle = 'playfair' | 'cinzel' | 'script' | 'sans';
export type TextPosition = 'top' | 'center' | 'bottom';
export type TextColor = 'white' | 'ivory' | 'gold';

export interface CustomizationSettings {
  fontStyle: FontStyle;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  textPosition: TextPosition;
  overlayDarkness: number; // 0 to 80
  textColor: TextColor;
  showShadow: boolean;
}
