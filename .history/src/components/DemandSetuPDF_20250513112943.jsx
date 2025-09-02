import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Icons } from "../icons";

const DemandSetuPDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  selectedLead,
}) => {
  const pdfStyles = StyleSheet.create({
    container: {
      padding: 30,
      backgroundColor: "#FFFFFF",
    },
    header: {
      backgroundColor: "#EA580C", // Orange header
      padding: 24,
      borderRadius: 12,
      marginBottom: 24,
    },
    companyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FFFFFF",
    },
    companySubtitle: {
      fontSize: 12,
      color: "#FFEDD5", // Light orange
      marginTop: 4,
    },
    packageTitle: {
      fontSize: 14,
      color: "#FFEDD5", // Light orange
    },
    packageName: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginTop: 4,
    },
    customerDetails: {
      marginTop: 16,
      padding: 16,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 8,
    },
    detailsRow: {
      flexDirection: "row",
      gap: 48,
    },
    detailColumn: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: "#FFEDD5", // Light orange
    },
    detailValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      gap: 16,
    },
    statItem: {
      alignItems: "center",
    },
    statLabel: {
      fontSize: 9,
      color: "#FFEDD5", // Light orange
    },
    statValue: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#FFF7ED", // Very light orange
    },
    itinerarySection: {
      marginTop: 24,
      padding: 16,
      backgroundColor: "#FFF7ED", // Very light orange background
      borderRadius: 8,
    },
    itineraryTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#EA580C", // Orange
      marginBottom: 16,
    },
    dayTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#C2410C", // Dark orange
      marginBottom: 8,
    },
    activityText: {
      fontSize: 12,
      color: "#9A3412", // Darker orange
      marginBottom: 4,
    },
    costSection: {
      marginTop: 24,
      padding: 16,
      backgroundColor: "#FFF7ED", // Very light orange
      borderRadius: 8,
    },
    costTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#EA580C", // Orange
      marginBottom: 12,
    },
    costRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    costLabel: {
      fontSize: 12,
      color: "#9A3412", // Darker orange
    },
    costValue: {
      fontSize: 12,
      fontWeight: "bold",
      color: "#C2410C", // Dark orange
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderColor: "#EA580C", // Orange
    },
  });

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
                                  source={dayHotel.propertyImages[0]}
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



export default DemandSetuPDF;
