import jsPDF from 'jspdf';
import type { Tour } from './types';

// Helper to convert image URL to base64
async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  if (!imageUrl) return null;
  
  try {
    // Try to fetch with CORS
    const response = await fetch(imageUrl, {
      method: 'GET',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    // Gracefully handle CORS or load failures
    console.warn('Skipping image due to load failure:', imageUrl);
    return null;
  }
}

export async function exportTourToPdf(tour: Tour) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Set default font to Times
  doc.setFont('times');

  // Header
  doc.setFontSize(24);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204); 
  doc.text(tour.name, margin, y);
  y += 12;

  doc.setFontSize(12);
  doc.setFont('times', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`${tour.type} | ${tour.difficulty} | ${tour.duration} days`, margin, y);
  y += 10;
  
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Price: $${tour.price}`, margin, y);
  y += 10;

  // Helper for page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > 280) {
      doc.addPage();
      doc.setFont('times'); // Reset font on new page
      y = margin;
    }
  };

  // Main Image
  if (tour.mainImage?.url) {
    const base64 = await getBase64ImageFromUrl(tour.mainImage.url);
    if (base64) {
      try {
        const imgWidth = 170;
        const imgHeight = 100;
        doc.addImage(base64, 'JPEG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      } catch (e) {
        console.warn('Error adding main image to PDF', e);
      }
    }
  }

  // Description
  checkPageBreak(30);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text("Description", margin, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(50, 50, 50);
  const descLines = doc.splitTextToSize(tour.description.replace(/<[^>]*>?/gm, ''), 170);
  doc.text(descLines, margin, y);
  y += (descLines.length * 5) + 10;

  // Itinerary
  checkPageBreak(30);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text("Itinerary", margin, y);
  y += 8;
  
  for (const item of tour.itinerary) {
    const titleLines = doc.splitTextToSize(`Day ${item.day}: ${item.title}`, 170);
    checkPageBreak(titleLines.length * 7 + 15);
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 6;
    
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);
    const itemDescLines = doc.splitTextToSize(item.description, 170);
    checkPageBreak(itemDescLines.length * 5 + 5);
    doc.text(itemDescLines, margin, y);
    y += (itemDescLines.length * 5) + 5;
  }

  // Gallery (More Images)
  if (tour.images && tour.images.length > 0) {
    checkPageBreak(50);
    y += 5;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text("Gallery", margin, y);
    y += 10;

    const imgWidth = 80;
    const imgHeight = 50;
    const spacing = 10;
    let currentX = margin;

    for (const img of tour.images.slice(0, 6)) { // Limit to top 6 images
      const base64 = await getBase64ImageFromUrl(img.url);
      if (base64) {
        checkPageBreak(imgHeight + 10);
        try {
          doc.addImage(base64, 'JPEG', currentX, y, imgWidth, imgHeight);
          if (currentX === margin) {
            currentX += imgWidth + spacing;
          } else {
            currentX = margin;
            y += imgHeight + spacing;
          }
        } catch (e) {
          console.warn('Error adding gallery image to PDF', e);
        }
      }
    }
    if (currentX !== margin) y += imgHeight + spacing;
  }

  // Inclusions/Exclusions
  checkPageBreak(30);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text("Inclusions", margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(50, 50, 50);
  tour.inclusions.forEach((inc) => {
    const lines = doc.splitTextToSize(`• ${inc}`, 160);
    checkPageBreak(lines.length * 5);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5;
  });
  y += 10;

  checkPageBreak(30);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text("Exclusions", margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(50, 50, 50);
  tour.exclusions.forEach((exc) => {
    const lines = doc.splitTextToSize(`• ${exc}`, 160);
    checkPageBreak(lines.length * 5);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5;
  });

  // FAQ
  if (tour.faq && tour.faq.length > 0) {
    checkPageBreak(30);
    y += 10;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text("FAQ", margin, y);
    y += 8;
    tour.faq.forEach((f) => {
      const qLines = doc.splitTextToSize(`Q: ${f.question}`, 170);
      const aLines = doc.splitTextToSize(`A: ${f.answer}`, 170);
      checkPageBreak((qLines.length + aLines.length) * 5 + 10);
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(qLines, margin, y);
      y += qLines.length * 5 + 2;
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(aLines, margin, y);
      y += aLines.length * 5 + 5;
    });
  }

  // Gears
  if (tour.gears && tour.gears.length > 0) {
    checkPageBreak(30);
    y += 10;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text("Gears & Equipment", margin, y);
    y += 8;
    tour.gears.forEach((gear) => {
      const gearText = `${gear.name}${gear.provided ? ' (Provided)' : ' (Bring your own)'}`;
      const lines = doc.splitTextToSize(`• ${gearText}`, 160);
      checkPageBreak(lines.length * 5);
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5;
    });
  }

  // Reviews
  if (tour.reviews && tour.reviews.length > 0) {
    checkPageBreak(30);
    y += 10;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text("Reviews", margin, y);
    y += 8;
    tour.reviews.forEach((review) => {
      const reviewText = `${review.author} (${review.rating}/5): ${review.comment}`;
      const lines = doc.splitTextToSize(reviewText, 170);
      checkPageBreak(lines.length * 5 + 5);
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    });
  }

  // Map of the trek
  if (tour.map) {
    checkPageBreak(30);
    y += 10;
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text("Map of the trek", margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text("You can view the interactive map for this trek here:", margin, y);
    y += 10; // Increased spacing for the break
    doc.setTextColor(0, 102, 204);
    doc.text(tour.map, margin, y);
    y += 15;
  }

  // CTA
  checkPageBreak(40);
  y += 20;
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.setTextColor(0, 102, 204);
  doc.text("Ready to book?", margin, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont('times', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`Visit: https://happymountainnepal.com/tours/${tour.slug}`, margin, y);

  doc.save(`${tour.slug}.pdf`);
}
