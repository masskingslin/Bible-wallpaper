import JSZip from 'jszip';
import { Wallpaper } from '../types';

export interface BulkDownloadProgress {
  current: number;
  total: number;
  currentName: string;
}

/**
 * Downloads multiple wallpapers into a clean ZIP archive with a scripture index.
 */
export async function downloadWallpapersAsZip(
  wallpapers: Wallpaper[],
  onProgress?: (progress: BulkDownloadProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Bible_Wallpapers_HD');

  let scriptureIndex = "=== BIBLE WALLPAPERS COLLECTION ===\n\n";

  for (let i = 0; i < wallpapers.length; i++) {
    const item = wallpapers[i];
    const safeRef = item.verseReference.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${(i + 1).toString().padStart(2, '0')}_${safeRef}.jpg`;

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: wallpapers.length,
        currentName: item.verseReference,
      });
    }

    scriptureIndex += `[${i + 1}] ${item.verseReference}\n"${item.verseText}"\nCategory: ${item.category} | Theme: ${item.visualTheme || 'Nature'}\nFile: ${filename}\n\n`;

    try {
      // Fetch image blob
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      folder?.file(filename, blob);
    } catch (err) {
      console.warn(`Failed to package image for ${item.verseReference}:`, err);
    }
  }

  // Include the scripture quotes reference index text file
  folder?.file('Scripture_Quotes_Index.txt', scriptureIndex);

  // Generate ZIP file
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bible_Wallpapers_VIP_Pack_${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
