export async function addWatermarkToImage(
  imageUrl: string,
  shareId: string,
  timestamp: string,
  logoUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    // Load original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Load logo
      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.src = logoUrl;

      logo.onload = () => {
        // Save context state
        ctx.save();

        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw logo watermark (center, rotated)
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-45 * Math.PI / 180);
        
        const logoSize = Math.min(canvas.width, canvas.height) * 0.3;
        ctx.globalAlpha = 0.15;
        ctx.drawImage(
          logo,
          -logoSize / 2,
          -logoSize / 2 - 50,
          logoSize,
          logoSize
        );

        // Draw text watermark
        ctx.globalAlpha = 0.2;
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('VERIFIED BY', 0, 20);
        ctx.fillText('MYHEALTHSTATUS', 0, 70);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(timestamp, 0, 110);

        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Share ID: ${shareId}`, 0, 145);

        // Restore context
        ctx.restore();

        // Add footer
        ctx.globalAlpha = 1;
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(
          `Verify at: myhealthstatus.org/verify/${shareId}`,
          20,
          canvas.height - 20
        );

        // Convert to data URL
        resolve(canvas.toDataURL('image/png'));
      };

      logo.onerror = () => reject(new Error('Failed to load logo'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
  });
}