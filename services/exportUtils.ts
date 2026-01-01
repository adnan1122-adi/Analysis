
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportWithLogoFlow = (elementId: string, fileName: string, customTitle?: string, preSelectedLogo?: string | null) => {
    // If a logo is already in the UI, use it. Otherwise, prompt.
    if (preSelectedLogo) {
        exportToPDF(elementId, fileName, preSelectedLogo, customTitle);
    } else {
        if (window.confirm("Would you like to add an institution logo to the report header?")) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const logoBase64 = evt.target?.result as string;
                        exportToPDF(elementId, fileName, logoBase64, customTitle);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        } else {
            exportToPDF(elementId, fileName, null, customTitle);
        }
    }
};

export const exportToPDF = async (elementId: string, fileName: string, logoBase64?: string | null, customTitle?: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    const bottomMargin = 20;
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - margin - bottomMargin;

    let currentY = margin;

    // Report Header Section
    if (logoBase64 || customTitle) {
        let logoH = 0;
        
        // Render Logo on the LEFT
        if (logoBase64) {
            try {
                 const img = new Image();
                 img.src = logoBase64;
                 await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                 });

                 const maxW = 45;
                 const maxH = 22;
                 const aspect = img.width / img.height;
                 let drawW = maxW;
                 let drawH = maxW / aspect;
                 if (drawH > maxH) {
                     drawH = maxH;
                     drawW = maxH * aspect;
                 }
                 logoH = drawH;
                 let format = 'PNG';
                 if (logoBase64.startsWith('data:image/jpeg') || logoBase64.startsWith('data:image/jpg')) format = 'JPEG';
                 
                 // Force LEFT placement
                 pdf.addImage(logoBase64, format, margin, margin, drawW, drawH);
            } catch (e) {
                console.warn("Logo failed to render in PDF", e);
            }
        }

        // Render Title professionally
        if (customTitle) {
            const isArabic = /[\u0600-\u06FF]/.test(customTitle);
            pdf.setFontSize(24);
            pdf.setTextColor(15, 23, 42); // slate-900
            
            // Adjust Y for title: center it vertically relative to logo if logo exists
            const titleY = logoH > 0 ? margin + (logoH / 2) + 4 : margin + 10;
            const titleX = logoBase64 ? margin + 50 : margin; // Offset if logo exists
            
            if (isArabic) {
                // If Arabic, we might prefer right alignment for the text itself within the remaining space
                // But for a professional letterhead style, we'll keep it simple
                pdf.text(customTitle, pdfWidth - margin, titleY, { align: 'right', maxWidth: logoBase64 ? pdfWidth - margin - 65 : pdfWidth - (2*margin) });
            } else {
                pdf.text(customTitle, titleX, titleY, { maxWidth: pdfWidth - titleX - margin });
            }
        }

        currentY = margin + Math.max(logoH, 15) + 15;
        
        // Header separator line
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.5);
        pdf.line(margin, currentY - 5, pdfWidth - margin, currentY - 5);
    }

    const children = Array.from(element.children) as HTMLElement[];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      // Skip the duplicated UI header in the capture if we are already rendering it via jsPDF primitives
      if (child.classList.contains('report-professional-header')) continue;
      if (child.style.display === 'none' || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;

      const canvas = await html2canvas(child, {
        scale: 2.5, // High enough for print, but not memory intensive
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const spaceLeft = (pdfHeight - bottomMargin) - currentY;

      if (imgHeight <= spaceLeft) {
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 8;
      } 
      else if (imgHeight <= contentHeight) {
        pdf.addPage();
        currentY = margin;
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 8;
      }
      else {
        // Splitting logic for very tall charts/tables
        let currentSliceY = 0;
        let remainingCanvasHeight = canvas.height;
        while (remainingCanvasHeight > 0) {
            const currentSpaceMM = (currentY === margin) ? contentHeight : ((pdfHeight - bottomMargin) - currentY);
            const pxPerMM = canvas.width / imgWidth;
            const availableHeightPx = currentSpaceMM * pxPerMM;
            const sliceHeightPx = Math.min(remainingCanvasHeight, availableHeightPx);
            
            if (sliceHeightPx < (5 * pxPerMM) && currentY !== margin) {
                pdf.addPage();
                currentY = margin;
                continue;
            }

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceHeightPx;
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
                ctx.drawImage(canvas, 0, currentSliceY, canvas.width, sliceHeightPx, 0, 0, sliceCanvas.width, sliceHeightPx);
                const sliceImgData = sliceCanvas.toDataURL('image/png');
                const sliceHeightMM = sliceHeightPx / pxPerMM;
                pdf.addImage(sliceImgData, 'PNG', margin, currentY, imgWidth, sliceHeightMM);
                currentY += sliceHeightMM;
                currentSliceY += sliceHeightPx;
                remainingCanvasHeight -= sliceHeightPx;
            }
            if (remainingCanvasHeight > 10) {
                pdf.addPage();
                currentY = margin;
            }
        }
        currentY += 8;
      }
    }

    const totalPages = pdf.getNumberOfPages();
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // slate-400
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const footerText = `Page ${i} of ${totalPages} | Educational Intelligence Report | Powered by EduAnalytics AI`;
        pdf.text(footerText, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    }
    pdf.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error("Professional PDF Export failed", err);
  }
};

export const exportToWord = (elementId: string, fileName: string, customTitle?: string, logo?: string | null) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const isArabic = customTitle && /[\u0600-\u06FF]/.test(customTitle);

  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${fileName}</title>
      <style>
        body { font-family: 'Segoe UI', Calibri, sans-serif; padding: 20px; direction: ${isArabic ? 'rtl' : 'ltr'}; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: ${isArabic ? 'right' : 'left'}; }
        th { background-color: #f8fafc; color: #1e293b; font-weight: bold; }
        h1 { color: #0f172a; font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { color: #334155; font-size: 22px; margin-top: 30px; }
        .logo-container { text-align: left; margin-bottom: 20px; }
        .logo-img { max-height: 80px; max-width: 180px; }
      </style>
    </head>
    <body>
      <div class="logo-container">
        ${logo ? `<img src="${logo}" class="logo-img" />` : ''}
      </div>
      ${customTitle ? `<h1>${customTitle}</h1>` : `<h1>${fileName.replace(/_/g, ' ')}</h1>`}
  `;
  const footer = "</body></html>";
  const sourceHTML = header + element.innerHTML + footer;
  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
