import React, { useEffect, useState, useCallback } from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import { getStateImages, stateImages } from "./images";
import { Icons } from "./newFile";

// Helper functions
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

// Parse exclusions with sections (like PAYMENT PROCEDURE, CANCELLATION POLICY, etc.)
const parseExclusionsWithSections = (htmlString) => {
  if (!htmlString) return [];
  
  const sections = [];
  
  // Extract all paragraphs
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gs;
  const paragraphs = [...htmlString.matchAll(paragraphRegex)];
  
  if (paragraphs.length === 0) {
    // If no paragraphs, decode and split by newlines
    const decoded = decodeHtmlEntities(htmlString);
    const items = decoded.split(/\n+/).filter(item => item.trim().length > 0);
    return items.map(item => ({ title: null, content: [item.trim()] }));
  }
  
  let currentSection = null;
  let regularItems = [];
  
  paragraphs.forEach((match) => {
    const paragraphHtml = match[1];
    const decodedText = decodeHtmlEntities(paragraphHtml);
    const trimmedText = decodedText.trim();
    
    if (!trimmedText || trimmedText === '<br>') return;
    
    // Check if this paragraph contains a section header
    // Pattern: "• SECTION NAME:" anywhere in the text
    const sectionHeaderMatch = trimmedText.match(/•\s*([A-Z\s&]+):\s*/);
    
    if (sectionHeaderMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Extract section name
      const sectionName = sectionHeaderMatch[1].trim();
      
      // Extract content after the section name (if any)
      const contentAfterHeader = trimmedText.substring(sectionHeaderMatch[0].length).trim();
      
      // Start new section
      currentSection = {
        title: sectionName,
        content: []
      };
      
      // If there's content after the header in the same paragraph, add it
      if (contentAfterHeader) {
        currentSection.content.push(contentAfterHeader);
      }
    } else if (currentSection) {
      // Add content to current section (skip empty paragraphs and <br> tags)
      if (trimmedText && trimmedText !== '<br>') {
        currentSection.content.push(trimmedText);
      }
    } else {
      // Regular item without section (collect them first)
      if (trimmedText && trimmedText !== '<br>') {
        regularItems.push(trimmedText);
      }
    }
  });
  
  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // If we have sections, return them
  if (sections.length > 0) {
    // Add any regular items before sections as a separate section
    if (regularItems.length > 0) {
      return [
        { title: null, content: regularItems },
        ...sections
      ];
    }
    return sections;
  }
  
  // If no sections found, return as simple list
  const allItems = paragraphs
    .map(match => decodeHtmlEntities(match[1]).trim())
    .filter(item => item.length > 0 && item !== '<br>');
  
  return allItems.map(item => ({ title: null, content: [item] }));
};

const parseDuration = (duration) => {
  if (!duration) return { days: "6", nights: "5" };
  
  const durationStr = String(duration).trim();
  
  const pattern1 = durationStr.match(/(\d+)\s*N\s*[\/|]\s*(\d+)\s*D/i);
  if (pattern1) {
    return { nights: pattern1[1], days: pattern1[2] };
  }
  
  const pattern2 = durationStr.match(/(\d+)\s*D\s*[\/|]\s*(\d+)\s*N/i);
  if (pattern2) {
    return { days: pattern2[1], nights: pattern2[2] };
  }
  
  const pattern3 = durationStr.match(/(\d+)\s*N.*?(\d+)\s*D/i);
  if (pattern3) {
    return { nights: pattern3[1], days: pattern3[2] };
  }
  
  const pattern4 = durationStr.match(/(\d+)\s*D.*?(\d+)\s*N/i);
  if (pattern4) {
    return { days: pattern4[1], nights: pattern4[2] };
  }
  
  const numbers = durationStr.match(/\d+/g);
  if (numbers && numbers.length >= 2) {
    return { nights: numbers[0], days: numbers[1] };
  }
  
  return { days: "6", nights: "5" };
};

// Helper function to get hotel image URL
const getHotelImageUrl = (hotel) => {
  if (!hotel) return null;
  if (Array.isArray(hotel.propertyphoto) && hotel.propertyphoto.length > 0) {
    return hotel.propertyphoto[0];
  }
  if (typeof hotel.propertyphoto === "string" && hotel.propertyphoto.trim()) {
    return hotel.propertyphoto;
  }
  if (hotel.roomimage) {
    return hotel.roomimage;
  }
  return null;
};

// Convert array buffer to base64
const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof globalThis !== "undefined") {
    if (typeof globalThis.btoa === "function") {
      return globalThis.btoa(binary);
    }
    if (typeof globalThis.Buffer !== "undefined") {
      return globalThis.Buffer.from(bytes).toString("base64");
    }
    if (typeof globalThis.window !== "undefined") {
      const base64Chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let result = "";
      let i = 0;
      while (i < binary.length) {
        const chr1 = binary.charCodeAt(i++);
        const chr2 = binary.charCodeAt(i++);
        const chr3 = binary.charCodeAt(i++);
        const enc1 = chr1 >> 2;
        const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        let enc4 = chr3 & 63;
        if (Number.isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (Number.isNaN(chr3)) {
          enc4 = 64;
        }
        result +=
          base64Chars.charAt(enc1) +
          base64Chars.charAt(enc2) +
          base64Chars.charAt(enc3) +
          base64Chars.charAt(enc4);
      }
      return result;
    }
  }

  throw new Error("Base64 encoding is not supported in this environment.");
};

