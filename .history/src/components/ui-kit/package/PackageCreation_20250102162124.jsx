import React, { useState } from 'react';
import DayWiseCabPricing from './DayWiseCabPricing';
import HotelCalculation from './HotelCalculation';

const PackageCreation = () => {
  const [selectedCabInfo, setSelectedCabInfo] = useState(null);

  return (
    <div>
      <DayWiseCabPricing
        onCabSelect={(selectedCabData) => {
          setSelectedCabInfo(selectedCabData);
        }}
      />

      <HotelCalculation
        selectedCabInfo={selectedCabInfo}
      />
    </div>
  );
};

export default PackageCreation;
