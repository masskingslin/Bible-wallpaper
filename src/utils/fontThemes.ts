import { FontThemeId, FontThemeOption, WallpaperFadeMode } from '../types';

export const FONT_THEMES: FontThemeOption[] = [
  {
    id: 'cathedral',
    name: 'Cathedral Classic',
    subtitle: 'Majestic Serif & Roman Inscription',
    verseFontClass: 'font-theme-cathedral-verse',
    refFontClass: 'font-theme-cathedral-ref',
    description: 'Playfair Display italic verse paired with monumental Cinzel Roman references, evocative of grand stone cathedrals.',
  },
  {
    id: 'sacred_script',
    name: 'Sacred Script',
    subtitle: 'Flowing Calligraphic Devotion',
    verseFontClass: 'font-theme-sacred-script-verse',
    refFontClass: 'font-theme-sacred-script-ref',
    description: 'Handcrafted Great Vibes cursive script paired with noble roman references for an intimate, poetic prayer tone.',
  },
  {
    id: 'heritage_serif',
    name: 'Heritage Serif',
    subtitle: 'Vintage Antiqua & Geneva Bible',
    verseFontClass: 'font-theme-heritage-serif-verse',
    refFontClass: 'font-theme-heritage-serif-ref',
    description: 'Literary Cormorant Garamond and traditional serif rendering reminiscent of historic illuminated scriptures.',
  },
  {
    id: 'modern_clarity',
    name: 'Modern Clarity',
    subtitle: 'Contemporary Minimalist Sans',
    verseFontClass: 'font-theme-modern-clarity-verse',
    refFontClass: 'font-theme-modern-clarity-ref',
    description: 'Crisp Plus Jakarta Sans typography designed for maximum reading clarity across high-resolution displays.',
  },
  {
    id: 'golden_gothic',
    name: 'Golden Gothic',
    subtitle: 'Imperial Roman & Gold Accents',
    verseFontClass: 'font-theme-golden-gothic-verse',
    refFontClass: 'font-theme-golden-gothic-ref',
    description: 'Monumental Cinzel Roman lettering with luminous golden luster and dignified imperial presence.',
  },
];

export const getFontTheme = (id?: FontThemeId): FontThemeOption => {
  return FONT_THEMES.find((t) => t.id === id) || FONT_THEMES[0];
};

export interface WallpaperFadeOption {
  id: WallpaperFadeMode;
  name: string;
  subtitle: string;
  description: string;
  overlayClass: string;
}

export const WALLPAPER_FADE_OPTIONS: WallpaperFadeOption[] = [
  {
    id: 'none',
    name: 'Natural (No Fade)',
    subtitle: 'Pure Photography',
    description: 'Displays the wallpaper photography in its original clarity with default contrast protection.',
    overlayClass: '',
  },
  {
    id: 'soft',
    name: 'Soft Vignette',
    subtitle: 'Gentle Edge Softening',
    description: 'Gently darkens perimeter edges to softly frame the scripture verse while preserving wallpaper depth.',
    overlayClass: 'wallpaper-fade-soft',
  },
  {
    id: 'deep',
    name: 'Cinematic Depth',
    subtitle: 'Top & Bottom Fading',
    description: 'Deepened gradient fade for top status bar icons and bottom navigation controls, maximizing verse legibility.',
    overlayClass: 'wallpaper-fade-deep',
  },
  {
    id: 'dreamy',
    name: 'Luminescent Glow',
    subtitle: 'Warm Golden Center',
    description: 'Subtle radiant golden-amber ambient glow at the center with atmospheric peripheral shadowing.',
    overlayClass: 'wallpaper-fade-dreamy',
  },
];

export const getWallpaperFade = (fade?: WallpaperFadeMode): WallpaperFadeOption => {
  return WALLPAPER_FADE_OPTIONS.find((f) => f.id === fade) || WALLPAPER_FADE_OPTIONS[0];
};
