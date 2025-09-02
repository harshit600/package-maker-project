<DayWiseCabPricing
  onCabSelect={(selectedCabData) => {
    setSelectedCabInfo(selectedCabData);
  }}
/>

<HotelCalculation
  selectedCabInfo={selectedCabInfo}
/> 