// Fetch image as data URI with CORS proxy
const fetchImageAsDataUri = async (imageUrl) => {
  if (!imageUrl) return null;

  const sanitizedUrl = imageUrl.replace(/^https?:\/\//, "");
  const weservBase = `https://images.weserv.nl/?url=${encodeURIComponent(
    `ssl:${sanitizedUrl}`
  )}`;
  const attempts = [
    {
      url: `${weservBase}&output=jpg`,
      label: "weserv-jpg",
    },
    {
      url: `${weservBase}&n=-1`,
      label: "weserv-raw",
    },
    {
      url: `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
      label: "allorigins",
    },
    {
      url: `https://cors.isomorphic-git.org/${imageUrl}`,
      label: "isomorphic-git",
    },
  ];

  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {
        mode: "cors",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Failed to load image (${attempt.label}) ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      const contentType =
        response.headers.get("content-type") || "image/jpeg";
      const base64 = arrayBufferToBase64(buffer);
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.warn("Image fetch attempt failed", {
        source: imageUrl,
        via: attempt.label,
        error,
      });
    }
  }

  throw new Error("All image fetch attempts failed");
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#2d2d44",
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  companyEmail: {
    fontSize: 12,
    color: "#E2E8F0",
  },
  logo: {
    width: 80,
    height: 30,
  },
  heroSection: {
    backgroundColor: "#2d2d44",
    padding: 30,
    marginBottom: 20,
    borderRadius: 8,
    minHeight: 200,
  },
  personalizedText: {
    fontSize: 20,
    color: "#FCD34D",
    fontStyle: "italic",
    marginBottom: 8,
  },
  packageName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  durationBox: {
    borderWidth: 2,
    borderColor: "#FCD34D",
    padding: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  durationText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  costBox: {
    backgroundColor: "rgba(20, 184, 166, 0.3)",
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(20, 184, 166, 0.5)",
    marginTop: 20,
  },
  costLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  costAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  costSubtext: {
    fontSize: 12,
    color: "#E2E8F0",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d2d44",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "30%",
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "medium",
  },
  journeyOverview: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  citiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  cityTag: {
    backgroundColor: "#E2E8F0",
    padding: 6,
    borderRadius: 4,
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "600",
  },
  hotelsTransportRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  hotelsBox: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 6,
  },
  transportBox: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 6,
  },
  boxTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d2d44",
    marginBottom: 8,
  },
  hotelItem: {
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  hotelName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  hotelDetails: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d2d44",
  },
  inclusionsSection: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  exclusionsSection: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 11,
    color: "#1E293B",
  },
  bullet: {
    marginRight: 8,
    fontSize: 12,
  },
  costSection: {
    backgroundColor: "#2d2d44",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  costSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  costSectionSubtitle: {
    fontSize: 12,
    color: "#E2E8F0",
    marginBottom: 12,
  },
  costAmountLarge: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  paymentInfo: {
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  paymentInfoTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#92400E",
    marginBottom: 6,
  },
  paymentInfoText: {
    fontSize: 11,
    color: "#92400E",
    lineHeight: 1.5,
  },
  grandTotalSection: {
    backgroundColor: "#3B82F6",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  agentSection: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    position: "relative",
  },
  agentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#BFDBFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  agentAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d2d44",
  },
  agentInfo: {
    flex: 1,
  },
  agentLabel: {
    fontSize: 10,
    color: "#64748B",
    marginBottom: 2,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d2d44",
  },
  agentContact: {
    fontSize: 11,
    color: "#475569",
    marginTop: 4,
  },
  experienceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  experienceBadgeText: {
    fontSize: 11,
    color: "#2d2d44",
    fontWeight: "bold",
  },
  environmentalNote: {
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
  },
  environmentalText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "500",
  },
  policySection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  policyText: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 8,
  },
  accountSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  accountTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
    textAlign: "center",
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  bankCard: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bankName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d2d44",
    marginBottom: 8,
  },
  bankDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  bankLabel: {
    fontSize: 10,
    color: "#64748B",
  },
  bankValue: {
    fontSize: 10,
    color: "#1E293B",
    fontWeight: "medium",
  },
  upiSection: {
    flexDirection: "row",
  },
  upiCard: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  upiTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 6,
  },
  upiValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "medium",
  },
  footer: {
    backgroundColor: "#2d2d44",
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  footerItem: {
    fontSize: 10,
    color: "#E2E8F0",
  },
  footerCopyright: {
    fontSize: 9,
    color: "#CBD5E1",
    textAlign: "center",
    marginTop: 8,
  },
  imageGallery: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  galleryImage: {
    flex: 1,
    height: 120,
    borderRadius: 4,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    color: "#2d2d44",
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});

const QuotePreviewPDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "PTW Holidays",
  selectedLead,
  showDiscount,
  discountAmount,
  activeDiscountPercentage,
  cabImages = [],
  pdfStyle = "pluto", // "pluto" or "demand"
}) => {
  const [destinationImages, setDestinationImages] = useState([]);
  const [hotelImageCache, setHotelImageCache] = useState({});
  const [cabImageCache, setCabImageCache] = useState({});

  const taxAmount = finalTotal * 0.05;
  const totalWithTax = finalTotal + taxAmount;

  // Theme colors based on pdfStyle
  const theme = pdfStyle === "demand" ? {
    primary: "#EA580C",      // Orange-600
    secondary: "#FFA500",    // Orange-500
    accent: "#FFD700",       // Gold
    light: "#FFF7ED",        // Orange-50
    dark: "#C2410C",         // Orange-700
    headerBg: "#2d2d44",     // Dark for header
    textPrimary: "#1E293B",
    textSecondary: "#475569",
    border: "#FFA500",
    badgeBg: "#FFF7ED",
    success: "#EA580C",
  } : {
    primary: "#2d2d44",      // Dark blue
    secondary: "#3B82F6",    // Blue-500
    accent: "#60A5FA",       // Blue-400
    light: "#F1F5F9",        // Slate-100
    dark: "#1E293B",         // Slate-800
    headerBg: "#2d2d44",
    textPrimary: "#1E293B",
    textSecondary: "#475569",
    border: "#E2E8F0",
    badgeBg: "#EFF6FF",
    success: "#2d2d44",
  };

  // Conditional Header Component
  const PDFHeader = () => {
    if (pdfStyle === "demand") {
      return (
        <View
          style={{
            backgroundColor: theme.headerBg,
            padding: 20,
            marginTop: 10,
            borderRadius: 12,
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
            borderWidth: 2,
            borderColor: pdfStyle === "demand" ? theme.secondary : theme.primary,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 120,
              height: 120,
              backgroundColor: pdfStyle === "demand" ? `rgba(${theme.secondary.replace('#', '')}, 0.1)` : "rgba(255, 255, 255, 0.05)",
              borderRadius: 60,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 80,
              height: 80,
              backgroundColor: pdfStyle === "demand" ? `rgba(${theme.accent.replace('#', '')}, 0.15)` : "rgba(255, 255, 255, 0.03)",
              borderRadius: 40,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Image
                  style={{ width: 35, height: 35, objectFit: "contain" }}
                  source={{
                    uri: "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1747808971/cropped-Black-Modern-Business-Logo2-96x26-1_fmui6p.png",
                    method: "GET",
                    headers: { "Cache-Control": "no-cache" },
                  }}
                  cache={false}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    marginBottom: 2,
                  }}
                >
                  Demandsetu
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "500",
                  }}
                >
                  Tour & Travel
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 14, height: 14 }}>
                  <Icons.Email width={14} height={14} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#FFFFFF",
                    fontWeight: "500",
                  }}
                >
                  info@demandsetu.com
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 14, height: 14 }}>
                  <Icons.Phone width={14} height={14} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#FFFFFF",
                    fontWeight: "500",
                  }}
                >
                  +91 82788 25471
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
    
    // Pluto Header (default)
    return (
      <View
        style={{
          padding: 20,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
          backgroundColor: theme.headerBg,
          borderWidth: 2,
          borderColor: theme.primary,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            backgroundColor: theme.primary,
            borderRadius: 100,
            opacity: 0.3,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: 75,
            opacity: 0.2,
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 50,
                height: 50,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <Image
                style={{
                  width: 35,
                  height: 35,
                  objectFit: "contain",
                }}
                source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749216057/jhjhgjhgjg_i8ti9h.png"
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  marginBottom: 2,
                }}
              >
                PTW Holidays Pvt. Ltd.
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "rgba(255, 255, 255, 0.8)",
                  fontWeight: "500",
                }}
              >
                Your Trusted Travel Partner
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backdropFilter: "blur(10px)",
              }}
            >
              <View style={{ width: 12, height: 12 }}>
                <Icons.Email width={12} height={12} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#FFFFFF",
                  fontWeight: "500",
                }}
              >
                info@ptwholidays.com
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backdropFilter: "blur(10px)",
              }}
            >
              <View style={{ width: 12, height: 12 }}>
                <Icons.Phone width={12} height={12} color="#FFFFFF" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#FFFFFF",
                  fontWeight: "500",
                }}
              >
                +91-8353056000
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Conditional Footer Component
  const PDFFooter = () => {
    if (pdfStyle === "demand") {
      return (
        <View
          style={{
            backgroundColor: "#2d2d44",
            padding: 16,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Image
                  style={{ width: 20, height: 20, objectFit: "contain" }}
                  source={{
                    uri: "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1747808971/cropped-Black-Modern-Business-Logo2-96x26-1_fmui6p.png",
                    method: "GET",
                    headers: { "Cache-Control": "no-cache" },
                  }}
                  cache={false}
                />
              </View>
              <View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  Demandsetu
                </Text>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: 10,
                    fontWeight: "500",
                  }}
                >
                  Tour & Travel
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1, gap: 6 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 12, height: 12 }}>
                  <Icons.Phone width={12} height={12} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 9,
                    fontWeight: "500",
                  }}
                >
                  +91 82788 25471
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 12, height: 12 }}>
                  <Icons.Email width={12} height={12} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 9,
                    fontWeight: "500",
                  }}
                >
                  info@demandsetu.com
                </Text>
              </View>
            </View>
          </View>
          <Text
            style={{
              color: "#CBD5E1",
              fontSize: 7,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            © {new Date().getFullYear()} Demandsetu. All rights reserved.
          </Text>
        </View>
      );
    }
    
    // Pluto Footer (default)
    return (
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: "rgb(45 45 68)",
          borderRadius: 16,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 15,
            borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
            paddingBottom: 15,
          }}
        >
          <Image
            style={{
              width: 80,
              height: 100,
              marginRight: 12,
            }}
            source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1749122411/PTW_Holidays_Logo_1_mgi4uu.png"
          />
          <View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: "bold",
                fontFamily: "Helvetica-Bold",
              }}
            >
              PTW Holidays Pvt. Ltd.
            </Text>
            <Text
              style={{
                color: "#E2E8F0",
                fontSize: 10,
                marginTop: 4,
              }}
            >
              Your Trusted Travel Partner
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 15,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={{ width: 16, height: 16, marginRight: 8 }}>
              <Icons.Location width={16} height={16} color="#FFFFFF" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 9,
              }}
            >
              Sheryl Villa 2nd Floor, near Taste buds restaurant, Panthaghati,
              Shimla, Himachal Pradesh 171009
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <View style={{ width: 16, height: 16, marginRight: 8 }}>
              <Icons.Phone width={16} height={16} color="#FFFFFF" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 9,
              }}
            >
              +91-8353056000
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <View style={{ width: 16, height: 16, marginRight: 8 }}>
              <Icons.Globe width={16} height={16} color="#FFFFFF" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 9,
              }}
            >
              www.ptwholidays.com
            </Text>
          </View>
        </View>
        <Text
          style={{
            color: "#CBD5E1",
            fontSize: 7,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          © {new Date().getFullYear()} PTW Holidays. All rights reserved.
        </Text>
      </View>
    );
  };

  // Conditional Account Details Component
  const PDFAccountDetails = () => {
    if (pdfStyle === "demand") {
      return (
        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
            padding: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderWidth: 3,
            borderColor: "#FFA500",
            overflow: "hidden",
            shadowColor: "#EA580C",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#EA580C",
              padding: 18,
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                }}
              >
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                  }}
                >
                  ₹
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}
                >
                  ACCOUNT DETAILS
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  Payment Information
                </Text>
              </View>
            </View>
          </View>

          {/* Bank Cards Grid */}
          <View
            style={{
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* PNB Bank Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 3,
                borderColor: "#FFA500",
                borderLeftWidth: 6,
                borderLeftColor: "#EA580C",
                padding: 18,
                marginBottom: 12,
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Corner */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  backgroundColor: "#FFF7ED",
                  borderBottomLeftRadius: 80,
                }}
              />
              
              {/* Bank Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#EA580C",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    PNB
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#EA580C",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Punjab National Bank
                </Text>
              </View>

              {/* Bank Details */}
              <View style={{ gap: 12, position: "relative", zIndex: 2 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C No:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                      letterSpacing: 1,
                    }}
                  >
                    0894002100008473
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C Name:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    DEMAND SETU
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Account Type:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Current
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#EA580C",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    IFSC Code:
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      letterSpacing: 1.5,
                    }}
                  >
                    PUNB0089400
                  </Text>
                </View>
              </View>
            </View>

            {/* HDFC Bank Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 3,
                borderColor: "#FFA500",
                borderLeftWidth: 6,
                borderLeftColor: "#EA580C",
                padding: 18,
                marginBottom: 12,
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Corner */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  backgroundColor: "#FFF7ED",
                  borderBottomLeftRadius: 80,
                }}
              />
              
              {/* Bank Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#EA580C",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    HDFC
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#EA580C",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  HDFC Bank
                </Text>
              </View>

              {/* Bank Details */}
              <View style={{ gap: 12, position: "relative", zIndex: 2 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C No:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                      letterSpacing: 1,
                    }}
                  >
                    50200092959140
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C Name:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    DEMAND SETU
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Account Type:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Current
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#EA580C",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    IFSC Code:
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      letterSpacing: 1.5,
                    }}
                  >
                    HDFC0004116
                  </Text>
                </View>
              </View>
            </View>

            {/* Axis Bank Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 3,
                borderColor: "#FFA500",
                borderLeftWidth: 6,
                borderLeftColor: "#EA580C",
                padding: 18,
                marginBottom: 12,
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Corner */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 80,
                  height: 80,
                  backgroundColor: "#FFF7ED",
                  borderBottomLeftRadius: 80,
                }}
              />
              
              {/* Bank Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "#EA580C",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    AXIS
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#EA580C",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Axis Bank
                </Text>
              </View>

              {/* Bank Details */}
              <View style={{ gap: 12, position: "relative", zIndex: 2 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C No:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                      letterSpacing: 1,
                    }}
                  >
                    920020015004799
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    A/C Name:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    DEMAND SETU
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Account Type:
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Current
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: "#EA580C",
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    IFSC Code:
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      letterSpacing: 1.5,
                    }}
                  >
                    UTIB0003277
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }
    
    // Pluto Account Details (default)
    return (
      <View style={styles.accountSection}>
        <Text style={styles.accountTitle}>ACCOUNT DETAILS AND UPI ID</Text>
        <View style={styles.bankGrid}>
          <View style={[styles.bankCard, { marginRight: 8, marginBottom: 8 }]}>
            <Text style={styles.bankName}>STATE BANK OF INDIA A/C</Text>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C No:</Text>
              <Text style={styles.bankValue}>38207849663</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C Name:</Text>
              <Text style={styles.bankValue}>PTW HOLIDAYS PVT. LTD.</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>PANTHAGHATI-SHIMLA</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>IFSC Code:</Text>
              <Text style={styles.bankValue}>SBIN0021763</Text>
            </View>
          </View>
          <View style={[styles.bankCard, { marginRight: 8, marginBottom: 8 }]}>
            <Text style={styles.bankName}>HDFC BANK</Text>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C No:</Text>
              <Text style={styles.bankValue}>50200044011800</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C Name:</Text>
              <Text style={styles.bankValue}>PTW HOLIDAYS PVT LTD</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>MAHELI-SHIMLA</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>IFSC Code:</Text>
              <Text style={styles.bankValue}>HDFC0003612</Text>
            </View>
          </View>
          <View style={[styles.bankCard, { marginRight: 8, marginBottom: 8 }]}>
            <Text style={styles.bankName}>ICICI BANK</Text>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C No:</Text>
              <Text style={styles.bankValue}>36680550120</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C Name:</Text>
              <Text style={styles.bankValue}>PTW HOLIDAYS PVT LTD</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>KASUMPATI-SHIMLA</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>IFSC Code:</Text>
              <Text style={styles.bankValue}>ICIC0003368</Text>
            </View>
          </View>
          <View style={[styles.bankCard, { marginRight: 8, marginBottom: 8 }]}>
            <Text style={styles.bankName}>BANK OF BARODA</Text>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C No:</Text>
              <Text style={styles.bankValue}>54140200000060</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>A/C Name:</Text>
              <Text style={styles.bankValue}>PTW HOLIDAYS PVT LTD</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Branch:</Text>
              <Text style={styles.bankValue}>BCS-SHIMLA</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>IFSC Code:</Text>
              <Text style={styles.bankValue}>BARB0NEWSIM</Text>
            </View>
          </View>
        </View>
        <View style={styles.upiSection}>
          <View style={[styles.upiCard, { marginRight: 8 }]}>
            <Text style={styles.upiTitle}>GOOGLE PAY @ PHONE PAY</Text>
            <Text style={styles.upiValue}>80917-53823</Text>
          </View>
          <View style={styles.upiCard}>
            <Text style={styles.upiTitle}>UPI ID</Text>
            <Text style={styles.upiValue}>mdplutotours-2@okhdfcbank</Text>
            <Text style={styles.upiValue}>981666196@sbi</Text>
          </View>
        </View>
      </View>
    );
  };
  
  const uniqueCities = Array.from(
    new Set(
      packageSummary.package?.itineraryDays?.map((day) => day.selectedItinerary?.cityName).filter(Boolean)
    )
  );

  const durationInfo = parseDuration(packageSummary.package?.duration);

  // Helper function to find cab image by matching cabName or cabType
  const findCabImage = useCallback((cabName, cabType) => {
    if (!cabImages || !Array.isArray(cabImages) || cabImages.length === 0) {
      return null;
    }

    const normalizedCabName = (cabName || "").toLowerCase().trim();
    const normalizedCabType = (cabType || "").toLowerCase().trim();

    // First, try to match by cabName (case-insensitive, partial matching)
    if (normalizedCabName) {
      const nameMatch = cabImages.find((cab) => {
        const normalizedImageCabName = (cab.cabName || "").toLowerCase().trim();
        
        // Exact match
        if (normalizedImageCabName === normalizedCabName) {
          return true;
        }
        
        // Partial match - check if history cabName is contained in image cabName or vice versa
        if (normalizedImageCabName.includes(normalizedCabName) || 
            normalizedCabName.includes(normalizedImageCabName)) {
          return true;
        }
        
        // Word-by-word matching (e.g., "Innova Crysta" matches "Crysta" or "Innova")
        const historyWords = normalizedCabName.split(/\s+/);
        const imageWords = normalizedImageCabName.split(/\s+/);
        
        // Check if any word from history matches any word from image
        return historyWords.some(word => 
          word.length > 2 && imageWords.some(imgWord => 
            imgWord.includes(word) || word.includes(imgWord)
          )
        );
      });

      if (nameMatch && nameMatch.cabImages && nameMatch.cabImages.length > 0) {
        return nameMatch.cabImages[0];
      }
    }

    // If no name match, try to match by cabType (case-insensitive)
    if (normalizedCabType) {
      const typeMatch = cabImages.find((cab) => {
        const normalizedImageCabType = (cab.cabType || "").toLowerCase().trim();
        return normalizedImageCabType === normalizedCabType;
      });

      if (typeMatch && typeMatch.cabImages && typeMatch.cabImages.length > 0) {
        return typeMatch.cabImages[0];
      }
    }

    return null;
  }, [cabImages]);

  // Helper function to find matching state from package state
  const findMatchingState = (packageState) => {
    if (!packageState) return null;
    const lowerPackageState = packageState.toLowerCase();
    
    // Check each state name to see if it matches
    for (const stateName of Object.keys(stateImages)) {
      const lowerStateName = stateName.toLowerCase();
      
      // Check if state name matches exactly or is contained in package state
      if (lowerPackageState === lowerStateName || lowerPackageState.includes(lowerStateName)) {
        return stateName;
      }
    }
    
    return null;
  };

  // Get destination images based on state
  useEffect(() => {
    const getDestinationImages = () => {
      try {
        const packageState = packageSummary.package?.state || "";
        const stateName = findMatchingState(packageState);
        
        if (stateName) {
          const images = getStateImages(stateName);
          setDestinationImages(images);
        } else {
          // Fallback to default images
          setDestinationImages([
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
          ]);
        }
      } catch (error) {
        console.error("Error getting images:", error);
        setDestinationImages([
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
        ]);
      }
    };

    getDestinationImages();
  }, [packageSummary.package?.state]);

  // Preload hotel images
  useEffect(() => {
    const preloadHotelImages = async () => {
      if (!packageSummary?.hotels) {
        setHotelImageCache({});
        return;
      }

      const cacheEntries = await Promise.all(
        packageSummary.hotels.map(async (hotel, index) => {
          const imageUrl = getHotelImageUrl(hotel);
          if (!imageUrl) return [index, null];
          try {
            const dataUri = await fetchImageAsDataUri(imageUrl);
            return [index, dataUri];
          } catch (error) {
            console.error("Failed to cache hotel image", {
              propertyName: hotel?.propertyName,
              imageUrl,
              error,
            });
            return [index, null];
          }
        })
      );

      const newCache = {};
      cacheEntries.forEach(([index, dataUri]) => {
        newCache[index] = dataUri;
      });
      setHotelImageCache(newCache);
    };

    preloadHotelImages();
  }, [packageSummary?.hotels]);

  // Preload cab images
  useEffect(() => {
    const preloadCabImages = async () => {
      if (!packageSummary?.transfer?.details || !Array.isArray(packageSummary.transfer.details)) {
        setCabImageCache({});
        return;
      }

      const cacheEntries = await Promise.all(
        packageSummary.transfer.details.map(async (cab, index) => {
          const imageUrl = findCabImage(cab?.cabName, cab?.cabType);
          if (!imageUrl) return [index, null];
          try {
            const dataUri = await fetchImageAsDataUri(imageUrl);
            return [index, dataUri];
          } catch (error) {
            console.error("Failed to cache cab image", {
              cabName: cab?.cabName,
              cabType: cab?.cabType,
              imageUrl,
              error,
            });
            return [index, null];
          }
        })
      );

      const newCache = {};
      cacheEntries.forEach(([index, dataUri]) => {
        newCache[index] = dataUri;
      });
      setCabImageCache(newCache);
    };

    preloadCabImages();
  }, [packageSummary?.transfer?.details, findCabImage]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PDFHeader />

        {/* Hero Section with Theme */}
        <View
          style={{
            backgroundColor: theme.headerBg,
            padding: 30,
            marginBottom: 20,
            borderRadius: 12,
            minHeight: 200,
            position: "relative",
            overflow: "hidden",
            borderWidth: 2,
            borderColor: pdfStyle === "demand" ? theme.secondary : theme.primary,
          }}
        >
          {/* Decorative Background Elements */}
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              backgroundColor: pdfStyle === "demand" ? theme.secondary : theme.primary,
              borderRadius: 100,
              opacity: 0.2,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              backgroundColor: pdfStyle === "demand" ? theme.accent : "rgba(255, 255, 255, 0.05)",
              borderRadius: 75,
              opacity: 0.15,
            }}
          />

          <View style={{ position: "relative", zIndex: 2 }}>
            <Text
              style={{
                fontSize: 20,
                color: pdfStyle === "demand" ? theme.accent : "#FCD34D",
                fontStyle: "italic",
                marginBottom: 8,
                fontWeight: "600",
              }}
            >
              {safe(selectedLead?.name, "Valued Customer")}'s trip to
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {safe(packageSummary.package?.packageName, "EXCLUSIVE TRAVEL PACKAGE")}
            </Text>
            <View
              style={{
                borderWidth: 2,
                borderColor: pdfStyle === "demand" ? theme.secondary : "#FCD34D",
                padding: 10,
                marginBottom: 12,
                alignSelf: "flex-start",
                backgroundColor: pdfStyle === "demand" ? "rgba(255, 165, 0, 0.1)" : "rgba(252, 211, 77, 0.1)",
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
              >
                {durationInfo.days} Days | {durationInfo.nights} Nights
              </Text>
            </View>
            <View
              style={{
                backgroundColor: pdfStyle === "demand" ? "rgba(234, 88, 12, 0.3)" : "rgba(20, 184, 166, 0.3)",
                padding: 20,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: pdfStyle === "demand" ? theme.secondary : "rgba(20, 184, 166, 0.5)",
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#FFFFFF",
                  marginBottom: 6,
                  fontWeight: "600",
                }}
              >
                Total Package Cost
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  marginBottom: 4,
                }}
              >
                ₹{showMargin ? finalTotal.toFixed(0) : (packageSummary.totals?.grandTotal || 0).toFixed(0)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: 8,
                }}
              >
                With 5% GST included
              </Text>
              {activeDiscountPercentage > 0 && (
                <View
                  style={{
                    backgroundColor: pdfStyle === "demand" ? theme.secondary : "rgba(34, 197, 94, 0.3)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    }}
                  >
                    {activeDiscountPercentage}% OFF Applied
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 8 }}>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "500",
                    }}
                  >
                    Adults: {safe(selectedLead?.adults, 0)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "500",
                    }}
                  >
                    Children: {safe(selectedLead?.kids, 0)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#FFFFFF",
                      fontWeight: "500",
                    }}
                  >
                    Rooms: {safe(selectedLead?.noOfRooms, 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Image Gallery - Use state-based destination images */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 20,
            gap: 8,
          }}
        >
          {(destinationImages.length > 0 ? destinationImages : [
            packageSummary.package?.images?.[0] || "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
            packageSummary.package?.images?.[1] || "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
            packageSummary.package?.images?.[2] || "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
          ]).slice(0, 3).map((imageUrl, i) => (
            <Image
              key={i}
              style={{
                flex: 1,
                height: 150,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: theme.border,
              }}
              src={imageUrl}
            />
          ))}
        </View>

        {/* Lead Details */}
        <View
          style={{
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.border,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <View
            style={{
              backgroundColor: theme.headerBg,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              borderLeftWidth: 6,
              borderLeftColor: theme.primary,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Details
            </Text>
          </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <View
              style={{
                flex: 1,
                minWidth: "30%",
                backgroundColor: theme.light,
                padding: 16,
                borderRadius: 10,
                marginRight: 12,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: theme.border,
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: theme.primary,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Personal Information
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Name: {safe(selectedLead?.name)}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Contact: {safe(selectedLead?.mobile)}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary }}>
                Email: {safe(selectedLead?.email)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                minWidth: "30%",
                backgroundColor: theme.light,
                padding: 16,
                borderRadius: 10,
                marginRight: 12,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: theme.border,
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: theme.primary,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Travel Information
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Date: {selectedLead?.travelDate ? new Date(selectedLead.travelDate).toLocaleDateString() : 'N/A'}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Duration: {safe(selectedLead?.nights, 0)} Nights / {safe(selectedLead?.days, 0)} Days
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary }}>
                Package: {safe(selectedLead?.packageType)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                minWidth: "30%",
                backgroundColor: theme.light,
                padding: 16,
                borderRadius: 10,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: theme.border,
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: theme.primary,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Guest Information
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Adults: {safe(selectedLead?.adults, 0)}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary, marginBottom: 6 }}>
                Children: {safe(selectedLead?.kids, 0)}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textPrimary }}>
                Rooms: {safe(selectedLead?.noOfRooms, 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Journey Overview */}
        <View
          style={{
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.border,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <View
            style={{
              backgroundColor: theme.headerBg,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              borderLeftWidth: 6,
              borderLeftColor: theme.primary,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Journey Overview
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
            {uniqueCities.map((city, idx) => (
              <View
                key={city || idx}
                style={{
                  backgroundColor: theme.light,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: theme.primary,
                  }}
                >
                  {city}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.light,
                padding: 16,
                borderRadius: 10,
                marginRight: 8,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.headerBg,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Your Hotels
                </Text>
              </View>
              {packageSummary.hotels?.map((hotel, idx) => {
                const cachedImage = hotelImageCache[idx];
                return (
                  <View key={idx} style={[styles.hotelItem, { flexDirection: "row" }]}>
                    {cachedImage && (
                      <Image
                        src={cachedImage}
                        style={{ width: 50, height: 35, marginRight: 8, borderRadius: 4 }}
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "bold",
                          color: theme.primary,
                          marginBottom: 4,
                        }}
                      >
                        {hotel.propertyName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.textSecondary,
                        }}
                      >
                        {hotel.basicInfo?.hotelStarRating && "★".repeat(Math.round(hotel.basicInfo.hotelStarRating))} {hotel.mealPlan}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: theme.light,
                padding: 16,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.headerBg,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Your Transport
                </Text>
              </View>
              {Array.isArray(packageSummary.transfer?.details) && packageSummary.transfer.details.length > 0 ? (
                packageSummary.transfer.details.map((cab, idx) => {
                  const cachedCabImage = cabImageCache[idx];
                  return (
                    <View key={cab._id || idx} style={[styles.hotelItem, { flexDirection: "row" }]}>
                      {cachedCabImage && (
                        <Image
                          src={cachedCabImage}
                          style={{ width: 50, height: 35, marginRight: 8, borderRadius: 4 }}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "bold",
                            color: theme.primary,
                            marginBottom: 4,
                          }}
                        >
                          {cab.cabName || 'Standard Vehicle'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.textSecondary,
                          }}
                        >
                          {cab.cabType || 'Sedan'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: theme.textSecondary,
                          }}
                        >
                          {cab.vehicleCategory || ''} • {cab.cabSeatingCapacity || '4'} Seater
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View
                  style={{
                    padding: 12,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "bold",
                      color: theme.primary,
                      marginBottom: 4,
                    }}
                  >
                    Standard Vehicle
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.textSecondary,
                    }}
                  >
                    Sedan • 4 Seater
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: 16,
              borderTopWidth: 2,
              borderTopColor: theme.border,
              marginTop: 16,
            }}
          >
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.light,
                padding: 12,
                borderRadius: 10,
                flex: 1,
                marginHorizontal: 4,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Total Cities
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.primary,
                }}
              >
                {uniqueCities.length}
              </Text>
            </View>
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.light,
                padding: 12,
                borderRadius: 10,
                flex: 1,
                marginHorizontal: 4,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Total Days
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.primary,
                }}
              >
                {packageSummary.package?.itineraryDays?.length || 0}
              </Text>
            </View>
            <View
              style={{
                alignItems: "center",
                backgroundColor: theme.light,
                padding: 12,
                borderRadius: 10,
                flex: 1,
                marginHorizontal: 4,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: theme.textSecondary,
                  marginBottom: 4,
                  fontWeight: "600",
                }}
              >
                Total Distance
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: theme.primary,
                }}
              >
                {packageSummary.package?.itineraryDays?.reduce((acc, day) => acc + (day.selectedItinerary?.distance || 0), 0)} km
              </Text>
            </View>
          </View>
        </View>

        {/* Detailed Itinerary */}
        {packageSummary.package?.itineraryDays && packageSummary.package.itineraryDays.length > 0 && (
          <View
            style={{
              marginBottom: 20,
              backgroundColor: "#FFFFFF",
              padding: 20,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: theme.border,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <View
              style={{
                backgroundColor: theme.headerBg,
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                borderLeftWidth: 6,
                borderLeftColor: theme.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                TRIP ITINERARY
              </Text>
            </View>
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

              return (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: theme.border,
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: "#FFFFFF",
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }}
                >
                  {/* Day Header */}
                  <View
                    style={{
                      backgroundColor: theme.headerBg,
                      padding: 14,
                      marginBottom: 12,
                      borderRadius: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      borderLeftWidth: 6,
                      borderLeftColor: theme.primary,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: theme.primary,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 12,
                        borderWidth: 2,
                        borderColor: pdfStyle === "demand" ? theme.secondary : "#FFFFFF",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 10, marginBottom: 2 }}>
                        {formatDate(currentDate)} • {dayData.cityName || "Destination"}
                      </Text>
                      <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
                        {dayData.itineraryTitle || `Day ${index + 1}`}
                      </Text>
                    </View>
                  </View>

                  {/* Transfer on Day 1 */}
                  {index === 0 && transfer && (
                    <View
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        backgroundColor: theme.light,
                        borderRadius: 8,
                        flexDirection: "row",
                        borderWidth: 2,
                        borderColor: theme.border,
                      }}
                    >
                      {cabImageCache[0] && (
                        <Image
                          src={cabImageCache[0]}
                          style={{
                            width: 70,
                            height: 50,
                            marginRight: 12,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: theme.primary,
                          }}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            marginBottom: 6,
                            color: theme.primary,
                            textTransform: "uppercase",
                          }}
                        >
                          Private Transfer
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: theme.textPrimary,
                            fontWeight: "600",
                          }}
                        >
                          {transfer.cabName || "Standard Vehicle"} | {transfer.cabType || "Sedan"} | {transfer.cabSeatingCapacity || "4"} Seater
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Itinerary Description */}
                  {dayData.itineraryDescription && (
                    <View
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        backgroundColor: theme.light,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: theme.border,
                      }}
                    >
                      {decodeHtmlEntities(dayData.itineraryDescription)
                        .split(/\.\s+/)
                        .filter((s) => s.trim())
                        .slice(0, 2)
                        .map((sentence, idx) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: "row",
                              marginBottom: 6,
                              alignItems: "flex-start",
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: theme.primary,
                                borderRadius: 3,
                                marginTop: 4,
                                marginRight: 10,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 10,
                                flex: 1,
                                color: theme.textPrimary,
                                lineHeight: 1.5,
                              }}
                            >
                              {sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}

                  {/* Places to Visit */}
                  {dayData.cityArea && dayData.cityArea.length > 0 && (
                    <View
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        backgroundColor: theme.light,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          marginBottom: 8,
                          color: theme.primary,
                          textTransform: "uppercase",
                        }}
                      >
                        Places to Visit
                      </Text>
                      {dayData.cityArea.slice(0, 3).map((area, areaIndex) => {
                        const areaText = typeof area === "string" ? area : area.placeName || area.city || "";
                        return (
                          <View
                            key={areaIndex}
                            style={{
                              flexDirection: "row",
                              marginBottom: 6,
                              alignItems: "flex-start",
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: theme.primary,
                                borderRadius: 3,
                                marginTop: 4,
                                marginRight: 8,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 10,
                                flex: 1,
                                color: theme.textPrimary,
                              }}
                            >
                              {decodeHtmlEntities(areaText)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* Hotel Information */}
                  {hotel && (() => {
                    const hotelIndex = packageSummary.hotels?.findIndex((h) => String(h.day) === String(day.day)) ?? -1;
                    const cachedHotelImage = hotelIndex >= 0 ? hotelImageCache[hotelIndex] : null;
                    return (
                      <View
                        style={{
                          marginBottom: 12,
                          padding: 12,
                          backgroundColor: theme.light,
                          borderRadius: 8,
                          flexDirection: "row",
                          borderWidth: 2,
                          borderColor: theme.border,
                        }}
                      >
                        {cachedHotelImage && (
                          <Image
                            src={cachedHotelImage}
                            style={{
                              width: 70,
                              height: 50,
                              marginRight: 12,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor: theme.primary,
                            }}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 10,
                              color: theme.textSecondary,
                              marginBottom: 4,
                              fontWeight: "600",
                            }}
                          >
                            {index + 1}st NIGHT at {hotel.cityName || hotel.hotelCity || dayData.cityName}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "bold",
                              marginBottom: 4,
                              color: theme.primary,
                            }}
                          >
                            {hotel.propertyName}
                          </Text>
                          {hotel.basicInfo?.hotelStarRating && (
                            <Text
                              style={{
                                fontSize: 10,
                                color: pdfStyle === "demand" ? "#FFA500" : "#F59E0B",
                                marginBottom: 6,
                              }}
                            >
                              {"★".repeat(Math.round(hotel.basicInfo.hotelStarRating))}
                            </Text>
                          )}
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 8,
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "#FFFFFF",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: theme.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  color: theme.textPrimary,
                                  fontWeight: "600",
                                }}
                              >
                                ROOMS: {hotel.roomName || "Standard Room"}
                              </Text>
                            </View>
                            <View
                              style={{
                                backgroundColor: "#FFFFFF",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 6,
                                borderWidth: 1,
                                borderColor: theme.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 9,
                                  color: theme.textPrimary,
                                  fontWeight: "600",
                                }}
                              >
                                MEAL PLAN: {hotel.mealPlan || "Breakfast"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Activities */}
                  {dayActivities.length > 0 && (
                    <View
                      style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: theme.light,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: theme.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          marginBottom: 8,
                          color: theme.primary,
                          textTransform: "uppercase",
                        }}
                      >
                        Activities
                      </Text>
                      {dayActivities.slice(0, 2).map((activity, actIndex) => (
                        <View
                          key={actIndex}
                          style={{
                            marginBottom: 8,
                            padding: 8,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 6,
                            borderLeftWidth: 3,
                            borderLeftColor: theme.primary,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "bold",
                              marginBottom: 4,
                              color: theme.primary,
                            }}
                          >
                            {activity.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: 9,
                              color: theme.textSecondary,
                              lineHeight: 1.4,
                            }}
                          >
                            {decodeHtmlEntities(activity.description || "").substring(0, 100)}...
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Inclusions */}
        <View
          style={{
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.border,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <View
            style={{
              backgroundColor: pdfStyle === "demand" ? "#F0FDF4" : theme.headerBg,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              borderLeftWidth: 6,
              borderLeftColor: pdfStyle === "demand" ? "#16A34A" : theme.primary,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: pdfStyle === "demand" ? "#16A34A" : "#FFFFFF",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Package Inclusions
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 10,
              paddingLeft: 4,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: pdfStyle === "demand" ? "#16A34A" : theme.primary,
                borderRadius: 4,
                marginTop: 4,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 11,
                color: theme.textPrimary,
                lineHeight: 1.6,
              }}
            >
              {packageSummary.hotels?.length || 0} Hotels accommodation with {packageSummary.package?.itineraryDays?.length || 0} days itinerary
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 10,
              paddingLeft: 4,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: pdfStyle === "demand" ? "#16A34A" : theme.primary,
                borderRadius: 4,
                marginTop: 4,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 11,
                color: theme.textPrimary,
                lineHeight: 1.6,
              }}
            >
              Meals as mentioned in the itinerary (MAP - Breakfast & Dinner)
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 10,
              paddingLeft: 4,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: pdfStyle === "demand" ? "#16A34A" : theme.primary,
                borderRadius: 4,
                marginTop: 4,
                marginRight: 12,
              }}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 11,
                color: theme.textPrimary,
                lineHeight: 1.6,
              }}
            >
              All transfers and sightseeing as per itinerary in {packageSummary.transfer?.details?.[0]?.cabName || 'Standard Vehicle'}
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>{packageSummary.activities?.length || 0} activities and excursions as mentioned</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>All applicable taxes and service charges</Text>
          </View>
        </View>

        {/* Exclusions */}
        <View
          style={{
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            padding: 20,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.border,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <View
            style={{
              backgroundColor: "#FEF2F2",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              borderLeftWidth: 6,
              borderLeftColor: "#DC2626",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#991B1B",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Package Exclusions
            </Text>
          </View>
          {(() => {
            const exclusionsText = packageSummary?.package?.packageExclusions || "";
            if (!exclusionsText) return null;
            
            // Parse HTML content
            const parsedItems = parseHtmlContent(exclusionsText);
            const sections = parseExclusionsWithSections(exclusionsText);
            
            // If we have sections, render them with titles
            if (sections.length > 0 && sections.some(s => s.title)) {
              return sections.map((section, idx) => {
                if (section.title) {
                  return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: "bold", color: "#991B1B", marginBottom: 6 }}>
                        • {section.title}:
                      </Text>
                      {section.content && section.content.length > 0 && (
                        <View style={{ marginLeft: 16 }}>
                          {section.content.map((item, itemIdx) => {
                            // Parse HTML if content is still HTML
                            const cleanItem = item.includes('<') ? decodeHtmlEntities(item) : item;
                            return (
                              <View key={itemIdx} style={[styles.listItem, { marginLeft: 8 }]}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={{ flex: 1, fontSize: 10 }}>{cleanItem}</Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                } else if (section.content && Array.isArray(section.content)) {
                  return section.content.map((item, itemIdx) => {
                    const cleanItem = item.includes('<') ? decodeHtmlEntities(item) : item;
                    return (
                      <View key={`${idx}-${itemIdx}`} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={{ flex: 1, fontSize: 10 }}>{cleanItem}</Text>
                      </View>
                    );
                  });
                } else {
                  const cleanContent = section.content?.includes('<') ? decodeHtmlEntities(section.content) : section.content;
                  return (
                    <View key={idx} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={{ flex: 1, fontSize: 10 }}>{cleanContent}</Text>
                    </View>
                  );
                }
              });
            }
            
            // Otherwise, render as simple list
            return parsedItems.map((item, idx) => {
              const cleanItem = item.includes('<') ? decodeHtmlEntities(item) : item;
              return (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={{ flex: 1, fontSize: 10 }}>{cleanItem}</Text>
                </View>
              );
            });
          })()}
          {packageSummary?.package?.customExclusions?.map((section, idx) => {
            const sectionItems = parseHtmlContent(section.description || "");
            return (
              <View key={idx} style={{ marginTop: 12 }}>
                {section.name && (
                  <Text style={{ fontSize: 12, fontWeight: "bold", color: "#991B1B", marginBottom: 6 }}>
                    • {section.name}:
                  </Text>
                )}
                {sectionItems.map((item, itemIdx) => (
                  <View key={itemIdx} style={[styles.listItem, section.name ? { marginLeft: 16 } : {}]}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={{ flex: 1, fontSize: 10 }}>{item}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* Cost Section */}
        <View
          style={{
            marginBottom: 20,
            backgroundColor: theme.headerBg,
            padding: 24,
            borderRadius: 12,
            borderWidth: 3,
            borderColor: theme.primary,
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#FFFFFF",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Pay Now
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: 16,
            }}
          >
            Pay 40% of the total amount to confirm the booking
          </Text>
          <Text
            style={{
              fontSize: 42,
              fontWeight: "bold",
              color: pdfStyle === "demand" ? theme.accent : "#FCD34D",
              marginBottom: 16,
              fontFamily: "Helvetica-Bold",
            }}
          >
            ₹{showMargin ? finalTotal.toFixed(0) : (packageSummary.totals?.grandTotal || 0).toFixed(0)}
          </Text>
          {activeDiscountPercentage > 0 && (
            <View
              style={{
                backgroundColor: pdfStyle === "demand" ? theme.secondary : "rgba(34, 197, 94, 0.3)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#FFFFFF",
                  fontWeight: "bold",
                }}
              >
                {activeDiscountPercentage}% OFF Applied
              </Text>
            </View>
          )}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: "#FFFFFF",
                marginBottom: 8,
              }}
            >
              Important Payment Information
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.9)", marginBottom: 4 }}>
              • 40% advance payment required to confirm booking
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.9)", marginBottom: 4 }}>
              • Balance payment due 15 days before travel date
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.9)" }}>
              • Prices are subject to availability and may change
            </Text>
          </View>
        </View>

      

        {/* Agent Info - Only show for Pluto style */}
        {pdfStyle === "pluto" && (
          <View style={styles.agentSection}>
            <View style={styles.agentHeader}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentAvatarText}>
                  {(packageSummary.package?.agentName || 'P')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.agentInfo}>
                <Text style={styles.agentLabel}>TRAVEL EXPERT</Text>
                <Text style={styles.agentName}>
                  {packageSummary.package?.agentName || 'PTW Holidays Agent'}
                </Text>
                <Text style={styles.agentContact}>
                  Phone: {packageSummary.package?.agentPhone || '+91-8353056000'}
                </Text>
                <Text style={styles.agentContact}>Email: info@ptwholidays.com</Text>
              </View>
            </View>
            <Text style={styles.agentContact}>
              Quotation Created on {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Text>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceBadgeText}>5+ Years Experience</Text>
            </View>
          </View>
        )}

        {/* Environmental Note - Only show for Pluto style */}
        {pdfStyle === "pluto" && (
          <View style={styles.environmentalNote}>
            <Text style={styles.environmentalText}>
              Please think twice before printing this mail. Save paper, it's good for the environment.
            </Text>
          </View>
        )}

        {/* Date Change Policy */}
        <View style={styles.policySection}>
          <Text style={styles.sectionTitle}>Date Change Policy</Text>
          <Text style={styles.policyTitle}>Your Current Policy</Text>
          <Text style={styles.policyText}>Non Refundable. Date Change is not allowed.</Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>
              These are non-refundable amounts as per the current components attached. In the case of component change/modifications, the policy will change accordingly.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>
              Date Change fees don't include any fare change in the components on the new date. Fare difference as applicable will be charged separately.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>
              Date Change will depend on the availability of the components on the new requested date.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>
              Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={{ flex: 1 }}>
              Cancellation charges shown is exclusive of all taxes and taxes will be added as per applicable.
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <PDFAccountDetails />

        {/* Footer */}
        <PDFFooter />
      </Page>
    </Document>
  );
};

export default QuotePreviewPDF;

