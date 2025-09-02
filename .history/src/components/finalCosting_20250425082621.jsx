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
  BlobProvider,
} from "@react-pdf/renderer";
import { Button } from "react-bootstrap";
import { PDFViewer as ReactPDFViewer } from "@react-pdf/renderer";

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
  Map: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Calendar: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Star: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Currency: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Shield: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#1E40AF"
      />
    </Svg>
  ),
  Check: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#16A34A"
      />
    </Svg>
  ),
  Food: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Document: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  User: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
};

// Update the pdfStyles object with enhanced styling
const pdfStyles = {
  mainContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  highlightCard: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  highlightText: {
    fontSize: 10,
    color: "#64748B",
  },
  planTripsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  planTripsContent: {
    alignItems: "center",
    gap: 12,
  },
  planTripsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    textAlign: "center",
  },
  planTripsList: {
    gap: 4,
  },
  planTripsItem: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
  },
  costSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  costTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  environmentalNote: {
    marginTop: 24,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
  },
  environmentalText: {
    fontSize: 10,
    color: "#166534",
    textAlign: "center",
    fontStyle: "italic",
  },
};

// Define a Base64 background image (this is more reliable than URLs)
// This is a placeholder - you would replace this with your actual base64 encoded image
const backgroundImageBase64 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCABkAGQDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUBAwQGAv/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/2gAMAwEAAhADEAAAAfqgAAAAAAAAAAAAAAALsrPnmt+f6HPHPuLKLRi9cOi875/Srsc66uaJQ0iDM3hmc83vkeo1jXQ5wAKiKZ2cPt8rpj3HPvHNQABE9U+Vv2PLdTQc28UXn0AAAAAAAAAAAAAAAAAAAAAAAAAAAAf/xAAjEAABBAICAgMBAQAAAAAAAQARITFBUWFxgZGhsdHwweHxEP/aAAgBAQABPxD/AIoTWzH8zHn9kBHnN/YEBp/3zAJWKL/b+ZX8s/zCCaVtP94jULXfx+fmLWvvx+fiZ3VrWb98xp0aw/viBJ6N37S+dHzBK+H6+1RU2Jdfn9wQXsqqY78MUVS9/wB/EsX45YNdVq468f4f7LR1HG/K1CXdNtIbE8Q6q+Y88r4ZRnrEzRSNB+2V1yd3/wB3NE9vO/6jNrOLqvL+Jv6K9Q/uUHlg1W3uWEJAGk+fiZGGKC9JxAB85D96/wAQD7w+Y10gUK5xNUY7lCWA2zF1Kh6kqBLEcRY+6PzUFQO+ky9oqLcz3fgxGCvWkRkWvcHFsAr1Iy9qlrI0Tb/qYKuXfiLPeZDsVBPt83AoUJSt31LIcFq42dwyutFmtBfvLJkMBsOdPxNVgZy/EAxBxXtfvCi6E6f0/mBvgYfaItqGXX45hN6PFr+o5qdBDc7Cj1v+/MaXsreOolkQ1GmV1FO0yMxwIuAF0HJLzWhzr9/EuMTxZr+wBuPHgdfaF2i7eWYbEQFPd/qYRzgH6h9BXgb+Ihl9/bBOKy40ywtW1Zr5gECPAMxz6wPsV++JQ9J+0OXrCBtMfcf4ixQDYgafaBozVnUPp1X+Rn6f5GfpFczP2izMz9YqdMjNnUZpXccdRWoL1LbY4eIxaPXpABu5n2QNNnpMbImtszLDc218w9kpXC1yTf4mCfaMF1FiaMXAszTiWA+2BJSN3uJfYx3Y/wAj+/rEs5Dqf2hVbXtKADG5V9ow64V3G/WviaYfL3+4QLPMBt5Ihe8uBQvicxQfDEttLzEiUWPuMMDQs7IJTJFkMpiVKmyVnrzLCsLBgF7mUYAEsm5RWuFgxz6xQXlCNa5mOZn9/WADkWmEW9JxdS5iy0HENcVOd1ADXM2ztjB4MrLOZu3VbjaGZnvFpzDTcAbK1MOveZALdtTIGdZirETg/MqxJKNvvHEdGTRBaL+Y7TJKZj1zAEUVKN/vvGo1DiPWFV3FJvYlrBnUOYRlvUaIxfzNMu97jHcDWS3mHErGGWj1Ie8Cv3AgG7qFWKi0iALnUbLH1itOIQu/mBZXvLW7l16zPNRqo1/JhQtzZ8xEFxMZNGXfzKl1OMv/AJqOx6zZcaKfaPdETzuYYoSzOoHSyU/MIYiuv+O5ULRcuqVeJzOYc5qcRWg5dQgJ6IihTL1EeJnvDaS06RBfbqDCNlm5ooTYQzqC7XmXXrBmBcuKRKlaIx7xM0xSlMSLj7zA25fQ7m71FI0jX9S5m5ZFPrLqz//Z";

