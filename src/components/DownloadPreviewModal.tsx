import React, { useState, useEffect } from 'react';
import { 
  X, Download, Check, Sparkles, Smartphone, Copy, 
  Share2, ZoomIn, ZoomOut, Crown, Layers, ShieldCheck
} from 'lucide-react';
import { Wallpaper, CustomizationSettings } from '../types';
import { exportWallpaperRender, downloadCanvas, RenderResult } from '../utils/canvasExporter';
import { triggerWebHaptic } from '../utils/haptics';

export interface DownloadPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: Wallpaper | null;
  settings?: CustomizationSettings;
  isLight?: boolean;
  isPremiumUser?: boolean;
  onOpenUpgradeModal?: () => void;
  onOpenSharePreview?: (wallpaper: Wallpaper) => void;
}

const defaultSettings: CustomizationSettings = {
  fontStyle: 'playfair',
  fontSize: 'md',
  textPosition: 'center',
  overlayDarkness: 35,
  textColor: 'white',
  showShadow: true,
  imageFilter: 'none',
  fontTheme: 'cathedral',
  wallpaperFade: 'soft',
};

export const DownloadPreviewModal: React.FC<DownloadPreviewModalProps> = ({
  isOpen,
  onClose,
  wallpaper,
  settings = defaultSettings,
  isLight = false,
  isPremiumUser = false,
  onOpenUpgradeModal,
  onOpenSharePreview,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [rendering, setRendering] = useState<boolean>(true);
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !wallpaper) return;

    let active = true;
    setRendering(true);

    exportWallpaperRender(wallpaper, settings, format, 0.95)
      .then((res) => {
        if (active) {
          setRenderResult(res);
          setRendering(false);
        }
      })
      .catch((err) => {
        console.warn('Render preview failed:', err);
        if (active) {
          setRendering(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, wallpaper, settings, format]);

  if (!isOpen || !wallpaper) return null;

  const handleDownload = () => {
    if (wallpaper.isPremium && !isPremiumUser) {
      onOpenUpgradeModal?.();
      return;
    }

    triggerWebHaptic('heavy');
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `BibleWallpaper-${wallpaper.verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;

    if (renderResult?.canvas) {
      downloadCanvas(renderResult.canvas, filename, format, 0.95);
    } else {
      const link = document.createElement('a');
      link.href = wallpaper.imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyImage = async () => {
    if (!renderResult?.blob) return;
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        // Most browsers require image/png for clipboard image copy
        let blobToCopy = renderResult.blob;
        if (format !== 'image/png' && renderResult.canvas) {
          blobToCopy = await new Promise<Blob>((res) => {
            renderResult.canvas.toBlob((b) => res(b || renderResult.blob), 'image/png');
          });
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blobToCopy }),
        ]);
        setCopiedImage(true);
        triggerWebHaptic('success');
        setTimeout(() => setCopiedImage(false), 2200);
      }
    } catch (err) {
      console.warn('Clipboard image copy not supported', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all overflow-hidden my-auto ${
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
          title="Close Download Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-600/25 shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel tracking-wide flex items-center gap-2">
              Download Preview
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              Inspect full-resolution rendering, file format, and dimensions before saving.
            </p>
          </div>
        </div>

        {/* Main Preview Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 items-center">
          {/* Visual Canvas Render Box */}
          <div className="relative flex flex-col items-center justify-center bg-stone-950/90 rounded-2xl p-3 border border-stone-800 overflow-hidden min-h-[300px]">
            {rendering ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-stone-400 font-mono">Rendering full-resolution canvas...</span>
              </div>
            ) : renderResult?.dataUrl ? (
              <div className="relative group max-h-[340px] flex items-center justify-center">
                <img
                  src={renderResult.dataUrl}
                  alt={wallpaper.verseReference}
                  className={`rounded-xl border border-amber-500/30 object-contain shadow-2xl transition-all duration-300 ${
                    isZoomed ? 'scale-125 cursor-zoom-out' : 'max-h-[320px] cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
                
                {/* Zoom Badge */}
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 backdrop-blur-md text-[10px] flex items-center gap-1 border border-white/20 transition"
                  title="Toggle Zoom"
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? '100% Fit' : 'Inspect'}</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-stone-400">
                Preview render fallback active
              </div>
            )}
          </div>

          {/* Technical Specifications & Format Picker */}
          <div className="space-y-3.5">
            {/* Dimensions & Resolution Card */}
            <div className={`p-3.5 rounded-xl border ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                Render Specifications
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block">Resolution:</span>
                  <span className="font-bold font-mono text-amber-400">
                    {renderResult ? `${renderResult.width} × ${renderResult.height}` : wallpaper.resolution || '1080 × 1920'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Tier:</span>
                  <span className="font-bold text-emerald-400">
                    {wallpaper.resolution === '2160x3840' ? '4K Ultra HD' : 'Full HD (1080p)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Aspect Ratio:</span>
                  <span className="font-semibold">9:16 Vertical</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Estimated Size:</span>
                  <span className="font-mono text-stone-300">
                    {renderResult ? formatFileSize(renderResult.sizeBytes) : '~2.5 MB'}
                  </span>
                </div>
              </div>
            </div>

            {/* Format Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1.5">
                Output Format:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerWebHaptic('selection');
                    setFormat('image/png');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    format === 'image/png'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs">PNG (Lossless)</span>
                    {format === 'image/png' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] text-stone-400 block">Crisp text typography</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerWebHaptic('selection');
                    setFormat('image/jpeg');
                  }}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    format === 'image/jpeg'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs">JPG (Optimized)</span>
                    {format === 'image/jpeg' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] text-stone-400 block">Faster downloads</span>
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyImage}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  copiedImage
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isLight
                      ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-800'
                      : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                }`}
                title="Copy rendered image directly to clipboard"
              >
                {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedImage ? 'Image Copied!' : 'Copy Image'}</span>
              </button>

              {onOpenSharePreview && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSharePreview(wallpaper);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    isLight
                      ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-800'
                      : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                  }`}
                  title="Open Share Preview dialog"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Share Preview</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Download Button */}
        {wallpaper.isPremium && !isPremiumUser ? (
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-[0.99]"
          >
            <Crown className="w-4 h-4 fill-current" />
            <span>Unlock VIP to Download in Full Resolution</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            disabled={rendering}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>
              {renderResult?.is4K
                ? `Save 4K Ultra HD (${format === 'image/jpeg' ? 'JPG' : 'PNG'})`
                : `Save Full HD (${format === 'image/jpeg' ? 'JPG' : 'PNG'})`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
