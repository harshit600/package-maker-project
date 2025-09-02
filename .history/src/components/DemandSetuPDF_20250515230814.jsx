import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFViewer,
  BlobProvider,
  Image
} from "@react-pdf/renderer";

// Define Icons as simple text components since SVG might not be supported
const Icons = {
  Email: () => <Text>📧</Text>,
  User: () => <Text>👤</Text>,
  Profile: () => <Text>👤</Text>,
  Calendar: () => <Text>📅</Text>,
  Location: () => <Text>📍</Text>,
  Phone: () => <Text>📞</Text>,
  Group: () => <Text>👥</Text>,
  Map: () => <Text>🗺️</Text>,
  Room: () => <Text>🛏️</Text>,
  Food: () => <Text>🍽️</Text>,
  Activity: () => <Text>🎯</Text>,
  Meals: () => <Text>🍳</Text>,
  Car: () => <Text>🚗</Text>,
  Check: () => <Text>✓</Text>,
  Close: () => <Text>✕</Text>,
  Info: () => <Text>ℹ️</Text>,
  Star: () => <Text>⭐</Text>,
  Document: () => <Text>📄</Text>,
  Hotel: () => <Text>🏨</Text>,
  Globe: () => <Text>🌐</Text>,
  Facebook: () => <Text>fb</Text>,
  Instagram: () => <Text>ig</Text>,
  Twitter: () => <Text>tw</Text>,
};

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
  }
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

// Create the main component
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

// Make sure to export the component
export default DemandSetuPDF;
