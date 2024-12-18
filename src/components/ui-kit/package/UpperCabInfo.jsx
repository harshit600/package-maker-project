import React from 'react';

function UpperCabInfo({ cabsData, pricing, isEditing }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-2">Route Information</h3>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Pickup:</span> {cabsData?.pickupLocation}</p>
          <p><span className="font-medium">Drop:</span> {cabsData?.dropLocation}</p>
          {cabsData?.packagePlaces?.map((place, index) => (
            <p key={index}><span className="font-medium">Stop {index + 1}:</span> {place.placeCover}</p>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-2">Price Summary</h3>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">On Season Price:</span> 
            ₹{isEditing && cabsData?.travelPrices?.prices?.lowestOnSeasonPrice || pricing?.lowestOnSeasonPrice || 0}
          </p>
          <p>
            <span className="font-medium">Off Season Price:</span> 
            ₹{isEditing && cabsData?.travelPrices?.prices?.lowestOffSeasonPrice || pricing?.lowestOffSeasonPrice || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpperCabInfo;
