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
  Calculator: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Info: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#92400E"
      />
    </Svg>
  ),
  Profile: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Group: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Adult: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Child: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Room: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Clock: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
      />
    </Svg>
  ),
  Package: () => (
    <Svg width="16" height="16" viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="#2563EB"
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
});

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
    <Page
      size="A4"
      style={{
        ...pdfStyles.page,
        position: "relative",
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
                fontSize: 35,
                fontWeight: "bold",
                color: "#1E293B",
              }}
            >
              Rs.
              {showMargin
                ? finalTotal.toFixed(0)
                : packageSummary.totals.grandTotal}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: "#6B7280",
                marginTop: 2,
              }}
            >
              For {packageSummary.package?.numberOfAdults || 2} Adults
            </Text>
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
            <Icons.User style={{ width: 14, height: 14, color: "#2563EB" }} />
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
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
                      Name:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                      {selectedLead?.name || "N/A"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
                      Contact:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                      {selectedLead?.mobile || "N/A"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
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
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
                      Date:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                      {selectedLead?.travelDate
                        ? new Date(selectedLead.travelDate).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
                      Duration:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B", flex: 1 }}>
                      {selectedLead?.nights || "0"} Nights /{" "}
                      {selectedLead?.days || "0"} Days
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ fontSize: 9, color: "#64748B", width: 60 }}>
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
                  <View style={{ flexDirection: "row", gap: 4, minWidth: 80 }}>
                    <Text style={{ fontSize: 9, color: "#64748B" }}>
                      Adults:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B" }}>
                      {selectedLead?.adults || "0"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 4, minWidth: 80 }}>
                    <Text style={{ fontSize: 9, color: "#64748B" }}>
                      Children:
                    </Text>
                    <Text style={{ fontSize: 9, color: "#1E293B" }}>
                      {selectedLead?.kids || "0"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 4, minWidth: 80 }}>
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
            <Icons.Map style={{ width: 14, height: 14, color: "#2563EB" }} />
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
              const nextDay = packageSummary.package?.itineraryDays[index + 1];
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
                          color: "#2563EB",
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
                          borderColor: "#2563EB",
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icons.Hotel
                      style={{ width: 14, height: 14, color: "#2563EB" }}
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
                            color: "#2563EB",
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icons.Car
                      style={{ width: 14, height: 14, color: "#2563EB" }}
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
                          color: "#2563EB",
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
                          color: "#2563EB",
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
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
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
                            color: "#2563EB",
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
                        backgroundColor: "#2563EB",
                        borderRadius: 16,
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#FFFFFF",
                        }}
                      >
                        {day.day}
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
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#1E293B",
                            marginBottom: 4,
                          }}
                        >
                          {dayData.itineraryTitle}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Icons.Location
                            style={{ width: 14, height: 14, color: "#64748B" }}
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
                                    color: "#2563EB",
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
                                          backgroundColor: "#2563EB",
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

                        {/* Hotel Details Card */}
                        {dayHotel && (
                          <View
                            style={{
                              marginTop: 16,
                              backgroundColor: "#F8FAFC",
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "#EFF6FF",
                                padding: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: "#BFDBFE",
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
                                <Icons.Hotel
                                  style={{
                                    width: 16,
                                    height: 16,
                                    color: "#2563EB",
                                  }}
                                />
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "bold",
                                    color: "#1E293B",
                                  }}
                                >
                                  Night's Stay
                                </Text>
                              </View>
                              <View
                                style={{
                                  backgroundColor: "#DBEAFE",
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                  borderRadius: 12,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: "#2563EB",
                                    fontWeight: "500",
                                  }}
                                >
                                  {dayHotel.basicInfo.hotelStarRating}★ Rated
                                </Text>
                              </View>
                            </View>

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
                                  alignItems: "center",
                                  gap: 16,
                                  marginTop: 8,
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <Icons.Meals
                                    style={{
                                      width: 14,
                                      height: 14,
                                      color: "#64748B",
                                    }}
                                  />
                                  <Text
                                    style={{ fontSize: 12, color: "#64748B" }}
                                  >
                                    {dayHotel.mealPlan === "MAP"
                                      ? "Breakfast + Dinner"
                                      : dayHotel.mealPlan === "AP"
                                      ? "All Meals"
                                      : dayHotel.mealPlan === "CP"
                                      ? "Breakfast"
                                      : dayHotel.mealPlan}
                                  </Text>
                                </View>
                              </View>
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
                              Included Meals: {dayData.meals}
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
                    color: "#2563EB",
                  }}
                >
                  {(packageSummary.package?.agentName || "P")[0].toUpperCase()}
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
                  style={{ width: 12, height: 12, color: "#2563EB" }}
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
                  style={{ width: 12, height: 12, color: "#2563EB" }}
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
              <Icons.Star style={{ width: 10, height: 10, color: "#2563EB" }} />
              <Text
                style={{
                  fontSize: 8,
                  color: "#2563EB",
                  fontWeight: "bold",
                }}
              >
                5+ Years Experience
              </Text>
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
                    color: "#2563EB",
                    marginTop: 2,
                  }}
                />
                <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                  Hotel accommodation as per itinerary
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
                    color: "#2563EB",
                    marginTop: 2,
                  }}
                />
                <Text style={{ flex: 1, fontSize: 11, color: "#1E293B" }}>
                  Meals as mentioned in the itinerary (MAP - Breakfast & Dinner)
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

          {/* Package Cost Section */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              padding: 24,
              borderRadius: 12,
              marginBottom: 30,
              borderWidth: 1,
              borderColor: "#E2E8F0",
            }}
          >
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
                  style={{ fontSize: 11, color: "#92400E", fontWeight: "500" }}
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
                • 50% advance payment required to confirm booking{"\n"}• Balance
                payment due 15 days before travel date{"\n"}• Prices are subject
                to availability and may change
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

          {/* Break to new page for Terms and Conditions */}

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
