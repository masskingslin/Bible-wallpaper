import { Wallpaper } from '../types';

export interface ShareResult {
  shared: boolean;
  copiedToClipboard: boolean;
  channel?: string;
}

export interface SocialShareLinks {
  whatsapp: string;
  twitter: string;
  telegram: string;
  facebook: string;
  email: string;
  sms: string;
}

/**
 * Returns formatted share text with scripture quote, reference, and app link
 */
export function getFormattedShareText(wallpaper: Wallpaper): string {
  const quoteText = wallpaper.wallpaperQuote ? `✦ ${wallpaper.wallpaperQuote} ✦\n` : '';
  return `${quoteText}"${wallpaper.verseText}"\n— ${wallpaper.verseReference}\n\nBible Wallpapers: Daily Scripture & 4K UHD Art`;
}

/**
 * Generates direct web and mobile social share links
 */
export function getSocialShareLinks(wallpaper: Wallpaper): SocialShareLinks {
  const text = getFormattedShareText(wallpaper);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(wallpaper.imageUrl);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${wallpaper.imageUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=BibleVerse,Scripture,Faith`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    email: `mailto:?subject=${encodeURIComponent(`Bible Scripture Wallpaper: ${wallpaper.verseReference}`)}&body=${encodeURIComponent(`${text}\n\nView Wallpaper: ${wallpaper.imageUrl}`)}`,
    sms: `sms:?body=${encodeURIComponent(`${text}\n${wallpaper.imageUrl}`)}`,
  };
}

/**
 * Shares a wallpaper and its verse reference using Web Share API (with File support) and clipboard fallback
 */
export async function shareWallpaper(
  wallpaper: Wallpaper,
  imageBlob?: Blob
): Promise<ShareResult> {
  const title = `${wallpaper.verseReference} — Bible Wallpaper`;
  const text = getFormattedShareText(wallpaper);
  const url = wallpaper.imageUrl;

  // Try file sharing if blob is provided and supported
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (imageBlob && navigator.canShare) {
        const file = new File([imageBlob], `BibleWallpaper-${wallpaper.verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`, {
          type: imageBlob.type || 'image/png',
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            text,
            files: [file],
          });
          return { shared: true, copiedToClipboard: false, channel: 'file-share' };
        }
      }

      // Standard text/url share
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, copiedToClipboard: false, channel: 'native-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, copiedToClipboard: false };
      }
    }
  }

  // Fallback: Copy to clipboard
  try {
    const textToCopy = `"${wallpaper.verseText}" — ${wallpaper.verseReference}\n${wallpaper.imageUrl}`;
    await navigator.clipboard.writeText(textToCopy);
    return { shared: true, copiedToClipboard: true, channel: 'clipboard' };
  } catch (clipboardErr) {
    console.error('Clipboard copy failed:', clipboardErr);
    return { shared: false, copiedToClipboard: false };
  }
}
