import { Injectable } from '@angular/core';
import { ImageRecord } from '../models/image.model';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class PdfExportService {

  async exportToPdf(images: ImageRecord[]): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const imageSize = pageWidth - margin * 2;

    for (let i = 0; i < images.length; i++) {
      if (i > 0) pdf.addPage();

      const image = images[i];

      try {
        // Add keyword label at top
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text(
          image.keyword.charAt(0).toUpperCase() + image.keyword.slice(1),
          margin,
          margin + 5
        );

        // Add KidsColor watermark
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text('kidscolor.app', pageWidth - margin, margin + 5, { align: 'right' });

        // Load and add image
        const imgData = await this.loadImageAsBase64(image.imageUrl);
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin + 12,
          imageSize,
          imageSize
        );

        // Add difficulty and age range if available
        if (image.difficulty || image.ageRange) {
          pdf.setFontSize(8);
          pdf.setTextColor(150, 150, 150);
          const label = [
            image.difficulty ? `Difficulty: ${image.difficulty}` : '',
            image.ageRange ? `Age: ${image.ageRange} yrs` : ''
          ].filter(Boolean).join(' · ');
          pdf.text(label, margin, pageHeight - margin);
        }

      } catch (err) {
        console.warn(`[PDF] Failed to add image ${image.id}:`, err);
      }
    }

    const filename = images.length === 1
      ? `kidscolor-${images[0].keyword}.pdf`
      : `kidscolor-${images.length}-pages.pdf`;

    pdf.save(filename);
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
