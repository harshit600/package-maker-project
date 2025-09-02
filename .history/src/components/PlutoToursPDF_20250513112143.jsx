import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Icons } from '../icons';

const PlutoToursPDF = ({
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
      backgroundColor: '#FFFFFF',
    },
    header: {
      backgroundColor: "#2d2d44",
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
      color: "#E2E8F0",
      marginTop: 4,
    },
    packageTitle: {
      fontSize: 14,
      color: "#E2E8F0",
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
      color: "#E2E8F0",
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
      color: "#64748B",
    },
    statValue: {
      fontSize: 11,
      fontWeight: "bold",
      color: "#1E293B",
    },
    // Add more styles for other sections...
  });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.container}>
        {/* Header Section */}
        <View style={pdfStyles.header}>
          {/* Company Info */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={pdfStyles.companyTitle}>Pluto Tours & Travels</Text>
              <Text style={pdfStyles.companySubtitle}>Your Trusted Travel Partner</Text>
            </View>
            <Image
              source="https://res.cloudinary.com/dcp1ev1uk/image/upload/v1724223770/logo_easm3q.png"
              style={{ width: 100, height: 30 }}
            />
          </View>

          {/* Package Title */}
          <View style={{ marginTop: 16 }}>
            <Text style={pdfStyles.packageTitle}>PACKAGE TITLE</Text>
            <Text style={pdfStyles.packageName}>
              {packageSummary?.package?.packageName || "Custom Package"}
            </Text>
          </View>

          {/* Customer Details */}
          <View style={pdfStyles.customerDetails}>
            <View style={pdfStyles.detailsRow}>
              <View style={pdfStyles.detailColumn}>
                <Text style={pdfStyles.detailLabel}>CUSTOMER NAME</Text>
                <Text style={pdfStyles.detailValue}>
                  {selectedLead?.name || "Guest"}
                </Text>
              </View>
              <View style={pdfStyles.detailColumn}>
                <Text style={pdfStyles.detailLabel}>TRAVEL DATE</Text>
                <Text style={pdfStyles.detailValue}>
                  {selectedLead?.travelDate
                    ? new Date(selectedLead.travelDate).toLocaleDateString()
                    : "TBD"}
                </Text>
              </View>
              <View style={pdfStyles.detailColumn}>
                <Text style={pdfStyles.detailLabel}>DURATION</Text>
                <Text style={pdfStyles.detailValue}>
                  {packageSummary?.package?.itineraryDays?.length || 0} Days
                </Text>
              </View>
            </View>
          </View>

          {/* Package Stats */}
          <View style={pdfStyles.statsContainer}>
            {/* Add your stats items here */}
          </View>
        </View>

        {/* Add the rest of your PDF content sections here */}
        {/* This would include:
            - Itinerary Details
            - Hotel Information
            - Activities
            - Cost Breakdown
            - Terms and Conditions
            etc. */}
      </Page>
    </Document>
  );
};

export default PlutoToursPDF;
