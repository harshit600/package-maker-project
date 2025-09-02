"use client";

import { useEffect, useState } from "react";
import { usePackage } from "../context/PackageContext";
import { Icons, pdfStyles } from "./newFile";

import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  Svg,
  Path,
  BlobProvider,
} from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Update the PackagePDF component
const DemandSetuPDF = ({
  packageSummary,
  showMargin,
  marginAmount,
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

  // Update styles to use the theme colors
  const styles = {
    header: {
      backgroundColor: theme.primary,
      // ... other styles
    },
    title: {
      color: theme.secondary,
      // ... other styles
    },
    // ... update other style objects to use theme colors
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
      >
        {/* Existing content */}
        <View
          style={{
            position: "relative", // This ensures content stays above the background
            zIndex: 1,
          }}
        >
          {/* New Professional Header */}
          <View style={pdfStyles.topHeader}>
            <View style={pdfStyles.brandSection}>
              <View style={pdfStyles.brandInfo}>
                <Text style={pdfStyles.contactText}>
                  Demandsetu Tour and travel
                </Text>
                <Image
                  style={{ marginTop: 5, width: 70, height: 20 }}
                  source={{
                    uri: "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1747808971/cropped-Black-Modern-Business-Logo2-96x26-1_fmui6p.png",
                    method: "GET",
                    headers: {
                      "Cache-Control": "no-cache",
                    },
                  }}
                  cache={false}
                />
              </View>
            </View>
            <View style={pdfStyles.contactSection}>
              <View style={pdfStyles.contactItem}>
                <Icons.Email style={pdfStyles.contactIcon} />
                <Text style={pdfStyles.contactText}>info@plutotours.com</Text>
              </View>
            </View>
          </View>
          <View style={pdfStyles.headerDivider} />

          {/* Image Gallery Section */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginVertical: 20,
              marginHorizontal: 20,
            }}
          >
            {destinationImages.map((imageUrl, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  height: 200,
                  borderRadius: 8,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Image
                  source={imageUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </View>
            ))}
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

              <View style={{ flexDirection: "row", gap: 4, minWidth: 80 }}>
                <Text style={{ fontSize: 9, color: "#1E293B" }}>
                  For Adults: {selectedLead?.adults || "0"} , Children:
                  {selectedLead?.kids || "0"}
                </Text>
              </View>
            </View>
          </View>

          <View style={pdfStyles.headerDivider} />

          {/* Add Lead Details Section right after the header and before Journey Overview */}
          <View
            style={{
              margin: "20px 0",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
            {/* Section Header */}
            <View
              style={{
                backgroundColor: "#2d2d44",
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  padding: 8,
                  borderRadius: 8,
                }}
              >
                <View style={{ width: 14, height: 14 }}>
                  <Icons.User width={14} height={14} color="rgb(45 45 68)" />
                </View>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#FFFFFF",
                }}
              >
                Your Travel Details
              </Text>
            </View>

            {/* Details Content */}
            <View
              style={{
                padding: 20,
                gap: 24,
              }}
            >
              {/* Personal Information Card */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 8,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <View style={{ width: 14, height: 14 }}>
                    <Icons.Profile width={14} height={14} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Personal Information
                  </Text>
                </View>

                <View style={{ gap: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#FFFFFF",
                      padding: 10,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 12, color: "#64748B" }}>
                      Full Name
                    </Text>
                    <Text
                      style={{
                        flex: 2,
                        fontSize: 12,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.name || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#FFFFFF",
                      padding: 10,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 12, color: "#64748B" }}>
                      Contact
                    </Text>
                    <Text
                      style={{
                        flex: 2,
                        fontSize: 12,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.mobile || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#FFFFFF",
                      padding: 10,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 12, color: "#64748B" }}>
                      Email
                    </Text>
                    <Text
                      style={{
                        flex: 2,
                        fontSize: 12,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.email || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Travel Information Card */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 8,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <View style={{ width: 14, height: 14 }}>
                    <Icons.Calendar width={14} height={14} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Travel Information
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
                      flex: 1,
                      minWidth: 150,
                      backgroundColor: "#FFFFFF",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        marginBottom: 4,
                      }}
                    >
                      Travel Date
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
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
                      minWidth: 150,
                      backgroundColor: "#FFFFFF",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        marginBottom: 4,
                      }}
                    >
                      Duration
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.nights || "0"} Nights /{" "}
                      {selectedLead?.days || "0"} Days
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      minWidth: 150,
                      backgroundColor: "#FFFFFF",
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#64748B",
                        marginBottom: 4,
                      }}
                    >
                      Package Type
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#1E293B",
                        fontWeight: "500",
                      }}
                    >
                      {selectedLead?.packageType || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Guest Information Card */}
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 8,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 8,
                  }}
                >
                  <View style={{ width: 14, height: 14 }}>
                    <Icons.Group width={14} height={14} color="#2d2d44" />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#1E293B",
                    }}
                  >
                    Guest Information
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.adults || "0"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}
                    >
                      Adults
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.kids || "0"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}
                    >
                      Children
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 8,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#2d2d44",
                      }}
                    >
                      {selectedLead?.noOfRooms || "0"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}
                    >
                      Rooms
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Enhanced Journey Itinerary Section */}
          <View style={{
            marginTop: 24,
            marginBottom: 32,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}>
            {/* Elegant Header with Background Pattern */}
            <View style={{
              backgroundColor: "#2d2d44",
              padding: 24,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative Pattern */}
              <View style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 150,
                height: "100%",
                opacity: 0.1,
                backgroundColor: "#FFFFFF",
                transform: "skewX(-45deg)",
              }} />
              
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}>
                <View style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: 12,
                  borderRadius: 12,
                }}>
                  <Icons.Map width={24} height={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    marginBottom: 4,
                  }}>
                    Your Journey Itinerary
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: "#E2E8F0",
                    opacity: 0.8,
                  }}>
                    {packageSummary?.package?.itineraryDays?.length} Days of Unforgettable Experiences
                  </Text>
                </View>
              </View>
            </View>

            {/* Journey Progress Bar */}
            <View style={{
              padding: 16,
              backgroundColor: "#F8FAFC",
              borderBottomWidth: 1,
              borderBottomColor: "#E2E8F0",
            }}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}>
                {packageSummary?.package?.itineraryDays?.map((day, index) => {
                  const isNewCity = index === 0 || 
                    day.selectedItinerary.cityName !== 
                    packageSummary.package.itineraryDays[index - 1].selectedItinerary.cityName;

                  return (
                    <View key={index} style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                    }}>
                      {/* City Marker */}
                      {isNewCity && (
                        <View style={{
                          backgroundColor: "#2d2d44",
                          padding: 8,
                          borderRadius: 12,
                          position: "relative",
                          zIndex: 2,
                        }}>
                          <Text style={{
                            color: "#FFFFFF",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}>
                            {day.selectedItinerary.cityName}
                          </Text>
                        </View>
                      )}
                      
                      {/* Connection Line */}
                      {index < packageSummary.package.itineraryDays.length - 1 && (
                        <View style={{
                          flex: 1,
                          height: 2,
                          backgroundColor: "#E2E8F0",
                          position: "relative",
                        }}>
                          <View style={{
                            position: "absolute",
                            top: -4,
                            left: "50%",
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#CBD5E1",
                            marginLeft: -4,
                          }} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Detailed Day Cards */}
            <View style={{ padding: 20, gap: 24 }}>
              {packageSummary?.package?.itineraryDays?.map((day, index) => (
                <View key={index} style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  {/* Day Header */}
                  <View style={{
                    backgroundColor: "#F8FAFC",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#E2E8F0",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    {/* Day Number Badge */}
                    <View style={{
                      backgroundColor: "#2d2d44",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <Text style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}>
                        Day {String(index + 1).padStart(2, "0")}
                      </Text>
                    </View>

                    {/* Location Badge */}
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#EFF6FF",
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 20,
                    }}>
                      <Icons.Location width={14} height={14} color="#2d2d44" />
                      <Text style={{
                        color: "#2d2d44",
                        fontSize: 12,
                        fontWeight: "500",
                      }}>
                        {day.selectedItinerary.cityName}
                      </Text>
                    </View>
                  </View>

                  {/* Day Content */}
                  <View style={{ padding: 16 }}>
                    {/* Title and Description */}
                    <Text style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#1E293B",
                      marginBottom: 8,
                    }}>
                      {day.selectedItinerary.itineraryTitle}
                    </Text>
                    
                    <Text style={{
                      fontSize: 14,
                      color: "#64748B",
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}>
                      {day.selectedItinerary.description}
                    </Text>

                    {/* Activities Section */}
                    {day.selectedItinerary.activities && (
                      <View style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 16,
                      }}>
                        <View style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                          gap: 8,
                        }}>
                          <Icons.Activity width={16} height={16} color="#2d2d44" />
                          <Text style={{
                            fontSize: 14,
                            fontWeight: "bold",
                            color: "#1E293B",
                          }}>
                            Today's Highlights
                          </Text>
                        </View>

                        <View style={{ gap: 8 }}>
                          {day.selectedItinerary.activities.map((activity, idx) => (
                            <View key={idx} style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                              backgroundColor: "#FFFFFF",
                              padding: 12,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: "#E2E8F0",
                            }}>
                              <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: "#EFF6FF",
                                alignItems: "center",
                                justifyContent: "center",
                              }}>
                                <Text style={{
                                  fontSize: 12,
                                  fontWeight: "bold",
                                  color: "#2d2d44",
                                }}>
                                  {idx + 1}
                                </Text>
                              </View>
                              <Text style={{
                                flex: 1,
                                fontSize: 14,
                                color: "#1E293B",
                              }}>
                                {activity}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Meals Badge */}
                    {day.selectedItinerary.meals && (
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 16,
                        backgroundColor: "#F0FDF4",
                        padding: 12,
                        borderRadius: 8,
                      }}>
                        <Icons.Food width={16} height={16} color="#059669" />
                        <Text style={{
                          fontSize: 14,
                          color: "#059669",
                          fontWeight: "500",
                        }}>
                          Included Meals: {day.selectedItinerary.meals}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DemandSetuPDF;
