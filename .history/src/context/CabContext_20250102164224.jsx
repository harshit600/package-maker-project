import React, { createContext, useContext, useState } from 'react';

const CabContext = createContext();

export function CabProvider({ children }) {
  const [cabData, setCabData] = useState({
    prices: {},
    seasonDates: {},
    selectedCab: null,
    pricing: {
      lowestOnSeasonPrice: 0,
      lowestOffSeasonPrice: 0
    }
  });

  return (
    <CabContext.Provider value={{ cabData, setCabData }}>
      {children}
    </CabContext.Provider>
  );
}

export function useCabData() {
  const context = useContext(CabContext);
  if (!context) {
    throw new Error('useCabData must be used within a CabProvider');
  }
  return context;
} 