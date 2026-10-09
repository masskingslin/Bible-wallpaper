import { Wallpaper } from '../types';

export interface ShareResult {
  shared: boolean;
  copiedToClipboard: boolean;
}

/**
 * Shares a wallpaper and its verse reference using the Web Share API with a clipboard fallback.
 */
export async function shareWallpaper(wallpaper: Wallpaper): Promise<ShareResult> {
  const shareData = {
    title: `${wallpaper.verseReference} — Bible Wallpaper`,
    text: `"${wallpaper.verseText}"\n— ${wallpaper.verseReference}\n\nDownload this Christian scripture wallpaper:`,
    url: wallpaper.imageUrl,
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData);
      return { shared: true, copiedToClipboard: false };
    } catch (err: any) {
      // If user aborted/cancelled the share sheet, return gracefully
      if (err.name === 'AbortError') {
        return { shared: false, copiedToClipboard: false };
      }
      // If sharing failed for another reason, fall through to clipboard copy
    }
  }

  // Fallback: Copy scripture text and wallpaper link to clipboard
  try {
    const textToCopy = `"${wallpaper.verseText}" — ${wallpaper.verseReference}\n${wallpaper.imageUrl}`;
    await navigator.clipboard.writeText(textToCopy);
    return { shared: true, copiedToClipboard: true };
  } catch (clipboardErr) {
    console.error('Clipboard copy failed:', clipboardErr);
    return { shared: false, copiedToClipboard: false };
  }
}
