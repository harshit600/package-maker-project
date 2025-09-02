"use client";

import { useEffect, useState } from "react";
import { usePackage } from "../context/PackageContext";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import "./finalCosting.css";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Utility functions for common PDF operations
const pdfUtils = {
  // Convert hex color to RGB
  hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  },

  // Draw a rectangle with rounded corners
  async drawRoundedRect(page, { x, y, width, height, color, radius = 0 }) {
    const { r, g, b } = this.hexToRgb(color);
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: rgb(r, g, b),
      borderRadius: radius,
    });
  },

  // Draw text with proper word wrapping
  async drawWrappedText(page, text, { x, y, width, size, font, color }) {
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    const lineHeight = size * 1.2;

    for (const word of words) {
      const testLine = line + word + " ";
      const textWidth = font.widthOfTextAtSize(testLine, size);

      if (textWidth > width) {
        page.drawText(line, { x, y: currentY, size, font, color });
        line = word + " ";
        currentY -= lineHeight;
      } else {
        line = testLine;
      }
    }
    page.drawText(line, { x, y: currentY, size, font, color });
    return currentY - lineHeight;
  },
};

// PDF Generation Sections
const pdfSections = {
  async drawHeader(page, fonts, { width, height }) {
    // Company header
    await pdfUtils.drawRoundedRect(page, {
      x: 50,
      y: height - 100,
      width: width - 100,
      height: 60,
      color: "#0a4d7a",
      radius: 8,
    });

    page.drawText("PLUTO TRAVELS", {
      x: width / 2 - 80,
      y: height - 70,
      size: 28,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    return height - 120; // Return the next Y position
  },

  async drawCustomerInfo(page, fonts, startY, customerData) {
    let currentY = startY;

    // Section title
    page.drawText("Customer Details", {
      x: 50,
      y: currentY,
      size: 16,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    // Customer details grid
    const details = [
      { label: "Name", value: customerData.name },
      { label: "Email", value: customerData.email },
      { label: "Phone", value: customerData.phone },
      { label: "Travel Dates", value: customerData.travelDates },
    ];

    for (const detail of details) {
      page.drawText(detail.label, {
        x: 50,
        y: currentY,
        size: 10,
        font: fonts.regular,
        color: rgb(0.4, 0.4, 0.4),
      });

      page.drawText(detail.value, {
        x: 150,
        y: currentY,
        size: 10,
        font: fonts.bold,
        color: rgb(0, 0, 0),
      });

      currentY -= 20;
    }

    return currentY - 20; // Return the next Y position
  },
};

// Main PDF creation function
const createPDF = async (packageData) => {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Embed fonts
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  };

  // Add a new page
  const page = pdfDoc.addPage([595.276, 841.89]); // A4 size
  const { width, height } = page.getSize();

  // Draw sections
  let currentY = height;

  // Draw header
  currentY = await pdfSections.drawHeader(page, fonts, { width, height });

  // Draw customer info
  currentY = await pdfSections.drawCustomerInfo(
    page,
    fonts,
    currentY,
    packageData.customer
  );

  // Generate PDF bytes
  return await pdfDoc.save();
};

// React Component
export default function FinalCosting() {
  const { packageDetails } = usePackage();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const pdfBytes = await createPDF(packageDetails);

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "package-details.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-center p-4">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isGenerating ? "Generating PDF..." : "Download PDF"}
      </button>
    </div>
  );
}
