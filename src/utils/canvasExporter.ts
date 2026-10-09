import { CustomizationSettings, Wallpaper } from '../types';

export async function generateAndDownloadWallpaper(
  wallpaper: Wallpaper,
  settings: CustomizationSettings
): Promise<void> {
  const canvas = document.createElement('canvas');
  // Full HD vertical wallpaper resolution
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        // Draw image covering 1080x1920
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );

        // Dark overlay
        if (settings.overlayDarkness > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${settings.overlayDarkness / 100})`;
          ctx.fillRect(0, 0, width, height);
        }

        // Additional subtle gradient for readability
        const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.8);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Text styling
        let fontName = 'serif';
        if (settings.fontStyle === 'playfair') fontName = "'Playfair Display', 'Mukta Malar', 'Noto Serif Tamil', serif";
        else if (settings.fontStyle === 'cinzel') fontName = "'Cinzel', 'Mukta Malar', 'Noto Serif Tamil', serif";
        else if (settings.fontStyle === 'script') fontName = "'Great Vibes', 'Mukta Malar', cursive";
        else if (settings.fontStyle === 'sans') fontName = "'Plus Jakarta Sans', 'Mukta Malar', sans-serif";

        let fontSize = 48;
        if (settings.fontSize === 'sm') fontSize = 40;
        else if (settings.fontSize === 'md') fontSize = 52;
        else if (settings.fontSize === 'lg') fontSize = 64;
        else if (settings.fontSize === 'xl') fontSize = 76;

        ctx.font = `${fontSize}px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Color
        if (settings.textColor === 'gold') ctx.fillStyle = '#fde047';
        else if (settings.textColor === 'ivory') ctx.fillStyle = '#fef3c7';
        else ctx.fillStyle = '#ffffff';

        // Shadow
        if (settings.showShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;
        }

        // Text wrap helper
        const maxTextWidth = width * 0.82;
        const words = wallpaper.verseText.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const lineHeight = fontSize * 1.35;
        const totalTextHeight = lines.length * lineHeight;

        let startY = height / 2 - totalTextHeight / 2;
        if (settings.textPosition === 'top') {
          startY = height * 0.28;
        } else if (settings.textPosition === 'bottom') {
          startY = height * 0.65;
        }

        // Draw verse lines
        lines.forEach((line, index) => {
          ctx.fillText(line, width / 2, startY + index * lineHeight);
        });

        // Draw scripture reference
        const refY = startY + lines.length * lineHeight + 36;
        ctx.font = `600 ${Math.max(28, fontSize * 0.55)}px 'Cinzel', serif`;
        ctx.fillStyle = settings.textColor === 'gold' ? '#facc15' : '#e0e7ff';
        ctx.fillText(`— ${wallpaper.verseReference} —`, width / 2, refY);

        // Watermark/Subtle attribution
        ctx.font = "400 20px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 0;
        ctx.fillText('Bible Wallpapers', width / 2, height - 60);

        // Trigger download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `BibleWallpaper-${wallpaper.verseReference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      // If cross-origin image fails on canvas, fallback to direct download
      const link = document.createElement('a');
      link.href = wallpaper.imageUrl;
      link.target = '_blank';
      link.download = `BibleWallpaper-${wallpaper.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      resolve();
    };
    img.src = wallpaper.imageUrl;
  });
}
