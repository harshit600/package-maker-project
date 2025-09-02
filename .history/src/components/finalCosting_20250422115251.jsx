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
} from "@react-pdf/renderer";
import { Button } from "react-bootstrap";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 100,
    height: 100,
  },
  customerName: {
    fontSize: 24,
    color: "#333",
    marginBottom: 5,
  },
  destinationText: {
    fontSize: 36,
    color: "#2680EB",
    fontWeight: "bold",
    marginBottom: 10,
  },
  packageMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  packageDuration: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  customizableTag: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  customizableText: {
    color: "#ffffff",
    fontSize: 12,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  stayDetails: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
  },
  stayItem: {
    marginRight: 15,
    color: "#666",
    fontSize: 12,
  },
  quotation: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  quotationHeader: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  curatedBy: {
    marginBottom: 5,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  contactInfo: {
    fontSize: 12,
    color: "#666",
  },
  highlightsSection: {
    marginTop: 20,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  highlightItem: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  highlightIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  highlightText: {
    fontSize: 12,
    color: "#333",
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
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerLeft}>
          <Text style={pdfStyles.customerName}>
            {packageSummary.customerName || "Customer"}'s trip to
          </Text>
          <Text style={pdfStyles.destinationText}>
            {packageSummary.package?.destination || "Ladakh"}
          </Text>

          <View style={pdfStyles.packageMeta}>
            <View style={pdfStyles.packageDuration}>
              <Text>{packageSummary.package?.duration || "5N/6D"}</Text>
            </View>
            <View style={pdfStyles.customizableTag}>
              <Text style={pdfStyles.customizableText}>Customizable</Text>
            </View>
            <Text style={pdfStyles.packageTitle}>
              {packageSummary.package?.name || "Best of Ladakh Package"}
            </Text>
          </View>

          <View style={pdfStyles.stayDetails}>
            {packageSummary.hotels?.map((hotel, index, arr) => (
              <React.Fragment key={hotel.id}>
                <Text style={pdfStyles.stayItem}>
                  {hotel.nights}N {hotel.location}
                </Text>
                {index < arr.length - 1 && (
                  <Text style={pdfStyles.stayItem}>•</Text>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        <Image
          style={pdfStyles.headerRight}
          src="/path/to/makemytrip-logo.png"
        />
      </View>

      <View style={pdfStyles.quotation}>
        <Text style={pdfStyles.quotationHeader}>Quotation Details</Text>
        <View style={pdfStyles.curatedBy}>
          <Text>Curated by</Text>
          <Text style={pdfStyles.agentName}>
            {packageSummary.agent?.name || "Travel Expert"}
          </Text>
          <Text style={pdfStyles.contactInfo}>
            Call: {packageSummary.agent?.phone || "+91 XXXXXXXXXX"}
          </Text>
          <Text style={pdfStyles.contactInfo}>
            Email: {packageSummary.agent?.email || "expert@example.com"}
          </Text>
        </View>
      </View>

      <View style={pdfStyles.highlightsSection}>
        <Text style={pdfStyles.highlightsTitle}>Highlights</Text>
        <View style={pdfStyles.highlightsGrid}>
          <View style={pdfStyles.highlightItem}>
            <Text>{packageSummary.flights?.length || 2} Flights</Text>
          </View>
          <View style={pdfStyles.highlightItem}>
            <Text>{packageSummary.hotels?.length || 4} Hotels</Text>
          </View>
          <View style={pdfStyles.highlightItem}>
            <Text>{packageSummary.activities?.length || 6} Activities</Text>
          </View>
          <View style={pdfStyles.highlightItem}>
            <Text>
              {packageSummary.transfer?.details?.length || 6} Transfers
            </Text>
          </View>
        </View>
      </View>

      {/* ... Keep rest of the existing content ... */}
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
