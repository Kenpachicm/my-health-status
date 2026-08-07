import { PDFDocument, rgb, degrees } from 'pdf-lib';

export async function addWatermarkToPDF(
  pdfUrl: string,
  shareId: string,
  timestamp: string,
  logoUrl: string
): Promise<Blob> {
  try {
    // Fetch PDF
    const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Fetch logo
    const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes); // or embedJpg

    const pages = pdfDoc.getPages();

    // Add watermark to each page
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Draw logo (center, rotated)
      const logoSize = 150;
      page.drawImage(logoImage, {
        x: width / 2 - logoSize / 2,
        y: height / 2 - logoSize / 2,
        width: logoSize,
        height: logoSize,
        opacity: 0.1,
        rotate: degrees(-45)
      });

      // Draw text watermark (diagonal)
      page.drawText('VERIFIED BY MYHEALTHSTATUS', {
        x: width / 4,
        y: height / 2 + 50,
        size: 40,
        color: rgb(0, 0, 0),
        opacity: 0.15,
        rotate: degrees(-45)
      });

      page.drawText(timestamp, {
        x: width / 4,
        y: height / 2,
        size: 20,
        color: rgb(0, 0, 0),
        opacity: 0.15,
        rotate: degrees(-45)
      });

      page.drawText(`Share ID: ${shareId}`, {
        x: width / 4,
        y: height / 2 - 30,
        size: 16,
        color: rgb(0, 0, 0),
        opacity: 0.15,
        rotate: degrees(-45)
      });

      // Footer info
      page.drawText(
        `UNOFFICIAL COPY - Verify at myhealthstatus.org/verify/${shareId}`,
        {
          x: 50,
          y: 30,
          size: 10,
          color: rgb(0, 0, 0)
        }
      );
    }

    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    return new Blob([watermarkedPdfBytes], { type: 'application/pdf' });

  } catch (error) {
    console.error('Error watermarking PDF:', error);
    throw error;
  }
}