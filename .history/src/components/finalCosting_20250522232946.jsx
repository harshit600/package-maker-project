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
import "./finalCosting.css";
import PlutoToursPDF from "./PlutoToursPDF";
import DemandSetuPDF from "./DemandSetuPDF";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Add these icon components using SVG paths

// Update the PackagePDF component
const PackagePDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "Pluto Tours and Travel",
  selectedLead,
  colorTheme,
}) => {
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
          backgroundImage:
            "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
                  Pluto Tours World Holidays Pvt. Ltd.
                </Text>
                <Image
                  style={{ marginTop: 5, width: 70, height: 20 }}
                  source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png"
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
            {/* Image Box 1 */}
            <View
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
                source={
                  packageSummary.package?.images?.[0] ||
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223741/himaclahimg2_cs0qvm.jpg"
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </View>

            {/* Image Box 2 */}
            <View
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
                source={
                  packageSummary.package?.images?.[1] ||
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg3_klatkm.jpg"
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </View>

            {/* Image Box 3 */}
            <View
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
                source={
                  packageSummary.package?.images?.[2] ||
                  "https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223742/himaclahimg4_ujs3z9.jpg"
                }
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </View>
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
                <Text style={pdfStyles.customerName}>
                  {selectedLead?.name || "N/A"}'s
                </Text>
                <Text style={pdfStyles.tripText}>trip to</Text>
              </View>

              <Text style={pdfStyles.destinationName}>
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
                <Text style={pdfStyles.packageTypeText}>
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
                  color: "#6B7280",
                  marginBottom: 4,
                }}
              >
                Total Package Cost
              </Text>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "bold",
                  color: "#1E293B",
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
          <View style={pdfStyles.leadDetailsSection}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                gap: 8,
              }}
            >
              <Icons.User style={{ width: 14, height: 14, color: "#2d2d44" }} />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "bold",
                  color: "#1E293B",
                }}
              >
                Your Details
              </Text>
            </View>

            {/* Combined Info Grid */}
            <View
              style={{
                backgroundColor: "#F8FAFC",
                padding: 12,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                {/* Personal Info */}
                <View style={{ flex: 1, minWidth: 200 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#000",
                      marginBottom: 8,
                      fontWeight: "700",
                    }}
                  >
                    Personal Information
                  </Text>
                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Name:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.name || "N/A"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Contact:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.mobile || "N/A"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Email:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.email || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Travel Info */}
                <View style={{ flex: 1, minWidth: 200 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#000",
                      marginBottom: 8,
                      fontWeight: "700",
                    }}
                  >
                    Travel Information
                  </Text>
                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Date:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.travelDate
                          ? new Date(
                              selectedLead.travelDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Duration:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.nights || "0"} Nights /{" "}
                        {selectedLead?.days || "0"} Days
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Text
                        style={{ fontSize: 9, color: "#64748B", width: 60 }}
                      >
                        Package:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                        {selectedLead?.packageType || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Guest Info */}
                <View style={{ flex: 1, minWidth: 200 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#64748B",
                      marginBottom: 8,
                      fontWeight: "500",
                    }}
                  >
                    Guest Information
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                  >
                    <View
                      style={{ flexDirection: "row", gap: 4, minWidth: 80 }}
                    >
                      <Text style={{ fontSize: 9, color: "#64748B" }}>
                        Adults:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B" }}>
                        {selectedLead?.adults || "0"}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", gap: 4, minWidth: 80 }}
                    >
                      <Text style={{ fontSize: 9, color: "#64748B" }}>
                        Children:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B" }}>
                        {selectedLead?.kids || "0"}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", gap: 4, minWidth: 80 }}
                    >
                      <Text style={{ fontSize: 9, color: "#64748B" }}>
                        Rooms:
                      </Text>
                      <Text style={{ fontSize: 9, color: "#1E293B" }}>
                        {selectedLead?.noOfRooms || "0"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
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
              <Icons.Map style={{ width: 14, height: 14, color: "#2d2d44" }} />
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
                  nextDay.selectedItinerary.cityName !== cityInfo.cityName;

                if (
                  index === 0 ||
                  cityInfo.cityName !==
                    packageSummary.package?.itineraryDays[index - 1]
                      .selectedItinerary.cityName
                ) {
                  const daysInCity = packageSummary.package?.itineraryDays
                    .slice(index)
                    .filter((d, i, arr) => {
                      if (i === 0) return true;
                      return d.selectedItinerary.cityName === cityInfo.cityName;
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
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: "#2d2d44",
                          }}
                        >
                          {daysInCity}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: "#1E293B",
                          }}
                        >
                          {cityInfo.cityName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 9,
                            color: "#64748B",
                          }}
                        >
                          {daysInCity} {daysInCity > 1 ? "Days" : "Day"}
                        </Text>
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
                      <Icons.Hotel
                        style={{ width: 14, height: 14, color: "#2d2d44" }}
                      />
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
                      <Icons.Car
                        style={{ width: 14, height: 14, color: "#2d2d44" }}
                      />
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

                  <View
                    style={{
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
                        }}
                      >
                        {packageSummary.transfer?.details?.vehicleName ||
                          "Standard Vehicle"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#1E293B",
                        marginBottom: 2,
                      }}
                    >
                      {packageSummary.transfer?.details?.vehicleType || "Sedan"}
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
                          {packageSummary.transfer?.details?.vehicleCategory ||
                            "AC"}
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
                          {packageSummary.transfer?.details?.seatingCapacity ||
                            "4"}{" "}
                          Seater
                        </Text>
                      </View>
                    </View>
                  </View>
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
                        (day) => day.selectedItinerary.cityName
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
            {/* Enhanced Itinerary Section */}
            <View
              style={{
                marginTop: 24,
                marginBottom: 32,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                overflow: "hidden",
              }}
            >
              {/* Elegant Section Header */}
              <View
                style={{
                  backgroundColor: "rgb(45 45 68)",
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      padding: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Icons.Map
                      style={{ width: 24, height: 24, color: "#FFFFFF" }}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                      }}
                    >
                      Your Journey Itinerary
                    </Text>
                    <Text
                      style={{ fontSize: 14, color: "#E2E8F0", marginTop: 2 }}
                    >
                      {packageSummary?.package?.itineraryDays?.length} Days of
                      Adventure
                    </Text>
                  </View>
                </View>
              </View>

              {/* Journey Overview Strip */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#F8FAFC",
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E2E8F0",
                }}
              >
                {packageSummary?.package?.itineraryDays?.map((day, index) => {
                  const isFirst = index === 0;
                  const isLast =
                    index === packageSummary.package.itineraryDays.length - 1;
                  const cityName = day.selectedItinerary.cityName;
                  const isNewCity =
                    index === 0 ||
                    cityName !==
                      packageSummary.package.itineraryDays[index - 1]
                        .selectedItinerary.cityName;

                  if (isNewCity) {
                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {!isFirst && (
                          <View
                            style={{
                              height: 2,
                              width: 24,
                              backgroundColor: "#CBD5E1",
                              marginHorizontal: 8,
                            }}
                          />
                        )}
                        <View
                          style={{
                            backgroundColor: "#EFF6FF",
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: "#BFDBFE",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#2d2d44",
                              fontWeight: "500",
                            }}
                          >
                            {cityName}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                  return null;
                })}
              </View>

              {/* Detailed Day-by-Day Itinerary */}
              <View style={{ padding: 16, gap: 24 }}>
                {packageSummary?.package?.itineraryDays?.map((day, index) => {
                  const dayData = day.selectedItinerary;
                  const dayHotel = packageSummary.hotels.find(
                    (hotel) => hotel.day === day.day
                  );

                  // Calculate the date for this day
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
                      }}
                    >
                      {/* Vertical Timeline Line */}
                      {index !==
                        packageSummary.package.itineraryDays.length - 1 && (
                        <View
                          style={{
                            position: "absolute",
                            left: 15,
                            top: 30,
                            bottom: -24,
                            width: 2,
                            backgroundColor: "#E2E8F0",
                            zIndex: 1,
                          }}
                        />
                      )}

                      {/* Day Number Badge */}
                      <View
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 32,
                          height: 32,
                          backgroundColor: "#2d2d44",
                          borderRadius: 16,
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "#FFFFFF",
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                      </View>

                      {/* Day Content Card */}
                      <View
                        style={{
                          marginLeft: 48,
                          backgroundColor: "#FFFFFF",
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        {/* Day Header */}
                        <View
                          style={{
                            backgroundColor: "#F8FAFC",
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: "#E2E8F0",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#64748B",
                              marginBottom: 2,
                            }}
                          >
                            {formattedDate}
                          </Text>
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "bold",
                              color: "#1E293B",
                              marginBottom: 4,
                            }}
                          >
                            Day {String(index + 1).padStart(2, "0")} -{" "}
                            {dayData.itineraryTitle}
                          </Text>

                          <Text style={pdfStyles.dayLocation}>
                            {day.selectedItinerary.cityName}
                          </Text>

                          <Text style={pdfStyles.dayDescription}>
                            {day.selectedItinerary.description ||
                              "Day itinerary details"}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              color: "#FFFFFF",
                            }}
                          >
                            {String(day.day).padStart(2, "0")}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Icons.Location
                              style={{
                                width: 14,
                                height: 14,
                                color: "#64748B",
                              }}
                            />
                            <Text style={{ fontSize: 14, color: "#64748B" }}>
                              {dayData.cityName}
                            </Text>
                          </View>
                        </View>
                        <View style={{ padding: 16 }}>
                          <Text style={pdfStyles.cityAreaContainer}>
                            {day.selectedItinerary?.cityArea?.map(
                              (area, index) => {
                                // Handle both string and object types
                                const areaText =
                                  typeof area === "string"
                                    ? area
                                    : area.placeName || area.city || "";

                                return (
                                  <View
                                    key={index}
                                    style={pdfStyles.cityAreaItem}
                                  >
                                    {/* Location Icon */}
                                    <Icons.Location
                                      style={pdfStyles.cityAreaIcon}
                                    />

                                    {/* Area Text */}
                                    <Text style={pdfStyles.cityAreaText}>
                                      {areaText}
                                    </Text>

                                    {/* Separator dot for all but last item */}
                                    {index <
                                      day.selectedItinerary.cityArea.length -
                                        1 && (
                                      <View
                                        style={pdfStyles.cityAreaSeparator}
                                      />
                                    )}
                                  </View>
                                );
                              }
                            )}
                          </Text>
                        </View>
                        {/* Day Description */}
                        <View style={{ padding: 16 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: "#475569",
                              lineHeight: 1.6,
                            }}
                          >
                            {dayData.itineraryDescription?.replace(
                              /<[^>]*>/g,
                              ""
                            )}
                          </Text>

                          {/* Hotel Details with Image */}
                          {dayHotel && (
                            <View
                              style={{
                                marginTop: 16,
                                backgroundColor: "#F8FAFC",
                                borderRadius: 8,
                                overflow: "hidden",
                                borderWidth: 1,
                                borderColor: "#E2E8F0",
                              }}
                            >
                              {/* Hotel Image */}
                              {dayHotel.propertyImages?.[0] && (
                                <Image
                                  source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png"
                                  style={{
                                    width: "100%",
                                    height: 120,
                                    objectFit: "cover",
                                  }}
                                />
                              )}

                              <View style={{ padding: 12 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: "bold",
                                    color: "#1E293B",
                                    marginBottom: 4,
                                  }}
                                >
                                  {dayHotel.propertyName}
                                </Text>

                                <View
                                  style={{
                                    flexDirection: "row",
                                    gap: 8,
                                    marginTop: 4,
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 4,
                                    }}
                                  >
                                    <Icons.Room
                                      style={{
                                        width: 14,
                                        height: 14,
                                        color: "#64748B",
                                      }}
                                    />
                                    <Text
                                      style={{ fontSize: 12, color: "#64748B" }}
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
                                    <Icons.Food
                                      style={{
                                        width: 14,
                                        height: 14,
                                        color: "#64748B",
                                      }}
                                    />
                                    <Text
                                      style={{ fontSize: 12, color: "#64748B" }}
                                    >
                                      {dayHotel.mealPlan}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          )}

                          {/* Activities Section */}
                          {dayData.activities &&
                            dayData.activities.length > 0 && (
                              <View
                                style={{
                                  marginTop: 16,
                                  backgroundColor: "#F8FAFC",
                                  borderRadius: 8,
                                  padding: 12,
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
                                  <Icons.Activity
                                    style={{
                                      width: 16,
                                      height: 16,
                                      color: "#2d2d44",
                                    }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      fontWeight: "bold",
                                      color: "#1E293B",
                                    }}
                                  >
                                    Today's Activities
                                  </Text>
                                </View>
                                <View style={{ gap: 8 }}>
                                  {dayData.activities.map(
                                    (activity, actIndex) => (
                                      <View
                                        key={actIndex}
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          gap: 8,
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: "#2d2d44",
                                          }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 14,
                                            color: "#475569",
                                          }}
                                        >
                                          {activity}
                                        </Text>
                                      </View>
                                    )
                                  )}
                                </View>
                              </View>
                            )}

                          {/* Meals Info Badge */}
                          {dayData.meals && (
                            <View
                              style={{
                                marginTop: 16,
                                backgroundColor: "#ECFDF5",
                                borderRadius: 8,
                                padding: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Icons.Meals
                                style={{
                                  width: 16,
                                  height: 16,
                                  color: "#059669",
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#059669",
                                  fontWeight: "500",
                                }}
                              >
                                Included Meals: {dayData?.meals}
                              </Text>
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
                <Icons.Check
                  style={{ width: 16, height: 16, color: "#16A34A" }}
                />
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
                  <Icons.Hotel
                    style={{ width: 20, height: 20, color: "#2d2d44" }}
                  />
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
                  <Icons.Calendar
                    style={{ width: 20, height: 20, color: "#16A34A" }}
                  />
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
                  <Icons.Hotel
                    style={{
                      width: 14,
                      height: 14,
                      color: "#2d2d44",
                      marginTop: 2,
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    {packageSummary.hotels?.length || 0} Hotels accommodation
                    with {packageSummary.package?.itineraryDays?.length || 0}{" "}
                    days itinerary
                  </Text>
                </View>

                {/* Meals */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Icons.Food
                    style={{
                      width: 14,
                      height: 14,
                      color: "#2d2d44",
                      marginTop: 2,
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    Meals as mentioned in the itinerary (MAP - Breakfast &
                    Dinner)
                  </Text>
                </View>

                {/* Transport */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Icons.Car
                    style={{
                      width: 14,
                      height: 14,
                      color: "#2d2d44",
                      marginTop: 2,
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    All transfers and sightseeing as per itinerary in{" "}
                    {packageSummary.transfer?.details?.vehicleName ||
                      "Standard Vehicle"}
                  </Text>
                </View>

                {/* Activities */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Icons.Activity
                    style={{
                      width: 14,
                      height: 14,
                      color: "#2d2d44",
                      marginTop: 2,
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    {packageSummary.activities?.length || 0} activities and
                    excursions as mentioned
                  </Text>
                </View>

                {/* Taxes */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <Icons.Document
                    style={{
                      width: 14,
                      height: 14,
                      color: "#2d2d44",
                      marginTop: 2,
                    }}
                  />
                  <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                    All applicable taxes and service charges
                  </Text>
                </View>
              </View>
            </View>

            {/* Package Exclusions Section - Moved here */}
            <View style={pdfStyles.exclusionsContainer}>
              {/* Header */}
              <View style={pdfStyles.exclusionsHeader}>
                <Icons.Close />
                <Text style={pdfStyles.exclusionsTitle}>
                  Package Exclusions
                </Text>
              </View>

              {/* Main Exclusions */}
              {packageSummary?.package?.packageExclusions && (
                <View style={pdfStyles.exclusionsList}>
                  {packageSummary.package.packageExclusions
                    .split("\n")
                    .filter(Boolean)
                    .map((exclusion, index) => (
                      <View key={index} style={pdfStyles.exclusionItem}>
                        <View style={pdfStyles.bulletPoint} />
                        <Text style={pdfStyles.exclusionText}>
                          {exclusion.trim().replace(/^\*\s*/, "")}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              {/* Custom Exclusions */}
              {packageSummary?.package?.customExclusions?.map(
                (section, index) => (
                  <View key={index} style={pdfStyles.customExclusion}>
                    <Text style={pdfStyles.customExclusionTitle}>
                      {section.name}
                    </Text>
                    {section.description?.split("\n").map((item, idx) => (
                      <View key={idx} style={pdfStyles.customExclusionItem}>
                        <View style={pdfStyles.customBulletPoint} />
                        <Text style={pdfStyles.customExclusionText}>
                          {item.trim().replace(/^\*\s*/, "")}
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
                  <Icons.Info
                    style={{ width: 14, height: 14, color: "rgb(45 45 68)" }}
                  />
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
                    {packageSummary.package?.agentName || "Pluto Tours Agent"}
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
                  <Icons.Phone
                    style={{ width: 12, height: 12, color: "#2d2d44" }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#64748B",
                    }}
                  >
                    {packageSummary.package?.agentPhone || "+91 98765 43210"}
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
                  <Icons.Email
                    style={{ width: 12, height: 12, color: "#2d2d44" }}
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#64748B",
                    }}
                  >
                    info@plutotours.in
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
                <Icons.Calendar
                  style={{ width: 12, height: 12, color: "#64748B" }}
                />
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
                <Icons.Star
                  style={{ width: 10, height: 10, color: "#2d2d44" }}
                />
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
    <Text style={pdfStyles.accountDetailsHeader}>
      ACCOUNT DETAILS AND UPI ID
    </Text>

    {/* Bank Grid Section */}
    <View style={pdfStyles.bankGrid}>
      {/* SBI Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>STATE BANK OF INDIA A/C</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>38207849663</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>PT HOLIDAYS PVT. LTD.</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Branch:</Text>
          <Text style={pdfStyles.bankValue}>PANTHAGHATI-SHIMLA</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>SBIN0021763</Text>
        </View>
      </View>

      {/* HDFC Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>HDFC BANK</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>50200044011800</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>PT HOLIDAYS PVT LTD</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Branch:</Text>
          <Text style={pdfStyles.bankValue}>MAHELI-SHIMLA</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>HDFC0003612</Text>
        </View>
      </View>

      {/* ICICI Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>ICICI BANK</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>36680550120</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>PT HOLIDAYS PVT LTD</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Branch:</Text>
          <Text style={pdfStyles.bankValue}>KASUMPATI-SHIMLA</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>ICIC0003368</Text>
        </View>
      </View>

      {/* Bank of Baroda Section */}
      <View style={pdfStyles.bankCard}>
        <Text style={pdfStyles.bankName}>BANK OF BARODA</Text>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C No:</Text>
          <Text style={pdfStyles.bankValue}>54140200000060</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>A/C Name:</Text>
          <Text style={pdfStyles.bankValue}>PT HOLIDAYS PVT LTD</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>Branch:</Text>
          <Text style={pdfStyles.bankValue}>BCS-SHIMLA</Text>
        </View>
        <View style={pdfStyles.bankDetail}>
          <Text style={pdfStyles.bankLabel}>IFSC Code:</Text>
          <Text style={pdfStyles.bankValue}>BARB0NEWSIM</Text>
        </View>
      </View>
    </View>

    {/* UPI Section */}
    <View style={pdfStyles.upiSection}>
      <View style={pdfStyles.upiCard}>
        <Text style={pdfStyles.upiTitle}>GOOGLE PAY @ PHONE PAY</Text>
        <Text style={pdfStyles.upiValue}>80917-53823</Text>
      </View>
      <View style={pdfStyles.upiCard}>
        <Text style={pdfStyles.upiTitle}>UPI ID</Text>
        <Text style={pdfStyles.upiValue}>UpId: mdplutotours-2@okhdfcbank</Text>
        <Text style={pdfStyles.upiValue}>UpId: 981666196@sbi</Text>
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
      padding: 20,
      backgroundColor: "rgb(45 45 68)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    }}
  >
    {/* Company Logo and Name Section */}
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
          width: 70,
          height: 20,
          marginRight: 15,
        }}
        source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png"
      />

      <View>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Helvetica-Bold",
          }}
        >
          Pluto Tours & Travels
        </Text>
        <Text
          style={{
            color: "#E2E8F0",
            fontSize: 12,
            marginTop: 4,
          }}
        ></Text>
      </View>
    </View>

    {/* Contact Information Grid */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 15,
      }}
    >
      {/* Address */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        }}
      >
        <Icons.Location
          style={{ width: 16, height: 16, color: "#FFFFFF", marginRight: 8 }}
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
          }}
        >
          123 Tourism Street, Shimla, Himachal Pradesh
        </Text>
      </View>

      {/* Phone */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Icons.Phone
          style={{ width: 16, height: 16, color: "#FFFFFF", marginRight: 8 }}
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
          }}
        >
          +91 98765 43210
        </Text>
      </View>

      {/* Website */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
          justifyContent: "flex-end",
        }}
      >
        <Icons.Globe
          style={{ width: 16, height: 16, color: "#FFFFFF", marginRight: 8 }}
        />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
          }}
        >
          www.plutotours.in
        </Text>
      </View>
    </View>

    {/* Social Media Links */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
        marginBottom: 15,
      }}
    >
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Icons.Facebook style={{ width: 14, height: 14, color: "#FFFFFF" }} />
      </View>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Icons.Instagram style={{ width: 14, height: 14, color: "#FFFFFF" }} />
      </View>
      <View
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Icons.Twitter style={{ width: 14, height: 14, color: "#FFFFFF" }} />
      </View>
    </View>

    {/* Copyright Text */}
    <Text
      style={{
        color: "#CBD5E1",
        fontSize: 8,
        textAlign: "center",
        marginTop: 10,
      }}
    >
      © {new Date().getFullYear()} Pluto Tours & Travels. All rights reserved.
    </Text>
  </View>
);

const FinalCosting = ({ selectedLead }) => {
  const { packageSummary } = usePackage();

  const [showMargin, setShowMargin] = useState(false);
  const [history, setHistory] = useState([]);
  const [showCustomMargin, setShowCustomMargin] = useState(false);
  const [customMarginPercentage, setCustomMarginPercentage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [activeMarginPercentage, setActiveMarginPercentage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [margins, setMargins] = useState({
    firstQuoteMargins: {},
    minimumQuoteMargins: {},
  });
  const [showDiscount, setShowDiscount] = useState(false);
  const [customDiscountPercentage, setCustomDiscountPercentage] = useState("");
  const [activeDiscountPercentage, setActiveDiscountPercentage] =
    useState(null);
  const [marginData, setMarginData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyResponse = await fetch(
          `${config.API_HOST}/api/finalcosting/get`
        );
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch history");
        }
        const historyData = await historyResponse.json();

        const filteredHistory = historyData.filter(
          (item) => item.id === packageSummary.id
        );
        setHistory(filteredHistory);

        const marginsResponse = await fetch(
          `${config.API_HOST}/api/margin/get-margin`
        );
        if (!marginsResponse.ok) {
          throw new Error("Failed to fetch margins");
        }
        const marginsData = await marginsResponse.json();
        setMargins(marginsData);

        if (filteredHistory.length > 0) {
          setShowCustomMargin(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (packageSummary?.id) {
      fetchData();
    }
  }, [packageSummary?.id]);

  useEffect(() => {
    const allData = {
      leadDetails: {
        personalInfo: {
          name: selectedLead?.name,
          email: selectedLead?.email,
          mobile: selectedLead?.mobile,
          from: selectedLead?.from,
          source: selectedLead?.source,
        },
        travelInfo: {
          destination: selectedLead?.destination,
          travelDate: selectedLead?.travelDate,
          nights: selectedLead?.nights,
          days: selectedLead?.days,
        },
        packageInfo: {
          type: selectedLead?.packageType,
          category: selectedLead?.packageCategory,
          mealPlan: selectedLead?.mealPlans,
          EP: selectedLead?.EP,
        },
        guestInfo: {
          adults: selectedLead?.adults,
          children: selectedLead?.kids,
          totalPersons: selectedLead?.persons,
          noOfRooms: selectedLead?.noOfRooms,
          extraBeds: selectedLead?.extraBeds,
        },
      },
      packageDetails: {
        activities: packageSummary?.activities,
        hotels: packageSummary?.hotels,
        transfer: packageSummary?.transfer,
        totals: packageSummary?.totals,
      },
    };
  }, [selectedLead, packageSummary]);

  useEffect(() => {
    const fetchMarginData = async () => {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/margin/get-margin`
        );
        const data = await response.json();

        // Get the package state and extract just the state name
        const fullPackageState = packageSummary?.package?.state || "";
        const packageState = fullPackageState.split(" ")[0].toLowerCase();

        console.log("packageState:", packageState);

        // Find matching state margin
        const matchingStateMargin = data?.data?.find(
          (margin) => (margin.state || "").toLowerCase() === packageState
        );

        if (matchingStateMargin) {
          // Immediately set the margin data when found
          setMarginData(matchingStateMargin);
          setSelectedStateMargins(matchingStateMargin);
        } else {
          // Set default margins if no match found
          const defaultMargin = Array.isArray(data.data) ? data.data[0] : null;
          setMarginData(defaultMargin);
        }
      } catch (error) {
        console.error("Error fetching margin data:", error);
      }
    };

    if (packageSummary?.package?.state) {
      fetchMarginData();
    }
  }, [packageSummary?.package?.state]); // Changed dependency to state

  // Add console log to verify margin data updates
  useEffect(() => {
    console.log("Current margin data:", marginData);
  }, [marginData]);

  const calculateMargin = (total, customPercentage = null) => {
    if (customPercentage !== null) {
      return total * (customPercentage / 100);
    }

    // Check if marginData exists and has firstQuoteMargins
    if (!marginData || !marginData.firstQuoteMargins) {
      return 0;
    }

    let marginPercentage = 0;

    if (total < 100000) {
      marginPercentage = Number(marginData.firstQuoteMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between2To3Lakh);
    } else {
      marginPercentage = Number(marginData.firstQuoteMargins.moreThan3Lakh);
    }

    const calculatedMargin = total * (marginPercentage / 100);

    return calculatedMargin;
  };

  const calculateDiscount = (total, discountPercentage = null) => {
    if (discountPercentage !== null) {
      return total * (discountPercentage / 100);
    }
    return 0;
  };

  const marginAmount = calculateMargin(
    packageSummary?.totals?.grandTotal || 0,
    activeMarginPercentage
  );
  const discountAmount = showDiscount
    ? calculateDiscount(
        packageSummary?.totals?.grandTotal || 0,
        activeDiscountPercentage
      )
    : 0;
  const finalTotal = showDiscount
    ? (packageSummary?.totals?.grandTotal || 0) - discountAmount
    : (packageSummary?.totals?.grandTotal || 0) + marginAmount;

  const getCurrentMarginPercentage = () => {
    if (activeMarginPercentage !== null) {
      return activeMarginPercentage;
    }

    if (!marginData || !marginData.firstQuoteMargins) {
      return 0;
    }

    const total = packageSummary?.totals?.grandTotal || 0;

    let marginPercentage = 0;

    if (total < 100000) {
      marginPercentage = Number(marginData.firstQuoteMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      marginPercentage = Number(marginData.firstQuoteMargins.between2To3Lakh);
    } else {
      marginPercentage = Number(marginData.firstQuoteMargins.moreThan3Lakh);
    }

    return marginPercentage;
  };

  const getMinimumMargin = (total) => {
    if (!marginData || !marginData.minimumQuoteMargins) {
      console.log("No minimum margin data available");
      return 0;
    }

    let minimumMargin = 0;

    if (total < 100000) {
      minimumMargin = Number(marginData.minimumQuoteMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      minimumMargin = Number(marginData.minimumQuoteMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      minimumMargin = Number(marginData.minimumQuoteMargins.between2To3Lakh);
    } else {
      minimumMargin = Number(marginData.minimumQuoteMargins.moreThan3Lakh);
    }

    return minimumMargin;
  };

  const handleSendLink = async () => {
    const timestamp = new Date().toLocaleString();
    const historyItem = {
      timestamp,
      total: packageSummary?.totals?.grandTotal || 0,
      marginPercentage: showDiscount ? 0 : getCurrentMarginPercentage(),
      discountPercentage: showDiscount ? activeDiscountPercentage : 0,
      finalTotal: finalTotal,
      id: packageSummary.id,
      activities: packageSummary.activities,
      hotels: packageSummary.hotels,
      transfer: {
        details: packageSummary.transfer.details,
        itineraryDays: packageSummary?.transfer?.itineraryDays,
        selectedLead: packageSummary?.transfer?.selectedLead,
        totalCost: packageSummary.transfer.totalCost,
      },
      totals: {
        transferCost: packageSummary.totals.transferCost,
        hotelCost: packageSummary.totals.hotelCost,
        activitiesCost: packageSummary.totals.activitiesCost,
        grandTotal: packageSummary.totals.grandTotal,
      },
    };
    try {
      const response = await fetch(
        `${config.API_HOST}/api/finalcosting/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(historyItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save history");
      }

      setHistory([...history, historyItem]);
      setShowCustomMargin(true);
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const handleCustomMarginSubmit = () => {
    const marginValue = Number.parseFloat(customMarginPercentage);
    const total = packageSummary?.totals?.grandTotal || 0;

    // Get minimum margin based on total amount
    let minimumMargin = 0;
    if (total < 100000) {
      minimumMargin = marginData?.minimumQuoteMargins?.lessThan1Lakh;
    } else if (total < 200000) {
      minimumMargin = marginData?.minimumQuoteMargins?.between1To2Lakh;
    } else if (total < 300000) {
      minimumMargin = marginData?.minimumQuoteMargins?.between2To3Lakh;
    } else {
      minimumMargin = marginData?.minimumQuoteMargins?.moreThan3Lakh;
    }

    if (marginValue < minimumMargin) {
      alert(
        `Margin cannot be less than ${minimumMargin}% for this package value`
      );
      return;
    }

    if (marginValue > 0) {
      setActiveMarginPercentage(marginValue);
      setCustomMarginPercentage("");
    } else {
      alert("Please enter a valid margin percentage");
    }
  };

  const handleCustomDiscountSubmit = () => {
    const discountValue = Number.parseFloat(customDiscountPercentage);
    const total = packageSummary?.totals?.grandTotal || 0;

    // Get minimum margin (which will be maximum discount) based on total amount
    let maximumDiscount = 0;
    if (total < 100000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.lessThan1Lakh;
    } else if (total < 200000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.between1To2Lakh;
    } else if (total < 300000) {
      maximumDiscount = marginData?.minimumQuoteMargins?.between2To3Lakh;
    } else {
      maximumDiscount = marginData?.minimumQuoteMargins?.moreThan3Lakh;
    }

    if (discountValue > maximumDiscount) {
      alert(
        `Discount cannot be more than ${maximumDiscount}% for this package value`
      );
      return;
    }

    if (discountValue > 0 && discountValue <= 100) {
      setActiveDiscountPercentage(discountValue);
      setCustomDiscountPercentage("");
    } else {
      alert("Please enter a valid discount percentage between 0 and 100");
    }
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/finalcosting/delete/${historyId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete history");
      }

      setHistory(history.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error deleting history:", error);
    }
  };

  // Add new function to check if any history item is converted
  const hasConvertedHistory = history.some((item) => item.converted === true);

  return (
    <>
      <div className="p-6 flex gap-6">
        {/* Cost Breakdown Section - Wider */}
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Enhanced Header */}
          <div
            className="relative overflow-hidden"
            style={{ backgroundColor: "#2d2d44" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" className="text-white">
                <pattern
                  id="pattern-circles"
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#pattern-circles)" />
              </svg>
            </div>

            {/* Header Content */}
            <div className="px-4 py-6 relative">
              <div className="pb-4 flex items-start gap-4">
                {/* Icon */}
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Cost Breakdown
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    <p className="text-gray-300 text-sm">
                      Detailed pricing information
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                {/* Action Buttons */}
                {!hasConvertedHistory && (
                  <div className="flex items-center gap-3">
                    {showCustomMargin && (
                      <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                        {/* Toggle between Margin and Discount */}
                        <div className="flex bg-white/5 rounded-md p-1">
                          <button
                            onClick={() => {
                              setShowDiscount(false);
                              setActiveDiscountPercentage(null);
                              setCustomDiscountPercentage("");
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                              !showDiscount
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            Margin
                          </button>
                          <button
                            onClick={() => {
                              setShowDiscount(true);
                              setActiveMarginPercentage(null);
                              setCustomMarginPercentage("");
                            }}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                              showDiscount
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            Discount
                          </button>
                        </div>

                        {/* Input field */}
                        <input
                          type="number"
                          value={
                            showDiscount
                              ? customDiscountPercentage
                              : customMarginPercentage
                          }
                          onChange={(e) =>
                            showDiscount
                              ? setCustomDiscountPercentage(e.target.value)
                              : setCustomMarginPercentage(e.target.value)
                          }
                          className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                          placeholder="%"
                        />
                        <button
                          onClick={
                            showDiscount
                              ? handleCustomDiscountSubmit
                              : handleCustomMarginSubmit
                          }
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    )}

                    {/* Show/Hide Margin Button */}
                    <button
                      onClick={() => setShowMargin(!showMargin)}
                      className="margin_my px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm"
                    >
                      {showMargin ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Hide {showDiscount ? "Discount" : "Margin"}
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add {showDiscount ? "Discount" : "Margin"}
                        </>
                      )}
                    </button>

                    {/* Send Link Button */}
                    {showMargin && (
                      <button
                        onClick={handleSendLink}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Send Link
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <div className="space-y-5">
              {/* Cost Items */}
              <div className="grid gap-4">
                {/* Hotel Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Hotel Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Accommodation costs
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{packageSummary?.totals?.hotelCost || 0}
                    </span>
                  </div>
                </div>
                {/*  paid places cost */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          paid places cost
                        </h4>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      ₹{packageSummary?.totals?.placesCost || 0}
                    </span>
                  </div>
                </div>
                {/* Transfer Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Transfer Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Transportation costs
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      ₹{packageSummary?.totals?.transferCost || 0}
                    </span>
                  </div>
                </div>

                {/* Activity Costs */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Activity Charges
                        </h4>
                        <p className="text-xs text-gray-500">
                          Entertainment & activities
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-purple-600">
                      ₹{packageSummary?.totals?.activitiesCost || 0}
                    </span>
                  </div>
                </div>

                {/* Taxes */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-orange-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-gray-700 font-medium">
                          Taxes & Fees
                        </h4>
                        <p className="text-xs text-gray-500">
                          Additional charges
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-orange-600">
                      ₹0
                    </span>
                  </div>
                </div>
              </div>

              {/* Margin Section */}
              {showMargin && !hasConvertedHistory && (
                <div className="mt-6 space-y-4">
                  <div
                    className={`bg-${
                      showDiscount ? "green" : "yellow"
                    }-50 rounded-xl border border-${
                      showDiscount ? "green" : "yellow"
                    }-100 p-4`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 bg-${
                            showDiscount ? "green" : "yellow"
                          }-100 rounded-lg`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-6 w-6 text-${
                              showDiscount ? "green" : "yellow"
                            }-600`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-gray-700 font-medium">
                            {showDiscount
                              ? `Discount (${activeDiscountPercentage}%)`
                              : `Margin (${getCurrentMarginPercentage()}%)`}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {showDiscount
                              ? "Applied discount"
                              : "Additional profit margin"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-lg font-semibold text-${
                          showDiscount ? "green" : "yellow"
                        }-600`}
                      >
                        ₹
                        {showDiscount
                          ? discountAmount.toFixed(2)
                          : marginAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Rest of the section */}
                </div>
              )}

              {/* Grand Total */}
              <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-blue-100">
                      Grand Total
                    </h4>
                    <p className="text-sm text-blue-200">
                      {showMargin && "(with Margin)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">
                      ₹
                      {showMargin
                        ? finalTotal.toFixed(2)
                        : packageSummary?.totals?.grandTotal || 0}
                    </span>
                    <p className="text-sm text-blue-200">Total package cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section - Narrower */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "#2d2d44" }}>
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-white">Quote History</h3>
                <p className="text-sm text-gray-300">Previous quotations</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No quote history available</p>
                </div>
              ) : (
                history.filter((item) => item.id === packageSummary.id).map((item, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100 p-4 relative hover:shadow-md transition-all">
                    {/* Quote Details */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.timestamp}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Base Amount</p>
                          <p className="text-sm font-semibold">₹{item.total}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Final Amount</p>
                          <p className="text-sm font-semibold text-blue-700">₹{item.finalTotal.toFixed(2)}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Margin</p>
                          <p className="text-sm font-semibold text-green-700">{item.marginPercentage}%</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Discount</p>
                          <p className="text-sm font-semibold text-purple-700">{item.discountPercentage}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={() => handleViewPDF(item)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        View Quote
                      </button>
                      <button onClick={() => handleConvertQuote(item)} disabled={item.converted} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${item.converted ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        {item.converted ? 'Converted' : 'Convert'}
                      </button>
                      <button onClick={() => handleDeleteHistory(item._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Status Badge */}
                    {item.converted && (
                      <div className="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Converted
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && selectedHistoryItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] h-[90%] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Package Details -{" "}
                {new Date(selectedHistoryItem.timestamp).toLocaleDateString()}
              </h3>
              <button
                onClick={() => {
                  setShowPdfPreview(false);
                  setSelectedHistoryItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                <PackagePDF
                  packageSummary={{
                    ...selectedHistoryItem,
                    package: packageSummary.package,
                  }}
                  showMargin={true}
                  marginAmount={
                    selectedHistoryItem.finalTotal - selectedHistoryItem.total
                  }
                  finalTotal={selectedHistoryItem.finalTotal}
                  getCurrentMarginPercentage={() =>
                    selectedHistoryItem.marginPercentage
                  }
                  companyName="Pluto Tours and Travel"
                  selectedLead={selectedLead}
                  colorTheme="orange"
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}

      {/* Modal/Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Warning</h3>
            <p className="text-gray-700 mb-4">
              Below Margins require supervisor approval. Please adjust the
              margin percentage.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default FinalCosting;
