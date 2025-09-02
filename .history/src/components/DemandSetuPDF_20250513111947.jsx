import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const DemandSetuPDF = ({
  packageSummary,
  showMargin,
  marginAmount,
  finalTotal,
  getCurrentMarginPercentage,
  selectedLead,
}) => {
  return (
    <Document>
      <Page>
        {/* Header with Demand Setu Orange Theme */}
        <View
          style={{
            backgroundColor: "#EA580C",
            padding: 24,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          {/* Same structure but with orange theme */}
          {/* ... */}
        </View>

        {/* Rest of the Demand Setu styled content */}
        {/* ... */}
      </Page>
    </Document>
  );
};

export default DemandSetuPDF;
