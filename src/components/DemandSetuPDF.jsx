"use client";

import { useEffect, useState } from "react";
import { usePackage } from "../context/PackageContext";
import { Icons, pdfStyles } from "./newFile";

import { Document, Page, View, Text } from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";

// Add this helper function at the top of the component
const decodeHtmlEntities = (text) => {
  if (!text) return "";
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .trim();
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
}) => {
  const [destinationImages, setDestinationImages] = useState([]);

  useEffect(() => {
    const fetchDestinationImages = async () => {
      try {
        // Extract location from package name and create a better search query
        const packageName = packageSummary.package?.packageName || "";

        // Extract main destination keywords
        let searchTerm = packageName
          .toLowerCase()
          .replace(/tour package|tour|package|heaven/gi, "")
          .trim();

        // Add "tourism" or "landscape" to get better travel-related images
        searchTerm = `${searchTerm} tourism landscape`;

        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${searchTerm}&per_page=3&orientation=landscape`,
          {
            headers: {
              Authorization: `s7bpT61DC6XnYdLXzNIb9VOeh3HJUifJ1SDaypfNL5X361wMLohDXVhu`,
            },
          }
        );
        const data = await response.json();

        if (data.photos && data.photos.length >= 3) {
          setDestinationImages(data.photos.map((photo) => photo.src.large));
        } else {
          // If not enough relevant images, try a more generic search
          const fallbackResponse = await fetch(
            `https://api.pexels.com/v1/search?query=${searchTerm} mountains nature&per_page=3&orientation=landscape`,
            {
              headers: {
                Authorization: `s7bpT61DC6XnYdLXzNIb9VOeh3HJUifJ1SDaypfNL5X361wMLohDXVhu`,
              },
            }
          );
          const fallbackData = await fallbackResponse.json();
          setDestinationImages(
            fallbackData.photos.map((photo) => photo.src.large)
          );
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        // Fallback to default images
        setDestinationImages([
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg",
          "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg",
        ]);
      }
    };

    fetchDestinationImages();
  }, [packageSummary.package?.packageName]);

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

          {/* Header Section */}
          <View
            style={[
              pdfStyles.headerContainer,
              { flexDirection: "row", justifyContent: "space-between" },
            ]}
          >
            {/* Left Section */}
            <View style={{ flex: 0.7 }}>
              <View style={pdfStyles.customerHeader}>
                <Text style={[pdfStyles.customerName, { color: "#000000" }]}>
                  {selectedLead?.name || "N/A"}'s
                </Text>
                <Text style={[pdfStyles.tripText, { color: "#000000" }]}>
                  trip to
                </Text>
              </View>

              <Text style={[pdfStyles.destinationName, { color: "#000000" }]}>
                {packageSummary.package?.packageName || "Package Name"}
              </Text>

              <View style={pdfStyles.packageInfoRow}>
                <Text style={pdfStyles.durationText}>
                  {packageSummary.package?.duration || "5N/6D"}
                </Text>
                <View style={pdfStyles.customizableBadge}>
                  <Text style={pdfStyles.customizableText}>
                    {packageSummary.package?.customizablePackage
                      ? "Customizable"
                      : "Fixed"}
                  </Text>
                </View>
                <Text style={[pdfStyles.packageTypeText, { color: "#000000" }]}>
                  {packageSummary.package?.packageType || "Best Package"}
                </Text>
              </View>
            </View>

            {/* Right Section - Grand Total */}
            <View
              style={{
                flex: 0.3,
                alignItems: "flex-end",
                paddingTop: 10,
                paddingRight: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#000000",
                  marginBottom: 4,
                }}
              >
                Total Package Cost
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "bold",
                  color: "#000000",
                }}
              >
                Rs.
                {showMargin
                  ? finalTotal.toFixed(0)
                  : packageSummary.totals.grandTotal}
              </Text>
              {activeDiscountPercentage > 0 && (
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>
                  {`with Discount ${activeDiscountPercentage}%`}
                </Text>
              )}

              <View style={{ flexDirection: "row", gap: 4, minWidth: 80 }}>
                <Text style={{ fontSize: 9, color: "#1E293B" }}>
                  For Adults: {selectedLead?.adults || "0"} , Children:
                  {selectedLead?.kids || "0"}
                </Text>
              </View>
            </View>
          </View>

          <View style={pdfStyles.headerDivider} />

          {/* Ultra Compact Travel Details */}
          <View
            style={{
              margin: "12px 0",
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            {/* Compact Header */}
            <View
              style={{
                background: "linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)",
                padding: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
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
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    padding: 6,
                    borderRadius: 6,
                  }}
                >
                  <View style={{ width: 12, height: 12 }}>
                    <Icons.User width={12} height={12} color="#FFFFFF" />
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#000",
                  }}
                >
                  Travel Details
                </Text>
              </View>

              {/* Quick Stats */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {(selectedLead?.adults || 0) + (selectedLead?.kids || 0)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      color: "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedLead?.noOfRooms || "0"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ultra Compact Content */}
            <View style={{ padding: 8, gap: 8 }}>
              {/* Combined Info Row */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                    gap: 4,
                  }}
                >
                  <View style={{ width: 10, height: 10 }}>
                    <Icons.Profile width={10} height={10} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: "#1E293B",
                    }}
                  >
                    Personal & Travel Info
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      minWidth: 100,
                      backgroundColor: "#FFFFFF",
                      padding: 6,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                        marginBottom: 1,
                      }}
                    >
                      Name
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.name || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: 100,
                      backgroundColor: "#FFFFFF",
                      padding: 6,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                        marginBottom: 1,
                      }}
                    >
                      Contact
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.mobile || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: 100,
                      backgroundColor: "#FFFFFF",
                      padding: 6,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                        marginBottom: 1,
                      }}
                    >
                      Date
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.travelDate
                        ? new Date(selectedLead.travelDate).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: 100,
                      backgroundColor: "#FFFFFF",
                      padding: 6,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                        marginBottom: 1,
                      }}
                    >
                      Duration
                    </Text>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.nights || "0"}N/{selectedLead?.days || "0"}
                      D
                    </Text>
                  </View>
                </View>
              </View>

              {/* Guest Stats Row */}
              <View
                style={{
                  backgroundColor: "#F0FDF4",
                  padding: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                    gap: 4,
                  }}
                >
                  <View style={{ width: 10, height: 10 }}>
                    <Icons.Group width={10} height={10} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: "#1E293B",
                    }}
                  >
                    Guest Summary
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 8,
                      borderRadius: 6,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.adults || "0"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                      }}
                    >
                      Adults
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 8,
                      borderRadius: 6,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.kids || "0"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                      }}
                    >
                      Children
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 8,
                      borderRadius: 6,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.noOfRooms || "0"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 8,
                        color: "#64748B",
                      }}
                    >
                      Rooms
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={pdfStyles.leadDetailsSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
              }}
            >
              <View style={{ width: 14, height: 14 }}>
                <Icons.User width={14} height={14} color="#2d2d44" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#1E293B",
                }}
              >
                Package Description
              </Text>
            </View>
            {packageSummary?.package?.packageDescription && (
              <View
                style={{
                  marginBottom: 16,
                  padding: 12,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: "#2d2d44",
                }}
              >
                {parseHtmlContent(packageSummary.package.packageDescription).map((textSegments, idx) => (
                  <Text
                    key={idx}
                    style={{
                      fontSize: 14,
                      color: "#374151",
                      lineHeight: 1.5,
                      marginBottom: 4,
                    }}
                  >
                    {Array.isArray(textSegments) ? (
                      textSegments.map((segment, segIdx) => (
                        <Text 
                          key={segIdx} 
                          style={segment.bold ? { fontWeight: 'bold', fontFamily: 'Helvetica-Bold' } : {}}
                        >
                          {segment.text}
                        </Text>
                      ))
                    ) : (
                      textSegments
                    )}
                  </Text>
                ))}
              </View>
            )}
          </View>
          {/* Enhanced Itinerary Overview with hotels and cab info */}
          <View
            style={{
              marginTop: 12,
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#F8FAFC",
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
                gap: 6,
              }}
            >
              <View style={{ width: 14, height: 14 }}>
                <Icons.Map width={14} height={14} color="#000000" />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#1E293B",
                }}
              >
                Journey Overview
              </Text>
            </View>

            {/* Cities Timeline */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 12,
                borderBottom: "1px solid #E2E8F0",
                paddingBottom: 12,
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
                        backgroundColor: "#FFFFFF",
                        borderRadius: 4,
                        padding: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        minWidth: 120,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          backgroundColor: "#EFF6FF",
                          borderRadius: 11,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: "#2d2d44",
                          }}
                        >
                          {daysInCity}
                        </Text> */}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: "#1E293B",
                          }}
                        >
                          {cityInfo?.cityName}
                        </Text>
                        {/* <Text
                          style={{
                            fontSize: 9,
                            color: "#64748B",
                          }}
                        >
                          {daysInCity} {daysInCity > 1 ? "Days" : "Day"}
                        </Text> */}
                      </View>
                      {!isLastDayInCity && (
                        <View
                          style={{
                            position: "absolute",
                            right: -8,
                            top: "50%",
                            marginTop: -4,
                            width: 6,
                            height: 6,
                            borderWidth: 1.5,
                            borderColor: "#2d2d44",
                            borderRadius: 3,
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

            {/* Hotels and Transport Info with Costs */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {/* Hotels Summary */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      borderBottom: "1px solid #E2E8F0",
                      paddingBottom: 5,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={{ width: 14, height: 14 }}>
                        <Icons.Hotel width={14} height={14} color="#2d2d44" />
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "bold",
                          color: "#1E293B",
                          marginLeft: 5,
                        }}
                      >
                        Your Hotels
                      </Text>
                    </View>
                  </View>

                  {packageSummary.hotels?.map((hotel, index) => (
                    <View
                      key={index}
                      style={{
                        marginBottom:
                          index === packageSummary.hotels.length - 1 ? 0 : 6,
                        backgroundColor: "#F8FAFC",
                        borderRadius: 6,
                        padding: 5,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: "#1E293B",
                            fontWeight: "600",
                            marginBottom: 1,
                            flex: 1,
                          }}
                        >
                          {hotel.propertyName}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
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
                            {hotel.basicInfo?.hotelStarRating}★
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 8,
                            color: "#64748B",
                            fontWeight: "500",
                          }}
                        >
                          {hotel.mealPlan}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Transport Summary */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      borderBottom: "1px solid #E2E8F0",
                      paddingBottom: 5,
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={{ width: 14, height: 14 }}>
                        <Icons.Car width={14} height={14} color="#2d2d44" />
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "bold",
                          color: "#1E293B",
                          marginLeft: 5,
                        }}
                      >
                        Your Transport
                      </Text>
                    </View>
                  </View>

                  {packageSummary.transfer?.details?.length > 0 ? (
                    packageSummary.transfer.details.map((cab, index) => (
                      <View
                        key={cab?._id || index}
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderRadius: 6,
                          padding: 5,
                          marginBottom: 6, // Optional spacing between multiple cabs
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
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
                            {cab?.cabName || "Standard Vehicle"}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 9,
                            color: "#1E293B",
                            marginBottom: 2,
                          }}
                        >
                          {cab?.cabType || "Sedan"}
                        </Text>

                        <View
                          style={{ flexDirection: "row", gap: 5, marginTop: 2 }}
                        >
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
                              {cab?.vehicleCategory || ""}
                            </Text>
                          </View>

                         
                        </View>
                      </View>
                    ))
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 6,
                        padding: 5,
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
                      <View
                        style={{ flexDirection: "row", gap: 5, marginTop: 2 }}
                      >
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
                </View>
              </View>
            </View>

            {/* Journey Stats */}
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                justifyContent: "space-around",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: "#E2E8F0",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#64748B",
                  }}
                >
                  Total Cities
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#1E293B",
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
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#64748B",
                  }}
                >
                  Total Days
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#1E293B",
                  }}
                >
                  {packageSummary.package?.itineraryDays?.length}
                </Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    color: "#64748B",
                  }}
                >
                  Total Distance
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "#1E293B",
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
            {/* Modern Journey Itinerary Section */}
            <View
              style={{
                marginTop: 20,
                marginBottom: 24,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Modern Gradient Header */}
              <View
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: 20,
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
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 40,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -15,
                    left: -15,
                    width: 60,
                    height: 60,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 30,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        padding: 10,
                        borderRadius: 12,
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <View style={{ width: 28, height: 28 }}>
                        <Icons.Map width={28} height={28} color="#1E293B" />
                      </View>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 26,
                          fontWeight: "bold",
                          color: "#1E293B",
                          marginBottom: 4,
                        }}
                      >
                        Your Journey Itinerary
                      </Text>
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
                            borderRadius: 12,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#1E293B",
                              fontWeight: "600",
                            }}
                          >
                            {packageSummary?.package?.itineraryDays?.length}{" "}
                            Days
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#1E293B",
                          }}
                        >
                          of Adventure & Discovery
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Journey Stats */}
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      padding: 12,
                      borderRadius: 12,
                      backdropFilter: "blur(10px)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#1E293B",
                        marginBottom: 4,
                      }}
                    >
                      JOURNEY HIGHLIGHTS
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#1E293B",
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
                            fontSize: 8,
                            color: "#1E293B",
                          }}
                        >
                          Cities
                        </Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#1E293B",
                          }}
                        >
                          {packageSummary.hotels?.length || 0}
                        </Text>
                        <Text
                          style={{
                            fontSize: 8,
                            color: "#1E293B",
                          }}
                        >
                          Hotels
                        </Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#1E293B",
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
                            fontSize: 8,
                            color: "#1E293B",
                          }}
                        >
                          Km
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Compact City Route Overview */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ width: 16, height: 16, marginRight: 8 }}>
                    <Icons.Location width={16} height={16} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1E293B",
                    }}
                  >
                    Route Overview
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
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
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          backgroundColor: "#EFF6FF",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: "#BFDBFE",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: "#2d2d44",
                            borderRadius: 4,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#2d2d44",
                            fontWeight: "500",
                          }}
                        >
                          {cityName}
                        </Text>
                      </View>
                      {index < cities.length - 1 && (
                        <View
                          style={{
                            width: 16,
                            height: 2,
                            backgroundColor: "#CBD5E1",
                            marginHorizontal: 4,
                          }}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Compact Day-by-Day Timeline */}
              <View style={{ padding: 20, gap: 16 }}>
                {packageSummary?.package?.itineraryDays?.map((day, index) => {
                  const dayData = day.selectedItinerary;
                  const dayHotel = packageSummary.hotels.find(
                    (hotel) => hotel.day === day.day
                  );

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
                    <View key={index} style={{ position: "relative" }}>
                      {/* Timeline Connector */}
                      {index !==
                        packageSummary.package.itineraryDays.length - 1 && (
                        <View
                          style={{
                            position: "absolute",
                            left: 20,
                            top: 40,
                            bottom: -16,
                            width: 2,
                            backgroundColor: "#E2E8F0",
                            zIndex: 1,
                          }}
                        />
                      )}

                      {/* Day Card */}
                      <View
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          position: "relative",
                          width: "100%",
                        }}
                      >
                        {/* Day Header */}
                        <View
                          style={{
                            backgroundColor: "#F8FAFC",
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: "#E2E8F0",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 16,
                            // Remove justifyContent: 'space-between' to allow flexible width
                          }}
                        >
                          {/* Day Badge */}
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              backgroundColor: "#2d2d44",
                              borderRadius: 20,
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              zIndex: 2,
                              marginRight: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                color: "#FFFFFF",
                              }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </Text>
                          </View>

                          {/* Date and Title in a vertical stack, but allow title to use flex space */}
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#64748B",
                                marginBottom: 2,
                              }}
                            >
                              {formattedDate}
                            </Text>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: "#1E293B",
                                marginBottom: 4,
                                lineHeight: 1.2,
                              }}
                              wrap={true}
                            >
                              {dayData.itineraryTitle}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <View style={{ width: 12, height: 12 }}>
                                <Icons.Location
                                  width={12}
                                  height={12}
                                  color="#64748B"
                                />
                              </View>
                              <Text style={{ fontSize: 12, color: "#64748B" }}>
                                {dayData?.cityName}
                              </Text>
                            </View>
                          </View>

                          {/* Quick Info Badges */}
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 6,
                              marginLeft: 8,
                            }}
                          >
                            {dayData.meals && (
                              <View
                                style={{
                                  backgroundColor: "#ECFDF5",
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 12,
                                  borderWidth: 1,
                                  borderColor: "#A7F3D0",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 9,
                                    color: "#059669",
                                    fontWeight: "600",
                                  }}
                                >
                                  {dayData.meals}
                                </Text>
                              </View>
                            )}
                            {dayData.activities &&
                              dayData.activities.length > 0 && (
                                <View
                                  style={{
                                    backgroundColor: "#EFF6FF",
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor: "#BFDBFE",
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 9,
                                      color: "#2d2d44",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {dayData.activities.length} Activities
                                  </Text>
                                </View>
                              )}
                          </View>
                        </View>

                        {/* Day Content */}
                        <View style={{ padding: 16, gap: 12, width: "100%" }}>
                          {/* Description */}
                          {dayData.itineraryDescription && (
                            <View style={{ width: "100%", marginBottom: 8, paddingRight: 8 }}>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#475569",
                                  lineHeight: 1.6,
                                  textAlign: "left",
                                }}
                              >
                                {decodeHtmlEntities(dayData.itineraryDescription)}
                              </Text>
                            </View>
                          )}

                          {/* Compact City Areas */}
                          {day.selectedItinerary?.cityArea &&
                            day.selectedItinerary.cityArea.length > 0 && (
                              <View style={{ gap: 8 }}>
                                <Text
                                  style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: "#1E293B",
                                    marginBottom: 4,
                                  }}
                                >
                                  Places to Visit:
                                </Text>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 6,
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
                                            backgroundColor: "#F1F5F9",
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 8,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                          }}
                                        >
                                          <View style={{ width: 8, height: 8 }}>
                                            <Icons.Location
                                              width={8}
                                              height={8}
                                              color="#64748B"
                                            />
                                          </View>
                                          <Text
                                            style={{
                                              fontSize: 10,
                                              color: "#475569",
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

                          {/* Compact Hotel Info */}
                          {dayHotel && (
                            <View
                              style={{
                                backgroundColor: "#F8FAFC",
                                borderRadius: 8,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: "#E2E8F0",
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                  marginBottom: 6,
                                }}
                              >
                                <View style={{ width: 14, height: 14 }}>
                                  <Icons.Hotel
                                    width={14}
                                    height={14}
                                    color="#2d2d44"
                                  />
                                </View>
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: "#1E293B",
                                  }}
                                >
                                  Accommodation
                                </Text>
                              </View>
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: "#1E293B",
                                  marginBottom: 4,
                                }}
                              >
                                {dayHotel.propertyName}
                              </Text>
                              <View style={{ flexDirection: "row", gap: 8 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <View style={{ width: 10, height: 10 }}>
                                    <Icons.Room
                                      width={10}
                                      height={10}
                                      color="#64748B"
                                    />
                                  </View>
                                  <Text
                                    style={{ fontSize: 9, color: "#64748B" }}
                                  >
                                    {dayHotel.roomName}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <View style={{ width: 10, height: 10 }}>
                                    <Icons.Food
                                      width={10}
                                      height={10}
                                      color="#64748B"
                                    />
                                  </View>
                                  <Text
                                    style={{ fontSize: 9, color: "#64748B" }}
                                  >
                                    {dayHotel.mealPlan}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          )}

                          {/* Compact Activities */}
                          {dayData.activities &&
                            dayData.activities.length > 0 && (
                              <View style={{ gap: 6 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <View style={{ width: 12, height: 12 }}>
                                    <Icons.Activity
                                      width={12}
                                      height={12}
                                      color="#2d2d44"
                                    />
                                  </View>
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "600",
                                      color: "#1E293B",
                                    }}
                                  >
                                    Activities
                                  </Text>
                                </View>
                                <View style={{ gap: 4, width: "100%" }}>
                                  {dayData.activities
                                    .slice(0, 3)
                                    .map((activity, actIndex) => (
                                      <View
                                        key={actIndex}
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "flex-start",
                                          gap: 6,
                                          width: "100%",
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: 4,
                                            height: 4,
                                            backgroundColor: "#2d2d44",
                                            borderRadius: 2,
                                            marginTop: 4,
                                          }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 10,
                                            color: "#475569",
                                            flex: 1,
                                          }}
                                          wrap={true}
                                        >
                                          {decodeHtmlEntities(activity)}
                                        </Text>
                                      </View>
                                    ))}
                                  {dayData.activities.length > 3 && (
                                    <Text
                                      style={{
                                        fontSize: 9,
                                        color: "#64748B",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      +{dayData.activities.length - 3} more
                                      activities
                                    </Text>
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
            </View>

            {/* Modern Inclusions Section */}
            <View
              style={{
                marginTop: 20,
                marginBottom: 16,
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E2E8F0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View style={{ width: 16, height: 16 }}>
                  <Icons.Check width={16} height={16} color="#16A34A" />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: "#1E293B",
                  }}
                >
                  Package Inclusions
                </Text>
              </View>

              {/* Package Summary Stats */}
              <View
                style={{
                  flexDirection: "row",
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E2E8F0",
                  backgroundColor: "#FAFAFA",
                  gap: 12,
                }}
              >
                {/* Total Hotels Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#EFF6FF",
                    borderRadius: 6,
                    padding: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View style={{ width: 20, height: 20 }}>
                    <Icons.Hotel width={20} height={20} color="#2d2d44" />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 8, color: "#64748B", marginBottom: 2 }}
                    >
                      TOTAL HOTELS
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#1E293B",
                      }}
                    >
                      {packageSummary.hotels?.length || 0} Hotels
                    </Text>
                  </View>
                </View>

                {/* Total Days Card */}
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#F0FDF4",
                    borderRadius: 6,
                    padding: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View style={{ width: 20, height: 20 }}>
                    <Icons.Calendar width={20} height={20} color="#16A34A" />
                  </View>
                  <View>
                    <Text
                      style={{ fontSize: 8, color: "#64748B", marginBottom: 2 }}
                    >
                      TOTAL DAYS
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#1E293B",
                      }}
                    >
                      {packageSummary.package?.itineraryDays?.length || 0} Days
                    </Text>
                  </View>
                </View>
              </View>

              {/* Inclusions List */}
              <View style={{ padding: 16, gap: 12 }}>
                {/* Hotels */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <View style={{ width: 14, height: 14 }}>
                    <Icons.Hotel width={14} height={14} color="#2d2d44" />
                  </View>
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    {packageSummary.hotels?.length || 0} Hotels accommodation
                    with {packageSummary.package?.itineraryDays?.length || 0}{" "}
                    days itinerary
                  </Text>
                </View>

                {/* Main Inclusions - Fixed HTML parsing */}
                {packageSummary?.package?.packageInclusions && (
                  <View style={pdfStyles.exclusionsList}>
                    {parseHtmlContent(packageSummary.package.packageInclusions).map((textSegments, index) => (
                      <View key={index} style={pdfStyles.exclusionItem}>
                        <View style={pdfStyles.bulletPoint} />
                        <Text style={pdfStyles.exclusionText}>
                          {Array.isArray(textSegments) ? (
                            textSegments.map((segment, segIdx) => (
                              <Text 
                                key={segIdx} 
                                style={segment.bold ? { fontWeight: 'bold', fontFamily: 'Helvetica-Bold' } : {}}
                              >
                                {segment.text}
                              </Text>
                            ))
                          ) : (
                            textSegments
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Package Exclusions Section */}
            <View style={pdfStyles.exclusionsContainer}>
              {/* Header */}
              <View style={pdfStyles.exclusionsHeader}>
                <Icons.Close />
                <Text style={pdfStyles.exclusionsTitle}>
                  Package Exclusions
                </Text>
              </View>

              {/* Main Exclusions - Fixed HTML parsing */}
              {packageSummary?.package?.packageExclusions && (
                <View style={pdfStyles.exclusionsList}>
                  {parseHtmlContent(packageSummary.package.packageExclusions).map((textSegments, index) => (
                    <View key={index} style={pdfStyles.exclusionItem}>
                      <View style={pdfStyles.bulletPoint} />
                      <Text style={pdfStyles.exclusionText}>
                        {Array.isArray(textSegments) ? (
                          textSegments.map((segment, segIdx) => (
                            <Text 
                              key={segIdx} 
                              style={segment.bold ? { fontWeight: 'bold', fontFamily: 'Helvetica-Bold' } : {}}
                            >
                              {segment.text}
                            </Text>
                          ))
                        ) : (
                          textSegments
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {/* Custom Exclusions - Fixed HTML parsing and bullet points */}
              {packageSummary?.package?.customExclusions?.map(
                (section, index) => (
                  <View key={index} style={pdfStyles.customExclusion}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 16,
                        backgroundColor: "#FEF2F2",
                        padding: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Icons.Close />
                      <Text style={pdfStyles.customExclusionTitle}>
                        {section.name}
                      </Text>
                    </View>
                    {/* Parse HTML content properly with list items and formatting */}
                    {parseHtmlContent(section.description).map((textSegments, idx) => (
                      <View key={idx} style={pdfStyles.exclusionItem}>
                        <View style={pdfStyles.bulletPoint} />
                        <Text style={pdfStyles.exclusionText}>
                          {Array.isArray(textSegments) ? (
                            textSegments.map((segment, segIdx) => (
                              <Text 
                                key={segIdx} 
                                style={segment.bold ? { fontWeight: 'bold', fontFamily: 'Helvetica-Bold' } : {}}
                              >
                                {segment.text}
                              </Text>
                            ))
                          ) : (
                            textSegments
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
            <AccountDetailsSection />

            {/* Package Cost Section */}
            <View style={pdfStyles.costContainer}>
              {/* Package Cost Card */}
              <View
                style={{
                  backgroundColor: "rgb(45 45 68)",
                  borderRadius: 10,
                  padding: 20,
                }}
              >
                <View style={pdfStyles.rowBetween}>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                      }}
                    >
                      Pay Now
                    </Text>
                    <Text
                      style={{ fontSize: 10, color: "#E2E8F0", marginTop: 4 }}
                    >
                      Pay 40% of the total amount to confirm the booking
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      fontFamily: "Helvetica-Bold",
                    }}
                  >
                    Rs.
                    {showMargin
                      ? finalTotal.toFixed(0)
                      : packageSummary.totals.grandTotal}
                  </Text>
                </View>
              </View>

              {/* Payment Terms Card */}
              <View
                style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#FFFBEB",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#FEF3C7",
                }}
              >
                <View
                  style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                >
                  <View style={{ width: 14, height: 14 }}>
                    <Icons.Info width={14} height={14} color="rgb(45 45 68)" />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#92400E",
                      fontWeight: "500",
                    }}
                  >
                    Important Payment Information
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#92400E",
                    lineHeight: 1.5,
                    marginTop: 8,
                  }}
                >
                  • 40% advance payment required to confirm booking{"\n"}•
                  Balance payment due 15 days before travel date{"\n"}• Prices
                  are subject to availability and may change
                </Text>
              </View>
            </View>

            {/* Enhanced Agent Info Box */}
            <View
              style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: "#F8FAFC",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                position: "relative",
                marginTop: 24,
              }}
            >
              {/* Decorative Element */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  backgroundColor: "#EFF6FF",
                  borderBottomLeftRadius: 60,
                  opacity: 0.5,
                }}
              />

              {/* Agent Profile Section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 12,
                }}
              >
                {/* Agent Avatar Circle */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#BFDBFE",
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#2d2d44",
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
                      fontSize: 8,
                      color: "#64748B",
                      marginBottom: 2,
                    }}
                  >
                    TRAVEL EXPERT
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#1E293B",
                      marginBottom: 2,
                    }}
                  >
                    {packageSummary.package?.agentName || "Our Travel Agent"}
                  </Text>
                </View>
              </View>

              {/* Contact Information */}
              <View
                style={{
                  marginLeft: 52,
                  gap: 6,
                }}
              >
                {/* Phone */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View style={{ width: 12, height: 12 }}>
                    <Icons.Phone width={12} height={12} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#64748B",
                    }}
                  >
                    {packageSummary.package?.agentPhone || "+91-8353056000"}
                  </Text>
                </View>

                {/* Email */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View style={{ width: 12, height: 12 }}>
                    <Icons.Email width={12} height={12} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#64748B",
                    }}
                  >
                    info@demandsetutours.com
                  </Text>
                </View>
              </View>

              {/* Quotation Timestamp */}
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: "#E2E8F0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View style={{ width: 12, height: 12 }}>
                  <Icons.Calendar width={12} height={12} color="#64748B" />
                </View>
                <Text
                  style={{
                    fontSize: 9,
                    color: "#64748B",
                    fontStyle: "italic",
                  }}
                >
                  Quotation Created on {new Date().toLocaleDateString()}{" "}
                  {new Date().toLocaleTimeString()}
                </Text>
              </View>

              {/* Experience Badge */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "#EFF6FF",
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View style={{ width: 10, height: 10 }}>
                  <Icons.Star width={10} height={10} color="#2d2d44" />
                </View>
                <Text
                  style={{
                    fontSize: 8,
                    color: "#2d2d44",
                    fontWeight: "bold",
                  }}
                >
                  5+ Years Experience
                </Text>
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

            {/* Date Change Policy Section */}
            <View style={pdfStyles.policySection}>
              <Text style={pdfStyles.policyTitle}>Date Change Policy</Text>

              <View style={pdfStyles.policyContainer}>
                <View style={pdfStyles.currentPolicyHeader}>
                  <Text style={pdfStyles.currentPolicyText}>
                    Your Current Policy
                  </Text>
                </View>

                {/* Policy Timeline Bar */}
                <View style={pdfStyles.policyTimelineContainer}>
                  <View style={pdfStyles.policyTimeline}>
                    <View style={pdfStyles.timelineGradient} />
                    <View style={pdfStyles.cancelIcon}>
                      <Text style={pdfStyles.cancelX}>✕</Text>
                    </View>
                  </View>
                  <Text style={pdfStyles.afterBookingText}>AFTER BOOKING</Text>
                  <Text style={pdfStyles.nonRefundableText}>
                    Non Refundable
                  </Text>
                  <Text style={pdfStyles.noChangeText}>
                    Date Change is not allowed
                  </Text>
                </View>

                {/* Policy Points */}
                <View style={pdfStyles.policyPoints}>
                  <View style={pdfStyles.policyPoint}>
                    <View style={pdfStyles.bulletPoint} />
                    <Text style={pdfStyles.policyText}>
                      These are non-refundable amounts as per the current
                      components attached. In the case of component
                      change/modifications, the policy will change accordingly.
                    </Text>
                  </View>

                  <View style={pdfStyles.policyPoint}>
                    <View style={pdfStyles.bulletPoint} />
                    <Text style={pdfStyles.policyText}>
                      Date Change fees don't include any fare change in the
                      components on the new date. Fare difference as applicable
                      will be charged separately.
                    </Text>
                  </View>

                  <View style={pdfStyles.policyPoint}>
                    <View style={pdfStyles.bulletPoint} />
                    <Text style={pdfStyles.policyText}>
                      Date Change will depend on the availability of the
                      components on the new requested date.
                    </Text>
                  </View>

                  <View style={pdfStyles.policyPoint}>
                    <View style={pdfStyles.bulletPoint} />
                    <Text style={pdfStyles.policyText}>
                      Please note, TCS once collected cannot be refunded in case
                      of any cancellation / modification. You can claim the TCS
                      amount as adjustment against Income Tax payable at the
                      time of filing the return of income.
                    </Text>
                  </View>

                  <View style={pdfStyles.policyPoint}>
                    <View style={pdfStyles.bulletPoint} />
                    <Text style={pdfStyles.policyText}>
                      Cancellation charges shown is exclusive of all taxes and
                      taxes will be added as per applicable.
                    </Text>
                  </View>
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
  <View style={pdfStyles.accountDetailsSection}>
    <Text style={pdfStyles.accountDetailsHeader}>BANK DETAILS</Text>

    {/* Bank Grid Section */}
    <View style={pdfStyles.bankGrid}>
      {/* PNB Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>PUNJAB NATIONAL BANK</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>0894002100008473</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>DEMAND SETU</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Account Type:</Text>
          <Text style={pdfStyles.bankValue}>Current</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>PUNB0089400</Text>
        </View>
      </View>

      {/* HDFC Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>HDFC BANK</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>50200092959140</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>DEMAND SETU</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Account Type:</Text>
          <Text style={pdfStyles.bankValue}>Current</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>HDFC0004116</Text>
        </View>
      </View>

      {/* Axis Bank Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>AXIS BANK</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>920020015004799</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>DEMAND SETU</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Account Type:</Text>
          <Text style={pdfStyles.bankValue}>Current</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>UTIB0003277</Text>
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
