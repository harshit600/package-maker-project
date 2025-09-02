import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
  },
});

// Create Document Component
const DemandSetuPDF = ({
  packageSummary,
  showMargin,
  finalTotal,
  selectedLead,
}) => {
  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.text}>Package Details</Text>
            <Text style={styles.text}>
              {packageSummary?.package?.packageName ||
                "Package Name Not Available"}
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default DemandSetuPDF;
