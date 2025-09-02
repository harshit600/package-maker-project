import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const PlutoToursPDF = ({ packageSummary, showMargin, marginAmount, finalTotal, getCurrentMarginPercentage, selectedLead }) => {
  return (
    <Document>
      <Page>
        {/* Header with Pluto Tours Blue Theme */}
        <View style={{
          backgroundColor: "#2d2d44",
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
        }}>
          {/* Existing Pluto Tours PDF content with blue theme */}
          {/* ... */}
        </View>
        
        {/* Rest of the Pluto Tours styled content */}
        {/* ... */}
      </Page>
    </Document>
  );
};

export default PlutoToursPDF; 