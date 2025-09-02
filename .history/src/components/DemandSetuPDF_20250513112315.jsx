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
      backgroundColor: '#FFFFFF',
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
      <Page size="A4" style={pdfStyles.container}>
        {/* Header Section */}
        <View style={pdfStyles.header}>
          {/* Company Info */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={pdfStyles.companyTitle}>Demand Setu Tours & Travels</Text>
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
        </View>

        {/* Itinerary Section */}
        <View style={pdfStyles.itinerarySection}>
          <Text style={pdfStyles.itineraryTitle}>Itinerary Details</Text>
          {packageSummary?.package?.itineraryDays?.map((day, index) => (
            <View key={index} style={{ marginBottom: 16 }}>
              <Text style={pdfStyles.dayTitle}>Day {index + 1}: {day.selectedItinerary.cityName}</Text>
              <Text style={pdfStyles.activityText}>{day.selectedItinerary.description}</Text>
            </View>
          ))}
        </View>

        {/* Cost Section */}
        <View style={pdfStyles.costSection}>
          <Text style={pdfStyles.costTitle}>Cost Breakdown</Text>
          <View style={pdfStyles.costRow}>
            <Text style={pdfStyles.costLabel}>Base Price</Text>
            <Text style={pdfStyles.costValue}>₹ {packageSummary?.basePrice || 0}</Text>
          </View>
          {showMargin && (
            <View style={pdfStyles.costRow}>
              <Text style={pdfStyles.costLabel}>Margin</Text>
              <Text style={pdfStyles.costValue}>₹ {marginAmount || 0}</Text>
            </View>
          )}
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.costLabel, { fontWeight: "bold" }]}>Total Amount</Text>
            <Text style={[pdfStyles.costValue, { fontSize: 14 }]}>₹ {finalTotal || 0}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default DemandSetuPDF;
