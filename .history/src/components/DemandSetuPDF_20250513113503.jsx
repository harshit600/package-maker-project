import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// First define the Svg component if you're using @react-pdf/renderer
const SvgIcon = ({ children, width, height, viewBox }) => (
  <Svg width={width} height={height} viewBox={viewBox}>
    {children}
  </Svg>
);

// Update the pdfStyles object with enhanced styling
const pdfStyles = StyleSheet.create({
  page: {
    padding: 10,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 20,
  },
  companyHeader: {
    backgroundColor: "#0a4d7a",
    padding: 10,
    marginBottom: 10,
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
    color: "#2d2d44",
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
    color: "#2d2d44",
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
    color: "#2d2d44",
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
    color: "#2d2d44",
    fontSize: 12,
    fontWeight: "medium",
  },
  dayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2d2d44",
  },
  timelinePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2d2d44",
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
    color: "#2d2d44",
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
    backgroundColor: "#2d2d44",
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
  contentSection: {
    padding: 20,
  },
  contentsBox: {
    marginBottom: 20,
  },
  contentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentsList: {
    marginLeft: 20,
  },
  contentsItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  contentsNumber: {
    color: "#2d2d44",
    marginRight: 10,
    fontSize: 14,
  },
  contentsText: {
    fontSize: 14,
    color: "#2d2d44",
  },
  agentInfoBox: {
    backgroundColor: "#F3F9FF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  curatedByText: {
    fontSize: 12,
    color: "#64748B",
  },
  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  highlightItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  highlightIcon: {
    marginRight: 8,
  },
  highlightText: {
    fontSize: 12,
    color: "#1E293B",
  },
  ctaBox: {
    backgroundColor: "#E0F2FE",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  ctaContent: {
    alignItems: "center",
    marginBottom: 15,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 10,
  },
  ctaFeatures: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  ctaFeatureText: {
    fontSize: 12,
    color: "#334155",
  },
  ctaButton: {
    backgroundColor: "#2d2d44",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalCostSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalCostTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  totalCostNote: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 15,
  },
  priceDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  priceSymbol: {
    fontSize: 20,
    color: "#0F172A",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginRight: 10,
  },
  priceNote: {
    fontSize: 12,
    color: "#64748B",
  },
  payNowButton: {
    backgroundColor: "#2d2d44",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  payNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  environmentalNote: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  environmentalText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingBottom: 10,
  },

  headerLeft: {
    flex: 1,
    marginRight: 0,
  },

  customerHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },

  customerName: {
    fontSize: 23, // Increased from 18
    fontWeight: "bold",
    color: "#111827",
    marginRight: 4,
  },

  tripText: {
    fontSize: 31, // Increased from 24
    color: "#111827",
  },

  destinationName: {
    fontSize: 30, // Increased from 40
    fontWeight: "bold",
    color: "rgb(45 45 68)",
    marginBottom: 16,
    letterSpacing: -1,
  },

  packageInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },

  durationText: {
    backgroundColor: "#F3F4F6",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 18, // Increased from 14
    color: "#374151",
  },

  customizableBadge: {
    backgroundColor: "#000000",
    padding: "4 8",
    borderRadius: 4,
  },

  customizableText: {
    color: "#FFFFFF",
    fontSize: 18, // Increased from 14
  },

  packageTypeText: {
    fontSize: 21, // Increased from 16
    fontWeight: "bold",
    color: "#111827",
  },

  itineraryBreakdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },

  stayInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  stayText: {
    fontSize: 18, // Increased from 14
    color: "#6B7280",
  },

  bulletPoint: {
    fontSize: 18, // Increased from 14
    color: "#6B7280",
  },

  descriptionBox: {
    marginTop: 2,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },

  quoteSymbol: {
    fontSize: 36,
    color: "#9CA3AF",
    position: "absolute",
    top: -20,
    left: -8,
  },

  descriptionText: {
    fontSize: 18, // Increased from 14
    color: "#4B5563",
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  headerRight: {
    justifyContent: "center",
    alignItems: "center",
  },

  logoImage: {
    width: 100,
    height: 100,
    objectFit: "contain",
  },

  mainContent: {
    padding: 10,
  },

  contentsSection: {
    marginBottom: 14,
  },

  contentsList: {
    gap: 4,
  },

  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  contentNumber: {
    width: 24,
    height: 24,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  numberText: {
    color: "#2d2d44",
    fontSize: 14,
    fontWeight: "bold",
  },

  contentLink: {
    color: "#2d2d44",
    fontSize: 14,
  },

  agentBox: {
    backgroundColor: "#F3F9FF",
    padding: 6,
    borderRadius: 8,
    marginBottom: 14,
  },

  curatedByText: {
    fontSize: 12,
    color: "#64748B",
  },

  agentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 4,
  },

  contactText: {
    fontSize: 12,
    color: "#4B5563",
  },

  quotationDate: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
  },

  highlightsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  highlightCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  highlightText: {
    fontSize: 14,
    color: "#1E293B",
  },

  planTripsBox: {
    backgroundColor: "#E0F2FE",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },

  planTripsContent: {
    alignItems: "center",
    marginBottom: 16,
  },

  planTripsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
    marginVertical: 12,
  },

  planTripsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  planTripsItem: {
    fontSize: 12,
    color: "#334155",
  },

  viewQuotesButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 24,
    alignItems: "center",
  },

  buttonText: {
    color: "#2d2d44",
    fontSize: 14,
    fontWeight: "bold",
  },

  costSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },

  costTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },

  costNote: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },

  currencySymbol: {
    fontSize: 20,
    color: "#0F172A",
    marginRight: 4,
  },

  priceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
    marginRight: 8,
  },

  priceNote: {
    fontSize: 12,
    color: "#64748B",
  },

  payNowButton: {
    backgroundColor: "#2d2d44",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  payNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  environmentalNote: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 16,
    marginTop: 24,
  },

  environmentalText: {
    fontSize: 11,
    color: "#64748B",
    fontStyle: "italic",
    textAlign: "center",
  },

  topHeader: {
    backgroundColor: "#E0F2FE",
    padding: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  brandInfo: {
    flexDirection: "column",
  },

  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
    letterSpacing: -0.5,
  },

  brandTagline: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },

  contactSection: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  contactIcon: {
    width: 16,
    height: 16,
  },

  contactText: {
    fontSize: 12,
    color: "#1F2937",
  },

  headerDivider: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  itinerarySection: {
    marginTop: 20,
    padding: 20,
  },

  itineraryTitle: {
    fontSize: 24,
    color: "rgb(45 45 68)",
    marginBottom: 20,
  },

  flightInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 8,
  },

  flightIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  flightText: {
    fontSize: 12,
    color: "#4A4A4A",
  },

  transferInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  locationCard: {
    backgroundColor: "#FFF1EE",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  locationPin: {
    width: 16,
    height: 16,
    marginRight: 8,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },

  dayContainer: {
    marginBottom: 15,
  },

  dayHeader: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },

  activityIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },

  activityText: {
    fontSize: 11,
    color: "#333333",
  },

  hotelInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },

  hotelIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },

  hotelName: {
    fontSize: 11,
    color: "#333333",
    fontWeight: "bold",
  },

  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  mealIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
  },

  mealText: {
    fontSize: 11,
    color: "#666666",
  },

  verticalLine: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#E5E5E5",
  },

  cityAreasContainer: {
    marginTop: 8,
    paddingLeft: 24,
  },

  cityAreaTitle: {
    fontSize: 11,
    color: "#4A4A4A",
    fontWeight: "bold",
    marginBottom: 4,
  },

  cityAreaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  cityAreaBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666666",
    marginRight: 8,
  },

  cityAreaText: {
    fontSize: 11,
    color: "#4A4A4A",
  },

  transferContainer: {
    backgroundColor: "#F5F7FA",
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },

  transferHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  transferTitle: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "bold",
    marginLeft: 8,
  },

  transferDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingLeft: 28,
  },

  transferDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  transferLabel: {
    fontSize: 10,
    color: "#6B7280",
  },

  transferValue: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "medium",
  },

  transferDivider: {
    height: 12,
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },

  hotelContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 12,
  },

  hotelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  hotelTitle: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "bold",
    marginLeft: 8,
  },

  hotelDetails: {
    paddingLeft: 28,
  },

  hotelPropertyName: {
    fontSize: 11,
    color: "#111827",
    marginBottom: 4,
  },

  hotelLocation: {
    fontSize: 10,
    color: "#6B7280",
  },

  propertyPhotosContainer: {
    marginBottom: 16,
  },

  propertyMainPhotoContainer: {
    width: "100%",
    height: 150,
    marginBottom: 8,
    borderRadius: 6,
    overflow: "hidden",
  },

  propertyMainPhoto: {
    width: "100%",
    height: "100%",
  },

  propertyPhotoGrid: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },

  thumbnailContainer: {
    width: 80,
    height: 60,
    borderRadius: 4,
    overflow: "hidden",
  },

  propertyThumbnail: {
    width: "100%",
    height: "100%",
  },

  roomDetailsContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
  },

  roomTypeTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },

  roomImage: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 4,
  },

  roomImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },

  hotelInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 12,
    gap: 12,
  },

  hotelInfoItem: {
    width: "45%", // Allows 2 items per row with gap
  },

  infoLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "medium",
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F3F6FF",
    borderRadius: 4,
    marginBottom: 12,
  },

  locationText: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: 8,
  },

  hotelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  hotelMainInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },

  hotelImageContainer: {
    width: 200,
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
  },

  hotelImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  hotelInfo: {
    flex: 1,
  },

  hotelHeaderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  hotelTypeTag: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  hotelTypeText: {
    color: "rgb(45 45 68)",
    fontSize: 12,
    fontWeight: "medium",
  },

  ratingTag: {
    backgroundColor: "rgb(45 45 68)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "medium",
  },

  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },

  hotelAddress: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },

  distanceText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
  },

  checkInOutContainer: {
    flexDirection: "row",
    gap: 24,
  },

  checkInOut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  checkTime: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "medium",
  },

  roomDetailsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },

  roomTypeHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },

  roomDetailsGrid: {
    flexDirection: "row",
    gap: 24,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    marginBottom: 16,
  },

  roomDetailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "medium",
  },

  inclusionsSection: {
    marginTop: 12,
  },

  inclusionsHeader: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 8,
  },

  inclusionsText: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 1.5,
  },

  policySection: {
    marginTop: 24,
    padding: 16,
  },

  policyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },

  policyContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    overflow: "hidden",
  },

  currentPolicyHeader: {
    backgroundColor: "#4B5563",
    padding: 8,
  },

  currentPolicyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "medium",
  },

  policyTimelineContainer: {
    padding: 16,
    position: "relative",
  },

  policyTimeline: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },

  timelineGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor:
      "linear-gradient(90deg, #BBF7D0 0%, #FEF08A 50%, #FECACA 100%)",
  },

  cancelIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 20,
    height: 20,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelX: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  afterBookingText: {
    position: "absolute",
    right: 16,
    top: 32,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "medium",
  },

  nonRefundableText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 4,
  },

  noChangeText: {
    fontSize: 12,
    color: "#6B7280",
  },

  policyPoints: {
    padding: 16,
    gap: 12,
  },

  policyPoint: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },

  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4B5563",
    marginTop: 6,
  },

  policyText: {
    flex: 1,
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 1.5,
  },

  termsSection: {
    padding: 24,
  },

  policiesHeader: {
    marginBottom: 24,
  },

  policiesTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },

  termsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },

  termsList: {
    gap: 16,
  },

  termsItem: {
    gap: 8,
  },

  termsText: {
    fontSize: 11,
    color: "#4B5563",
    lineHeight: 1.5,
  },

  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4B5563",
    marginTop: 6,
    marginRight: 8,
  },

  bulletedText: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  section: {
    margin: 10,
    padding: 10,
    borderBottom: 1,
    borderColor: "#ccc",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d2d44",
  },
  subsection: {
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#444",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "45%",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: "#333",
  },

  leadDetailsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  leadInfoBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  leadSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
    marginBottom: 8,
  },

  leadInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  leadInfoItem: {
    minWidth: 150,
  },

  leadInfoLabel: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 2,
  },

  leadInfoValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "500",
  },

  costBreakdownSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  costComponent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
    gap: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  costLabel: {
    fontSize: 11,
    color: "#1E293B",
  },

  costValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#111827",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 8,
    marginBottom: 8,
  },

  grandTotalSection: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 6,
    marginTop: 8,
  },

  grandTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
  },

  paymentTerms: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  dayLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
    marginBottom: 12,
  },
  subsection: {
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#444",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "45%",
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: "#333",
  },

  leadDetailsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  leadInfoBox: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  leadSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
    marginBottom: 8,
  },

  leadInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  leadInfoItem: {
    minWidth: 150,
  },

  leadInfoLabel: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 2,
  },

  leadInfoValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "500",
  },

  costBreakdownSection: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  costComponent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 6,
    marginBottom: 16,
    gap: 12,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  costLabel: {
    fontSize: 11,
    color: "#1E293B",
  },

  costValue: {
    fontSize: 11,
    fontWeight: "500",
    color: "#111827",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 8,
    marginBottom: 8,
  },

  grandTotalSection: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 6,
    marginTop: 8,
  },

  grandTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
  },

  paymentTerms: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  daySection: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "rgb(45 45 68)",
  },
  dayLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 1.5,
  },
  iconContainer: {
    backgroundColor: "rgb(45 45 68 / 0.05)",
    padding: 8,
    borderRadius: 6,
  },

  icon: {
    width: 16,
    height: 16,
    color: "rgb(45 45 68)",
  },

  link: {
    color: "rgb(45 45 68)",
    textDecoration: "underline",
  },

  highlightText: {
    color: "rgb(45 45 68)",
    fontWeight: "500",
  },

  leadDetailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid #E2E8F0",
    marginBottom: 20,
  },

  sectionHeader: {
    backgroundColor: "rgb(45 45 68)",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  headerIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
  },

  headerIcon: {
    fontSize: 16,
  },

  sectionHeaderText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  detailsGrid: {
    padding: 16,
  },

  detailsSection: {
    marginBottom: 16,
  },

  sectionSubHeader: {
    backgroundColor: "#F8FAFC",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },

  subHeaderText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "bold",
  },

  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },

  infoItem: {
    minWidth: 150,
    backgroundColor: "#F8FAFC",
    padding: 8,
    borderRadius: 6,
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "medium",
  },

  exclusionsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  exclusionsHeader: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  exclusionsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#991B1B",
  },

  exclusionsList: {
    gap: 12,
    marginBottom: 16,
  },

  exclusionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginTop: 6,
  },

  exclusionText: {
    flex: 1,
    fontSize: 11,
    color: "#1E293B",
  },

  customExclusion: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  customExclusionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },

  customExclusionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 4,
  },

  customBulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#64748B",
    marginTop: 6,
  },

  customExclusionText: {
    flex: 1,
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.4,
  },

  accountDetailsSection: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  accountDetailsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  bankCard: {
    width: "47%",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2D2D44",
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    textAlign: "center",
  },
  bankDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 4,
  },
  bankLabel: {
    fontSize: 11,
    color: "#64748B",
    flex: 1,
  },
  bankValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "medium",
    flex: 2,
  },
  upiSection: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  upiCard: {
    flex: 1,
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  upiTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2D2D44",
    marginBottom: 8,
    textAlign: "center",
  },
  upiValue: {
    fontSize: 11,
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  hotelsSection: {
    margin: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: "#2d2d44",
    padding: 12,
    borderRadius: 6,
  },
  headerIcon: {
    width: 20,
    height: 20,
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  hotelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    overflow: "hidden",
  },
  hotelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  hotelName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    flex: 1,
    fontFamily: "Helvetica-Bold", // Use standard PDF font
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2d2d44",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  starIcon: {
    width: 12,
    height: 12,
    color: "#FCD34D",
  },
  ratingText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold", // Use standard PDF font
  },
  hotelDetails: {
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    width: 14,
    height: 14,
    color: "#64748B",
  },
  detailText: {
    fontSize: 11,
    color: "#475569",
    fontFamily: "Helvetica", // Use standard PDF font
  },
  amenitiesSection: {
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  amenitiesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "45%",
  },
  checkIcon: {
    width: 12,
    height: 12,
    color: "#16A34A",
  },
  amenityText: {
    fontSize: 11,
    color: "#475569",
    fontFamily: "Helvetica", // Use standard PDF font
  },
  accountDetailsSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  accountDetailsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
    borderBottom: "2px solid #E2E8F0",
    paddingBottom: 10,
  },
  bankGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  bankCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2d2d44",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #E2E8F0",
  },
  bankDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 4,
  },
  bankLabel: {
    fontSize: 11,
    color: "#64748B",
    flex: 1,
  },
  bankValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "medium",
    flex: 2,
  },
  upiSection: {
    marginTop: 20,
    display: "flex",
    flexDirection: "row",
    gap: 16,
  },
  upiCard: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  upiTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 8,
  },
  upiValue: {
    fontSize: 11,
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
});

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

export default DemandSetuPDF;
