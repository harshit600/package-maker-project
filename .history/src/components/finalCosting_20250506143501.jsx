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

  async drawPackageDetails(page, fonts, startY, packageData) {
    let currentY = startY;

    // Section title
    page.drawText("Package Details", {
      x: 50,
      y: currentY,
      size: 16,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    const details = [
      { label: "Package Name", value: packageData.name },
      { label: "Duration", value: `${packageData.duration} Days` },
      { label: "Destination", value: packageData.destination },
      { label: "Hotel Category", value: packageData.hotelCategory },
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

    return currentY - 20;
  },

  async drawItinerary(page, fonts, startY, itineraryData) {
    let currentY = startY;

    // Section title
    page.drawText("Itinerary", {
      x: 50,
      y: currentY,
      size: 16,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    for (const day of itineraryData) {
      // Day header
      page.drawText(`Day ${day.day}:`, {
        x: 50,
        y: currentY,
        size: 12,
        font: fonts.bold,
        color: rgb(0, 0, 0),
      });

      currentY -= 20;

      // Day description
      currentY = await pdfUtils.drawWrappedText(page, day.description, {
        x: 70,
        y: currentY,
        width: 450,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0),
      });

      currentY -= 15;
    }

    return currentY - 20;
  },

  async drawCostBreakdown(page, fonts, startY, costData) {
    let currentY = startY;

    // Section title
    page.drawText("Cost Breakdown", {
      x: 50,
      y: currentY,
      size: 16,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    // Draw table headers
    const columns = [
      { x: 50, width: 200, label: "Item" },
      { x: 250, width: 100, label: "Cost" },
      { x: 350, width: 100, label: "Quantity" },
      { x: 450, width: 100, label: "Total" },
    ];

    // Header background
    await pdfUtils.drawRoundedRect(page, {
      x: 50,
      y: currentY,
      width: 500,
      height: 25,
      color: "#f3f4f6",
      radius: 4,
    });

    // Header text
    for (const column of columns) {
      page.drawText(column.label, {
        x: column.x,
        y: currentY + 8,
        size: 10,
        font: fonts.bold,
        color: rgb(0, 0, 0),
      });
    }

    currentY -= 35;

    // Draw items
    for (const item of costData.items) {
      page.drawText(item.name, {
        x: columns[0].x,
        y: currentY,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0),
      });

      page.drawText(`$${item.cost}`, {
        x: columns[1].x,
        y: currentY,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0),
      });

      page.drawText(item.quantity.toString(), {
        x: columns[2].x,
        y: currentY,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0),
      });

      page.drawText(`$${item.cost * item.quantity}`, {
        x: columns[3].x,
        y: currentY,
        size: 10,
        font: fonts.bold,
        color: rgb(0, 0, 0),
      });

      currentY -= 20;
    }

    // Total
    currentY -= 10;
    await pdfUtils.drawRoundedRect(page, {
      x: 350,
      y: currentY,
      width: 200,
      height: 25,
      color: "#0a4d7a",
      radius: 4,
    });

    page.drawText(`Total: $${costData.total}`, {
      x: 370,
      y: currentY + 8,
      size: 12,
      font: fonts.bold,
      color: rgb(1, 1, 1),
    });

    return currentY - 20;
  },

  async drawTermsAndConditions(page, fonts, startY) {
    let currentY = startY;

    // Section title
    page.drawText("Terms & Conditions", {
      x: 50,
      y: currentY,
      size: 16,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });

    currentY -= 30;

    const terms = [
      "1. Booking & Payment: 50% advance payment required to confirm booking.",
      "2. Cancellation: Cancellations made 30 days prior to arrival - full refund; 15-29 days - 50% refund; less than 15 days - no refund.",
      "3. Package Modifications: Prices and itinerary subject to change based on availability.",
      "4. Travel Insurance: Guests are advised to obtain comprehensive travel insurance.",
      "5. Visa & Documentation: Guests are responsible for valid travel documents and visas.",
    ];

    for (const term of terms) {
      currentY = await pdfUtils.drawWrappedText(page, term, {
        x: 50,
        y: currentY,
        width: 500,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0),
      });
      currentY -= 10;
    }

    return currentY - 20;
  },

  async drawFooter(page, fonts, { width, height }) {
    const footerY = 50;

    // Footer line
    await pdfUtils.drawRoundedRect(page, {
      x: 50,
      y: footerY + 30,
      width: width - 100,
      height: 1,
      color: "#0a4d7a",
    });

    // Contact information
    page.drawText("Contact: +1234567890 | Email: info@plutotravels.com", {
      x: 50,
      y: footerY + 10,
      size: 10,
      font: fonts.regular,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Website and address
    page.drawText(
      "www.plutotravels.com | 123 Travel Street, Tourism City, TC 12345",
      {
        x: 50,
        y: footerY - 5,
        size: 10,
        font: fonts.regular,
        color: rgb(0.4, 0.4, 0.4),
      }
    );

    // Page number
    const pageNum = page.getPageIndex() + 1;
    page.drawText(`Page ${pageNum}`, {
      x: width - 70,
      y: footerY,
      size: 10,
      font: fonts.regular,
      color: rgb(0.4, 0.4, 0.4),
    });
  },
};

// Main PDF creation function
const createPDF = async (packageData) => {
  const pdfDoc = await PDFDocument.create();

  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
  };

  let page = pdfDoc.addPage([595.276, 841.89]); // A4 size
  const { width, height } = page.getSize();

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

  // Draw package details
  currentY = await pdfSections.drawPackageDetails(
    page,
    fonts,
    currentY,
    packageData
  );

  // Draw itinerary
  currentY = await pdfSections.drawItinerary(
    page,
    fonts,
    currentY,
    packageData.itinerary
  );

  // Check if we need a new page for cost breakdown
  if (currentY < 200) {
    page = pdfDoc.addPage([595.276, 841.89]);
    currentY = page.getSize().height - 50;
  }

  // Draw cost breakdown
  currentY = await pdfSections.drawCostBreakdown(
    page,
    fonts,
    currentY,
    packageData.costs
  );

  // Check if we need a new page for terms
  if (currentY < 200) {
    page = pdfDoc.addPage([595.276, 841.89]);
    currentY = page.getSize().height - 50;
  }

  // Draw terms and conditions
  currentY = await pdfSections.drawTermsAndConditions(page, fonts, currentY);

  // Draw footer on all pages
  pdfDoc.getPages().forEach((p) => {
    pdfSections.drawFooter(p, fonts, { width, height });
  });

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
