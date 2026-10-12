import React, { useState, useEffect } from 'react';
import { 
  Quote, Sparkles, ChevronDown, ChevronUp, Copy, Check, 
  Volume2, VolumeX, BookOpen, Feather 
} from 'lucide-react';
import { Wallpaper, VerseQuoteData } from '../types';
import { narrateScripture, stopScriptureNarration } from '../utils/speechUtils';
import { triggerWebHaptic } from '../utils/haptics';

interface DailyVerseQuoteProps {
  wallpaper: Wallpaper;
  isLight: boolean;
  onInteracted?: () => void;
  className?: string;
}

// In-memory cache across component re-renders to minimize redundant network queries
const quotesCache = new Map<string, VerseQuoteData>();

export const DailyVerseQuote: React.FC<DailyVerseQuoteProps> = ({
  wallpaper,
  isLight,
  onInteracted,
  className = '',
}) => {
  const [quoteData, setQuoteData] = useState<VerseQuoteData | null>(() => {
    return quotesCache.get(wallpaper.id) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!quoteData);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Check memory cache first
    const cached = quotesCache.get(wallpaper.id);
    if (cached) {
      setQuoteData(cached);
      setIsLoading(false);
      return;
    }

    // Fetch from existing server API
    setIsLoading(true);
    const controller = new AbortController();

    const fetchQuote = async () => {
      try {
        const url = `/api/quotes?wallpaperId=${encodeURIComponent(wallpaper.id)}&language=${wallpaper.language || 'en'}`;
        const res = await fetch(url, { signal: controller.signal });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch quote: ${res.status}`);
        }

        const data: VerseQuoteData = await res.json();
        if (isMounted) {
          quotesCache.set(wallpaper.id, data);
          setQuoteData(data);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') return;

        // Graceful fallback to wallpaper local quote and default theological reflection
        if (isMounted) {
          const fallback: VerseQuoteData = {
            wallpaperId: wallpaper.id,
            quote: wallpaper.wallpaperQuote || `Be still and know that the Lord is God in every season.`,
            sermonExcerpt: `When you lean upon God's enduring promises, fear dissolves and steadfast peace guards your heart and mind.`,
            authorOrPreacher: wallpaper.language === 'ta' ? 'சாது சுந்தர் சிங்' : 'Charles Spurgeon',
            theme: wallpaper.category,
            scriptureRef: wallpaper.verseReference,
            contextNote: `Pastoral devotion on ${wallpaper.verseReference}`
          };
          quotesCache.set(wallpaper.id, fallback);
          setQuoteData(fallback);
          setIsLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [wallpaper.id, wallpaper.language, wallpaper.category, wallpaper.verseReference, wallpaper.wallpaperQuote]);

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quoteData) return;

    triggerWebHaptic('selection');
    onInteracted?.();

    const textToCopy = `“${quoteData.quote}” — ${quoteData.authorOrPreacher} (${quoteData.scriptureRef})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!quoteData) return;

    onInteracted?.();

    if (isSpeaking) {
      stopScriptureNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = isExpanded && quoteData.sermonExcerpt
        ? `${quoteData.quote}. Sermon reflection: ${quoteData.sermonExcerpt}. — ${quoteData.authorOrPreacher}`
        : `${quoteData.quote}. — ${quoteData.authorOrPreacher}`;

      narrateScripture(textToRead, quoteData.scriptureRef, wallpaper.language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`mt-2 p-2.5 rounded-2xl border transition animate-pulse ${
        isLight ? 'bg-amber-100/40 border-amber-200/60' : 'bg-stone-900/60 border-stone-800/80'
      } ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400/40" />
          <div className="h-3 w-3/4 rounded bg-stone-500/20" />
        </div>
      </div>
    );
  }

  if (!quoteData) {
    return null;
  }

  return (
    <div 
      className={`mt-2 rounded-2xl border transition-all duration-200 overflow-hidden ${
        isLight
          ? 'bg-gradient-to-br from-[#fcf9f2] to-[#f8f2e4] border-[#dfd5c2] text-stone-850 shadow-xs'
          : 'bg-gradient-to-br from-stone-900/90 to-stone-950/90 border-amber-500/20 text-stone-200 shadow-sm'
      } ${className}`}
    >
      {/* Quote Header Bar */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Quote className="w-3.5 h-3.5 fill-current shrink-0 rotate-180" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-cinzel">
              Inspiring Quote
            </span>
          </div>

          {/* Quick Actions (Audio & Copy) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleToggleAudio}
              className={`p-1 rounded-lg text-[10px] transition ${
                isSpeaking
                  ? 'bg-amber-500 text-stone-950 shadow-xs animate-pulse'
                  : isLight
                  ? 'hover:bg-amber-200/60 text-stone-600'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-amber-300'
              }`}
              title={isSpeaking ? 'Stop listening' : 'Listen to inspiring quote'}
            >
              {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            <button
              onClick={handleCopyQuote}
              className={`p-1 rounded-lg text-[10px] transition ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : isLight
                  ? 'hover:bg-amber-200/60 text-stone-600'
                  : 'hover:bg-stone-800 text-stone-400 hover:text-amber-300'
              }`}
              title="Copy quote and sermon note"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* The Quote Text */}
        <p className={`text-xs font-serif italic leading-relaxed line-clamp-3 ${
          isLight ? 'text-stone-800' : 'text-stone-100'
        }`}>
          "{quoteData.quote}"
        </p>

        {/* Author / Preacher Attribution */}
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <span className="text-amber-700 dark:text-amber-300/90 font-medium font-cinzel flex items-center gap-1">
            <Feather className="w-2.5 h-2.5 text-amber-500 shrink-0" />
            <span>{quoteData.authorOrPreacher}</span>
          </span>

          {quoteData.sermonExcerpt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerWebHaptic('selection');
                setIsExpanded(!isExpanded);
              }}
              className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition"
            >
              <span>{isExpanded ? 'Less' : 'Sermon Excerpt'}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Sermon Excerpt Drawer */}
      {isExpanded && quoteData.sermonExcerpt && (
        <div className={`px-3 py-2.5 border-t text-[11px] leading-relaxed animate-fade-in ${
          isLight
            ? 'bg-amber-50/70 border-amber-200/60 text-stone-700'
            : 'bg-stone-950/80 border-stone-800/80 text-stone-300'
        }`}>
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
            <BookOpen className="w-3 h-3" />
            <span className="text-[10px] uppercase font-mono tracking-wider">
              Pastoral Meditation
            </span>
          </div>
          <p className="italic">
            "{quoteData.sermonExcerpt}"
          </p>
        </div>
      )}
    </div>
  );
};
