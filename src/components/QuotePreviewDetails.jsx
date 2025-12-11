import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePreviewPDF from "./QuotePreviewPDF";
import PdfDownloadButton from "./PdfDownloadButton";

// Helper function to format inclusion/exclusion text
const formatInclusionExclusionText = (text) => {
  if (!text) return "";
  let formatted = text.trim();
  formatted = formatted.replace(/[.,;:!?]+$/, "");
  if (formatted.length > 0) {
    formatted += ".";
  }
  return formatted;
};

// Inclusions Section Component - Styled like PlutoLink
const InclusionsSection = ({ packageInfo, decodeHtmlEntities, formatInclusionExclusionText, parseHtmlContent }) => {
  // Check both packageInclusions and package.packageInclusions
  const inclusionsText = packageInfo?.packageInclusions || packageInfo?.package?.packageInclusions || "";
  
  if (!inclusionsText) {
    return null;
  }

  const parsedItems = parseHtmlContent(inclusionsText);
  const allItems = [];
  
  parsedItems.forEach((textSegments) => {
    // parseHtmlContent returns array of strings
    const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
    
    // Split by newline or multiple spaces to create separate items
    const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      lines.forEach(line => {
        allItems.push(line.trim());
      });
    } else if (textContent.trim().length > 0) {
      allItems.push(textContent.trim());
    }
  });

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden border-2 border-green-200">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-green-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">PACKAGE INCLUSIONS</h3>
            <p className="text-white/90 text-sm mt-0.5">Everything included in your journey</p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-white px-4 py-3">
        <div className="space-y-1.5">
          {allItems.map((item, index) => {
            const formattedText = formatInclusionExclusionText(item);
            const isFirstItem = index === 0;
            return (
              <div key={index} className="rounded-lg p-2 flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {isFirstItem ? (
                    <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                  {formattedText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Exclusions Section Component - Styled like PlutoLink
const ExclusionsSection = ({ packageInfo, decodeHtmlEntities, formatInclusionExclusionText, parseHtmlContent, showOnlyMain = false }) => {
  // Check both packageExclusions and package.packageExclusions
  const exclusionsText = packageInfo?.packageExclusions || packageInfo?.package?.packageExclusions || "";
  const customExclusions = packageInfo?.customExclusions || packageInfo?.package?.customExclusions || [];
  
  const parsedItems = parseHtmlContent(exclusionsText);
  const allItems = [];
  
  parsedItems.forEach((textSegments) => {
    const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
    
    // Split by newline or multiple spaces to create separate items
    const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      lines.forEach(line => {
        allItems.push(line.trim());
      });
    } else if (textContent.trim().length > 0) {
      allItems.push(textContent.trim());
    }
  });

  if (showOnlyMain && allItems.length === 0) {
    return null;
  }

  if (!showOnlyMain && allItems.length === 0 && customExclusions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden border-2 border-red-200">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-red-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">PACKAGE EXCLUSIONS</h3>
            <p className="text-white/90 text-sm mt-0.5">Items not included in your package</p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-white px-4 py-3">
        <div className="space-y-1.5">
          {/* Main Exclusions */}
          {allItems.map((item, index) => {
            const formattedText = formatInclusionExclusionText(item);
            const isFirstItem = index === 0;
            return (
              <div key={index} className="rounded-lg p-2 flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {isFirstItem ? (
                    <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                  {formattedText}
                </span>
              </div>
            );
          })}

          {/* Custom Exclusions - Only show if showOnlyMain is false */}
          {!showOnlyMain && customExclusions.map((section, sectionIndex) => {
            const sectionItems = parseHtmlContent(section.description || "");
            const sectionAllItems = [];
            
            sectionItems.forEach((textSegments) => {
              const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
              const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
              if (lines.length > 0) {
                lines.forEach(line => {
                  sectionAllItems.push(line.trim());
                });
              } else if (textContent.trim().length > 0) {
                sectionAllItems.push(textContent.trim());
              }
            });

            if (sectionAllItems.length === 0) return null;

            return (
              <div key={sectionIndex} className={sectionIndex > 0 || allItems.length > 0 ? 'mt-4' : ''}>
                {section.name && (
                  <div className="bg-[#2d2d44] rounded-lg mb-2 px-3 py-2">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                      {section.name.toUpperCase()}
                    </h4>
                  </div>
                )}
                <div className="space-y-1.5">
                  {sectionAllItems.map((item, idx) => {
                    const formattedText = formatInclusionExclusionText(item);
                    const isFirstItemInSection = idx === 0 && (sectionIndex === 0 && allItems.length === 0);
                    return (
                      <div key={idx} className="rounded-lg p-2 flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {isFirstItemInSection ? (
                            <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                          {formattedText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Custom Exclusions Section Component - Styled like PlutoLink
const CustomExclusionsSection = ({ packageInfo, decodeHtmlEntities, formatInclusionExclusionText, parseHtmlContent }) => {
  const customExclusions = packageInfo?.customExclusions || packageInfo?.package?.customExclusions || [];
  
  if (customExclusions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200">
      {/* Header Section */}
      <div className="px-3 py-3 bg-[#2d2d44]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-orange-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white">CUSTOM EXCLUSIONS</h3>
            <p className="text-white/90 text-sm mt-0.5">Additional terms and conditions</p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-white px-4 py-3">
        <div className="space-y-1.5">
          {customExclusions.map((section, sectionIndex) => {
            const sectionItems = parseHtmlContent(section.description || "");
            const sectionAllItems = [];
            
            sectionItems.forEach((textSegments) => {
              const textContent = typeof textSegments === 'string' ? textSegments : String(textSegments || '');
              const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
              if (lines.length > 0) {
                lines.forEach(line => {
                  sectionAllItems.push(line.trim());
                });
              } else if (textContent.trim().length > 0) {
                sectionAllItems.push(textContent.trim());
              }
            });

            if (sectionAllItems.length === 0) return null;

            return (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-4' : ''}>
                {section.name && (
                  <div className="bg-[#2d2d44] rounded-lg mb-2 px-3 py-2">
                    <h4 className="text-xl md:text-2xl font-bold text-white">
                      {section.name.toUpperCase()}
                    </h4>
                  </div>
                )}
                <div className="space-y-1.5">
                  {sectionAllItems.map((item, idx) => {
                    const formattedText = formatInclusionExclusionText(item);
                    const isFirstItem = idx === 0;
                    return (
                      <div key={idx} className="rounded-lg p-2 flex items-start gap-2">
                        <div className="flex-shrink-0 mt-1">
                          {isFirstItem ? (
                            <svg className="w-6 h-6 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#2d2d44] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-800 text-sm md:text-base leading-relaxed flex-1">
                          {formattedText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const QuotePreviewDetails = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "PTW Holidays",
  selectedLead,
  colorTheme,
  showDiscount,
  discountAmount,
  activeDiscountPercentage,
  cabImages = [],
}) => {
  // Helper for safe access
  const safe = (val, fallback = "N/A") => (val !== undefined && val !== null ? val : fallback);

  // Decode HTML entities and remove HTML tags
  const decodeHtmlEntities = (text) => {
    if (!text) return "";
    return text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Parse HTML content to extract text from paragraphs and list items
  const parseHtmlContent = (htmlString) => {
    if (!htmlString) return [];
    
    // First, try to extract list items
    const listItemRegex = /<li[^>]*>(.*?)<\/li>/gs;
    const listMatches = [...htmlString.matchAll(listItemRegex)];
    
    if (listMatches.length > 0) {
      return listMatches.map(match => decodeHtmlEntities(match[1]));
    }
    
    // If no list items, extract paragraphs
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
    const paraMatches = [...htmlString.matchAll(paragraphRegex)];
    
    if (paraMatches.length > 0) {
      return paraMatches.map(match => decodeHtmlEntities(match[1])).filter(text => text && text.trim().length > 0);
    }
    
    // Fallback: split by <br> or newlines and decode
    return htmlString
      .split(/<br\s*\/?>|\n/)
      .map(item => decodeHtmlEntities(item))
      .filter(item => item && item.trim().length > 0);
  };


  // Parse exclusions with sections
  const parseExclusionsWithSections = (htmlString) => {
    if (!htmlString) return [];
    
    const sections = [];
    const paragraphs = parseHtmlContent(htmlString);
    
    let currentSection = null;
    let regularItems = [];
    
    paragraphs.forEach((text) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;
      
      // Check if this contains a section header (e.g., "• PAYMENT PROCEDURE:")
      const sectionHeaderMatch = trimmedText.match(/•\s*([A-Z\s&]+):\s*(.*)$/);
      
      if (sectionHeaderMatch) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const sectionName = sectionHeaderMatch[1].trim();
        const contentAfterHeader = sectionHeaderMatch[2].trim();
        
        // Start new section
        currentSection = {
          title: sectionName,
          content: []
        };
        
        // If there's content after the header, add it
        if (contentAfterHeader) {
          currentSection.content.push(contentAfterHeader);
        }
      } else if (currentSection) {
        // Add content to current section
        currentSection.content.push(trimmedText);
      } else {
        // Regular item without section
        regularItems.push(trimmedText);
      }
    });
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    // If we have sections, return them with regular items first
    if (sections.length > 0) {
      if (regularItems.length > 0) {
        return [{ title: null, content: regularItems }, ...sections];
      }
      return sections;
    }
    
    // If no sections found, return as simple list
    return regularItems.map(item => ({ title: null, content: [item] }));
  };

  // Calculate total with tax
  const taxAmount = finalTotal * 0.05;
  const totalWithTax = finalTotal + taxAmount;

  // Unique cities
  const uniqueCities = Array.from(
    new Set(
      packageSummary.package?.itineraryDays?.map((day) => day.selectedItinerary?.cityName).filter(Boolean)
    )
  );

  // Parse duration to get days and nights
  const parseDuration = (duration) => {
    if (!duration) return { days: "6", nights: "5" };
    
    const durationStr = String(duration).trim();
    
    // Pattern 1: "5N/6D" or "5N / 6D" or "6D/5N"
    const pattern1 = durationStr.match(/(\d+)\s*N\s*[\/|]\s*(\d+)\s*D/i);
    if (pattern1) {
      return { nights: pattern1[1], days: pattern1[2] };
    }
    
    // Pattern 2: "6D/5N" or "6D / 5N"
    const pattern2 = durationStr.match(/(\d+)\s*D\s*[\/|]\s*(\d+)\s*N/i);
    if (pattern2) {
      return { days: pattern2[1], nights: pattern2[2] };
    }
    
    // Pattern 3: "5N 6D" (space separated)
    const pattern3 = durationStr.match(/(\d+)\s*N.*?(\d+)\s*D/i);
    if (pattern3) {
      return { nights: pattern3[1], days: pattern3[2] };
    }
    
    // Pattern 4: "6D 5N" (space separated)
    const pattern4 = durationStr.match(/(\d+)\s*D.*?(\d+)\s*N/i);
    if (pattern4) {
      return { days: pattern4[1], nights: pattern4[2] };
    }
    
    // Pattern 5: Just numbers - assume first is nights, second is days
    const numbers = durationStr.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return { nights: numbers[0], days: numbers[1] };
    }
    
    // Default fallback
    return { days: "6", nights: "5" };
  };

  const durationInfo = parseDuration(packageSummary.package?.duration);

  // Get hero background image
  const heroBackgroundImage = packageSummary.package?.images?.[0] || 
    "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg";

  // Generate PDF filename
  const pdfFileName = `${selectedLead?.name || 'Quote'}_${packageSummary.package?.packageName || 'Package'}_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Download Bar - Always Visible at Top */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-white">
              <p className="text-sm font-semibold">Quick Download</p>
              <p className="text-xs opacity-90">Download your quote as PDF</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {/* Pluto PDF Download Button - Non-blocking */}
              <PdfDownloadButton
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
                pdfStyle="pluto"
                fileName={`${pdfFileName.replace('.pdf', '')}_Pluto.pdf`}
                buttonText="Download Pluto PDF"
                buttonClassName="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg transition-all text-sm font-bold whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-blue-50"
              />
              
              {/* Demand PDF Download Button - Non-blocking */}
              <PdfDownloadButton
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
                pdfStyle="demand"
                fileName={`${pdfFileName.replace('.pdf', '')}_Demand.pdf`}
                buttonText="Download Demand PDF"
                buttonClassName="flex items-center justify-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg transition-all text-sm font-bold whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 hover:bg-orange-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="bg-[#2d2d44] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo and Company Name */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749122411/PTW_Holidays_Logo_1_mgi4uu.png"
                alt="PTW Holidays Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <span className="text-white text-sm sm:text-base md:text-lg font-semibold">ptwholidays.com</span>
            </div>

            {/* Right Side: Email, Phone, and Download PDF Buttons */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 md:gap-4">
              {/* Download PDF Buttons - Prominent - Using Non-blocking Component */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Pluto PDF Download Button */}
                <PdfDownloadButton
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
                  pdfStyle="pluto"
                  fileName={`${pdfFileName.replace('.pdf', '')}_Pluto.pdf`}
                  buttonText="Download Pluto PDF"
                  buttonClassName="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105"
                />
                
                {/* Demand PDF Download Button */}
                <PdfDownloadButton
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
                  pdfStyle="demand"
                  fileName={`${pdfFileName.replace('.pdf', '')}_Demand.pdf`}
                  buttonText="Download Demand PDF"
                  buttonClassName="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105"
                />
              </div>
              <a
                href="mailto:info@ptwholidays.com"
                className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">info@ptwholidays.com</span>
              </a>
              <a
                href="tel:+918353056000"
                className="flex items-center gap-1.5 sm:gap-2 text-white text-xs sm:text-sm md:text-base hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-xs sm:text-sm md:text-base">+91-8353056000</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Section with Background Image */}
      <div 
        className="relative w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackgroundImage})`,
          minHeight: '400px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="relative z-10 pt-16 sm:pt-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
              {/* Left: Package Name Section */}
              <div className="flex-1">
                {/* Personalized for - Yellow Script Style */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl font-serif italic">
                    {safe(selectedLead?.name, "Valued Customer")}'s
                  </span>
                </div>

                {/* Package Name - Large White Bold */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight break-words uppercase">
                  {safe(packageSummary.package?.packageName, "EXCLUSIVE TRAVEL PACKAGE")}
                </h1>

                {/* Duration Box and TRIP Text */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="border-2 border-yellow-400 px-4 sm:px-6 py-2 sm:py-3 bg-transparent">
                    <span className="text-white text-base sm:text-lg md:text-xl font-semibold">
                      {durationInfo.days} Days | {durationInfo.nights} Nights
                    </span>
                  </div>
                  <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
                    TRIP
                  </span>
                </div>
              </div>

              {/* Right: Cost Summary Box */}
              <div className="bg-teal-500/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border-2 border-teal-400/50 w-full lg:w-auto lg:min-w-[300px] flex-shrink-0">
                <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-white text-sm sm:text-base font-medium">Total Package Cost</span>
                    <span className="text-white/90 text-xs sm:text-sm">With 5% GST included</span>
                  </div>
                  <span className="text-white text-3xl sm:text-4xl md:text-5xl font-bold whitespace-nowrap">
                    ₹{showMargin ? finalTotal.toLocaleString() : (packageSummary.totals?.grandTotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Adults: {safe(selectedLead?.adults, 0)}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Children: {safe(selectedLead?.kids, 0)}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Extra Bed: {safe(selectedLead?.extraBeds, 0)}
                  </span>
                  <span className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium whitespace-nowrap">
                    Rooms: {safe(selectedLead?.noOfRooms, 0)}
                  </span>
                </div>
                {showDiscount && activeDiscountPercentage > 0 && (
                  <div className="mt-3 px-3 py-1.5 bg-green-500/40 rounded-lg text-white text-xs font-medium">
                    {activeDiscountPercentage}% OFF Applied
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={
                packageSummary.package?.images?.[i] ||
                [
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
                ][i]
              }
              alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover"
            />
          </div>
        ))}
        </div>
      </div>

      {/* Lead Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6">
          <div className="font-bold text-xl md:text-2xl text-[#2d2d44] mb-4">Your Details</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Personal Info */}
            <div>
              <div className="font-bold text-sm md:text-base text-[#2d2d44] mb-3">Personal Information</div>
              <div className="space-y-2 text-sm md:text-base text-gray-700">
                <div>Name: {safe(selectedLead?.name)}</div>
                <div>Contact: {safe(selectedLead?.mobile)}</div>
                <div>Email: {safe(selectedLead?.email)}</div>
              </div>
          </div>
          {/* Travel Info */}
            <div>
              <div className="font-bold text-sm md:text-base text-[#2d2d44] mb-3">Travel Information</div>
              <div className="space-y-2 text-sm md:text-base text-gray-700">
                <div>Date: {selectedLead?.travelDate ? new Date(selectedLead.travelDate).toLocaleDateString() : 'N/A'}</div>
                <div>Duration: {safe(selectedLead?.nights, 0)} Nights / {safe(selectedLead?.days, 0)} Days</div>
                <div>Package: {safe(selectedLead?.packageType)}</div>
              </div>
          </div>
          {/* Guest Info */}
            <div>
              <div className="font-bold text-sm md:text-base text-[#2d2d44] mb-3">Guest Information</div>
              <div className="space-y-2 text-sm md:text-base text-gray-700">
                <div>Adults: {safe(selectedLead?.adults, 0)}</div>
                <div>Children: {safe(selectedLead?.kids, 0)}</div>
                <div>Rooms: {safe(selectedLead?.noOfRooms, 0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6">
          <div className="font-bold text-xl md:text-2xl text-[#2d2d44] mb-4">Journey Overview</div>
          <div className="flex gap-3 flex-wrap mb-6">
          {uniqueCities.map((city, idx) => (
              <div key={city || idx} className="bg-gray-100 rounded-lg px-4 py-2 border border-gray-200 font-semibold text-gray-700 text-sm md:text-base">
                {city}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Hotels */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="font-bold text-lg text-[#2d2d44] mb-3">Your Hotels</div>
              {packageSummary.hotels?.map((hotel, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">{hotel.propertyName}</div>
                  <div className="text-sm text-gray-600">
                    {hotel.basicInfo?.hotelStarRating && "★".repeat(Math.round(hotel.basicInfo.hotelStarRating))} {hotel.mealPlan}
                  </div>
              </div>
            ))}
          </div>
          {/* Transport */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="font-bold text-lg text-[#2d2d44] mb-3">Your Transport</div>
            {Array.isArray(packageSummary.transfer?.details) && packageSummary.transfer.details.length > 0 ? (
              packageSummary.transfer.details.map((cab, idx) => (
                  <div key={cab._id || idx} className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <div className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                    {cab.cabName || 'Standard Vehicle'}
                  </div>
                    <div className="text-sm text-gray-600 mb-2">
                    {cab.cabType || 'Sedan'}
                    </div>
                    <div className="flex gap-2">
                      {cab.vehicleCategory && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {cab.vehicleCategory}
                        </span>
                      )}
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {cab.cabSeatingCapacity || '4'} Seater
                      </span>
                  </div>
                </div>
              ))
            ) : (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">Standard Vehicle</div>
                  <div className="text-sm text-gray-600 mb-2">Sedan</div>
                  <div className="flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      4 Seater
                    </span>
                </div>
              </div>
            )}
          </div>
        </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Cities</div>
              <div className="font-bold text-lg text-[#2d2d44]">{uniqueCities.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Days</div>
              <div className="font-bold text-lg text-[#2d2d44]">{packageSummary.package?.itineraryDays?.length || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total Distance</div>
              <div className="font-bold text-lg text-[#2d2d44]">
                {packageSummary.package?.itineraryDays?.reduce((acc, day) => acc + (day.selectedItinerary?.distance || 0), 0)} km
          </div>
          </div>
          </div>
        </div>
      </div>

      {/* Detailed Itinerary */}
      {packageSummary.package?.itineraryDays && packageSummary.package.itineraryDays.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="font-bold text-xl md:text-2xl text-[#2d2d44] mb-6">TRIP ITINERARY</div>
          <div className="space-y-4 md:space-y-6">
            {packageSummary.package.itineraryDays.map((day, index) => {
              const dayData = day.selectedItinerary || {};
              const hotel = packageSummary.hotels?.find((h) => String(h.day) === String(day.day));
              const dayActivities = packageSummary.activities?.filter((activity) => activity.dayNumber === day.day) || [];
              const transfer = index === 0 && packageSummary.transfer?.details?.[0] ? packageSummary.transfer.details[0] : null;
              const startDate = selectedLead?.travelDate ? new Date(selectedLead.travelDate) : new Date();
              const currentDate = new Date(startDate);
              currentDate.setDate(startDate.getDate() + index);

              const formatDate = (date) => {
                return date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              };

              const formatOrdinal = (number) => {
                const n = Number(number);
                if (Number.isNaN(n)) return `${number}`;
                const remainder100 = n % 100;
                if (remainder100 >= 11 && remainder100 <= 13) {
                  return `${n}th`;
                }
                switch (n % 10) {
                  case 1:
                    return `${n}st`;
                  case 2:
                    return `${n}nd`;
                  case 3:
                    return `${n}rd`;
                  default:
                    return `${n}th`;
                }
              };

              return (
                <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  {/* Theme Color Header Section */}
                  <div className="bg-[#2d2d44] px-4 md:px-6 py-4 md:py-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                      {/* Day Number Circle */}
                      <div className="bg-white text-[#2d2d44] rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <span className="text-white text-sm md:text-base">{formatDate(currentDate)}</span>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-white text-sm md:text-base font-medium">{dayData.cityName || "Destination"}</span>
                          </div>
                        </div>
                        <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold break-words">{dayData.itineraryTitle || `Day ${index + 1}`}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 md:px-6 py-4 md:py-6 space-y-3 md:space-y-4">
                    {/* Show Transfer on Day 1 */}
                    {index === 0 && transfer && (
                      <div className="rounded-lg p-3 md:p-4 border border-blue-200">
                        <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                              <h4 className="font-semibold text-gray-900 text-sm md:text-base">Private Transfer</h4>
                            </div>
                            <p className="text-sm md:text-base text-gray-700 mb-1">
                              {transfer.cabName || "Standard Vehicle"} | {transfer.cabType || "Sedan"}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600">
                              {transfer.cabSeatingCapacity || "4"} Seater • {transfer.vehicleCategory || "Standard Category"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Itinerary Description */}
                    {dayData.itineraryDescription && (
                      <div className="space-y-2">
                        {decodeHtmlEntities(dayData.itineraryDescription)
                          .split(/\.\s+/)
                          .filter((s) => s.trim())
                          .map((sentence, idx) => (
                            <div key={idx} className="rounded-lg p-3 border border-blue-200">
                              <div className="flex items-start gap-2">
                                <span className="text-[#2d2d44] mt-1 flex-shrink-0 font-bold">•</span>
                                <span className="text-sm md:text-base text-gray-700 flex-1">{sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Places to Visit */}
                    {dayData.cityArea && dayData.cityArea.length > 0 && (
                      <div className="mt-4 md:mt-5">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-[#2d2d44] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">PLACES TO VISIT</h4>
                        </div>
                        <div className="space-y-1.5">
                          {dayData.cityArea.map((area, areaIndex) => {
                            const areaText = typeof area === "string" ? area : area.placeName || area.city || "";
                            return (
                              <div key={areaIndex} className="rounded-lg p-3 border border-blue-200">
                                <div className="flex items-start gap-2">
                                  <span className="text-[#2d2d44] mt-1 flex-shrink-0 font-bold">•</span>
                                  <span className="text-sm md:text-base text-gray-700 break-words">{decodeHtmlEntities(areaText)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Hotel Information */}
                    {hotel && (
                      <div className="mt-4 md:mt-5">
                        <div className="rounded-lg p-3 md:p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              {formatOrdinal(index + 1)} NIGHT
                            </span>
                            <span className="text-xs md:text-sm text-gray-600">at {hotel.cityName || hotel.hotelCity || dayData.cityName}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2 break-words">{hotel.propertyName}</h4>
                              {hotel.basicInfo?.hotelStarRating && (
                                <p className="text-yellow-500 text-xs md:text-sm mb-3">
                                  {"★".repeat(Math.round(hotel.basicInfo.hotelStarRating))}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                                  ROOMS: {hotel.roomName || "Standard Room"}
                                </span>
                                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                                  MEAL PLAN: {hotel.mealPlan || "Breakfast"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {dayActivities.length > 0 && (
                      <div className="mt-3 md:mt-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm md:text-base">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2-2m0 0l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Activities
                        </h4>
                        <div className="space-y-2 md:space-y-3">
                          {dayActivities.slice(0, 3).map((activity, actIndex) => (
                            <div key={actIndex} className="p-2 md:p-3 bg-gray-50 rounded border border-gray-200">
                              <h5 className="font-semibold text-gray-900 mb-1 text-xs md:text-sm">{activity.title}</h5>
                              <p className="text-xs md:text-sm text-gray-700">{decodeHtmlEntities(activity.description || "")}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inclusions Section - Styled like PlutoLink */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <InclusionsSection packageInfo={packageSummary?.package || packageSummary} decodeHtmlEntities={decodeHtmlEntities} formatInclusionExclusionText={formatInclusionExclusionText} parseHtmlContent={parseHtmlContent} />
      </div>

      {/* Exclusions Section - Styled like PlutoLink */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <ExclusionsSection packageInfo={packageSummary?.package || packageSummary} decodeHtmlEntities={decodeHtmlEntities} formatInclusionExclusionText={formatInclusionExclusionText} parseHtmlContent={parseHtmlContent} showOnlyMain={false} />
      </div>

      {/* Custom Exclusions Section - Styled like PlutoLink */}
      {(packageSummary?.package?.customExclusions && packageSummary.package.customExclusions.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <CustomExclusionsSection packageInfo={packageSummary?.package || packageSummary} decodeHtmlEntities={decodeHtmlEntities} formatInclusionExclusionText={formatInclusionExclusionText} parseHtmlContent={parseHtmlContent} />
        </div>
      )}

      {/* Cost Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-[#2d2d44] text-white rounded-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
              <div className="font-bold text-lg md:text-xl mb-2">Pay Now</div>
              <div className="text-sm text-gray-300">Pay 40% of the total amount to confirm the booking</div>
              <div className="font-bold text-lg md:text-xl mb-2">Grand Total</div>
              <div className="text-sm text-blue-100">with Margin & including 5% tax</div>
            </div>
            <div className="text-3xl md:text-4xl font-bold">
              ₹{showMargin ? totalWithTax.toFixed(2) : (packageSummary.totals?.grandTotal || 0).toFixed(0)}
            </div>
          </div>
          <div className="bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-200 p-4">
            <div className="font-semibold text-sm md:text-base mb-2">Important Payment Information</div>
            <div className="text-sm space-y-1">
              <div>• 40% advance payment required to confirm booking</div>
              <div>• Balance payment due 15 days before travel date</div>
              <div>• Prices are subject to availability and may change</div>
          </div>
        </div>
      </div>

    
      </div>

      {/* Agent Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-xl text-[#2d2d44]">
            {(packageSummary.package?.agentName || 'P')[0].toUpperCase()}
          </div>
          <div>
              <div className="text-xs text-gray-500 uppercase">Travel Expert</div>
              <div className="font-bold text-lg text-[#2d2d44]">{packageSummary.package?.agentName || 'PTW Holidays Agent'}</div>
            </div>
          </div>
          <div className="ml-16 text-sm text-gray-700 space-y-1">
            <div>Phone: {packageSummary.package?.agentPhone || '+91-8353056000'}</div>
            <div>Email: info@ptwholidays.com</div>
        </div>
          <div className="mt-4 text-xs text-gray-500 italic">
          Quotation Created on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
          <div className="absolute top-4 right-4 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold text-[#2d2d44]">
          5+ Years Experience
          </div>
        </div>
      </div>

      {/* Environmental Note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-green-50 text-green-800 rounded-lg p-4 text-center font-medium text-sm md:text-base">
        Please think twice before printing this mail. Save paper, it's good for the environment.
        </div>
      </div>

      {/* Date Change Policy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6">
          <div className="font-bold text-xl md:text-2xl text-[#2d2d44] mb-3">Date Change Policy</div>
          <div className="font-semibold text-base mb-2">Your Current Policy</div>
          <div className="text-sm md:text-base text-gray-700 mb-4">
          Non Refundable. Date Change is not allowed.
        </div>
          <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-gray-700">
          <li>These are non-refundable amounts as per the current components attached. In the case of component change/modifications, the policy will change accordingly.</li>
          <li>Date Change fees don't include any fare change in the components on the new date. Fare difference as applicable will be charged separately.</li>
          <li>Date Change will depend on the availability of the components on the new requested date.</li>
          <li>Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.</li>
          <li>Cancellation charges shown is exclusive of all taxes and taxes will be added as per applicable.</li>
        </ul>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              ACCOUNT DETAILS AND UPI ID
            </h2>
          </div>

          {/* Bank Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* SBI Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">STATE BANK OF INDIA A/C</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">38207849663</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT. LTD.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">PANTHAGHATI-SHIMLA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">SBIN0021763</span>
                </div>
              </div>
            </div>

            {/* HDFC Section */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">HDFC BANK</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">50200044011800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">MAHELI-SHIMLA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">HDFC0003612</span>
                </div>
              </div>
            </div>

            {/* ICICI Section */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">ICICI BANK</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">36680550120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">KASUMPATI-SHIMLA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">ICIC0003368</span>
                </div>
              </div>
            </div>

            {/* Bank of Baroda Section */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-3">BANK OF BARODA</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C No:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">54140200000060</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">A/C Name:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">PTW HOLIDAYS PVT LTD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">Branch:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">BCS-SHIMLA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs md:text-sm font-medium">IFSC Code:</span>
                  <span className="text-gray-900 text-xs md:text-sm font-semibold">BARB0NEWSIM</span>
                </div>
          </div>
        </div>
          </div>

          {/* UPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2">GOOGLE PAY @ PHONE PAY</h3>
              <p className="text-gray-900 text-base md:text-lg font-semibold">80917-53823</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200 shadow-md">
              <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2">UPI ID</h3>
              <div className="space-y-1">
                <p className="text-gray-900 text-sm md:text-base font-semibold">UpId: mdplutotours-2@okhdfcbank</p>
                <p className="text-gray-900 text-sm md:text-base font-semibold">UpId: 981666196@sbi</p>
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#2d2d44] text-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-5">
          <div className="bg-[#2d2d44] rounded-lg p-2 sm:p-3">
            {/* Company Logo and Name Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2 pb-2 border-b border-white/10">
              <img
                src="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749122411/PTW_Holidays_Logo_1_mgi4uu.png"
                alt="PTW Holidays Logo"
                className="w-32 h-32 sm:w-36 sm:h-40 object-contain"
              />
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  PTW Holidays Pvt. Ltd.
                </h3>
                <p className="text-gray-300 text-xs">Your Trusted Travel Partner</p>
              </div>
            </div>

            {/* Contact Information - Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              {/* Address */}
              <div className="text-center sm:text-left">
                <p className="text-white text-xs leading-snug">
                  Dari, Dharamshala, Himachal Pradesh 176057
                </p>
              </div>

              {/* Phone */}
              <div className="text-center sm:text-left">
                <p className="text-white text-xs font-medium">+91-8353056000</p>
              </div>

              {/* Website */}
              <div className="text-center sm:text-left">
                <p className="text-white text-xs font-medium">www.ptwholidays.com</p>
              </div>
            </div>

            {/* Social Media Links and Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex justify-center gap-2">
                <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors duration-200 cursor-pointer">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">
                © {new Date().getFullYear()} PTW Holidays. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuotePreviewDetails; 