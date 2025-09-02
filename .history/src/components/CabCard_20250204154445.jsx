// components/CabCard.js
import React from "react";

const CabCard = ({ cab }) => {
  return (
    <div className="border w-[320px] rounded-lg shadow-lg m-4 bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        {/* Favorite button */}
        <button className="absolute top-4 right-4 z-10">
          <svg
            className="w-6 h-6 text-gray-400 hover:text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

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

        {/* Price */}
        <div className="flex justify-end mt-2">
          <p className="text-lg font-bold">${cab.price}</p>
          <span className="text-gray-500 ml-1">/hora</span>
        </div>

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
