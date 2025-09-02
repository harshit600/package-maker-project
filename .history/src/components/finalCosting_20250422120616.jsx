"use client";

import { useEffect, useState } from "react";
import { usePackage } from "../context/PackageContext";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import { Button } from "react-bootstrap";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Add these icon components using SVG paths
const Icons = {
  Flight: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M21 14.58c0-.36-.19-.69-.49-.89L16 10.77V5c0-1.66-1.34-3-3-3S10 3.34 10 5v5.77L5.49 13.69c-.3.19-.49.53-.49.89 0 .7.68 1.21 1.36 1L10 14.17V19c0 1.66 1.34 3 3 3s3-1.34 3-3v-4.83l3.64 1.41c.68.21 1.36-.3 1.36-1z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Hotel: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Activity: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Transfer: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Meals: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
};

// Update the pdfStyles object with enhanced styling
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  companyHeader: {
    backgroundColor: "#0a4d7a",
    padding: 25,
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
  companyName: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  companyTagline: {
    color: "#ffffff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    padding: 14,
    backgroundColor: "#0a4d7a",
    borderRadius: 8,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ffffff",
    backgroundColor: "#1e88c9",
    padding: 10,
    borderRadius: 6,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "medium",
  },
  value: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0a4d7a",
  },
  hotelCard: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityCard: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1e88c9",
  },
  transferCard: {
    padding: 14,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#1e88c9",
  },
  totalSection: {
    marginTop: 20,
    padding: 18,
    backgroundColor: "#0a4d7a",
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  itineraryCard: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    backgroundColor: "#1e88c9",
    padding: 10,
    borderRadius: 6,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  itineraryLabel: {
    fontSize: 11,
    color: "#4b5563",
    width: 80,
    marginRight: 10,
    fontWeight: "medium",
  },
  itineraryContent: {
    fontSize: 11,
    color: "#1f2937",
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 1.4,
  },
  itineraryRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingRight: 15,
  },
  placesList: {
    marginLeft: 90,
    fontSize: 11,
    color: "#1f2937",
  },
  placeItem: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  decorativeLine: {
    borderBottomWidth: 2,
    borderBottomColor: "#1e88c9",
    marginVertical: 15,
    opacity: 0.5,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 20,
    fontSize: 10,
    color: "#6b7280",
  },
  watermark: {
    position: "absolute",
    bottom: 30,
    left: 30,
    fontSize: 9,
    color: "#d1d5db",
    opacity: 0.5,
  },
  inclusionSection: {
    marginTop: 15,
    padding: 14,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#1e88c9",
  },
  inclusionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0a4d7a",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  inclusionItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  inclusionBullet: {
    fontSize: 11,
    color: "#0a4d7a",
    marginRight: 6,
  },
  inclusionText: {
    fontSize: 11,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  highlightBox: {
    marginTop: 15,
    padding: 14,
    backgroundColor: "#ffedd5",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f97316",
  },
  highlightText: {
    fontSize: 11,
    color: "#7c2d12",
    fontStyle: "italic",
    lineHeight: 1.4,
  },
  priceTag: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  priceText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  packageInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  packageInfoItem: {
    width: "50%",
    paddingRight: 10,
    marginBottom: 8,
  },
  packageInfoLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  packageInfoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a4d7a",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 10,
  },
  badge: {
    backgroundColor: "#dbeafe",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    color: "#1e40af",
    fontWeight: "medium",
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "center",
  },
  logo: {
    width: 60,
    height: 60,
    position: "absolute",
    top: 15,
    left: 15,
  },
  mainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 20,
  },
  headerLeft: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: "#4B5563",
  },
  destinationName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E40AF",
    marginVertical: 8,
  },
  packageDuration: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },
  placesCoverage: {
    fontSize: 12,
    color: "#6B7280",
  },
  headerRight: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  quoteBox: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 12,
    color: "#4B5563",
    fontStyle: "italic",
  },
  highlightsSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
  },
  highlightsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  highlightItem: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    width: "30%",
  },
  highlightCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E40AF",
    textAlign: "center",
  },
  agentSection: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  agentLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  agentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginVertical: 4,
  },
  agentContact: {
    fontSize: 12,
    color: "#4B5563",
  },
  quoteDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  pageHeader: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  brandLogo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  heading1: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  heading2: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  highlightCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  col: {
    flexDirection: "column",
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  badgeText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "medium",
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1E40AF",
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1E40AF",
    marginRight: 8,
  },
  timelineLine: {
    width: 2,
    height: "100%",
    backgroundColor: "#E5E7EB",
    marginLeft: 5,
  },
  priceTag: {
    backgroundColor: "#059669",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  priceText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  textMuted: {
    color: "#6B7280",
    fontSize: 14,
  },
  textPrimary: {
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "medium",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  gridItem: {
    width: "50%",
    padding: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: "#059669",
  },
  statusPending: {
    backgroundColor: "#D97706",
  },
  ctaButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  coverImage: {
    width: "100%",
    height: 200,
    objectFit: "cover",
  },
  footer: {
    backgroundColor: "#F9FAFB",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
  contactInfo: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  contactLabel: {
    color: "#6B7280",
    fontSize: 12,
    width: 80,
  },
  contactValue: {
    color: "#1F2937",
    fontSize: 12,
    flex: 1,
  },
});

// Update the PackagePDF component with enhanced layout
const PackagePDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "Pluto Tours and Travel",
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header Section */}
      <View style={pdfStyles.mainHeader}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.customerName}>
            {packageSummary.package?.customerName || "Customer"}'s trip to
          </Text>
          <Text style={pdfStyles.destinationName}>
            {packageSummary.package?.packageName || "Your Destination"}
          </Text>
          <Text style={pdfStyles.packageDuration}>
            {packageSummary.package?.duration} • Customizable •{" "}
            {packageSummary.package?.packageType}
          </Text>

          {/* Places Coverage */}
          <Text style={pdfStyles.placesCoverage}>
            {packageSummary.package?.packagePlaces
              ?.map((place) => `${place.nights}N ${place.placeCover}`)
              .join(" • ")}
          </Text>
        </View>

        <View style={pdfStyles.headerRight}>
          <Image style={pdfStyles.logo} src="/path/to/your/logo.png" />
        </View>
      </View>

      {/* Quote Description */}
      <View style={pdfStyles.quoteBox}>
        <Text style={pdfStyles.quoteText}>
          Experience the beauty of {packageSummary.package?.packageName} with
          our customized package. Discover local culture, enjoy comfortable
          stays, and create unforgettable memories.
        </Text>
      </View>

      {/* Package Highlights */}
      <View style={pdfStyles.highlightsSection}>
        <Text style={pdfStyles.sectionTitle}>Highlights</Text>
        <View style={pdfStyles.highlightsGrid}>
          <View style={pdfStyles.highlightItem}>
            <View style={pdfStyles.row}>
              <Icons.Hotel />
              <Text style={pdfStyles.highlightCount}>
                {packageSummary.hotels?.length || 0} Hotels
              </Text>
            </View>
          </View>
          <View style={pdfStyles.highlightItem}>
            <Text style={pdfStyles.highlightCount}>
              {packageSummary.activities?.length || 0} Activities
            </Text>
          </View>
          <View style={pdfStyles.highlightItem}>
            <Text style={pdfStyles.highlightCount}>
              {packageSummary.transfer ? "1 Transfer" : "0 Transfers"}
            </Text>
          </View>
        </View>
      </View>

      {/* Agent Details */}
      <View style={pdfStyles.agentSection}>
        <Text style={pdfStyles.agentLabel}>Curated by</Text>
        <Text style={pdfStyles.agentName}>{companyName}</Text>
        <Text style={pdfStyles.agentContact}>Email: info@plutotours.com</Text>
        <Text style={pdfStyles.quoteDate}>
          Quotation Created on {new Date().toLocaleDateString()}{" "}
          {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {/* Company Header with enhanced design */}
      <View style={pdfStyles.companyHeader}>
        <Text style={pdfStyles.companyName}>{companyName}</Text>
        <Text style={pdfStyles.companyTagline}>Your Journey, Our Passion</Text>

        {/* Price tag overlay */}
        <View style={pdfStyles.priceTag}>
          <Text style={pdfStyles.priceText}>
            ₹
            {showMargin
              ? finalTotal.toFixed(0)
              : packageSummary.totals.grandTotal}
          </Text>
        </View>
      </View>

      <Text style={pdfStyles.header}>Travel Package Summary</Text>

      {/* Decorative line */}
      <View style={pdfStyles.decorativeLine} />

      {/* Package Details Section with grid layout */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Package Details</Text>
        <View style={pdfStyles.packageInfoGrid}>
          <View style={pdfStyles.packageInfoItem}>
            <Text style={pdfStyles.packageInfoLabel}>Package Name</Text>
            <Text style={pdfStyles.packageInfoValue}>
              {packageSummary.package?.packageName}
            </Text>
          </View>
          <View style={pdfStyles.packageInfoItem}>
            <Text style={pdfStyles.packageInfoLabel}>Duration</Text>
            <Text style={pdfStyles.packageInfoValue}>
              {packageSummary.package?.duration}
            </Text>
          </View>
          <View style={pdfStyles.packageInfoItem}>
            <Text style={pdfStyles.packageInfoLabel}>Package Type</Text>
            <Text style={pdfStyles.packageInfoValue}>
              {packageSummary.package?.packageType}
            </Text>
          </View>
          <View style={pdfStyles.packageInfoItem}>
            <Text style={pdfStyles.packageInfoLabel}>Pickup Location</Text>
            <Text style={pdfStyles.packageInfoValue}>
              {packageSummary.package?.pickupLocation}
            </Text>
          </View>
          <View style={pdfStyles.packageInfoItem}>
            <Text style={pdfStyles.packageInfoLabel}>Drop Location</Text>
            <Text style={pdfStyles.packageInfoValue}>
              {packageSummary.package?.dropLocation}
            </Text>
          </View>
        </View>
      </View>

      {/* Trip Highlights Box */}
      <View style={pdfStyles.highlightBox}>
        <Text style={pdfStyles.highlightText}>
          Experience the magic of this destination with our carefully curated
          package. Enjoy comfortable stays, seamless transfers, and
          unforgettable experiences throughout your journey.
        </Text>
      </View>

      {/* Places Covered Section */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Places Covered</Text>
        {packageSummary.package?.packagePlaces?.map((place, index) => (
          <View key={index} style={pdfStyles.hotelCard}>
            <View style={pdfStyles.badge}>
              <Text style={pdfStyles.badgeText}>Destination {index + 1}</Text>
            </View>
            <View style={pdfStyles.divider} />
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Destination</Text>
              <Text style={pdfStyles.value}>{place.placeCover}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Nights</Text>
              <Text style={pdfStyles.value}>{place.nights}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Detailed Itinerary Section */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Detailed Itinerary</Text>
        {packageSummary.package?.itineraryDays?.map((day, index) => (
          <View key={index} style={pdfStyles.itineraryCard}>
            <Text style={pdfStyles.dayHeader}>
              Day {day.day} - {day.selectedItinerary.cityName}
            </Text>

            <View style={pdfStyles.itineraryRow}>
              <Text style={pdfStyles.itineraryLabel}>Title:</Text>
              <Text style={pdfStyles.itineraryContent}>
                {day.selectedItinerary.itineraryTitle}
              </Text>
            </View>

            <View style={pdfStyles.itineraryRow}>
              <Text style={pdfStyles.itineraryLabel}>Description:</Text>
              <Text style={pdfStyles.itineraryContent}>
                {day.selectedItinerary.itineraryDescription}
              </Text>
            </View>

            {day.selectedItinerary.cityArea?.length > 0 && (
              <View style={pdfStyles.itineraryRow}>
                <Text style={pdfStyles.itineraryLabel}>Places to Visit:</Text>
                <View style={pdfStyles.placesList}>
                  {day.selectedItinerary.cityArea.map((place, placeIndex) => (
                    <Text key={placeIndex} style={pdfStyles.placeItem}>
                      • {place}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Hotels Section */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Hotel Details</Text>
        {packageSummary.hotels.map((hotel, index) => (
          <View key={index} style={pdfStyles.hotelCard}>
            <View style={pdfStyles.badge}>
              <Text style={pdfStyles.badgeText}>Stay {index + 1}</Text>
            </View>
            <View style={pdfStyles.divider} />
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Day {hotel.day}</Text>
              <Text style={pdfStyles.value}>{hotel.cityName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Property</Text>
              <Text style={pdfStyles.value}>{hotel.propertyName}</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Room Type</Text>
              <Text style={pdfStyles.value}>{hotel.roomName}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Transfer Section */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Transfer Details</Text>
        <View style={pdfStyles.transferCard}>
          <View style={pdfStyles.badge}>
            <Text style={pdfStyles.badgeText}>Transportation</Text>
          </View>
          <View style={pdfStyles.divider} />
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Vehicle Type</Text>
            <Text style={pdfStyles.value}>
              {packageSummary.transfer.details.cabType}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Vehicle Name</Text>
            <Text style={pdfStyles.value}>
              {packageSummary.transfer.details.cabName}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Seating Capacity</Text>
            <Text style={pdfStyles.value}>
              {packageSummary.transfer.details.cabSeatingCapacity}
            </Text>
          </View>
        </View>
      </View>

      {/* Inclusions & Exclusions */}
      <View style={pdfStyles.section}>
        <Text style={pdfStyles.subHeader}>Package Information</Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          {/* Inclusions Column */}
          <View style={{ flex: 1, marginRight: 5 }}>
            <View style={pdfStyles.inclusionSection}>
              <Text style={pdfStyles.inclusionHeader}>Inclusions</Text>
              <Text
                style={[
                  pdfStyles.value,
                  { textAlign: "justify", fontSize: 10 },
                ]}
              >
                {packageSummary.package?.packageInclusions
                  ?.replace(/<[^>]*>/g, "") // Remove HTML tags
                  .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
                  .replace(/&quot;/g, '"') // Replace &quot; with "
                  .replace(/&amp;/g, "&") // Replace &amp; with &
                  .replace(/&lt;/g, "<") // Replace &lt; with <
                  .replace(/&gt;/g, ">") // Replace &gt; with >
                  .trim()}
              </Text>
            </View>
          </View>

          {/* Exclusions Column */}
          <View style={{ flex: 1, marginLeft: 5 }}>
            <View
              style={[
                pdfStyles.inclusionSection,
                { backgroundColor: "#fff1f2", borderLeftColor: "#be123c" },
              ]}
            >
              <Text style={[pdfStyles.inclusionHeader, { color: "#be123c" }]}>
                Exclusions
              </Text>
              <Text
                style={[
                  pdfStyles.value,
                  { textAlign: "justify", fontSize: 10, color: "#be123c" },
                ]}
              >
                {packageSummary.package?.packageExclusions
                  ?.replace(/<[^>]*>/g, "") // Remove HTML tags
                  .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
                  .replace(/&quot;/g, '"') // Replace &quot; with "
                  .replace(/&amp;/g, "&") // Replace &amp; with &
                  .replace(/&lt;/g, "<") // Replace &lt; with <
                  .replace(/&gt;/g, ">") // Replace &gt; with >
                  .trim()}
              </Text>
            </View>
          </View>
        </View>

        {/* Custom Exclusions Section */}
        {packageSummary.package?.customExclusions?.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {packageSummary.package.customExclusions.map((exclusion, index) => (
              <View
                key={index}
                style={[
                  pdfStyles.inclusionSection,
                  {
                    backgroundColor: "#fff1f2",
                    marginTop: 5,
                    borderLeftColor: "#be123c",
                  },
                ]}
              >
                <Text style={[pdfStyles.inclusionHeader, { color: "#be123c" }]}>
                  {exclusion.name}
                </Text>
                <Text
                  style={[
                    pdfStyles.value,
                    { textAlign: "justify", fontSize: 10, color: "#be123c" },
                  ]}
                >
                  {exclusion.description
                    .replace(/<[^>]*>/g, "") // Remove HTML tags
                    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
                    .replace(/&quot;/g, '"') // Replace &quot; with "
                    .replace(/&amp;/g, "&") // Replace &amp; with &
                    .replace(/&lt;/g, "<") // Replace &lt; with <
                    .replace(/&gt;/g, ">") // Replace &gt; with >
                    .trim()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Cost Summary Section */}
      <View style={pdfStyles.totalSection}>
        <Text
          style={[
            pdfStyles.subHeader,
            {
              backgroundColor: "transparent",
              color: "#ffffff",
              marginBottom: 15,
            },
          ]}
        >
          Cost Summary
        </Text>

        <View
          style={[
            pdfStyles.totalRow,
            {
              marginTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#ffffff",
              paddingTop: 8,
            },
          ]}
        >
          <Text style={pdfStyles.grandTotal}>Grand Total</Text>
          <Text style={[pdfStyles.grandTotal, { textAlign: "right" }]}>
            ₹
            {showMargin
              ? finalTotal.toFixed(0)
              : packageSummary.totals.grandTotal}
          </Text>
        </View>
      </View>

      {/* Footer with terms */}
      <View style={pdfStyles.footer}>
        <Text style={pdfStyles.footerText}>
          This quote is valid for 7 days from the date of issue. Terms and
          conditions apply.
        </Text>
      </View>

      {/* Add watermark and page number */}
      <Text style={pdfStyles.watermark}>{companyName} - Confidential</Text>
      <Text
        style={pdfStyles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
        fixed
      />
    </Page>
  </Document>
);

const FinalCosting = () => {
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
  console.log(packageSummary);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const historyResponse = await fetch(
          `${config.API_HOST}/api/history/get`
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

  const calculateMargin = (total, customPercentage = null) => {
    if (customPercentage !== null) {
      return total * (customPercentage / 100);
    }

    // Use margins from API based on total amount
    const firstQuoteMargin = margins.firstQuoteMargins;
    let marginPercentage;

    if (total < 100000) {
      // Less than 1 Lakh
      marginPercentage = Number.parseFloat(firstQuoteMargin.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      // Between 1-2 Lakh
      marginPercentage = Number.parseFloat(firstQuoteMargin.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      // Between 2-3 Lakh
      marginPercentage = Number.parseFloat(firstQuoteMargin.between2To3Lakh);
    } else {
      // More than 3 Lakh
      marginPercentage = Number.parseFloat(firstQuoteMargin.moreThan3Lakh);
    }

    return total * (marginPercentage / 100);
  };

  const marginAmount = calculateMargin(
    packageSummary?.totals?.grandTotal || 0,
    activeMarginPercentage
  );
  const finalTotal = (packageSummary?.totals?.grandTotal || 0) + marginAmount;

  const getCurrentMarginPercentage = () => {
    if (activeMarginPercentage !== null) {
      return activeMarginPercentage;
    }

    const total = packageSummary?.totals?.grandTotal || 0;
    const firstQuoteMargin = margins.firstQuoteMargins;

    if (total < 100000) {
      return Number.parseFloat(firstQuoteMargin.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      return Number.parseFloat(firstQuoteMargin.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      return Number.parseFloat(firstQuoteMargin.between2To3Lakh);
    } else {
      return Number.parseFloat(firstQuoteMargin.moreThan3Lakh);
    }
  };

  const getMinimumMargin = (total) => {
    const minimumMargins = margins.minimumQuoteMargins;

    if (total < 100000) {
      return Number.parseFloat(minimumMargins.lessThan1Lakh);
    } else if (total >= 100000 && total < 200000) {
      return Number.parseFloat(minimumMargins.between1To2Lakh);
    } else if (total >= 200000 && total < 300000) {
      return Number.parseFloat(minimumMargins.between2To3Lakh);
    } else {
      return Number.parseFloat(minimumMargins.moreThan3Lakh);
    }
  };

  const handleSendLink = async () => {
    const timestamp = new Date().toLocaleString();
    const historyItem = {
      timestamp,
      total: packageSummary?.totals?.grandTotal || 0,
      marginPercentage: getCurrentMarginPercentage(),
      finalTotal: finalTotal,
      id: packageSummary.id,
      activities: packageSummary.activities,
      hotels: packageSummary.hotels,
      transfer: {
        details: packageSummary.transfer.details,
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
      const response = await fetch(`${config.API_HOST}/api/history/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(historyItem),
      });

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
    const minimumMargin = getMinimumMargin(total);

    if (marginValue < minimumMargin) {
      setShowWarning(true);
      setShowModal(true);
      return;
    }
    setShowWarning(false);
    setActiveMarginPercentage(marginValue);
    setCustomMarginPercentage("");
  };

  const handleDeleteHistory = async (historyId) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/history/delete/${historyId}`,
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
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              Cost Breakdown
            </h3>
            {!hasConvertedHistory && (
              <button
                onClick={() => setShowMargin(!showMargin)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showMargin ? "Hide Margin" : "Add Margin"}
              </button>
            )}
            {hasConvertedHistory && (
              <div className="text-red-600 text-sm">
                Cannot modify margins - Package already converted
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {/* Hotel Costs */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-medium">Hotel Charges</span>
                <span className="font-semibold text-blue-600">
                  ₹{packageSummary?.totals?.hotelCost || 0}
                </span>
              </div>

              {/* Transfer Costs */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-medium">
                  Transfer Charges
                </span>
                <span className="font-semibold text-blue-600">
                  ₹{packageSummary?.totals?.transferCost || 0}
                </span>
              </div>

              {/* Activity Costs */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-medium">
                  Activity Charges
                </span>
                <span className="font-semibold text-blue-600">
                  ₹{packageSummary?.totals?.activitiesCost || 0}
                </span>
              </div>

              {/* Taxes */}
              <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-medium">Taxes & Fees</span>
                <span className="font-semibold text-blue-600">₹0</span>
              </div>

              {showMargin && !hasConvertedHistory && (
                <>
                  <div className="flex justify-between items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors bg-yellow-50">
                    <span className="text-gray-700 font-medium">
                      Margin ({getCurrentMarginPercentage()}%)
                    </span>
                    <span className="font-semibold text-blue-600">
                      ₹{marginAmount.toFixed(2)}
                    </span>
                  </div>

                  {getCurrentMarginPercentage() >=
                    getMinimumMargin(packageSummary?.totals?.grandTotal || 0) &&
                    !showWarning && (
                      <button
                        onClick={handleSendLink}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Send Link
                      </button>
                    )}
                </>
              )}

              {showCustomMargin && !hasConvertedHistory && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Custom Margin</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customMarginPercentage}
                      onChange={(e) =>
                        setCustomMarginPercentage(e.target.value)
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Enter margin percentage"
                    />
                    <button
                      onClick={handleCustomMarginSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                  {showWarning && (
                    <div className="text-red-600 text-sm">
                      Warning: Margins below 12% require supervisor approval
                    </div>
                  )}
                  {activeMarginPercentage && (
                    <div className="text-green-600 text-sm">
                      Custom margin of {activeMarginPercentage}% applied
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center py-4 px-6 bg-blue-50 rounded-lg mt-6">
                <span className="font-bold text-lg text-gray-800">
                  Grand Total {showMargin && "(with Margin)"}
                </span>
                <span className="font-bold text-xl text-blue-600">
                  ₹
                  {showMargin
                    ? finalTotal.toFixed(2)
                    : packageSummary?.totals?.grandTotal || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* History Section - Narrower */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">History</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-gray-600 text-center italic">
                  No history available for this package
                </p>
              ) : (
                history
                  .filter((item) => item.id === packageSummary.id)
                  .map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg relative">
                      {console.log(item)}
                      <div className="text-sm text-gray-500">
                        {item.timestamp}
                      </div>
                      <div className="flex justify-between mt-2">
                        <span>Total: ₹{item.total}</span>
                        <span>Margin: {item.marginPercentage}%</span>
                      </div>
                      <div className="font-semibold text-blue-600 mt-1">
                        Final: ₹{item.finalTotal.toFixed(2)}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex flex-wrap gap-2">
                          {/* View PDF Button */}
                          <button
                            onClick={() => {
                              setSelectedHistoryItem(item);
                              setShowPdfPreview(true);
                            }}
                            className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            View
                          </button>

                          {/* Download Buttons Container */}
                          <div className="flex flex-col gap-2">
                            {/* Download as Pluto Tours Button */}
                            <PDFDownloadLink
                              document={
                                <PackagePDF
                                  packageSummary={{
                                    ...item,
                                    package: packageSummary.package,
                                  }}
                                  showMargin={true}
                                  marginAmount={item.finalTotal - item.total}
                                  finalTotal={item.finalTotal}
                                  getCurrentMarginPercentage={() =>
                                    item.marginPercentage
                                  }
                                  companyName="Pluto Tours and Travel"
                                />
                              }
                              fileName={`pluto-tours-package-${
                                item.id
                              }-${new Date(item.timestamp).getTime()}.pdf`}
                            >
                              {({ loading }) => (
                                <button
                                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                                  disabled={loading}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {loading ? "Loading..." : "Download as Pluto"}
                                </button>
                              )}
                            </PDFDownloadLink>

                            {/* Download as Demand Setu Button */}
                            <PDFDownloadLink
                              document={
                                <PackagePDF
                                  packageSummary={{
                                    ...item,
                                    package: packageSummary.package,
                                  }}
                                  showMargin={true}
                                  marginAmount={item.finalTotal - item.total}
                                  finalTotal={item.finalTotal}
                                  getCurrentMarginPercentage={() =>
                                    item.marginPercentage
                                  }
                                  companyName="Demand Setu Tour and Travel"
                                />
                              }
                              fileName={`demand-setu-package-${
                                item.id
                              }-${new Date(item.timestamp).getTime()}.pdf`}
                            >
                              {({ loading }) => (
                                <button
                                  className="text-sm px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                                  disabled={loading}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {loading
                                    ? "Loading..."
                                    : "Download as Demand Setu"}
                                </button>
                              )}
                            </PDFDownloadLink>
                            <button
                              onClick={async () => {
                                try {
                                  // Update the history item with converted flag
                                  const response = await fetch(
                                    `${config.API_HOST}/api/history/update/${item._id}`,
                                    {
                                      method: "PUT",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        ...item,
                                        converted: true,
                                      }),
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error("Failed to update history");
                                  }

                                  // Refresh history list
                                  const updatedHistory = history.map(
                                    (historyItem) =>
                                      historyItem._id === item._id
                                        ? { ...historyItem, converted: true }
                                        : historyItem
                                  );
                                  setHistory(updatedHistory);
                                } catch (error) {
                                  console.error(
                                    "Error converting history:",
                                    error
                                  );
                                }
                              }}
                              className={`text-sm px-3 py-1.5 ${
                                item.converted
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap`}
                              disabled={item.converted}
                            >
                              {item.converted ? "Converted" : "Convert"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteHistory(item._id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Add converted status indicator */}
                      {item.converted && (
                        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
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
