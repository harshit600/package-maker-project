import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  BlobProvider
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
const MyDocument = ({ packageSummary, showMargin, finalTotal, selectedLead }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.text}>
          Package Details
        </Text>
        <Text style={styles.text}>
          {packageSummary?.package?.packageName || 'Package Name Not Available'}
        </Text>
      </View>
    </Page>
  </Document>
);

const DemandSetuPDF = (props) => {
  return (
    <>
      {/* Preview */}
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <MyDocument {...props} />
      </PDFViewer>

      {/* Download Button */}
      <BlobProvider document={<MyDocument {...props} />}>
        {({ url, loading, error }) => (
          <div>
            {loading ? (
              <button disabled>Generating PDF...</button>
            ) : error ? (
              <button disabled>Error</button>
            ) : (
              <a href={url} download="package-details.pdf">
                <button>Download PDF</button>
              </a>
            )}
          </div>
        )}
      </BlobProvider>
    </>
  );
};

export default DemandSetuPDF;
