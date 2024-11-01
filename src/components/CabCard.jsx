// components/CabCard.js
import React from 'react';

const CabCard = ({ cab }) => {
  return (
    <div className="border w-[320px] rounded-lg shadow-lg m-4 bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      <img
        src={cab.cabImages[0]}
        alt={cab.cabName}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors duration-300">
          {cab.cabName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">{cab.cabType}</p>
        <div className="flex justify-between gap-1 mt-3">
          <div className="flex items-center">
            <p className="ml-1 text-gray-700">{cab.cabSeatingCapacity} Seats</p>
          </div>
          <div className="flex items-center">
            <p className="ml-1 text-gray-700">{cab.cabLuggage}</p>
          </div>
        </div>
        <button className="mt-4 w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors duration-300">
          Edit
        </button>
      </div>
    </div>
  );
};

export default CabCard;
