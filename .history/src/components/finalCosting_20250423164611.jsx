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
  Suitcase: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Globe: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Email: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Phone: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Car: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Location: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
};

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
    color: "#2563EB",
    marginRight: 10,
    fontSize: 14,
  },
  contentsText: {
    fontSize: 14,
    color: "#2563EB",
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
    backgroundColor: "#2563EB",
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
    backgroundColor: "#2563EB",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 4,
  },

  tripText: {
    fontSize: 24,
    color: "#111827",
  },

  destinationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
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
    fontSize: 14,
    color: "#374151",
  },

  customizableBadge: {
    backgroundColor: "#000000",
    padding: "4 8",
    borderRadius: 4,
  },

  customizableText: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  packageTypeText: {
    fontSize: 16,
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
    fontSize: 14,
    color: "#6B7280",
  },

  bulletPoint: {
    fontSize: 14,
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
    fontSize: 14,
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
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "bold",
  },

  contentLink: {
    color: "#2563EB",
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
    color: "#2563EB",
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
    backgroundColor: "#2563EB",
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
    color: "#1E40AF",
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
    color: "#0066FF",
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
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "medium",
  },

  ratingTag: {
    backgroundColor: "#4F46E5",
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
    marginTop: 12, // reduced from 24
    padding: 8, // reduced from 16
  },

  policyTitle: {
    fontSize: 20, // reduced from 24
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8, // reduced from 16
  },

  policyContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6, // reduced from 8
    overflow: 'hidden',
  },

  currentPolicyHeader: {
    backgroundColor: '#4B5563',
    padding: 4, // reduced from 8
  },

  currentPolicyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "medium",
  },
