import React, { createContext, useContext, useState } from 'react';

const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const [packageSummary, setPackageSummary] = useState(null);

  return (
    <PackageContext.Provider value={{ packageSummary, setPackageSummary }}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
}; 