import React, { useState, useMemo } from 'react';
import { 
  X, Search, BookOpen, Sparkles, Shield, Mountain, 
  Waves, Sun, Moon, Compass, Flower2, Droplets, 
  Wheat, Check, ArrowRight, Info, Heart, Crown
} from 'lucide-react';
import { ALL_BIBLE_TOPICS, VISUAL_THEMES_DIRECTORY } from '../data/bibleTopics';
import { BibleTopicInfo } from '../types';

interface TopicsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic: string;
  onSelectTopic: (topicName: string, recommendedTheme?: string) => void;
  isLight: boolean;
  wallpaperCountByTopic?: Record<string, number>;
}

export const TopicsExplorerModal: React.FC<TopicsExplorerModalProps> = ({
  isOpen,
  onClose,
  selectedTopic,
  onSelectTopic,
  isLight,
  wallpaperCountByTopic = {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'topics' | 'themes'>('topics');

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return ALL_BIBLE_TOPICS;
    const q = searchQuery.toLowerCase().trim();
    return ALL_BIBLE_TOPICS.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.shortDesc.toLowerCase().includes(q) ||
      t.biblicalContext.toLowerCase().includes(q) ||
      t.keyVerseRef.toLowerCase().includes(q) ||
      t.keyVerseText.toLowerCase().includes(q) ||
      t.recommendedThemes.some((theme) => theme.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return VISUAL_THEMES_DIRECTORY;
    const q = searchQuery.toLowerCase().trim();
    return VISUAL_THEMES_DIRECTORY.filter((theme) =>
      theme.name.toLowerCase().includes(q) ||
      theme.shortDesc.toLowerCase().includes(q) ||
      (theme.recommendedTopics && theme.recommendedTopics.some((t) => t.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col transition-colors ${
          isLight
            ? 'bg-[#fbf8f2] border-[#ded4c3] text-stone-900'
            : 'bg-stone-900 border-stone-800 text-stone-100'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLight ? 'border-[#e4dac8] bg-[#f4ede0]' : 'border-stone-800 bg-stone-950/70'
        }`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scripture Taxonomy & Theme Wallpapers</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-bold font-cinzel ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              All Bible Verses Topics & Themes
            </h2>
            <p className={`text-xs mt-1 max-w-lg ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}>
              Browse all core biblical life topics, view key scripture references, and explore wallpapers tailored with respect to each topic ("wrt topic").
            </p>
          </div>

          <button
            onClick={onClose}
            className={`self-end sm:self-start p-2 rounded-full border transition ${
              isLight
                ? 'bg-[#ede3d2] hover:bg-[#e4d7c2] border-[#d8ccb8] text-stone-700'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Search Bar */}
        <div className={`p-4 border-b flex flex-col sm:flex-row items-center gap-3 ${
          isLight ? 'border-[#e8dfcf] bg-[#f8f4ec]' : 'border-stone-800/80 bg-stone-900/60'
        }`}>
          {/* Tab Switcher */}
          <div className={`flex items-center p-1 rounded-2xl border shrink-0 w-full sm:w-auto ${
            isLight ? 'bg-[#eee7d8] border-[#ddd2be]' : 'bg-stone-950 border-stone-800'
          }`}>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'topics'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Bible Topics ({ALL_BIBLE_TOPICS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'themes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wallpapers wrt Topic</span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'topics'
                  ? 'Search topics (e.g., peace, anxiety, courage, love, healing)...'
                  : 'Search visual themes (e.g., mountain, sunrise, ocean, forest)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs transition ${
                isLight
                  ? 'bg-white border border-[#ded3be] text-stone-900 placeholder-stone-500 focus:outline-none focus:border-amber-600'
                  : 'bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'topics' ? (
            /* ALL TOPICS GRID */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopic === topic.name;
                  const count = wallpaperCountByTopic[topic.name];

                  return (
                    <div
                      key={topic.id}
                      onClick={() => {
                        onSelectTopic(topic.name, topic.recommendedThemes[0]);
                        onClose();
                      }}
                      className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? isLight
                            ? 'bg-[#f4ebe0] border-amber-600 ring-2 ring-amber-600/30 shadow-md'
                            : 'bg-stone-850 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                          : isLight
                            ? 'bg-white hover:bg-[#faf5ec] border-[#e2d8c7] hover:border-amber-600/40 shadow-xs'
                            : 'bg-stone-950/70 hover:bg-stone-800/80 border-stone-800 hover:border-amber-500/40 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Header: Title, Tag, and Check indicator */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-base group-hover:text-amber-500 transition-colors">
                              {topic.name}
                            </span>
                            {count !== undefined && count > 0 && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {count} {count === 1 ? 'wallpaper' : 'wallpapers'}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="p-1 rounded-full bg-amber-500 text-stone-950">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>

                        {/* Short Description */}
                        <p className={`text-xs mb-3 leading-relaxed ${
                          isLight ? 'text-stone-600' : 'text-stone-300'
                        }`}>
                          {topic.shortDesc}
                        </p>

                        {/* Key Scripture Quote */}
                        <div className={`p-2.5 rounded-xl border text-xs mb-3 font-serif-scripture italic ${
                          isLight
                            ? 'bg-[#f8f3ea] border-[#e5dcce] text-stone-800'
                            : 'bg-stone-900 border-stone-800 text-stone-200'
                        }`}>
                          "{topic.keyVerseText}"
                          <div className="mt-1 font-cinzel font-bold text-[11px] not-italic text-amber-600 dark:text-amber-400">
                            — {topic.keyVerseRef}
                          </div>
                        </div>
                      </div>

                      {/* Matching Wallpaper Theme wrt Topic */}
                      <div className="pt-2 border-t border-stone-800/20 dark:border-stone-800 flex flex-col gap-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Theme Wallpaper wrt Topic:
                          </span>
                          <span className={`group-hover:translate-x-1 transition-transform font-semibold text-xs flex items-center gap-1 text-amber-500`}>
                            Explore <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {topic.recommendedThemes.map((theme, i) => (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                                i === 0
                                  ? isLight
                                    ? 'bg-amber-600/15 border-amber-600/30 text-amber-900 font-bold'
                                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                                  : isLight
                                    ? 'bg-stone-100 border-stone-200 text-stone-700'
                                    : 'bg-stone-900 border-stone-800 text-stone-400'
                              }`}
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                        <p className={`text-[10px] italic mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                          {topic.themeRationale}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-stone-400">No scripture topics match "{searchQuery}".</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs text-amber-500 underline"
                  >
                    Clear search query
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* VISUAL THEMES DIRECTORY (WRT TOPIC) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Each visual theme in Bible Wallpapers is crafted with respect to its theological and spiritual resonance ("wrt topic"). Select any aesthetic theme to explore how landscape photography complements Holy Scripture.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredThemes.map((theme, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isLight
                        ? 'bg-white border-[#ded4c3] hover:border-amber-600/50 shadow-xs'
                        : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm font-cinzel text-amber-500">
                        {theme.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                        Aesthetic Pack
                      </span>
                    </div>

                    <p className={`text-xs mb-3 ${isLight ? 'text-stone-600' : 'text-stone-300'}`}>
                      {theme.shortDesc}
                    </p>

                    {theme.recommendedTopics && theme.recommendedTopics.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-amber-500" />
                          Recommended Bible Topics:
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {theme.recommendedTopics.map((top, tIdx) => (
                            <button
                              key={tIdx}
                              onClick={() => {
                                onSelectTopic(top, theme.name === 'All Aesthetics' ? undefined : theme.name);
                                onClose();
                              }}
                              className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                                isLight
                                  ? 'bg-[#f5eee2] hover:bg-[#eae0d0] border-[#ded4c3] text-stone-850'
                                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 hover:text-white'
                              }`}
                            >
                              {top}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          isLight ? 'border-[#e4dac8] bg-[#f4ede0] text-stone-600' : 'border-stone-800 bg-stone-950 text-stone-400'
        }`}>
          <span>
            {activeTab === 'topics'
              ? `${filteredTopics.length} of ${ALL_BIBLE_TOPICS.length} Bible topics shown`
              : `${filteredThemes.length} aesthetic themes available`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectTopic('All', 'All Aesthetics');
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-700 hover:bg-stone-800 transition"
            >
              Reset to All
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
