import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, MessageCircle, Send, 
  ExternalLink, Sparkles, Smartphone, Download, CheckCheck
} from 'lucide-react';
import { Wallpaper } from '../types';
import { getFormattedShareText, getSocialShareLinks, shareWallpaper } from '../utils/shareUtils';
import { triggerWebHaptic } from '../utils/haptics';

export interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: Wallpaper | null;
  isLight?: boolean;
  onOpenDownloadPreview?: (wallpaper: Wallpaper) => void;
}

export const SharePreviewModal: React.FC<SharePreviewModalProps> = ({
  isOpen,
  onClose,
  wallpaper,
  isLight = false,
  onOpenDownloadPreview,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);

  if (!isOpen || !wallpaper) return null;

  const shareText = getFormattedShareText(wallpaper);
  const socialLinks = getSocialShareLinks(wallpaper);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      triggerWebHaptic('success');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const handleNativeShare = async () => {
    triggerWebHaptic('selection');
    setSharing(true);
    try {
      await shareWallpaper(wallpaper);
    } finally {
      setSharing(false);
    }
  };

  const handleOpenSocial = (url: string) => {
    triggerWebHaptic('selection');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all overflow-hidden my-auto ${
          isLight
            ? 'bg-[#fbf7ee] border-[#dfd5c3] text-stone-900'
            : 'bg-stone-900 border-stone-800 text-white'
        }`}
      >
        {/* Amber Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            triggerWebHaptic('selection');
            onClose();
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition ${
            isLight
              ? 'bg-[#ede5d4] hover:bg-[#e2d8c3] text-stone-600 hover:text-stone-900'
              : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white'
          }`}
          title="Close Share Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-600/25 shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel tracking-wide flex items-center gap-2">
              Share Preview
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              Preview how this scripture wallpaper card appears when shared to social apps.
            </p>
          </div>
        </div>

        {/* Visual Share Card Preview */}
        <div className={`p-4 rounded-2xl border mb-5 transition-all ${
          isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
        }`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 block mb-2">
            Social Card Preview (WhatsApp / Messages / Stories)
          </span>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Visual Thumbnail */}
            <div className="relative w-28 sm:w-32 aspect-[9/16] rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow-md">
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.verseReference}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-[9px] font-bold text-amber-300 font-cinzel line-clamp-1">
                  {wallpaper.verseReference}
                </span>
              </div>
            </div>

            {/* Social Text Content Preview */}
            <div className="flex-1 space-y-2 text-left">
              <div className={`p-3 rounded-xl border font-mono text-xs leading-relaxed max-h-36 overflow-y-auto ${
                isLight ? 'bg-white border-[#dfd5c3] text-stone-800' : 'bg-stone-900 border-stone-800 text-stone-200'
              }`}>
                {wallpaper.wallpaperQuote && (
                  <p className="text-amber-500 font-bold mb-1">
                    ✦ {wallpaper.wallpaperQuote} ✦
                  </p>
                )}
                <p className="italic mb-1.5 font-serif text-sm">
                  "{wallpaper.verseText}"
                </p>
                <p className="font-bold text-amber-400 font-sans text-xs">
                  — {wallpaper.verseReference}
                </p>
                <p className="text-[10px] text-stone-400 mt-2">
                  Bible Wallpapers: Daily Scripture & 4K UHD Art
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isLight
                        ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-800'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                  }`}
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}</span>
                </button>

                {onOpenDownloadPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDownloadPreview(wallpaper);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                      isLight
                        ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-800'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Preview</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Social Sharing Channels */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
            1-Click Direct Share:
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleOpenSocial(socialLinks.whatsapp)}
              className="p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 bg-emerald-600/15 hover:bg-emerald-600/25 border-emerald-500/40 text-emerald-300 hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={() => handleOpenSocial(socialLinks.twitter)}
              className="p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 bg-sky-600/15 hover:bg-sky-600/25 border-sky-500/40 text-sky-300 hover:scale-[1.02]"
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold">X (Twitter)</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              onClick={() => handleOpenSocial(socialLinks.telegram)}
              className="p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 bg-blue-600/15 hover:bg-blue-600/25 border-blue-500/40 text-blue-300 hover:scale-[1.02]"
            >
              <ExternalLink className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold">Telegram</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOpenSocial(socialLinks.facebook)}
              className="p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 bg-indigo-600/15 hover:bg-indigo-600/25 border-indigo-500/40 text-indigo-300 hover:scale-[1.02]"
            >
              <Share2 className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold">Facebook</span>
            </button>
          </div>
        </div>

        {/* Primary Action Button: Native System Share Sheet */}
        <button
          type="button"
          onClick={handleNativeShare}
          disabled={sharing}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition active:scale-[0.99]"
        >
          <Smartphone className="w-4 h-4" />
          <span>{sharing ? 'Opening Share Sheet...' : 'Open Device Share Sheet'}</span>
        </button>
      </div>
    </div>
  );
};
