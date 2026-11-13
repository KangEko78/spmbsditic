/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  marginMm?: number;
  scale?: number;
}

/**
 * Generates and downloads a genuine A4 PDF file from an HTML element
 */
export async function downloadElementAsPdf(
  elementIdOrElement: string | HTMLElement,
  options: GeneratePdfOptions | string = {}
): Promise<boolean> {
  const normalizedOpts: GeneratePdfOptions = typeof options === 'string' ? { fileName: options } : options;
  const {
    fileName = `Dokumen_SPMB_${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation = 'portrait',
    format = 'a4',
    scale = 2
  } = normalizedOpts;

  let targetElement: HTMLElement | null = null;
  if (typeof elementIdOrElement === 'string') {
    targetElement = document.getElementById(elementIdOrElement);
  } else {
    targetElement = elementIdOrElement;
  }

  if (!targetElement) {
    console.error(`Target element not found for PDF generation.`);
    alert('Komponen dokumen tidak ditemukan untuk pembuatan PDF.');
    return false;
  }

  try {
    // Clone and prepare element if needed or render directly with html2canvas
    const canvas = await html2canvas(targetElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Create jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Multiple pages if document exceeds single page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF file to trigger download
    pdf.save(fileName);
    return true;
  } catch (err: any) {
    console.error('Error generating PDF:', err);
    // Graceful fallback to browser print dialog
    if (confirm('Pembuatan file PDF langsung mengalami kendala pada peramban ini. Ingin membuka jendela cetak sistem (Simpan sebagai PDF)?')) {
      window.print();
    }
    return false;
  }
}
