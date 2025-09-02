// components/CabCard.js
import React from "react";

const CabCard = ({ cab }) => {
  return (
    <div className="border w-[320px] rounded-lg shadow-lg m-4 bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        {/* Action buttons */}
      

        <img
          src={cab.cabImages[0]}
          alt={cab.cabName}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="p-4">
        {/* Brand and Model */}
        <p className="text-sm text-gray-600 font-medium">{cab.cabType}</p>
        <h2 className="text-xl font-bold text-gray-800 mt-1">{cab.cabName}</h2>

        {/* Features */}
        <div className="flex items-center gap-4 mt-4 text-gray-600 text-sm">
          <div className="flex items-center">
            <span>Manual</span>
          </div>
          <div className="flex items-center">
            <span>{cab.cabSeatingCapacity} asientos</span>
          </div>
          <div className="flex items-center">
            <span>{cab.luggageCapacity} maletas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CabCard;
