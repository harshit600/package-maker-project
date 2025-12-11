"use client";

import { useEffect, useState, useCallback } from "react";
import { usePackage } from "../context/PackageContext";
import { Icons, pdfStyles } from "./newFile";
import { getStateImages } from "./images";
import { Document, Page, View, Text, Link } from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";
import { stateImages } from "./images";
// Add this helper function at the top of the component
const decodeHtmlEntities = (text) => {
  if (!text) return "";
  let decoded = text
    // Decode common HTML entities first
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Decode bullet point entities
    .replace(/&bull;/g, "•")
    .replace(/&bullet;/g, "•")
    .replace(/&#8226;/g, "•")
    .replace(/&#149;/g, "•")
    // Decode numeric entities
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    // Decode hex entities
    .replace(/&#x([a-f\d]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Clean up any stray & characters that aren't part of valid entities
    .replace(/&(?![a-zA-Z]{2,10};|#\d{1,6};|#x[0-9a-fA-F]{1,6};)/g, "")
    // Clean up multiple spaces
    .replace(/\s+/g, " ")
    .trim();
  
  return decoded;
};

// Helper function to ensure text ends with a period and format properly
const formatInclusionExclusionText = (text) => {
  if (!text) return "";
  let formatted = text.trim();
  // Remove existing trailing punctuation
  formatted = formatted.replace(/[.,;:!?]+$/, "");
  // Add period if not empty
  if (formatted.length > 0) {
    formatted += ".";
  }
  return formatted;
};

// Enhanced HTML parser for list items with formatting
const parseHtmlContent = (htmlString) => {
  if (!htmlString) return [];
  
  // Extract list items from ol/ul tags
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gs;
  const matches = [...htmlString.matchAll(listItemRegex)];
  
  if (matches.length === 0) {
    // If no list items found, try paragraph parsing as fallback
    return htmlString
      .replace(/<p>/g, "")
      .split("</p>")
      .map((item) => parseInlineFormatting(item))
      .filter((item) => item && item.length > 0);
  }
  
  return matches.map(match => parseInlineFormatting(match[1]));
};

// Parse inline formatting like <strong>, <span>, etc. and return text segments with formatting info
const parseInlineFormatting = (htmlString) => {
  if (!htmlString) return [];
  
  // Remove style attributes and color attributes
  let cleaned = htmlString.replace(/style="[^"]*"/g, '')
                          .replace(/color:\s*rgb\([^)]*\);?/g, '');
  
  // Extract text segments with their formatting
  const segments = [];
  let currentText = '';
  let isBold = false;
  
  // Simple parser that handles <strong> tags
  const strongRegex = /<strong[^>]*>(.*?)<\/strong>/gs;
  let lastIndex = 0;
  
  for (const match of cleaned.matchAll(strongRegex)) {
    // Add text before the strong tag
    const beforeText = cleaned.substring(lastIndex, match.index);
    if (beforeText) {
      const cleanedBefore = beforeText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (cleanedBefore) {
        segments.push({ text: cleanedBefore, bold: false });
      }
    }
    
    // Add the bold text
    const boldText = match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (boldText) {
      segments.push({ text: boldText, bold: true });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last match
  if (lastIndex < cleaned.length) {
    const remainingText = cleaned.substring(lastIndex).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (remainingText) {
      segments.push({ text: remainingText, bold: false });
    }
  }
  
  // If no segments were created, just clean and return the whole text
  if (segments.length === 0) {
    const fullText = cleaned.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (fullText) {
      segments.push({ text: fullText, bold: false });
    }
  }
  
  return segments;
};

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

// Update the PackagePDF component
const DemandSetuPDF = ({
  packageSummary,
  showMargin,
  showDiscount,
  marginAmount,
  discountAmount,
  activeDiscountPercentage,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "Pluto Tours and Travel",
  selectedLead,
  colorTheme,
  cabImages,
}) => {
  const [destinationImages, setDestinationImages] = useState([]);
  const [hotelImageCache, setHotelImageCache] = useState({});
  const [cabImageCache, setCabImageCache] = useState({});
  
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
        console.log("DemandSetuPDF image fetched", {
          source: imageUrl,
          via: attempt.label,
        });
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

  useEffect(() => {
    const getDestinationImages = () => {
      try {
        // Get the state from package data
        const packageState = packageSummary.package?.state || "";
        
        // Try to match state with state names from images.jsx
        const stateName = findMatchingState(packageState);
        
        if (stateName) {
          // Get images for the matched state
          const images = getStateImages(stateName);
          setDestinationImages(images);
        } else {
          // Fallback to default images if no state match found
          setDestinationImages([
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
          ]);
        }
      } catch (error) {
        console.error("Error getting images:", error);
        // Fallback to default images
        setDestinationImages([
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
        ]);
      }
    };

    getDestinationImages();
  }, [packageSummary.package?.state]);

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
            console.log("DemandSetuPDF hotel image cached", {
              propertyName: hotel?.propertyName,
              source: imageUrl,
              viaProxy: dataUri?.startsWith("data:"),
              cacheKey: index,
            });
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
            console.log("DemandSetuPDF cab image cached", {
              cabName: cab?.cabName,
              cabType: cab?.cabType,
              source: imageUrl,
              viaProxy: dataUri?.startsWith("data:"),
              cacheKey: index,
            });
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

  // Helper function to find matching state from package state
  const findMatchingState = (packageState) => {
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

  // Define color schemes
  const colors = {
    default: {
      primary: "#2d2d44",
      secondary: "#1E293B",
      accent: "#3B82F6",
      light: "#E2E8F0",
      background: "#F8FAFC",
    },
    orange: {
      primary: "#EA580C", // Orange-600
      secondary: "#C2410C", // Orange-700
      accent: "#F97316", // Orange-500
      light: "#FFEDD5", // Orange-100
      background: "#FFF7ED", // Orange-50
    },
  };

  // Use the selected color scheme
  const theme = colorTheme === "orange" ? colors.orange : colors.default;

  const itineraryDays = packageSummary.package?.itineraryDays || [];

  const getHotelForDay = (dayObj) => {
    if (!dayObj || !packageSummary?.hotels) return null;
    return packageSummary.hotels.find(
      (hotel) => String(hotel.day) === String(dayObj.day)
    );
  };

  const getHotelImageForDay = (dayObj) => {
    if (!dayObj || !packageSummary?.hotels) return null;
    const hotelIndex = packageSummary.hotels.findIndex(
      (hotel) => String(hotel.day) === String(dayObj.day)
    );
    if (hotelIndex === -1) return null;
    return hotelImageCache[hotelIndex] || null;
  };

  const getConsecutiveHotelIndices = (startIndex, propertyName) => {
    const indices = [];
    if (!propertyName) return indices;
    for (let i = startIndex; i < itineraryDays.length; i += 1) {
      const hotelAtIndex = getHotelForDay(itineraryDays[i]);
      if (hotelAtIndex?.propertyName === propertyName) {
        indices.push(i);
      } else {
        break;
      }
    }
    return indices;
  };

  // Helper function to get grouped hotels for the "Your Hotels" section
  const getGroupedHotels = () => {
    if (!packageSummary?.hotels || !itineraryDays) return [];
    
    const grouped = [];
    const processedHotels = new Set();
    
    itineraryDays.forEach((day, dayIndex) => {
      const hotel = getHotelForDay(day);
      if (!hotel || processedHotels.has(hotel.propertyName)) return;
      
      const consecutiveIndices = getConsecutiveHotelIndices(dayIndex, hotel.propertyName);
      if (consecutiveIndices.length > 0) {
        processedHotels.add(hotel.propertyName);
        
        // Calculate check-in date
        const startDate = selectedLead?.travelDate
          ? new Date(selectedLead.travelDate)
          : new Date();
        const checkInDate = new Date(startDate);
        checkInDate.setDate(startDate.getDate() + consecutiveIndices[0]);
        
        // Get night badges
        const nightBadges = consecutiveIndices.map(idx => formatOrdinal(idx + 1));
        
        // Get hotel image
        const hotelIndex = packageSummary.hotels.findIndex(
          h => h.propertyName === hotel.propertyName
        );
        const hotelImage = hotelIndex !== -1 ? hotelImageCache[hotelIndex] : null;
        
        grouped.push({
          hotel,
          nightBadges,
          checkInDate,
          hotelImage,
          consecutiveIndices,
          city: hotel.cityName || hotel.hotelCity || day.selectedItinerary?.cityName || "",
        });
      }
    });
    
    return grouped;
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

  const formatDisplayDate = (date) => {
    try {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
      });
    } catch (error) {
      return date.toDateString();
    }
  };

  const getStarDisplay = (rating) => {
    const parsed = Math.round(Number(rating) || 0);
    if (!parsed) return null;
    return "★".repeat(parsed);
  };

  const accommodationStyles = {
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#FFA500",
      borderLeftWidth: 5,
      borderLeftColor: "#EA580C",
      padding: 14,
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      shadowColor: "#EA580C",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    leftColumn: {
      flex: 1,
      flexDirection: "column",
      gap: 8,
    },
    badgeWrapper: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    badge: {
      backgroundColor: "#FFF7ED",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 2,
      borderColor: "#FFA500",
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#EA580C",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    nightsText: {
      fontSize: 11,
      color: "#1E293B",
      fontWeight: "600",
    },
    nightsCity: {
      fontWeight: "bold",
      color: "#EA580C",
    },
    subText: {
      fontSize: 9,
      color: "#EA580C",
      fontWeight: "600",
    },
    hotelName: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#EA580C",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    starText: {
      fontSize: 10,
      color: "#EA580C",
      fontWeight: "600",
    },
    infoRow: {
      flexDirection: "row",
      gap: 24,
      marginTop: 8,
    },
    infoColumn: {
      minWidth: 90,
      backgroundColor: "#FFF7ED",
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#FFA500",
    },
    infoHeading: {
      fontSize: 8,
      color: "#EA580C",
      letterSpacing: 1,
      marginBottom: 4,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 10,
      fontWeight: "700",
      color: "#1E293B",
      textTransform: "capitalize",
    },
    secondaryValue: {
      fontSize: 9,
      color: "#EA580C",
      marginTop: 2,
      fontWeight: "600",
    },
    similarLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: "#EA580C",
      marginTop: 6,
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    similarValue: {
      fontSize: 10,
      color: "#1E293B",
      fontWeight: "500",
    },
    imageWrapper: {
      width: 140,
      height: 110,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "#FFA500",
    },
    placeholder: {
      width: 140,
      height: 110,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#FFA500",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF7ED",
    },
    placeholderText: {
      fontSize: 8,
      color: "#EA580C",
      fontWeight: "600",
    },
  };

  return (
    <Document>
      <Page
        size="A4"
        style={{
          ...pdfStyles.page,
          position: "relative",
          backgroundColor: "#FFA500", // Light orange background
          backgroundImage:
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundOpacity: 0.1, // Make the background image more subtle
        }}
        wrap={true}
      >
        {/* Existing content */}
        <View
          style={{
            position: "relative", // This ensures content stays above the background
            zIndex: 1,
          }}
        >
          {/* Compact & Attractive Header */}
          <View
            style={{
              backgroundColor: "#2d2d44",
              padding: 16,
              marginTop: 10,
              borderRadius: 8,
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle Background Pattern */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: 60,
                transform: [{ translateX: 60 }, { translateY: -60 }],
              }}
            />

            {/* Main Content */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Left - Brand Section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Logo Container */}
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

                {/* Company Info */}
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

                {/* Trust Badge */}
                <View
                  style={{
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255, 215, 0, 0.3)",
                  }}
                ></View>
              </View>

              {/* Right - Contact Info */}
              <View
                style={{
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                {/* Contact Row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Email */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 7,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icons.Email width={10} height={10} color="#FFFFFF" />
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

                  {/* Website */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 7,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icons.Globe width={10} height={10} color="#FFFFFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FFFFFF",
                        fontWeight: "500",
                      }}
                    >
                      demandsetutours.com
                    </Text>
                  </View>
                </View>

                {/* Phone & Address Row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  {/* Phone */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 7,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icons.Phone width={10} height={10} color="#FFFFFF" />
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

                  {/* Address */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 7,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icons.Location width={10} height={10} color="#FFFFFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#FFFFFF",
                        fontWeight: "500",
                      }}
                    >
                      Shimla, HP
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bottom Accent Line */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: "#FFA500",
              }}
            />
          </View>

          {/* Attractive Hero Section */}
          <View
            style={{
              marginVertical: 16,
              marginHorizontal: 20,
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
              height: 280,
            }}
          >
            {/* Hero Background Image */}
            <Image
              source={
                destinationImages[0] ||
                "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg"
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Strong Black Overlay for Text Visibility */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              }}
            />

            {/* Content Overlay */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: 24,
                justifyContent: "space-between",
              }}
            >
              {/* Top Section - Package Info */}
              <View>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#fff",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {packageSummary.package?.packageType || "Premium Package"}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#fff",
                    marginBottom: 8,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {packageSummary.package?.packageName || "Amazing Journey"}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View style={{ width: 12, height: 12 }}>
                      <Icons.Calendar width={12} height={12} color="#FFFFFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      {packageSummary.package?.duration || "5N/6D"}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View style={{ width: 12, height: 12 }}>
                      <Icons.Map width={12} height={12} color="#FFFFFF" />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#fff",
                        fontWeight: "600",
                      }}
                    >
                      {
                        new Set(
                          packageSummary.package?.itineraryDays?.map(
                            (day) => day.selectedItinerary.cityName
                          )
                        ).size
                      }{" "}
                      Cities
                    </Text>
                  </View>

                  {packageSummary.package?.customizablePackage && (
                    <View
                      style={{
                        backgroundColor: "rgba(255, 215, 0, 0.3)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(255, 215, 0, 0.5)",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFD700",
                          fontWeight: "bold",
                        }}
                      >
                        Customizable
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Bottom Section - Price & Guest Info */}
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "rgba(255, 255, 255, 0.8)",
                        marginBottom: 4,
                      }}
                    >
                      Total Package Cost (Including GST )
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                      }}
                    >
                      Rs.{" "}
                      {showMargin
                        ? finalTotal.toFixed(0)
                        : packageSummary.totals.grandTotal}
                    </Text>
                    {activeDiscountPercentage > 0 && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#FFD700",
                          fontWeight: "600",
                        }}
                      >
                        {activeDiscountPercentage}% Discount Applied
                      </Text>
                    )}
                  </View>

                  <View
                    style={{
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#FFFFFF",
                            fontWeight: "600",
                          }}
                        >
                          {selectedLead?.adults || "0"} Adults
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#FFFFFF",
                            fontWeight: "600",
                          }}
                        >
                          {selectedLead?.kids || "0"} Children
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "rgba(255, 255, 255, 0.7)",
                        fontStyle: "italic",
                      }}
                    >
                      {selectedLead?.name || "Guest"}'s Dream Journey
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Decorative Elements */}
            <View
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                width: 24,
                height: 24,
                backgroundColor: "rgba(255, 215, 0, 0.3)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255, 215, 0, 0.5)",
              }}
            />
          </View>

          {/* Premium Greeting Section - Orange Theme */}
          <View
            style={{
              marginTop: 20,
              marginBottom: 20,
              marginLeft: 20,
              marginRight: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 3,
              borderColor: "#FFA500",
              padding: 24,
              shadowColor: "#EA580C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative Corner Elements */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 120,
                height: 120,
                backgroundColor: "#FFF7ED",
                borderBottomLeftRadius: 120,
              }}
            />
            
            <View style={{ position: "relative", zIndex: 2 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: "#EA580C",
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 3,
                    borderColor: "#FFA500",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    👋
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#EA580C",
                      marginBottom: 4,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Dear {selectedLead?.name || "Valued Customer"},
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#EA580C",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Greetings from Demandsetu!
                  </Text>
                </View>
              </View>
              
              <View style={{ gap: 14, marginTop: 8 }}>
                <View
                  style={{
                    padding: 14,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#FFA500",
                    borderLeftWidth: 4,
                    borderLeftColor: "#EA580C",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#1E293B",
                      lineHeight: 1.7,
                      fontWeight: "500",
                    }}
                  >
                    We are delighted to share with you a thoughtfully designed itinerary that we believe will make your journey both memorable and enjoyable. We kindly request you to review the details at your convenience. If you have any questions or would like us to make adjustments to better suit your preferences, please do not hesitate to reach out. Your comfort and satisfaction remain our top priority. Our contact details are provided at the end for your ease of reference.
                  </Text>
                </View>
              </View>

              {/* Premium Orange Separator */}
              <View
                style={{
                  height: 3,
                  backgroundColor: "#FFA500",
                  marginTop: 20,
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "30%",
                    height: "100%",
                    backgroundColor: "#EA580C",
                    borderRadius: 2,
                  }}
                />
              </View>
            </View>
          </View>

          {/* Premium Package Header Section - Orange Theme */}
          <View
            wrap={false}
            style={{
              marginTop: 0,
              marginBottom: 20,
              marginLeft: 20,
              marginRight: 20,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 3,
              borderColor: "#FFA500",
              padding: 24,
              shadowColor: "#EA580C",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative Background */}
            <View
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 150,
                height: 150,
                backgroundColor: "#FFF7ED",
                borderRadius: 75,
                opacity: 0.5,
              }}
            />
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
              {/* Left Section - Customer & Package Info */}
              <View style={{ flex: 1, paddingRight: 24, minWidth: 0, flexShrink: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EA580C",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#FFA500",
                      flexShrink: 0,
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Map width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      flexShrink: 1,
                    }}
                  >
                    {selectedLead?.name || "Guest"}'s trip to
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#EA580C",
                    marginBottom: 8,
                    lineHeight: 1.3,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {packageSummary.package?.packageName || "Package Name"}
                </Text>
                {packageSummary.package?.packageCode && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#EA580C",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#FFFFFF",
                          fontWeight: "bold",
                          letterSpacing: 0.5,
                        }}
                      >
                        {packageSummary.package.packageCode}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#FFF7ED",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#FFA500",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#EA580C",
                            fontWeight: "700",
                          }}
                        >
                          {packageSummary.package?.duration || "4D/3N"}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: "#FFF7ED",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#FFA500",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#EA580C",
                            fontWeight: "700",
                          }}
                        >
                          {packageSummary.package?.customizablePackage ? "Customizable" : "Fixed"} {packageSummary.package?.packageType || "Family"}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                {!packageSummary.package?.packageCode && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#FFF7ED",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#FFA500",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#EA580C",
                          fontWeight: "700",
                        }}
                      >
                        {packageSummary.package?.duration || "4D/3N"}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#FFF7ED",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#FFA500",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#EA580C",
                          fontWeight: "700",
                        }}
                      >
                        {packageSummary.package?.customizablePackage ? "Customizable" : "Fixed"} {packageSummary.package?.packageType || "Family"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Right Section - Premium Pricing Card */}
              <View
                style={{
                  alignItems: "flex-end",
                  borderLeftWidth: 3,
                  borderLeftColor: "#FFA500",
                  paddingLeft: 24,
                  minWidth: 180,
                  flexShrink: 0,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#EA580C",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 3,
                    borderColor: "#FFA500",
                    width: "100%",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255, 255, 255, 0.9)",
                      marginBottom: 8,
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Total Package Cost
                  </Text>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      marginBottom: 10,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    ₹ {(showMargin ? finalTotal : packageSummary.totals.grandTotal).toLocaleString('en-IN')}
                  </Text>
                  {/* Green Accent Line */}
                  <View
                    style={{
                      height: 2,
                      backgroundColor: "#22C55E",
                      marginBottom: 10,
                      width: "100%",
                    }}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <View style={{ width: 12, height: 12 }}>
                        <Icons.Adult width={12} height={12} color="#FFFFFF" />
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFFFFF",
                          fontWeight: "600",
                        }}
                      >
                        {selectedLead?.adults || "0"} Adults
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <View style={{ width: 12, height: 12 }}>
                        <Icons.Child width={12} height={12} color="#FFFFFF" />
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFFFFF",
                          fontWeight: "600",
                        }}
                      >
                        {selectedLead?.kids || "0"} Children
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Horizontal Line Separator */}
          <View
            style={{
              height: 1,
              backgroundColor: "#E2E8F0",
              marginLeft: 20,
              marginRight: 20,
              marginTop: 8,
              marginBottom: 16,
            }}
          />

         

          <View style={pdfStyles.headerDivider} />

          {/* Premium Your Details Section - Orange Theme */}
          <View style={{
            marginBottom: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderWidth: 3,
            borderColor: "#FFA500",
            overflow: "hidden",
            shadowColor: "#EA580C",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}>
            {/* Premium Orange Header */}
            <View
              style={{
                backgroundColor: "#EA580C",
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Background Elements */}
              <View
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 150,
                  height: 150,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 75,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                  borderRadius: 60,
                }}
              />
              
              {/* Icon Container */}
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
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <View style={{ width: 28, height: 28 }}>
                  <Icons.User width={28} height={28} color="#FFFFFF" />
                </View>
              </View>
              
              {/* Title */}
              <View style={{ flex: 1, position: "relative", zIndex: 2 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    textTransform: "uppercase",
                  }}
                >
                  Your Details
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "500",
                  }}
                >
                  Your travel information
                </Text>
              </View>
            </View>

            {/* Content Section - Orange Theme */}
            <View
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                backgroundColor: "#FFF7ED",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {/* Personal Info Card - Orange Theme */}
                <View style={{ 
                  flex: 1, 
                  minWidth: 200,
                  backgroundColor: "#FFFFFF",
                  padding: 18,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  borderLeftWidth: 6,
                  borderLeftColor: "#EA580C",
                  marginBottom: 12,
                  shadowColor: "#EA580C",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 }}>
                    <View style={{ 
                      width: 36, 
                      height: 36, 
                      backgroundColor: "#EA580C", 
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#FFA500",
                    }}>
                      <View style={{ width: 18, height: 18 }}>
                        <Icons.Profile width={18} height={18} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#EA580C",
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Personal Information
                    </Text>
                  </View>
                  <View style={{ gap: 12 }}>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Name:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.name || "N/A"}
                      </Text>
                    </View>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Contact:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.mobile || "N/A"}
                      </Text>
                    </View>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Email:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.email || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Travel Info Card - Orange Theme */}
                <View style={{ 
                  flex: 1, 
                  minWidth: 200,
                  backgroundColor: "#FFFFFF",
                  padding: 18,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  borderLeftWidth: 6,
                  borderLeftColor: "#EA580C",
                  marginBottom: 12,
                  shadowColor: "#EA580C",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 }}>
                    <View style={{ 
                      width: 36, 
                      height: 36, 
                      backgroundColor: "#EA580C", 
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#FFA500",
                    }}>
                      <View style={{ width: 18, height: 18 }}>
                        <Icons.Calendar width={18} height={18} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#EA580C",
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Travel Information
                    </Text>
                  </View>
                  <View style={{ gap: 12 }}>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Date:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.travelDate
                          ? new Date(
                              selectedLead.travelDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Duration:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.nights || "0"} Nights /{" "}
                        {selectedLead?.days || "0"} Days
                      </Text>
                    </View>
                    <View style={{ 
                      flexDirection: "row", 
                      gap: 10, 
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: "#FFF7ED",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: "#FFA500",
                    }}>
                      <Text
                        style={{ 
                          fontSize: 10, 
                          color: "#EA580C", 
                          width: 70,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        Package:
                      </Text>
                      <Text style={{ 
                        fontSize: 12, 
                        color: "#1E293B", 
                        flex: 1,
                        fontWeight: "bold",
                      }}>
                        {selectedLead?.packageType || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Guest Info Card - Orange Theme */}
                <View style={{ 
                  flex: 1, 
                  minWidth: 200,
                  backgroundColor: "#FFFFFF",
                  padding: 18,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  borderLeftWidth: 6,
                  borderLeftColor: "#EA580C",
                  marginBottom: 12,
                  shadowColor: "#EA580C",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 }}>
                    <View style={{ 
                      width: 36, 
                      height: 36, 
                      backgroundColor: "#EA580C", 
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#FFA500",
                    }}>
                      <View style={{ width: 18, height: 18 }}>
                        <Icons.Group width={18} height={18} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#EA580C",
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Guest Information
                    </Text>
                  </View>
                  <View
                    style={{ 
                      flexDirection: "row", 
                      flexWrap: "wrap", 
                      gap: 12,
                    }}
                  >
                    <View
                      style={{ 
                        flexDirection: "row", 
                        gap: 8, 
                        backgroundColor: "#FFF7ED",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#FFA500",
                        alignItems: "center",
                        flex: 1,
                        minWidth: 120,
                      }}
                    >
                      <View style={{ 
                        width: 32, 
                        height: 32, 
                        backgroundColor: "#EA580C", 
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <View style={{ width: 16, height: 16 }}>
                          <Icons.Adult width={16} height={16} color="#FFFFFF" />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: "#EA580C", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Adults
                        </Text>
                        <Text style={{ fontSize: 14, color: "#1E293B", fontWeight: "bold" }}>
                          {selectedLead?.adults || "0"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{ 
                        flexDirection: "row", 
                        gap: 8,
                        backgroundColor: "#FFF7ED",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#FFA500",
                        alignItems: "center",
                        flex: 1,
                        minWidth: 120,
                      }}
                    >
                      <View style={{ 
                        width: 32, 
                        height: 32, 
                        backgroundColor: "#EA580C", 
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <View style={{ width: 16, height: 16 }}>
                          <Icons.Child width={16} height={16} color="#FFFFFF" />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: "#EA580C", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Children
                        </Text>
                        <Text style={{ fontSize: 14, color: "#1E293B", fontWeight: "bold" }}>
                          {selectedLead?.kids || "0"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{ 
                        flexDirection: "row", 
                        gap: 8,
                        backgroundColor: "#FFF7ED",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: "#FFA500",
                        alignItems: "center",
                        flex: 1,
                        minWidth: 120,
                      }}
                    >
                      <View style={{ 
                        width: 32, 
                        height: 32, 
                        backgroundColor: "#EA580C", 
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <View style={{ width: 16, height: 16 }}>
                          <Icons.Room width={16} height={16} color="#FFFFFF" />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 9, color: "#EA580C", fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Rooms
                        </Text>
                        <Text style={{ fontSize: 14, color: "#1E293B", fontWeight: "bold" }}>
                          {selectedLead?.noOfRooms || "0"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          {/* Premium Package Description Section - Orange Theme */}
          <View style={{
            marginBottom: 20,
            marginTop: 0,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            borderWidth: 3,
            borderColor: "#FFA500",
            overflow: "hidden",
            shadowColor: "#EA580C",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          }}>
            {/* Premium Orange Header */}
            <View
              style={{
                backgroundColor: "#EA580C",
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative Background Elements */}
              <View
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 150,
                  height: 150,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 75,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 120,
                  height: 120,
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                  borderRadius: 60,
                }}
              />
              
              {/* Icon Container */}
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
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <View style={{ width: 28, height: 28 }}>
                  <Icons.Document width={28} height={28} color="#FFFFFF" />
                </View>
              </View>
              
              {/* Title */}
              <View style={{ flex: 1, position: "relative", zIndex: 2 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    textTransform: "uppercase",
                  }}
                >
                  Package Description
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255, 255, 255, 0.95)",
                    fontWeight: "500",
                  }}
                >
                  Discover what awaits you
                </Text>
              </View>
            </View>

            {/* Content Section - Orange Theme */}
            {packageSummary?.package?.packageDescription && (
              <View
                style={{
                  paddingTop: 20,
                  paddingBottom: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                  backgroundColor: "#FFF7ED",
                  position: "relative",
                }}
              >
                {/* Premium Decorative Quote Symbol */}
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    width: 60,
                    height: 60,
                    opacity: 0.15,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 70,
                      color: "#EA580C",
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    "
                  </Text>
                </View>

                {/* Description Content - Orange Accent */}
                <View style={{ paddingTop: 8, position: "relative", zIndex: 2 }}>
                  {parseHtmlContent(packageSummary.package.packageDescription).map((textSegments, idx) => (
                    <View
                      key={idx}
                      style={{
                        marginBottom: idx < parseHtmlContent(packageSummary.package.packageDescription).length - 1 ? 14 : 0,
                        padding: 14,
                        paddingLeft: 18,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: "#FFA500",
                        borderLeftWidth: 5,
                        borderLeftColor: "#EA580C",
                        shadowColor: "#EA580C",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#1E293B",
                          lineHeight: 1.7,
                          textAlign: "left",
                          fontWeight: "500",
                        }}
                      >
                        {Array.isArray(textSegments) ? (
                          textSegments.map((segment, segIdx) => (
                            <Text 
                              key={segIdx} 
                              style={segment.bold ? { 
                                fontWeight: 'bold', 
                                fontFamily: 'Helvetica-Bold',
                                color: "#EA580C",
                              } : {
                                color: "#1E293B",
                              }}
                            >
                              {segment.text}
                            </Text>
                          ))
                        ) : (
                          <Text style={{ color: "#1E293B" }}>{textSegments}</Text>
                        )}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Premium Bottom Decorative Line */}
                <View
                  style={{
                    marginTop: 16,
                    height: 4,
                    backgroundColor: "#FFA500",
                    borderRadius: 2,
                    position: "relative",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "30%",
                      height: "100%",
                      backgroundColor: "#EA580C",
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
          {/* Premium Journey Overview Section - Orange Theme */}
          <View
            style={{
              marginTop: 8,
              marginBottom: 12,
              padding: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              borderWidth: 3,
              borderColor: "#FFA500",
              shadowColor: "#EA580C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative Background Elements */}
            <View
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                backgroundColor: "rgba(234, 88, 12, 0.1)",
                borderRadius: 50,
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 80,
                height: 80,
                backgroundColor: "rgba(255, 165, 0, 0.1)",
                borderRadius: 40,
              }}
            />
            
            {/* Premium Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
                gap: 10,
                paddingBottom: 12,
                borderBottomWidth: 3,
                borderBottomColor: "#FFA500",
                position: "relative",
                zIndex: 2,
              }}
            >
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: "#EA580C", 
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#FFA500",
              }}>
                <View style={{ width: 20, height: 20 }}>
                  <Icons.Map width={20} height={20} color="#FFFFFF" />
                </View>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#EA580C",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  textShadow: "0 1px 2px rgba(234, 88, 12, 0.2)",
                }}
              >
                Journey Overview
              </Text>
            </View>

            {/* Premium Cities Timeline - Orange Theme */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
                paddingBottom: 16,
                borderBottomWidth: 2,
                borderBottomColor: "#FFA500",
                position: "relative",
                zIndex: 2,
              }}
            >
              {packageSummary.package?.itineraryDays?.map((day, index) => {
                const cityInfo = day.selectedItinerary;
                const nextDay =
                  packageSummary.package?.itineraryDays[index + 1];
                const isLastDayInCity =
                  !nextDay ||
                  nextDay.selectedItinerary?.cityName !== cityInfo?.cityName;

                if (
                  index === 0 ||
                  cityInfo?.cityName !==
                    packageSummary.package?.itineraryDays[index - 1]
                      .selectedItinerary?.cityName
                ) {
                  const daysInCity = packageSummary.package?.itineraryDays
                    .slice(index)
                    .filter((d, i, arr) => {
                      if (i === 0) return true;
                      return (
                        d.selectedItinerary?.cityName === cityInfo?.cityName
                      );
                    }).length;

                  return (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "#FFF7ED",
                        borderRadius: 12,
                        padding: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        borderWidth: 2,
                        borderColor: "#FFA500",
                        minWidth: 130,
                        shadowColor: "#EA580C",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: "#EA580C",
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: "#FFA500",
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 5,
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "bold",
                            color: "#EA580C",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          {cityInfo?.cityName}
                        </Text>
                      </View>
                      {!isLastDayInCity && (
                        <View
                          style={{
                            position: "absolute",
                            right: -6,
                            top: "50%",
                            marginTop: -3,
                            width: 8,
                            height: 8,
                            borderWidth: 2,
                            borderColor: "#EA580C",
                            borderRadius: 4,
                            backgroundColor: "#FFFFFF",
                            zIndex: 1,
                          }}
                        />
                      )}
                    </View>
                  );
                }
                return null;
              })}
            </View>

            {/* Premium Hotels and Transport Info - Orange Theme */}
            <View style={{ flexDirection: "column", gap: 14, marginTop: 4, position: "relative", zIndex: 2 }}>
              {/* Premium Hotels Summary */}
              <View style={{ width: "100%" }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 3,
                    borderColor: "#FFA500",
                    borderLeftWidth: 6,
                    borderLeftColor: "#EA580C",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  {/* Premium Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      paddingBottom: 12,
                      borderBottomWidth: 3,
                      borderBottomColor: "#FFA500",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      <View style={{ 
                        width: 36, 
                        height: 36, 
                        backgroundColor: "#EA580C", 
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#FFA500",
                      }}>
                        <View style={{ width: 18, height: 18 }}>
                          <Icons.Hotel width={18} height={18} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#EA580C",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        Your Hotels
                      </Text>
                    </View>
                  </View>

                  {/* Detailed Hotel Cards */}
                  {getGroupedHotels().map((groupedHotel, index) => {
                    const { hotel, nightBadges, checkInDate, hotelImage, city } = groupedHotel;
                    const similarOptions =
                      hotel?.similarHotels ||
                      hotel?.alternateHotels ||
                      hotel?.alternativeHotels;
                    const starRating = hotel.basicInfo?.hotelStarRating || hotel.starRating;
                    
                    return (
                      <View
                        key={index}
                        style={{
                          marginTop: index === 0 ? 10 : 10,
                          marginBottom: 10,
                        }}
                      >
                        <View
                          style={[
                            accommodationStyles.card,
                            { 
                              marginTop: 0,
                              marginBottom: 0,
                            }
                          ]}
                        >
                          <View style={accommodationStyles.leftColumn}>
                            {/* Night Badges and City */}
                            <View style={accommodationStyles.badgeWrapper}>
                              {nightBadges.map((badge, badgeIndex) => (
                                <View
                                  key={badgeIndex}
                                  style={accommodationStyles.badge}
                                >
                                  <Text style={accommodationStyles.badgeText}>
                                    {badge}
                                  </Text>
                                </View>
                              ))}
                              <Text style={accommodationStyles.nightsText}>
                                Nights at{" "}
                                <Text style={accommodationStyles.nightsCity}>
                                  {city || "Destination"}
                                </Text>
                              </Text>
                            </View>

                            {/* Check-in Date */}
                            <Text style={accommodationStyles.subText}>
                              Check-in on {formatDisplayDate(checkInDate)}
                            </Text>

                            {/* Hotel Name */}
                            <Text style={accommodationStyles.hotelName}>
                              {hotel.propertyName}
                            </Text>

                            {/* Star Rating */}
                            {starRating && getStarDisplay(starRating) && (
                              <Text style={accommodationStyles.starText}>
                                {getStarDisplay(starRating)}
                              </Text>
                            )}

                            {/* ROOMS and MEAL PLAN */}
                            <View style={accommodationStyles.infoRow}>
                              <View style={accommodationStyles.infoColumn}>
                                <Text style={accommodationStyles.infoHeading}>
                                  ROOMS
                                </Text>
                                <Text style={accommodationStyles.infoValue}>
                                  {hotel.roomName || "1 Deluxe Room"}
                                </Text>
                                {(selectedLead?.adults || selectedLead?.noOfRooms) && (
                                  <Text style={accommodationStyles.secondaryValue}>
                                    {selectedLead?.adults || 2} Pax
                                  </Text>
                                )}
                              </View>
                              <View style={accommodationStyles.infoColumn}>
                                <Text style={accommodationStyles.infoHeading}>
                                  MEAL PLAN
                                </Text>
                                <Text style={accommodationStyles.infoValue}>
                                  {hotel.mealPlan || "Breakfast"}
                                </Text>
                              </View>
                            </View>

                            {/* Similar Options */}
                            {Array.isArray(similarOptions) &&
                              similarOptions.length > 0 && (
                                <View>
                                  <Text style={accommodationStyles.similarLabel}>
                                    Similar Options
                                  </Text>
                                  <Text style={accommodationStyles.similarValue}>
                                    {similarOptions
                                      .slice(0, 3)
                                      .map((hotelOption) =>
                                        typeof hotelOption === "string"
                                          ? hotelOption
                                          : hotelOption?.propertyName ||
                                            hotelOption?.name
                                      )
                                      .filter(Boolean)
                                      .join(", ")}
                                  </Text>
                                </View>
                              )}
                          </View>

                          {/* Hotel Image */}
                          {hotelImage ? (
                            <View style={accommodationStyles.imageWrapper}>
                              <Image
                                source={{ uri: hotelImage }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </View>
                          ) : (
                            <View style={accommodationStyles.placeholder}>
                              <Text style={accommodationStyles.placeholderText}>
                                Image unavailable
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  {/* Satisfaction Question at bottom of Your Hotels */}
                  <View
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTopWidth: 3,
                      borderTopColor: "#FFA500",
                      backgroundColor: "#FFF7ED",
                      alignItems: "center",
                      paddingBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#EA580C",
                        marginBottom: 10,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Satisfied with Hotels?
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Link
                        src={`https://wa.me/919816661968?text=${encodeURIComponent(
                          `Customer is satisfied with the Hotels\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                        )}`}
                        style={{
                          backgroundColor: "rgba(34, 197, 94, 0.2)",
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "rgba(34, 197, 94, 0.4)",
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#1E293B",
                            fontWeight: "700",
                          }}
                        >
                          Yes
                        </Text>
                      </Link>
                      <Link
                        src={`https://wa.me/919816661968?text=${encodeURIComponent(
                          `Customer is not satisfied with the Hotels\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                        )}`}
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "rgba(239, 68, 68, 0.4)",
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#1E293B",
                            fontWeight: "700",
                          }}
                        >
                          No
                        </Text>
                      </Link>
                    </View>
                  </View>
                </View>
              </View>

              {/* Premium Transport Summary - Orange Theme */}
              <View style={{ width: "100%" }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 3,
                    borderColor: "#FFA500",
                    borderLeftWidth: 6,
                    borderLeftColor: "#EA580C",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  {/* Premium Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottomWidth: 3,
                      borderBottomColor: "#FFA500",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      <View style={{ 
                        width: 36, 
                        height: 36, 
                        backgroundColor: "#EA580C", 
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "#FFA500",
                      }}>
                        <View style={{ width: 18, height: 18 }}>
                          <Icons.Car width={18} height={18} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#EA580C",
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        Your Transport
                      </Text>
                    </View>
                  </View>

                  {packageSummary.transfer?.details?.length > 0 ? (
  packageSummary?.transfer?.details?.map((cab, index) => {
    const cabImage = cabImageCache[index] || null;
    
    return (
      <View
        key={cab?._id || index}
        style={[
          accommodationStyles.card,
          { 
            marginTop: index === 0 ? 10 : 10, 
            marginBottom: 12,
          }
        ]}
      >
        {/* Cab Details - Left Column */}
        <View style={accommodationStyles.leftColumn}>
          {/* Cab Name */}
          <Text style={accommodationStyles.hotelName}>
            {cab?.cabName || "Standard Vehicle"}
          </Text>

          {/* Cab Type */}
          <Text style={accommodationStyles.subText}>
            {cab?.cabType || "Sedan"}
          </Text>

          {/* Cab Info Row */}
          <View style={accommodationStyles.infoRow}>
            {cab?.vehicleCategory && (
              <View style={accommodationStyles.infoColumn}>
                <Text style={accommodationStyles.infoHeading}>
                  CATEGORY
                </Text>
                <Text style={accommodationStyles.infoValue}>
                  {cab.vehicleCategory}
                </Text>
              </View>
            )}

            <View style={accommodationStyles.infoColumn}>
              <Text style={accommodationStyles.infoHeading}>
                SEATING
              </Text>
              <Text style={accommodationStyles.infoValue}>
                {cab?.cabSeatingCapacity || "4"} Seater
              </Text>
            </View>
          </View>
        </View>

        {/* Cab Image - Right Side */}
        {cabImage ? (
          <View style={accommodationStyles.imageWrapper}>
            <Image
              source={{ uri: cabImage }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </View>
        ) : (
          <View style={accommodationStyles.placeholder}>
            <Text style={accommodationStyles.placeholderText}>
              Image unavailable
            </Text>
          </View>
        )}
      </View>
    );
  })
) : (
  <View
    style={{
      backgroundColor: "#F8FAFC",
      borderRadius: 6,
      padding: 5,
      marginBottom: 12,
    }}
  >
    <Text
      style={{
        fontSize: 10,
        color: "#1E293B",
        fontWeight: "600",
        marginBottom: 1,
      }}
    >
      Standard Vehicle
    </Text>
    <Text
      style={{
        fontSize: 9,
        color: "#1E293B",
        marginBottom: 2,
      }}
    >
      Sedan
    </Text>
    <View style={{ flexDirection: "row", gap: 5, marginTop: 2 }}>
      <View
        style={{
          backgroundColor: "#EFF6FF",
          paddingHorizontal: 4,
          paddingVertical: 1,
          borderRadius: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 8,
            color: "#2d2d44",
            fontWeight: "500",
          }}
        >
          {" "}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "#EFF6FF",
          paddingHorizontal: 4,
          paddingVertical: 1,
          borderRadius: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 8,
            color: "#2d2d44",
            fontWeight: "500",
          }}
        >
          4 Seater
        </Text>
      </View>
    </View>
  </View>
)}

                  {/* Satisfaction Question at bottom of Your Transport */}
                  <View
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTopWidth: 3,
                      borderTopColor: "#FFA500",
                      backgroundColor: "#FFF7ED",
                      alignItems: "center",
                      paddingBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#EA580C",
                        marginBottom: 10,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Satisfied with Transport?
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "center",
                      }}
                    >
                      <Link
                        src={`https://wa.me/919816661968?text=${encodeURIComponent(
                          `Customer is satisfied with the Transport\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                        )}`}
                        style={{
                          backgroundColor: "rgba(34, 197, 94, 0.2)",
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "rgba(34, 197, 94, 0.4)",
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#1E293B",
                            fontWeight: "700",
                          }}
                        >
                          Yes
                        </Text>
                      </Link>
                      <Link
                        src={`https://wa.me/919816661968?text=${encodeURIComponent(
                          `Customer is not satisfied with the Transport\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                        )}`}
                        style={{
                          backgroundColor: "rgba(239, 68, 68, 0.2)",
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "rgba(239, 68, 68, 0.4)",
                          textDecoration: "none",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#1E293B",
                            fontWeight: "700",
                          }}
                        >
                          No
                        </Text>
                      </Link>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Premium Journey Stats - Orange Theme */}
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                justifyContent: "space-around",
                paddingTop: 16,
                borderTopWidth: 3,
                borderTopColor: "#FFA500",
                position: "relative",
                zIndex: 2,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#FFF7ED",
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  minWidth: 90,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#EA580C",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Total Cities
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#EA580C",
                  }}
                >
                  {
                    new Set(
                      packageSummary.package?.itineraryDays?.map(
                        (day) => day.selectedItinerary?.cityName
                      )
                    ).size
                  }
                </Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#FFF7ED",
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  minWidth: 90,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#EA580C",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Total Days
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#EA580C",
                  }}
                >
                  {packageSummary.package?.itineraryDays?.length}
                </Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "#FFF7ED",
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                  minWidth: 90,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#EA580C",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Total Distance
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#EA580C",
                  }}
                >
                  {packageSummary.package?.itineraryDays?.reduce(
                    (acc, day) => acc + (day.selectedItinerary.distance || 0),
                    0
                  )}{" "}
                  km
                </Text>
              </View>
            </View>
          </View>

          {/* Main Content Section */}
          <View style={pdfStyles.mainContent}>
            {/* Unique Journey Itinerary Section for DemandSetu - Orange Theme */}
            <View
              style={{
                marginTop: 12,
                marginBottom: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#FFA500",
                overflow: "hidden",
                shadowColor: "#FFA500",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              {/* Orange Themed Header with Diagonal Pattern */}
              <View
                style={{
                  backgroundColor: "#EA580C",
                  padding: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Diagonal Pattern Background */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                  }}
                >
                  <View
                    style={{
                      width: "200%",
                      height: "200%",
                      backgroundColor: "#FFFFFF",
                      transform: [{ rotate: "45deg" }],
                      position: "absolute",
                      top: -50,
                      left: -50,
                    }}
                  />
                </View>

                {/* Header Content */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: 2,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        padding: 12,
                        borderRadius: 14,
                        borderWidth: 2,
                        borderColor: "rgba(255, 255, 255, 0.4)",
                      }}
                    >
                      <View style={{ width: 32, height: 32 }}>
                        <Icons.Map width={32} height={32} color="#FFFFFF" />
                      </View>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "bold",
                          color: "#FFFFFF",
                          marginBottom: 6,
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        Your Journey Itinerary
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.5)",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#FFFFFF",
                              fontWeight: "700",
                            }}
                          >
                            {packageSummary?.package?.itineraryDays?.length}{" "}
                            Days Journey
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: "#FFD700",
                            borderRadius: 3,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#FFD700",
                            fontWeight: "600",
                          }}
                        >
                          Unforgettable Experience
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Journey Stats - Orange Theme Cards */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                      }}
                    >
                      {
                        new Set(
                          packageSummary?.package?.itineraryDays?.map(
                            (day) => day.selectedItinerary?.cityName
                          )
                        ).size
                      }
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Cities
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                      }}
                    >
                      {packageSummary.hotels?.length || 0}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Hotels
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                      }}
                    >
                      {packageSummary?.package?.itineraryDays?.reduce(
                        (acc, day) =>
                          acc + (day.selectedItinerary.distance || 0),
                        0
                      )}
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Kilometers
                    </Text>
                  </View>
                </View>
              </View>

              {/* Route Overview - Orange Accent Design */}
              <View
                style={{
                  backgroundColor: "#FFF7ED",
                  padding: 18,
                  borderBottomWidth: 2,
                  borderBottomColor: "#FFA500",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EA580C",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Location width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#EA580C",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Travel Route
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {Array.from(
                    new Set(
                      packageSummary?.package?.itineraryDays?.map(
                        (day) => day.selectedItinerary?.cityName
                      )
                    )
                  ).map((cityName, index, cities) => (
                    <View
                      key={index}
                      style={{ 
                        flexDirection: "row", 
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#EA580C",
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: "#FFA500",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          shadowColor: "#EA580C",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 5,
                            borderWidth: 2,
                            borderColor: "#FFA500",
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#FFFFFF",
                            fontWeight: "700",
                            letterSpacing: 0.3,
                          }}
                        >
                          {cityName}
                        </Text>
                      </View>
                      {index < cities.length - 1 && (
                        <View
                          style={{
                            width: 20,
                            height: 3,
                            backgroundColor: "#FFA500",
                            marginHorizontal: 6,
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Day-by-Day Timeline - Orange Vertical Design */}
              <View style={{ padding: 16, gap: 16, backgroundColor: "#FFFFFF" }}>
                {packageSummary?.package?.itineraryDays?.map((day, index) => {
                  const dayData = day.selectedItinerary;
                  const dayHotel = getHotelForDay(day);
                  const previousDayHotel =
                    index > 0 ? getHotelForDay(itineraryDays[index - 1]) : null;
                  const isStartOfHotelStay =
                    !!dayHotel &&
                    dayHotel.propertyName !== previousDayHotel?.propertyName;
                  const consecutiveStayIndices = isStartOfHotelStay
                    ? getConsecutiveHotelIndices(index, dayHotel.propertyName)
                    : [];
                  const stayNightBadges = consecutiveStayIndices.map((dayIndex) =>
                    formatOrdinal(dayIndex + 1)
                  );
                  const hotelImageSource = isStartOfHotelStay
                    ? getHotelImageForDay(day)
                    : null;
                  const stayCity =
                    dayHotel?.cityName ||
                    dayHotel?.hotelCity ||
                    dayData?.cityName ||
                    "";
                  const similarOptions =
                    dayHotel?.similarHotels ||
                    dayHotel?.alternateHotels ||
                    dayHotel?.alternativeHotels;

                  // Calculate date
                  const startDate = selectedLead?.travelDate
                    ? new Date(selectedLead.travelDate)
                    : new Date();
                  const currentDate = new Date(startDate);
                  currentDate.setDate(startDate.getDate() + index);
                  const formattedDate = currentDate.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    }
                  );

                  return (
                    <View 
                      key={index} 
                      style={{ 
                        position: "relative",
                        marginBottom: 24,
                        paddingLeft: 0,
                      }}
                    >
                      {/* Orange Vertical Timeline Connector */}
                      {index !==
                        packageSummary.package.itineraryDays.length - 1 && (
                        <View
                          style={{
                            position: "absolute",
                            left: 24,
                            top: 50,
                            height: "100%",
                            width: 4,
                            backgroundColor: "#FFA500",
                            zIndex: 0,
                            borderRadius: 2,
                          }}
                        />
                      )}

                      {/* Day Card - Orange Accent Design */}
                      <View
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: "#FFA500",
                          borderLeftWidth: 6,
                          borderLeftColor: "#EA580C",
                          overflow: "hidden",
                          position: "relative",
                          marginLeft: 0,
                          marginBottom: 0,
                          shadowColor: "#FFA500",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.15,
                          shadowRadius: 6,
                        }}
                      >
                        {/* Day Header - Orange Gradient Style */}
                        <View
                          style={{
                            background: "linear-gradient(135deg, #EA580C 0%, #FFA500 100%)",
                            backgroundColor: "#EA580C",
                            padding: 16,
                            borderBottomWidth: 3,
                            borderBottomColor: "#FFA500",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          {/* Day Badge - Orange Circle */}
                          <View
                            style={{
                              width: 50,
                              height: 50,
                              backgroundColor: "#FFFFFF",
                              borderRadius: 25,
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 2,
                              borderWidth: 3,
                              borderColor: "#FFA500",
                              shadowColor: "#EA580C",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.3,
                              shadowRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#EA580C",
                              }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </Text>
                          </View>

                          {/* Date and Title - White Text on Orange */}
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 6,
                              }}
                            >
                              <View
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                  borderRadius: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: "#FFFFFF",
                                    fontWeight: "600",
                                  }}
                                >
                                  {formattedDate}
                                </Text>
                              </View>
                              <View style={{ width: 14, height: 14 }}>
                                <Icons.Location
                                  width={14}
                                  height={14}
                                  color="#FFD700"
                                />
                              </View>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#FFD700",
                                  fontWeight: "600",
                                }}
                              >
                                {dayData?.cityName}
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#FFFFFF",
                                marginBottom: 4,
                                lineHeight: 1.3,
                                flexShrink: 1,
                                minWidth: 0,
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              {dayData.itineraryTitle}
                            </Text>
                          </View>

                          {/* Quick Info Badges - Orange Theme */}
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginLeft: 8,
                            }}
                          >
                            {dayData.meals && (
                              <View
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                                  paddingHorizontal: 10,
                                  paddingVertical: 5,
                                  borderRadius: 10,
                                  borderWidth: 1,
                                  borderColor: "rgba(255, 255, 255, 0.4)",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 9,
                                    color: "#FFFFFF",
                                    fontWeight: "700",
                                  }}
                                >
                                  {dayData.meals}
                                </Text>
                              </View>
                            )}
                            {packageSummary?.activities &&
                              packageSummary.activities.filter(activity => activity.dayNumber === day.day).length > 0 && (
                                <View
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: "rgba(255, 255, 255, 0.4)",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 9,
                                      color: "#FFFFFF",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {packageSummary.activities.filter(activity => activity.dayNumber === day.day).length} Activities
                                  </Text>
                                </View>
                              )}
                          </View>
                        </View>

                        {/* Day Content - Orange Accent Design */}
                        <View style={{ padding: 16, gap: 10, paddingBottom: 18, backgroundColor: "#FFF7ED" }}>
                    {dayData.itineraryDescription && (
                            <View style={{ gap: 8, marginBottom: 10, marginTop: 0 }}>
                              {(() => {
                                let decodedText = decodeHtmlEntities(dayData.itineraryDescription);
                                // Clean up common issues: •&, &•, etc.
                                decodedText = decodedText
                                  .replace(/•&/g, "•")
                                  .replace(/&•/g, "•")
                                  .replace(/•\s*&/g, "•")
                                  .replace(/&\s*•/g, "•")
                                  .replace(/^•\s*&/g, "•")
                                  .replace(/^&\s*•/g, "•");
                                // Split by period followed by space, keeping the period with the sentence
                                const sentences = decodedText
                                  .split(/\.\s+/)
                                  .filter(s => s.trim().length > 0)
                                  .map(s => {
                                    let trimmed = s.trim();
                                    // Clean up any remaining •& patterns in each sentence
                                    trimmed = trimmed.replace(/•&/g, "•").replace(/&•/g, "•");
                                    // Add period back if it was removed by split (except for last sentence if it already has one)
                                    return trimmed.endsWith('.') ? trimmed : trimmed + '.';
                                  });
                                
                                return sentences.map((sentence, idx) => (
                                  <View
                                    key={idx}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "flex-start",
                                      marginBottom: idx < sentences.length - 1 ? 8 : 0,
                                      gap: 10,
                                    }}
                                  >
                                    <View
                                      style={{
                                        width: 8,
                                        height: 8,
                                        backgroundColor: "#EA580C",
                                        borderRadius: 4,
                                        marginTop: 5,
                                        flexShrink: 0,
                                        borderWidth: 2,
                                        borderColor: "#FFA500",
                                      }}
                                    />
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: "#1E293B",
                                        lineHeight: 1.6,
                                        flex: 1,
                                        fontWeight: "500",
                                      }}
                                    >
                                      {sentence}
                                    </Text>
                                  </View>
                                ));
                              })()}
                            </View>
                          )}

                          {/* City Areas - Orange Theme */}
                          {day.selectedItinerary?.cityArea &&
                            day.selectedItinerary.cityArea.length > 0 && (
                              <View style={{ gap: 10, marginTop: 10, marginBottom: 10 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 8,
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      backgroundColor: "#EA580C",
                                      borderRadius: 12,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <View style={{ width: 12, height: 12 }}>
                                      <Icons.Location
                                        width={12}
                                        height={12}
                                        color="#FFFFFF"
                                      />
                                    </View>
                                  </View>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: "bold",
                                      color: "#EA580C",
                                      textTransform: "uppercase",
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    Places to Visit
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {day.selectedItinerary.cityArea.map(
                                    (area, areaIndex) => {
                                      const areaText =
                                        typeof area === "string"
                                          ? area
                                          : area.placeName || area.city || "";
                                      return (
                                        <View
                                          key={areaIndex}
                                          style={{
                                            backgroundColor: "#FFFFFF",
                                            paddingHorizontal: 12,
                                            paddingVertical: 8,
                                            borderRadius: 10,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                            borderLeftWidth: 4,
                                            borderLeftColor: "#EA580C",
                                            borderWidth: 1,
                                            borderColor: "#FFA500",
                                          }}
                                        >
                                          <View
                                            style={{
                                              width: 12,
                                              height: 12,
                                              backgroundColor: "#FFA500",
                                              borderRadius: 6,
                                            }}
                                          />
                                          <Text
                                            style={{
                                              fontSize: 11,
                                              color: "#1E293B",
                                              fontWeight: "600",
                                            }}
                                          >
                                            {decodeHtmlEntities(areaText)}
                                          </Text>
                                        </View>
                                      );
                                    }
                                  )}
                                </View>
                              </View>
                            )}

                          {/* Compact Hotel Info - Show for every day */}
                          {dayHotel && (
                            <View style={[accommodationStyles.card, { marginTop: 12, marginBottom: 12 }]}>
                              <View style={accommodationStyles.leftColumn}>
                                <View style={accommodationStyles.badgeWrapper}>
                                  <View style={accommodationStyles.badge}>
                                    <Text style={accommodationStyles.badgeText}>
                                      {formatOrdinal(index + 1)} Night
                                    </Text>
                                  </View>
                                  <Text style={accommodationStyles.nightsText}>
                                    at{" "}
                                    <Text style={accommodationStyles.nightsCity}>
                                      {stayCity || "Destination"}
                                    </Text>
                                  </Text>
                                </View>

                                <Text style={accommodationStyles.subText}>
                                  Check-in on {formatDisplayDate(currentDate)}
                                </Text>

                                <Text style={accommodationStyles.hotelName}>
                                  {dayHotel.propertyName}
                                </Text>
                                {getStarDisplay(
                                  dayHotel.basicInfo?.hotelStarRating ||
                                    dayHotel.starRating
                                ) && (
                                  <Text style={accommodationStyles.starText}>
                                    {getStarDisplay(
                                      dayHotel.basicInfo?.hotelStarRating ||
                                        dayHotel.starRating
                                    )}
                                  </Text>
                                )}

                                <View style={accommodationStyles.infoRow}>
                                  <View style={accommodationStyles.infoColumn}>
                                    <Text style={accommodationStyles.infoHeading}>
                                      ROOMS
                                    </Text>
                                    <Text style={accommodationStyles.infoValue}>
                                      {dayHotel.roomName || "Standard Room"}
                                    </Text>
                                    
                                  </View>
                                  <View style={accommodationStyles.infoColumn}>
                                    <Text style={accommodationStyles.infoHeading}>
                                      MEAL PLAN
                                    </Text>
                                    <Text style={accommodationStyles.infoValue}>
                                      {dayHotel.mealPlan || "Breakfast"}
                                    </Text>
                                  </View>
                                </View>

                                {/* Similar Hotels from itineraryDays */}
                                {Array.isArray(day.similarhotel) &&
                                  day.similarhotel.length > 0 && (
                                    <View style={{ marginTop: 10 }}>
                                      <Text style={accommodationStyles.similarLabel}>
                                        Similar Hotels
                                      </Text>
                                      <View style={{ gap: 6, marginTop: 6 }}>
                                        {day.similarhotel.map((similarHotel, shIndex) => (
                                          <View
                                            key={shIndex}
                                            style={{
                                              backgroundColor: "#FFF7ED",
                                              padding: 10,
                                              borderRadius: 6,
                                              borderWidth: 2,
                                              borderColor: "#FFA500",
                                              flexDirection: "row",
                                              alignItems: "flex-start",
                                              gap: 8,
                                            }}
                                          >
                                            <View style={{ flex: 1 }}>
                                              <Text
                                                style={{
                                                  fontSize: 10,
                                                  fontWeight: "600",
                                                  color: "#1E293B",
                                                  marginBottom: 4,
                                                  lineHeight: 1.4,
                                                }}
                                              >
                                                {similarHotel.propertyName || "Hotel Name"}
                                              </Text>
                                            </View>
                                          </View>
                                        ))}
                                      </View>
                                    </View>
                                  )}
                                {/* Fallback to old similarOptions if similarhotel is not available */}
                                {(!day.similarhotel || day.similarhotel.length === 0) &&
                                  Array.isArray(similarOptions) &&
                                  similarOptions.length > 0 && (
                                    <View>
                                      <Text style={accommodationStyles.similarLabel}>
                                        Similar Options
                                      </Text>
                                      <Text style={accommodationStyles.similarValue}>
                                        {similarOptions
                                          .slice(0, 3)
                                          .map((hotelOption) =>
                                            typeof hotelOption === "string"
                                              ? hotelOption
                                              : hotelOption?.propertyName ||
                                                hotelOption?.name
                                          )
                                          .filter(Boolean)
                                          .join(", ")}
                                      </Text>
                                    </View>
                                  )}
                              </View>

                              {getHotelImageForDay(day) ? (
                                <View style={accommodationStyles.imageWrapper}>
                                  <Image
                                    source={{ uri: getHotelImageForDay(day) }}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </View>
                              ) : (
                                <View style={accommodationStyles.placeholder}>
                                  <Text style={accommodationStyles.placeholderText}>
                                    Image unavailable
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          {/* Activities - Orange Theme */}
                          {packageSummary?.activities &&
                            packageSummary.activities.filter(activity => activity.dayNumber === day.day).length > 0 && (
                              <View style={{ gap: 8, marginTop: 10, marginBottom: 10 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 8,
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 24,
                                      height: 24,
                                      backgroundColor: "#EA580C",
                                      borderRadius: 12,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <View style={{ width: 12, height: 12 }}>
                                      <Icons.Activity
                                        width={12}
                                        height={12}
                                        color="#FFFFFF"
                                      />
                                    </View>
                                  </View>
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      fontWeight: "bold",
                                      color: "#EA580C",
                                      textTransform: "uppercase",
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    Activities
                                  </Text>
                                </View>
                                <View style={{ gap: 6, paddingBottom: 4 }}>
                                  {packageSummary.activities
                                    .filter(activity => activity.dayNumber === day.day)
                                    .slice(0, 3)
                                    .map((activity, actIndex) => (
                                      <View
                                        key={actIndex}
                                        style={{
                                          gap: 6,
                                          padding: 12,
                                          backgroundColor: "#FFFFFF",
                                          borderRadius: 10,
                                          borderWidth: 2,
                                          borderColor: "#FFA500",
                                          borderLeftWidth: 4,
                                          borderLeftColor: "#EA580C",
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            color: "#EA580C",
                                            marginBottom: 2,
                                          }}
                                        >
                                          {activity.title}
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 11,
                                            color: "#1E293B",
                                            lineHeight: 1.5,
                                            fontWeight: "500",
                                          }}
                                        >
                                          {decodeHtmlEntities(activity.description)}
                                        </Text>
                                        {activity.thing_to_carry && (
                                          <View
                                            style={{
                                              gap: 4,
                                              marginTop: 4,
                                              padding: 8,
                                              backgroundColor: "#FFF7ED",
                                              borderRadius: 6,
                                              borderWidth: 1,
                                              borderColor: "#FFA500",
                                            }}
                                          >
                                            <Text
                                              style={{
                                                fontSize: 10,
                                                color: "#EA580C",
                                                fontWeight: "700",
                                              }}
                                            >
                                              Things to carry:
                                            </Text>
                                            {activity.thing_to_carry
                                              .replace(/<ul[^>]*>/gi, '')
                                              .replace(/<\/ul>/gi, '')
                                              .replace(/<li[^>]*>/gi, '• ')
                                              .replace(/<\/li>/gi, '\n')
                                              .replace(/&nbsp;/gi, ' ')
                                              .split('\n')
                                              .filter(item => item.trim())
                                              .map((item, itemIndex) => (
                                                <View
                                                  key={itemIndex}
                                                  style={{
                                                    flexDirection: "row",
                                                    alignItems: "flex-start",
                                                    gap: 6,
                                                  }}
                                                >
                                                  <View
                                                    style={{
                                                      width: 5,
                                                      height: 5,
                                                      backgroundColor: "#EA580C",
                                                      borderRadius: 2.5,
                                                      marginTop: 4,
                                                    }}
                                                  />
                                                  <Text
                                                    style={{
                                                      fontSize: 10,
                                                      color: "#1E293B",
                                                      lineHeight: 1.4,
                                                      flex: 1,
                                                    }}
                                                  >
                                                    {item.trim()}
                                                  </Text>
                                                </View>
                                              ))}
                                          </View>
                                        )}
                                      </View>
                                    ))}
                                  {packageSummary.activities.filter(activity => activity.dayNumber === day.day).length > 3 && (
                                    <View
                                      style={{
                                        padding: 8,
                                        backgroundColor: "#FFF7ED",
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: "#FFA500",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 10,
                                          color: "#EA580C",
                                          fontStyle: "italic",
                                          fontWeight: "600",
                                        }}
                                      >
                                        +{packageSummary.activities.filter(activity => activity.dayNumber === day.day).length - 3} more
                                        activities
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Satisfaction Question at bottom of Journey Itinerary */}
              <View
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                  borderTopWidth: 2,
                  borderTopColor: "#FFA500",
                  backgroundColor: "#FFF7ED",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: "#EA580C",
                    marginBottom: 10,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Satisfied with Journey Itinerary?
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  <Link
                    src={`https://wa.me/919816661968?text=${encodeURIComponent(
                      `Customer is satisfied with the Journey Itinerary\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                    )}`}
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "rgba(34, 197, 94, 0.4)",
                      textDecoration: "none",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#1E293B",
                        fontWeight: "700",
                      }}
                    >
                      Yes
                    </Text>
                  </Link>
                  <Link
                    src={`https://wa.me/919816661968?text=${encodeURIComponent(
                      `Customer is not satisfied with the Journey Itinerary\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                    )}`}
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: "rgba(239, 68, 68, 0.4)",
                      textDecoration: "none",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#1E293B",
                        fontWeight: "700",
                      }}
                    >
                      No
                    </Text>
                  </Link>
                </View>
              </View>
            </View>

            {/* Premium Inclusions Section - Orange Theme */}
            <View
              style={{
                marginTop: 16,
                marginBottom: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                borderWidth: 3,
                borderColor: "#FFA500",
                overflow: "hidden",
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              }}
            >
              {/* Premium Orange Gradient Header */}
              <View
                wrap={false}
                style={{
                  backgroundColor: "#EA580C",
                  padding: 18,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Animated Background Pattern */}
                <View
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 60,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -20,
                    width: 100,
                    height: 100,
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    borderRadius: 50,
                  }}
                />
                
                <View
                  wrap={false}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <View style={{ width: 24, height: 24 }}>
                      <Icons.Check width={24} height={24} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Package Inclusions
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "rgba(255, 255, 255, 0.9)",
                        fontWeight: "500",
                      }}
                    >
                      Everything included in your journey
                    </Text>
                  </View>
                </View>
              </View>

              {/* Premium Stats Cards - Orange Theme */}
              <View
                style={{
                  flexDirection: "row",
                  padding: 16,
                  backgroundColor: "#FFF7ED",
                  gap: 12,
                }}
              >
                {/* Total Hotels Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    borderLeftWidth: 5,
                    borderLeftColor: "#EA580C",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EA580C",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Hotel width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#EA580C",
                        marginBottom: 3,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Total Hotels
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#EA580C",
                      }}
                    >
                      {packageSummary.hotels?.length || 0}
                    </Text>
                  </View>
                </View>

                {/* Total Days Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    borderLeftWidth: 5,
                    borderLeftColor: "#EA580C",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: "#EA580C",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Calendar width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#EA580C",
                        marginBottom: 3,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Total Days
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#EA580C",
                      }}
                    >
                      {packageSummary.package?.itineraryDays?.length || 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Premium Inclusions List */}
              <View style={{ 
                padding: 20, 
                gap: 10,
                backgroundColor: "#FFFFFF",
              }}>
                {/* Hotels Summary Card */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: "#EA580C",
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 18, height: 18 }}>
                      <Icons.Hotel width={18} height={18} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: "#1E293B",
                      lineHeight: 1.6,
                      fontWeight: "600",
                    }}
                  >
                    {packageSummary.hotels?.length || 0} Premium Hotels
                    accommodation with {packageSummary.package?.itineraryDays?.length || 0}{" "}
                    days curated itinerary.
                  </Text>
                </View>

                {/* Main Inclusions - Premium Orange Design */}
                {packageSummary?.package?.packageInclusions && (() => {
                  const parsedItems = parseHtmlContent(packageSummary.package.packageInclusions);
                  const allItems = [];
                  parsedItems.forEach((textSegments) => {
                    const textContent = Array.isArray(textSegments) 
                      ? textSegments.map(seg => seg.text).join("")
                      : textSegments;
                    const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
                    if (lines.length > 0) {
                      lines.forEach(line => {
                        allItems.push(line.trim());
                      });
                    } else if (textContent.trim().length > 0) {
                      allItems.push(textContent.trim());
                    }
                  });
                  
                  return (
                    <View style={{ 
                      gap: 8,
                    }}>
                      {allItems.map((item, index) => {
                        const formattedText = formatInclusionExclusionText(item);
                        
                        return (
                          <View
                            key={index}
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              gap: 14,
                              padding: 12,
                              backgroundColor: "#FFF7ED",
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: "#FFA500",
                              borderLeftWidth: 4,
                              borderLeftColor: "#EA580C",
                              marginBottom: 4,
                            }}
                          >
                            {/* Premium Orange Check Icon */}
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: "#EA580C",
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                borderWidth: 2,
                                borderColor: "#FFA500",
                              }}
                            >
                              <View style={{ width: 10, height: 10 }}>
                                <Icons.Check width={10} height={10} color="#FFFFFF" />
                              </View>
                            </View>
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 12,
                                color: "#1E293B",
                                lineHeight: 1.7,
                                fontWeight: "500",
                              }}
                            >
                              {formattedText}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            </View>

            {/* Premium Exclusions Section - Orange/Red Theme */}
            <View style={{
              marginBottom: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              borderWidth: 3,
              borderColor: "#DC2626",
              overflow: "hidden",
              shadowColor: "#DC2626",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
            }}>
              {/* Premium Red Gradient Header */}
              <View style={{
                backgroundColor: "#DC2626",
                padding: 18,
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Animated Background Pattern */}
                <View
                  style={{
                    position: "absolute",
                    top: -30,
                    left: -30,
                    width: 120,
                    height: 120,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 60,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    backgroundColor: "rgba(234, 88, 12, 0.2)",
                    borderRadius: 50,
                  }}
                />
                
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    <View style={{ width: 24, height: 24 }}>
                      <Icons.Close width={24} height={24} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      marginBottom: 4,
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}>
                      Package Exclusions
                    </Text>
                    <Text style={{
                      fontSize: 11,
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: "500",
                    }}>
                      Items not included in your package
                    </Text>
                  </View>
                </View>
              </View>

              {/* Main Exclusions - Premium Red Design */}
              {packageSummary?.package?.packageExclusions && (() => {
                const parsedItems = parseHtmlContent(packageSummary.package.packageExclusions);
                const allItems = [];
                parsedItems.forEach((textSegments) => {
                  const textContent = Array.isArray(textSegments) 
                    ? textSegments.map(seg => seg.text).join("")
                    : textSegments;
                  const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
                  if (lines.length > 0) {
                    lines.forEach(line => {
                      allItems.push(line.trim());
                    });
                  } else if (textContent.trim().length > 0) {
                    allItems.push(textContent.trim());
                  }
                });
                
                return (
                  <View style={{ padding: 20, gap: 8, backgroundColor: "#FEF2F2" }}>
                    {allItems.map((item, index) => {
                      const formattedText = formatInclusionExclusionText(item);
                      
                      return (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: 14,
                            padding: 12,
                            backgroundColor: "#FFFFFF",
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#FCA5A5",
                            borderLeftWidth: 4,
                            borderLeftColor: "#DC2626",
                            marginBottom: 4,
                          }}
                        >
                          {/* Premium Red X Icon */}
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: "#DC2626",
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              borderWidth: 2,
                              borderColor: "#FCA5A5",
                            }}
                          >
                            <View style={{ width: 10, height: 10 }}>
                              <Icons.Close width={10} height={10} color="#FFFFFF" />
                            </View>
                          </View>
                          <Text style={{
                            flex: 1,
                            fontSize: 12,
                            color: "#1E293B",
                            lineHeight: 1.7,
                            fontWeight: "500",
                          }}>
                            {formattedText}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
              
              {/* Custom Exclusions - Premium Design */}
              {packageSummary?.package?.customExclusions?.map(
                (section, index) => (
                  <View
                    key={index}
                    style={{
                      padding: 20,
                      borderTopWidth: index === 0 && !packageSummary?.package?.packageExclusions ? 0 : 3,
                      borderTopColor: "#FCA5A5",
                      backgroundColor: index % 2 === 0 ? "#FEF2F2" : "#FFFFFF",
                      marginBottom: 8,
                    }}
                  >
                    {/* Custom Exclusion Header */}
                    <View
                      wrap={false}
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginBottom: 14,
                        backgroundColor: "#DC2626",
                        padding: 14,
                        borderRadius: 12,
                        alignItems: "center",
                        borderLeftWidth: 5,
                        borderLeftColor: "#EA580C",
                        shadowColor: "#DC2626",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          backgroundColor: "rgba(255, 255, 255, 0.25)",
                          borderRadius: 18,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: "rgba(255, 255, 255, 0.4)",
                        }}
                      >
                        <View style={{ width: 18, height: 18 }}>
                          <Icons.Close width={18} height={18} color="#FFFFFF" />
                        </View>
                      </View>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}>
                        {section.name}
                      </Text>
                    </View>
                    {/* Parse HTML content */}
                    {(() => {
                      const parsedItems = parseHtmlContent(section.description);
                      const allItems = [];
                      parsedItems.forEach((textSegments) => {
                        const textContent = Array.isArray(textSegments) 
                          ? textSegments.map(seg => seg.text).join("")
                          : textSegments;
                        const lines = textContent.split(/\n+/).filter(line => line.trim().length > 0);
                        if (lines.length > 0) {
                          lines.forEach(line => {
                            allItems.push(line.trim());
                          });
                        } else if (textContent.trim().length > 0) {
                          allItems.push(textContent.trim());
                        }
                      });
                      
                      return (
                        <View style={{ gap: 8 }}>
                          {allItems.map((item, idx) => {
                            const formattedText = formatInclusionExclusionText(item);
                            
                            return (
                              <View
                                key={idx}
                                style={{
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                  gap: 14,
                                  padding: 12,
                                  backgroundColor: "#FFFFFF",
                                  borderRadius: 10,
                                  borderWidth: 1,
                                  borderColor: "#FCA5A5",
                                  borderLeftWidth: 4,
                                  borderLeftColor: "#DC2626",
                                  marginBottom: 4,
                                }}
                              >
                                {/* Premium Red X Icon */}
                                <View
                                  style={{
                                    width: 24,
                                    height: 24,
                                    backgroundColor: "#DC2626",
                                    borderRadius: 12,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    borderWidth: 2,
                                    borderColor: "#FCA5A5",
                                  }}
                                >
                                  <View style={{ width: 10, height: 10 }}>
                                    <Icons.Close width={10} height={10} color="#FFFFFF" />
                                  </View>
                                </View>
                                <Text style={{
                                  flex: 1,
                                  fontSize: 12,
                                  color: "#1E293B",
                                  lineHeight: 1.7,
                                  fontWeight: "500",
                                }}>
                                  {formattedText}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      );
                    })()}
                  </View>
                )
              )}
            </View>
            <AccountDetailsSection />

            {/* Premium Package Cost Section - Orange Theme */}
            <View
              style={{
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              {/* Premium Pay Now Card */}
              <View
                style={{
                  backgroundColor: "#EA580C",
                  borderRadius: 20,
                  padding: 24,
                  position: "relative",
                  overflow: "hidden",
                  borderWidth: 3,
                  borderColor: "#FFA500",
                  shadowColor: "#EA580C",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
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
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 100,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -40,
                    left: -40,
                    width: 160,
                    height: 160,
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    borderRadius: 80,
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
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 50,
                          height: 50,
                          backgroundColor: "rgba(255, 255, 255, 0.25)",
                          borderRadius: 25,
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
                      <View>
                        <Text
                          style={{
                            fontSize: 22,
                            fontWeight: "bold",
                            color: "#FFFFFF",
                            marginBottom: 4,
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            textTransform: "uppercase",
                            letterSpacing: 1.5,
                          }}
                        >
                          Pay Now
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "rgba(255, 255, 255, 0.95)",
                            fontWeight: "500",
                          }}
                        >
                          Pay 40% to confirm your booking
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 3,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                      minWidth: 150,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        fontFamily: "Helvetica-Bold",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      ₹
                      {showMargin
                        ? finalTotal.toFixed(0)
                        : packageSummary.totals.grandTotal}
                    </Text>
                  </View>
                </View>

                {/* Satisfaction Question with WhatsApp Links */}
                <View
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTopWidth: 2,
                    borderTopColor: "rgba(255, 255, 255, 0.3)",
                    alignItems: "center",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: "rgba(255, 255, 255, 0.95)",
                      marginBottom: 10,
                      fontWeight: "600",
                    }}
                  >
                    Satisfied with price?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "center",
                    }}
                  >
                    <Link
                      src={`https://wa.me/919816661968?text=${encodeURIComponent(
                        `Customer is satisfied with the price\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                      )}`}
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.3)",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: "rgba(34, 197, 94, 0.5)",
                        textDecoration: "none",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFFFFF",
                          fontWeight: "700",
                        }}
                      >
                        Yes
                      </Text>
                    </Link>
                    <Link
                      src={`https://wa.me/919816661968?text=${encodeURIComponent(
                        `Customer is not satisfied with the price\n\nPackage: ${packageSummary.package?.packageName || "N/A"}\nCustomer: ${selectedLead?.name || "N/A"}\nDuration: ${packageSummary.package?.duration || "N/A"}`
                      )}`}
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.3)",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: "rgba(239, 68, 68, 0.5)",
                        textDecoration: "none",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFFFFF",
                          fontWeight: "700",
                        }}
                      >
                        No
                      </Text>
                    </Link>
                  </View>
                </View>
              </View>

              {/* Premium Payment Information Card */}
              <View
                style={{
                  marginTop: 18,
                  padding: 18,
                  backgroundColor: "#FFF7ED",
                  borderRadius: 16,
                  borderWidth: 3,
                  borderColor: "#FFA500",
                  borderLeftWidth: 6,
                  borderLeftColor: "#EA580C",
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
                    width: 100,
                    height: 100,
                    backgroundColor: "rgba(234, 88, 12, 0.1)",
                    borderBottomLeftRadius: 100,
                  }}
                />
                
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 14,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: "#EA580C",
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 3,
                      borderColor: "#FFA500",
                    }}
                  >
                    <View style={{ width: 22, height: 22 }}>
                      <Icons.Info width={22} height={22} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#EA580C",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Important Payment Information
                  </Text>
                </View>
                <View style={{ gap: 10, position: "relative", zIndex: 2 }}>
                  {[
                    "40% advance payment required to confirm booking",
                    "Balance payment due 15 days before travel date",
                    "Prices are subject to availability and may change",
                  ].map((item, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        padding: 12,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#FFA500",
                        borderLeftWidth: 4,
                        borderLeftColor: "#EA580C",
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#EA580C",
                          borderRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "#FFFFFF",
                          }}
                        >
                          •
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#1E293B",
                          lineHeight: 1.6,
                          fontWeight: "500",
                          flex: 1,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Premium Travel Expert Section - Orange Theme */}
            <View
              style={{
                marginBottom: 28,
                marginTop: 28,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                borderWidth: 3,
                borderColor: "#FFA500",
                padding: 20,
                position: "relative",
                overflow: "hidden",
                shadowColor: "#EA580C",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
              }}
            >
              {/* Premium Orange Header */}
              <View
                style={{
                  backgroundColor: "#EA580C",
                  padding: 18,
                  borderRadius: 16,
                  marginBottom: 18,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative Background */}
                <View
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 60,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -20,
                    width: 100,
                    height: 100,
                    backgroundColor: "rgba(255, 215, 0, 0.2)",
                    borderRadius: 50,
                  }}
                />
                
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
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
                    <View style={{ width: 28, height: 28 }}>
                      <Icons.User width={28} height={28} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "rgba(255, 255, 255, 0.9)",
                        marginBottom: 4,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                      }}
                    >
                      Travel Expert
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      {packageSummary.package?.agentName || "Our Travel Agent"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Agent Profile Card */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 18,
                  gap: 16,
                  padding: 16,
                  backgroundColor: "#FFF7ED",
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: "#FFA500",
                }}
              >
                {/* Premium Avatar */}
                <View
                  style={{
                    width: 70,
                    height: 70,
                    backgroundColor: "#EA580C",
                    borderRadius: 35,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: "#FFA500",
                    shadowColor: "#EA580C",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                    }}
                  >
                    {(packageSummary.package?.agentName ||
                      "P")[0].toUpperCase()}
                  </Text>
                </View>
                {/* Agent Details */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#EA580C",
                      marginBottom: 6,
                    }}
                  >
                    {packageSummary.package?.agentName || "Our Travel Agent"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#EA580C",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <View style={{ width: 14, height: 14 }}>
                        <Icons.Star width={14} height={14} color="#FFD700" />
                      </View>
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#FFFFFF",
                          fontWeight: "bold",
                        }}
                      >
                        5+ Years Experience
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Contact Information Cards */}
              <View style={{ gap: 12, marginBottom: 16 }}>
                {/* Phone Card */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    borderLeftWidth: 5,
                    borderLeftColor: "#EA580C",
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: "#EA580C",
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Phone width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#EA580C",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 4,
                      }}
                    >
                      Phone
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        color: "#1E293B",
                      }}
                    >
                      {packageSummary.package?.agentPhone || "+91-8353056000"}
                    </Text>
                  </View>
                </View>

                {/* Email Card */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    backgroundColor: "#FFF7ED",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    borderLeftWidth: 5,
                    borderLeftColor: "#EA580C",
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: "#EA580C",
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View style={{ width: 20, height: 20 }}>
                      <Icons.Email width={20} height={20} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#EA580C",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 4,
                      }}
                    >
                      Email
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        color: "#1E293B",
                      }}
                    >
                      info@demandsetutours.com
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quotation Timestamp */}
              <View
                style={{
                  paddingTop: 16,
                  borderTopWidth: 2,
                  borderTopColor: "#FFA500",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "#FFF7ED",
                  padding: 12,
                  borderRadius: 10,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: "#EA580C",
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View style={{ width: 16, height: 16 }}>
                    <Icons.Calendar width={16} height={16} color="#FFFFFF" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#EA580C",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 2,
                    }}
                  >
                    Quotation Created
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#1E293B",
                      fontWeight: "600",
                    }}
                  >
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Environmental Note */}
            <View style={pdfStyles.environmentalNote}>
              <Text style={pdfStyles.environmentalText}>
                Please think twice before printing this mail. Save paper, it's
                good for the environment.
              </Text>
            </View>
            {/* Break to new page before Policy Section */}

            {/* Premium Date Change Policy Section - Orange Theme */}
            <View
              style={{
                marginTop: 24,
                marginBottom: 24,
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                borderWidth: 3,
                borderColor: "#DC2626",
                overflow: "hidden",
                shadowColor: "#DC2626",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
              }}
            >
              {/* Premium Red Header */}
              <View
                style={{
                  backgroundColor: "#DC2626",
                  padding: 20,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative Background */}
                <View
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 150,
                    height: 150,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: 75,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -30,
                    left: -30,
                    width: 120,
                    height: 120,
                    backgroundColor: "rgba(234, 88, 12, 0.2)",
                    borderRadius: 60,
                  }}
                />
                
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
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
                    <View style={{ width: 28, height: 28 }}>
                      <Icons.Calendar width={28} height={28} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        marginBottom: 4,
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        textTransform: "uppercase",
                        letterSpacing: 1.5,
                      }}
                    >
                      Date Change Policy
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "rgba(255, 255, 255, 0.95)",
                        fontWeight: "500",
                      }}
                    >
                      Important information about date modifications
                    </Text>
                  </View>
                </View>
              </View>

              {/* Policy Container */}
              <View
                style={{
                  padding: 20,
                  backgroundColor: "#FEF2F2",
                }}
              >
                {/* Your Current Policy Header */}
                <View
                  style={{
                    backgroundColor: "#EA580C",
                    padding: 16,
                    borderRadius: 14,
                    marginBottom: 20,
                    borderWidth: 3,
                    borderColor: "#FFA500",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative Elements */}
                  <View
                    style={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 80,
                      height: 80,
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: 40,
                    }}
                  />
                  
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        borderRadius: 22,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "rgba(255, 255, 255, 0.4)",
                      }}
                    >
                      <View style={{ width: 22, height: 22 }}>
                        <Icons.Info width={22} height={22} color="#FFFFFF" />
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      Your Current Policy
                    </Text>
                  </View>
                </View>

                {/* Premium Policy Timeline */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 3,
                    borderColor: "#DC2626",
                    marginBottom: 20,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Timeline Visual */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        backgroundColor: "#DC2626",
                        borderRadius: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 4,
                        borderColor: "#FCA5A5",
                        shadowColor: "#DC2626",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "bold",
                          color: "#FFFFFF",
                        }}
                      >
                        ✕
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          height: 4,
                          backgroundColor: "#DC2626",
                          borderRadius: 2,
                          marginBottom: 8,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          color: "#DC2626",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          marginBottom: 4,
                        }}
                      >
                        After Booking
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#1E293B",
                          marginBottom: 2,
                        }}
                      >
                        Non Refundable
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#DC2626",
                          fontWeight: "600",
                        }}
                      >
                        Date Change is not allowed
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Policy Points - Premium Design */}
                <View style={{ gap: 14 }}>
                  {[
                    "These are non-refundable amounts as per the current components attached. In the case of component change/modifications, the policy will change accordingly.",
                    "Date Change fees don't include any fare change in the components on the new date. Fare difference as applicable will be charged separately.",
                    "Date Change will depend on the availability of the components on the new requested date.",
                    "Please note, TCS once collected cannot be refunded in case of any cancellation / modification. You can claim the TCS amount as adjustment against Income Tax payable at the time of filing the return of income.",
                    "Cancellation charges shown is exclusive of all taxes and taxes will be added as per applicable.",
                  ].map((point, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 14,
                        padding: 16,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: "#FCA5A5",
                        borderLeftWidth: 5,
                        borderLeftColor: "#DC2626",
                        shadowColor: "#DC2626",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 6,
                      }}
                    >
                      {/* Premium Red Bullet */}
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          backgroundColor: "#DC2626",
                          borderRadius: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          borderWidth: 2,
                          borderColor: "#FCA5A5",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#FFFFFF",
                          }}
                        >
                          •
                        </Text>
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 12,
                          color: "#1E293B",
                          lineHeight: 1.7,
                          fontWeight: "500",
                        }}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Add the footer */}
        <CompanyFooter />
      </Page>
    </Document>
  );
};

const AccountDetailsSection = () => (
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
    {/* Premium Orange Header */}
    <View
      style={{
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          backgroundColor: "#EA580C",
          padding: 18,
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative Background Elements */}
        <View
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 150,
            height: 150,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 75,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            backgroundColor: "rgba(255, 215, 0, 0.2)",
            borderRadius: 60,
          }}
        />
        
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            position: "relative",
            zIndex: 2,
          }}
        >
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
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Bank Details
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.95)",
                fontWeight: "500",
              }}
            >
              Secure payment information for your booking
            </Text>
          </View>
        </View>
      </View>
    </View>

    {/* Premium Bank Cards Grid */}
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

// Add this component for the footer
const CompanyFooter = () => (
  <View
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#2d2d44",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: "hidden",
    }}
  >
    {/* Decorative Top Border */}
    <View
      style={{
        height: 3,
        background:
          "linear-gradient(90deg, #FFA500 0%, #FFD700 50%, #FFA500 100%)",
      }}
    />

    {/* Main Footer Content */}
    <View style={{ padding: 16 }}>
      {/* Company Brand Section */}
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
        {/* Left - Logo & Brand */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
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

        {/* Right - Trust Badges */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 215, 0, 0.2)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 215, 0, 0.3)",
            }}
          >
            <Text
              style={{
                fontSize: 8,
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              ★ 5+ Years
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(34, 197, 94, 0.3)",
            }}
          >
            <Text
              style={{
                fontSize: 8,
                color: "#22C55E",
                fontWeight: "bold",
              }}
            >
              ✓ Trusted
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information - Compact Grid */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        {/* Contact Info */}
        <View style={{ flex: 1, gap: 6 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icons.Phone width={8} height={8} color="#FFFFFF" />
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
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icons.Email width={8} height={8} color="#FFFFFF" />
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

        {/* Address & Website */}
        <View style={{ flex: 1, gap: 6, alignItems: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icons.Location width={8} height={8} color="#FFFFFF" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 9,
                fontWeight: "500",
                textAlign: "right",
              }}
            >
              Shimla, HP
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icons.Globe width={8} height={8} color="#FFFFFF" />
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 9,
                fontWeight: "500",
                textAlign: "right",
              }}
            >
              demandsetutours.com
            </Text>
          </View>
        </View>
      </View>

      {/* Social Media & Copyright Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Social Media Icons */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Icons.Facebook width={10} height={10} color="#FFFFFF" />
          </View>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Icons.Instagram width={10} height={10} color="#FFFFFF" />
          </View>
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: 6,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Icons.Twitter width={10} height={10} color="#FFFFFF" />
          </View>
        </View>

        {/* Copyright */}
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: 8,
            fontWeight: "500",
          }}
        >
          © {new Date().getFullYear()} Demandsetu. All rights reserved.
        </Text>
      </View>
    </View>

    {/* Bottom Accent Line */}
    <View
      style={{
        height: 2,
        background:
          "linear-gradient(90deg, #FFA500 0%, #FFD700 50%, #FFA500 100%)",
      }}
    />
  </View>
);

export default DemandSetuPDF;
