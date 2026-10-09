// Utility for Web Speech API text-to-speech scripture narration

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

// Map wallpaper language code to BCP 47 language tag
export const getSpeechLanguageTag = (languageCode?: string): string => {
  switch (languageCode?.toLowerCase()) {
    case 'ta':
      return 'ta-IN';
    case 'es':
      return 'es-ES';
    case 'pt':
      return 'pt-BR';
    case 'fr':
      return 'fr-FR';
    case 'de':
      return 'de-DE';
    case 'en':
    default:
      return 'en-US';
  }
};

/**
 * Finds the most suitable voice for the requested language tag.
 */
export const findBestVoice = (langTag: string): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Try exact match first
  let match = voices.find((v) => v.lang.toLowerCase() === langTag.toLowerCase());
  if (match) return match;

  // Special match for Tamil voices which can be named with 'tamil' or 'தமிழ்'
  if (langTag.toLowerCase().startsWith('ta')) {
    match = voices.find((v) => 
      v.name.toLowerCase().includes('tamil') || 
      v.lang.toLowerCase().includes('ta') ||
      v.name.includes('தமிழ்')
    );
    if (match) return match;
  }

  // Try matching primary language prefix (e.g. 'en', 'es', 'ta')
  const prefix = langTag.split('-')[0].toLowerCase();
  match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
  return match || null;
};

export interface SpeakOptions {
  rate?: number;       // default 0.92 for calm, reflective scripture delivery
  pitch?: number;      // default 1.0
  volume?: number;     // default 1.0
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Narrates the scripture verse text and reference aloud using the browser's Web Speech API.
 */
export const narrateScripture = (
  verseText: string,
  verseReference: string,
  languageCode?: string,
  options: SpeakOptions = {}
): SpeechSynthesisUtterance | null => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Web Speech API is not supported in this browser.');
    return null;
  }

  // Cancel any currently playing or pending audio
  window.speechSynthesis.cancel();

  // Format scripture narration with natural pauses
  const cleanVerse = verseText.trim();
  const cleanRef = verseReference.trim();
  const textToSpeak = `${cleanVerse}. ${cleanRef}.`;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  const langTag = getSpeechLanguageTag(languageCode);
  utterance.lang = langTag;

  const bestVoice = findBestVoice(langTag);
  if (bestVoice) {
    utterance.voice = bestVoice;
  }

  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    // Only report real errors, not canceled speech
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('Speech synthesis utterance error:', e);
    }
    if (options.onError) options.onError(e);
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Failed to invoke window.speechSynthesis.speak:', err);
    if (options.onError) options.onError(err);
    return null;
  }

  return utterance;
};

/**
 * Stops any active speech synthesis narration.
 */
export const stopScriptureNarration = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};
