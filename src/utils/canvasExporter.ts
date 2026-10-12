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

        // Apply image adjustment filter if enabled
        if (settings.imageFilter === 'grayscale') {
          ctx.filter = 'grayscale(100%) contrast(105%)';
        } else if (settings.imageFilter === 'sepia') {
          ctx.filter = 'sepia(85%) contrast(95%) brightness(95%)';
        } else {
          ctx.filter = 'none';
        }

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

        // Reset filter for subsequent overlay and text drawing
        ctx.filter = 'none';

        // Wallpaper Fading & Vignette Overlay
        if (settings.wallpaperFade === 'soft') {
          const softGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.85);
          softGrad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
          softGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
          ctx.fillStyle = softGrad;
          ctx.fillRect(0, 0, width, height);
        } else if (settings.wallpaperFade === 'deep') {
          const deepGrad = ctx.createLinearGradient(0, 0, 0, height);
          deepGrad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
          deepGrad.addColorStop(0.25, 'rgba(0, 0, 0, 0.10)');
          deepGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.18)');
          deepGrad.addColorStop(1, 'rgba(0, 0, 0, 0.88)');
          ctx.fillStyle = deepGrad;
          ctx.fillRect(0, 0, width, height);
        } else if (settings.wallpaperFade === 'dreamy') {
          const dreamyGrad = ctx.createRadialGradient(width / 2, height * 0.45, 10, width / 2, height / 2, width * 0.82);
          dreamyGrad.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
          dreamyGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.40)');
          dreamyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.78)');
          ctx.fillStyle = dreamyGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // User Dark overlay
        if (settings.overlayDarkness > 0) {
          ctx.fillStyle = `rgba(0, 0, 0, ${settings.overlayDarkness / 100})`;
          ctx.fillRect(0, 0, width, height);
        }

        // Additional subtle reading gradient for baseline readability
        const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.8);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Text & Font Theme styling
        let fontName = 'serif';
        let isItalic = false;
        let refFontName = "'Cinzel', serif";

        if (settings.fontTheme === 'cathedral') {
          fontName = "'Playfair Display', 'Mukta Malar', 'Noto Serif Tamil', serif";
          isItalic = true;
          refFontName = "'Cinzel', serif";
        } else if (settings.fontTheme === 'sacred_script') {
          fontName = "'Great Vibes', 'Mukta Malar', cursive";
          refFontName = "'Cinzel', serif";
        } else if (settings.fontTheme === 'heritage_serif') {
          fontName = "'Cormorant Garamond', 'Playfair Display', serif";
          isItalic = true;
          refFontName = "'Playfair Display', serif";
        } else if (settings.fontTheme === 'modern_clarity') {
          fontName = "'Plus Jakarta Sans', 'Mukta Malar', sans-serif";
          refFontName = "'Inter', sans-serif";
        } else if (settings.fontTheme === 'golden_gothic') {
          fontName = "'Cinzel', 'Mukta Malar', serif";
          refFontName = "'Cinzel', serif";
        } else {
          // Fallback to legacy fontStyle
          if (settings.fontStyle === 'playfair') {
            fontName = "'Playfair Display', 'Mukta Malar', 'Noto Serif Tamil', serif";
            isItalic = true;
          } else if (settings.fontStyle === 'cinzel') fontName = "'Cinzel', 'Mukta Malar', 'Noto Serif Tamil', serif";
          else if (settings.fontStyle === 'script') fontName = "'Great Vibes', 'Mukta Malar', cursive";
          else if (settings.fontStyle === 'sans') fontName = "'Plus Jakarta Sans', 'Mukta Malar', sans-serif";
        }

        let fontSize = 48;
        if (settings.fontSize === 'sm') fontSize = 40;
        else if (settings.fontSize === 'md') fontSize = 52;
        else if (settings.fontSize === 'lg') fontSize = 64;
        else if (settings.fontSize === 'xl') fontSize = 76;

        ctx.font = `${isItalic ? 'italic ' : ''}${fontSize}px ${fontName}`;
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

        // Draw optional inspirational quote
        if (wallpaper.wallpaperQuote) {
          ctx.save();
          ctx.font = `600 ${Math.max(22, fontSize * 0.42)}px 'Cinzel', serif`;
          ctx.fillStyle = settings.textColor === 'gold' ? '#fde047' : '#fef08a';
          ctx.fillText(`✦ ${wallpaper.wallpaperQuote} ✦`, width / 2, startY - 40);
          ctx.restore();
        }

        // Draw verse lines
        lines.forEach((line, index) => {
          ctx.fillText(line, width / 2, startY + index * lineHeight);
        });

        // Draw scripture reference
        const refY = startY + lines.length * lineHeight + 36;
        ctx.font = `600 ${Math.max(28, fontSize * 0.55)}px ${refFontName}`;
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
