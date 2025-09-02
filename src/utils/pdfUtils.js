import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFWithImages = async (images, existingPDF) => {
  try {
    // Create temporary container for images
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    // Load all images
    const loadedImages = await Promise.all(
      images.map(async (src) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;
        await new Promise((resolve) => (img.onload = resolve));
        return img;
      })
    );

    // Add images to PDF
    const doc = existingPDF || new jsPDF();
    loadedImages.forEach((img, index) => {
      const x = 10 + (index * 65);
      doc.addImage(img, 'JPEG', x, 10, 60, 60);
    });

    // Cleanup
    document.body.removeChild(container);
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF with images:', error);
    throw error;
  }
}; 