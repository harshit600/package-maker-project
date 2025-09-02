import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  Svg,
  Path,
  BlobProvider,
  Image,
} from "@react-pdf/renderer";

// Define your styles
const styles = StyleSheet.create({
  // ... your styles ...
});

// Define the main component
const DemandSetuPDF = ({ packageSummary, showMargin, finalTotal, selectedLead }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Your PDF content */}
        <View>
          <Text>Your PDF Content</Text>
        </View>
      </Page>
    </Document>
  );
};

// Make sure to export the component
export default DemandSetuPDF;
