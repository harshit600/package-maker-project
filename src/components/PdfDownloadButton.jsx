import React, { useState, useEffect, useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import QuotePreviewPDF from "./QuotePreviewPDF";

/**
 * Non-blocking PDF Download Button
 * Uses pdf() function to generate PDF asynchronously with proper yield points
 * Prevents browser unresponsive dialog by using requestIdleCallback and setTimeout
 */
const PdfDownloadButton = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName,
  selectedLead,
  showDiscount,
  discountAmount,
  activeDiscountPercentage,
  cabImages,
  pdfStyle,
  fileName,
  buttonText = "Download PDF",
  buttonClassName = "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-md hover:shadow-lg",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Cleanup URL when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper function to yield control back to browser
  const yieldToBrowser = () => {
    return new Promise((resolve) => {
      // Use requestIdleCallback if available, otherwise setTimeout
      if (window.requestIdleCallback) {
        requestIdleCallback(() => setTimeout(resolve, 0));
      } else {
        setTimeout(resolve, 0);
      }
    });
  };

  const handleDownload = async () => {
    // Reset states
    setError(null);
    setIsGenerating(true);
    setProgress(0);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Yield to browser immediately to keep UI responsive
      await yieldToBrowser();
      setProgress(5);

      // Step 2: Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress(10);

      // Step 3: Create the PDF document component (lightweight operation)
      const pdfDocument = (
        <QuotePreviewPDF
          packageSummary={packageSummary}
          showMargin={showMargin}
          marginAmount={marginAmount}
          finalTotal={finalTotal}
          getCurrentMarginPercentage={getCurrentMarginPercentage}
          companyName={companyName}
          selectedLead={selectedLead}
          showDiscount={showDiscount}
          discountAmount={discountAmount}
          activeDiscountPercentage={activeDiscountPercentage}
          cabImages={cabImages}
          pdfStyle={pdfStyle}
        />
      );

      await yieldToBrowser();
      setProgress(15);

      // Step 4: Create PDF instance (this is still lightweight)
      const pdfInstance = pdf(pdfDocument);
      
      // Step 5: Start progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 85) {
            return prev + 1;
          }
          return prev;
        });
      }, 300);

      // Step 6: Generate PDF blob - this is the heavy operation
      // Use setTimeout to ensure this runs in next tick
      let blob;
      try {
        // Check if toBlob exists, otherwise use toBuffer and convert
        if (typeof pdfInstance.toBlob === 'function') {
          blob = await new Promise((resolve, reject) => {
            // Wrap in setTimeout to yield to browser
            setTimeout(async () => {
              try {
                const result = await pdfInstance.toBlob();
                resolve(result);
              } catch (err) {
                reject(err);
              }
            }, 0);
          });
        } else {
          // Fallback: use toBuffer if toBlob doesn't exist
          const buffer = await pdfInstance.toBuffer();
          blob = new Blob([buffer], { type: 'application/pdf' });
        }
      } finally {
        clearInterval(progressInterval);
      }
      
      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      await yieldToBrowser();
      setProgress(90);

      // Step 7: Create blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      await yieldToBrowser();
      setProgress(95);

      // Step 8: Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "quote.pdf";
      link.style.display = "none";
      document.body.appendChild(link);
      
      // Small delay before click
      await yieldToBrowser();
      link.click();
      
      // Clean up link
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch (e) {
          // Link might already be removed
        }
      }, 100);

      setProgress(100);

      // Reset states after successful download
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        // Keep blob URL for download
        setTimeout(() => {
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
          }
        }, 5000);
      }, 500);

    } catch (err) {
      // Check if error is due to abort
      if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false);
        setProgress(0);
        return;
      }

      console.error("PDF generation error:", err);
      setError(err.message || "Failed to generate PDF. Please try again.");
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={`${buttonClassName} ${isGenerating ? "opacity-75 cursor-not-allowed" : ""}`}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating PDF... {progress > 0 && `${progress}%`}
        </>
      ) : error ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Error - Try Again
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
};

export default PdfDownloadButton;

