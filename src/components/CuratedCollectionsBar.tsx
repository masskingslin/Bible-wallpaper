import React from 'react';
import { 
  Sparkles, Crown, Heart, Shield, Flame, 
  Layers, Check, ArrowRight 
} from 'lucide-react';
import { CURATED_COLLECTIONS, CuratedCollectionInfo } from '../data/curatedCollections';
import { triggerWebHaptic } from '../utils/haptics';

interface CuratedCollectionsBarProps {
  selectedCollection: string;
  onSelectCollection: (collectionId: string) => void;
  isLight: boolean;
  language: string;
  totalCollectionCount: number;
}

export const CuratedCollectionsBar: React.FC<CuratedCollectionsBarProps> = ({
  selectedCollection,
  onSelectCollection,
  isLight,
  language,
  totalCollectionCount,
}) => {
  const isTamil = language === 'ta';

  const getCollectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      default:
        return <Layers className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleCollectionClick = (id: string) => {
    triggerWebHaptic('selection');
    onSelectCollection(id);
  };

  const activeCollection = CURATED_COLLECTIONS.find((c) => c.id === selectedCollection);

  return (
    <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-xl ${
      isLight
        ? 'bg-gradient-to-r from-[#fbf6ed] via-[#f7f0e3] to-[#fbf8f2] border-[#ded4c1] shadow-md'
        : 'bg-gradient-to-r from-stone-900/95 via-stone-900/90 to-stone-950 border-stone-800 shadow-2xl'
    }`}>
      {/* Header title & 4K badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/30 dark:border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-md">
            <Layers className="w-4 h-4 fill-current text-white" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-base font-bold font-cinzel ${isLight ? 'text-stone-950' : 'text-white'}`}>
                {isTamil ? '4K வேத வசன வால்பேப்பர்கள் (5 தொகுப்புகள்)' : 'Curated 4K Scripture Collections'}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                2160×3840 UHD
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              {isTamil
                ? '30 வசனங்கள் வீதம் 5 பிரத்யேக தொகுப்புகள் • ஆங்கிலம் & தமிழ் மொழிபெயர்ப்புகள்'
                : '5 Master collections featuring 30 scripture wallpapers each with dual English & Tamil passages'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleCollectionClick('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              selectedCollection === 'All'
                ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/20'
                : isLight
                  ? 'bg-stone-200/80 hover:bg-stone-300/80 border-stone-300 text-stone-800'
                  : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
            }`}
          >
            {isTamil ? 'அனைத்து தொகுப்புகள்' : 'All Collections'}
          </button>
        </div>
      </div>

      {/* 5 Collections Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
        {CURATED_COLLECTIONS.map((col) => {
          const isSelected = selectedCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => handleCollectionClick(isSelected ? 'All' : col.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group overflow-hidden ${
                isSelected
                  ? isLight
                    ? 'bg-amber-600/10 border-amber-600/80 ring-2 ring-amber-600/50 shadow-md'
                    : 'bg-stone-800/90 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/10'
                  : isLight
                    ? 'bg-white/70 hover:bg-white border-[#e0d6c4] hover:border-amber-500/50 hover:shadow-sm'
                    : 'bg-stone-950/70 hover:bg-stone-900 border-stone-800 hover:border-stone-700 hover:shadow-md'
              }`}
            >
              {/* Subtle top indicator bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${col.gradient} opacity-80`} />

              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="p-1.5 rounded-xl bg-stone-900/60 border border-white/10 shrink-0">
                  {getCollectionIcon(col.iconName)}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-800/80 border border-stone-700 text-stone-300">
                  {col.count} {isTamil ? 'படங்கள்' : 'Wallpapers'}
                </span>
              </div>

              <h4 className={`text-xs font-bold leading-snug line-clamp-1 ${
                isLight ? 'text-stone-900' : 'text-stone-100'
              }`}>
                {isTamil ? col.nameTamil : col.name}
              </h4>

              {isTamil ? (
                <p className="text-[10px] text-stone-400 truncate mt-0.5 font-sans">
                  {col.name}
                </p>
              ) : (
                <p className="text-[10px] text-stone-400 truncate mt-0.5">
                  {col.nameTamil}
                </p>
              )}

              <p className={`text-[10px] leading-tight line-clamp-2 mt-1.5 ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                {col.shortDesc}
              </p>

              {isSelected && (
                <div className="mt-2 pt-1.5 border-t border-amber-500/20 flex items-center justify-between text-[10px] font-bold text-amber-500">
                  <span>Filtered ({col.count})</span>
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Collection Spotlight Banner if selected */}
      {activeCollection && (
        <div className={`mt-4 p-3.5 px-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
          isLight
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
        }`}>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-500 font-cinzel">
                Active Collection: {isTamil ? activeCollection.nameTamil : activeCollection.name}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-stone-300">
                {activeCollection.resolution}
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              {activeCollection.versesRange}
            </p>
          </div>

          <button
            onClick={() => handleCollectionClick('All')}
            className="self-start md:self-auto text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Show all collections</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