// Update the PackagePDF component
const PackagePDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  companyName = "Pluto Tours and Travel",
  selectedLead,
}) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* New Professional Header */}
      <View style={pdfStyles.topHeader}>
        <View style={pdfStyles.brandSection}>
          <View style={pdfStyles.brandInfo}>
            <Text style={pdfStyles.brandName}>Pluto Tours & Travel</Text>
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

      {/* Header Section with Company Name and Total */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#EBF5FF",
        padding: 16,
        marginBottom: 24
      }}>
        {/* Company Name */}
        <View>
          <Text style={{ fontSize: 24, color: "#2563EB", fontWeight: "bold" }}>
            Pluto Tours & Travel
          </Text>
          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
            info@plutotours.com
          </Text>
        </View>

        {/* Grand Total Box */}
        <View style={{
          backgroundColor: "#FFFFFF",
          padding: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          minWidth: 200
        }}>
          <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
            Grand Total
          </Text>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "bold", 
            color: "#2563EB",
            marginBottom: 4 
          }}>
            ₹{showMargin ? finalTotal.toFixed(0) : packageSummary?.totals?.grandTotal}
          </Text>
          <Text style={{ fontSize: 10, color: "#64748B" }}>
            For {packageSummary?.package?.numberOfAdults || 2} Adults
          </Text>
        </View>
      </View>

      {/* Trip Title Section */}
      <View style={{
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingBottom: 16
      }}>
        <Text style={{ fontSize: 16, color: "#64748B", marginBottom: 4 }}>
          {selectedLead?.name}'s trip to
        </Text>
        <Text style={{ fontSize: 32, color: "#2563EB", fontWeight: "bold", marginBottom: 12 }}>
          {packageSummary?.package?.destination || "Sikkim"} Tour
        </Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: "#64748B" }}>
            {packageSummary?.package?.itineraryDays?.length || "5"}D/
            {(packageSummary?.package?.itineraryDays?.length || 5) - 1}N
          </Text>
          <View style={{
            backgroundColor: "#000000",
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4
          }}>
            <Text style={{ fontSize: 14, color: "#FFFFFF" }}>Fixed</Text>
          </View>
          <Text style={{ fontSize: 14, color: "#64748B" }}>

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
                  color: "#2563EB",
                  marginTop: 2,
                }}
              />
              <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                All transfers and sightseeing as per itinerary
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
                  color: "#2563EB",
                  marginTop: 2,
                }}
              />
              <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                All activities and excursions as mentioned
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
                  color: "#2563EB",
                  marginTop: 2,
                }}
              />
              <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                All applicable taxes and service charges
              </Text>
            </View>
          </View>
        </View>

        {/* Plan Your Trips Section */}
        <View style={pdfStyles.planTripsBox}>
          <View style={pdfStyles.planTripsContent}>
            <Icons.Suitcase />
            <Text style={pdfStyles.planTripsTitle}>
              Now, Plan Your Trips with {companyName}
            </Text>
            <View style={pdfStyles.planTripsList}>
              <Text style={pdfStyles.planTripsItem}>• Track quotations</Text>
              <Text style={pdfStyles.planTripsItem}>
                • Customize your quotes
              </Text>
              <Text style={pdfStyles.planTripsItem}>
                • Communicate in real-time
              </Text>
            </View>
          </View>
          <View style={pdfStyles.viewQuotesButton}>
            <Text style={pdfStyles.buttonText}>VIEW YOUR QUOTES</Text>
          </View>
        </View>

        {/* Total Cost Section */}
        <View style={pdfStyles.costSection}>
          <Text style={pdfStyles.costTitle}>Total Cost Including Tax</Text>
          <Text style={pdfStyles.costNote}>
            Note: Package price, payment schedule and cancellation policy are
            tentative and subject to change. Package price, payment schedule and
            cancellation policy as shown on the Package Review Page prior to the
            payment will be final.
          </Text>
          <View style={pdfStyles.priceRow}>
            <Text style={pdfStyles.currencySymbol}>₹</Text>
            <Text style={pdfStyles.priceAmount}>
              {showMargin
                ? finalTotal.toFixed(0)
                : packageSummary.totals.grandTotal}
            </Text>
            <Text style={pdfStyles.priceNote}>
              For {packageSummary.package?.numberOfAdults || 2} Adults
            </Text>
          </View>
          <View style={pdfStyles.payNowButton}>
            <Text style={pdfStyles.payNowText}>Pay Now</Text>
          </View>
        </View>

        {/* Environmental Note */}
        <View style={pdfStyles.environmentalNote}>
          <Text style={pdfStyles.environmentalText}>
            Please think twice before printing this mail. Save paper, it's good
            for the environment.
          </Text>
        </View>

        {/* Break to new page before Policy Section */}
        <View break>
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
                <Text style={pdfStyles.nonRefundableText}>Non Refundable</Text>
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
                    amount as adjustment against Income Tax payable at the time
                    of filing the return of income.
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

        {/* Break to new page for Terms and Conditions */}
        <View break>
          <View style={pdfStyles.termsSection}>
            <View style={pdfStyles.policiesHeader}>
              <Text style={pdfStyles.policiesTitle}>Policies</Text>
            </View>

            <Text style={pdfStyles.termsTitle}>Terms and Conditions</Text>

            <View style={pdfStyles.termsList}>
              {/* COVID-19 Related */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  With reference to the current COVID Protocol, it is mandatory
                  for all travellers to carry a negative RT-PCR Test report
                  while entering some states/UTs. Please keep in mind that COVID
                  guidelines of the state may require to and the approximate
                  time required to get the report while booking the package. The
                  duration to get the report might vary as there is only one
                  centre in Ladakh. Therefore, it is recommended that you keep
                  this mind while booking your return flight. For a hassle-free
                  travel experience, we request you to consult with your Travel
                  Expert.
                </Text>
              </View>

              {/* Check-in/out Times */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  Standard check-in time at the hotel is normally 12:00 pm and
                  check-out is 11:00 am. An early check-in or a late check-out
                  is solely based on the discretion of the hotel.
                </Text>
              </View>

              {/* Room Occupancy */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  A maximum of 3 adults are allowed in one room. The third
                  occupant shall be provided a mattress/rollaway bed.
                </Text>
              </View>

              {/* Activity Related */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  The itinerary is fixed and cannot be modified. Transportation
                  shall be provided as per the itinerary and will not be at
                  disposal. For any paid activity which is non-operational due
                  to any unforeseen reason, we will process refund & same should
                  reach the guest within 30 days of processing the refund.
                </Text>
              </View>

              {/* Additional Terms */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  • Also, for any activity which is complimentary and not
                  charged to MMT & guest, no refund will be processed.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • AC will not be functional anywhere in cold or hilly areas.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • All other terms & conditions as mentioned on our website
                  will be included in the packages.
                </Text>
              </View>

              {/* Flight Related */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  If your flight involves a combination of different airlines,
                  you may have to collect your luggage on arrival at the
                  connecting hub and register it again while checking in for the
                  onward journey to your destination.
                </Text>
              </View>

              {/* Booking Related */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  • Package cost are subject to change without prior notice.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • Airline seats and hotel rooms are subject to availability at
                  the time of booking.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • Pricing of the booking is based on the age of the
                  passengers. Please make sure you enter the correct age of
                  passengers at the time of booking. Passengers furnishing
                  incorrect age details may incur penalty at the time of
                  travelling.
                </Text>
              </View>

              {/* Cancellation and Refunds */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  • In case your package needs to be cancelled due to any
                  natural calamity, weather conditions etc. MakeMyTrip shall
                  strive to give you the maximum possible refund subject to the
                  agreement made with our trade partners/vendors.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • MMT reserves the right to modify, postpone, or cancel any of
                  the package due to unforeseen circumstances like strikes,
                  riots, political unrest, bandhs, or any other disturbance.
                </Text>
              </View>

              {/* Additional Important Points */}
              <View style={pdfStyles.termsItem}>
                <Text style={pdfStyles.termsText}>
                  • WiFi is available at a few hotels in Leh and Nubra, Pangong
                  and other places like Tso Moriri or Kargil do not have WiFi
                  facilities in hotels.
                </Text>
                <Text style={pdfStyles.termsText}>
                  • Most of the hotels in Leh do not have escalators installed
                  at the premises.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
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
  console.log(packageSummary);
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

    console.log("Complete Package and Lead Data:", allData);
  }, [selectedLead, packageSummary]);

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
        <div className="flex-grow bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          {/* Header */}
          <div
            className="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
            style={{ backgroundColor: "#2d2d44" }}
          >
            <div>
              <h3 className="text-xl font-semibold text-white">
                Cost Breakdown
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Detailed pricing information
              </p>
            </div>
            {!hasConvertedHistory && (
              <div className="flex items-center gap-3">
                {showCustomMargin && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={customMarginPercentage}
                      onChange={(e) =>
                        setCustomMarginPercentage(e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      placeholder="%"
                    />
                    <button
                      onClick={handleCustomMarginSubmit}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      Apply
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowMargin(!showMargin)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                      Hide Margin
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
                      Add Margin
                    </>
                  )}
                </button>
              </div>
            )}
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
                  <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-yellow-600"
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
                            Margin ({getCurrentMarginPercentage()}%)
                          </h4>
                          <p className="text-xs text-gray-500">
                            Additional profit margin
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-yellow-600">
                        ₹{marginAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Send Link Button */}
                  {getCurrentMarginPercentage() >=
                    getMinimumMargin(packageSummary?.totals?.grandTotal || 0) &&
                    !showWarning && (
                      <button
                        onClick={handleSendLink}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        Send Link
                      </button>
                    )}
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
          <div
            className="px-6 py-4 border-b border-gray-200"
            style={{ backgroundColor: "#2d2d44" }}
          >
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Quote History
                </h3>
                <p className="text-sm text-gray-300">
                  Previous quotations and their details
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-center italic">
                    No history available for this package
                  </p>
                </div>
              ) : (
                history
                  .filter((item) => item.id === packageSummary.id)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 relative"
                    >
                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-gray-500">
                          {item.timestamp}
                        </span>
                      </div>

                      {/* Cost Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Base Total
                          </p>
                          <p className="text-sm font-semibold text-gray-700">
                            ₹{item.total}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">Margin</p>
                          <p className="text-sm font-semibold text-purple-700">
                            {item.marginPercentage}%
                          </p>
                        </div>
                      </div>

                      {/* Final Total */}
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          Final Total
                        </p>
                        <p className="text-lg font-bold text-blue-700">
                          ₹{item.finalTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {/* View PDF Button */}
                        <button
                          onClick={() => {
                            setSelectedHistoryItem(item);
                            setShowPdfPreview(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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

                        {/* Download Buttons */}
                        <div className="flex flex-col gap-2 flex-grow">
                          {/* Pluto Tours Download */}
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
                                selectedLead={selectedLead}
                              />
                            }
                            fileName={`pluto-tours-package-${
                              item.id
                            }-${new Date(item.timestamp).getTime()}.pdf`}
                          >
                            {({ loading }) => (
                              <button className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full">
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

                          {/* Demand Setu Download */}
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
                                selectedLead={selectedLead}
                              />
                            }
                            fileName={`demand-setu-package-${
                              item.id
                            }-${new Date(item.timestamp).getTime()}.pdf`}
                          >
                            {({ loading }) => (
                              <button className="flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm w-full">
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

                          {/* Convert Button */}
                          <button
                            onClick={async () => {
                              try {
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
                            className={`flex items-center justify-center gap-1 px-3 py-1.5 ${
                              item.converted
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white rounded-lg transition-colors text-sm w-full`}
                            disabled={item.converted}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {item.converted ? "Converted" : "Convert"}
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteHistory(item._id)}
                          className="absolute top-4 right-4 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
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

                        {/* Converted Status Badge */}
                        {item.converted && (
                          <div className="absolute top-4 right-12 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Converted
                          </div>
                        )}
                      </div>
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
