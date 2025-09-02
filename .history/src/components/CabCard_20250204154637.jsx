// components/CabCard.js
import React from "react";

const CabCard = ({ cab }) => {
  return (
    <div className="border w-[320px] rounded-lg shadow-lg m-4 bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Edit button */}
          <button className="p-1.5 bg-white rounded-full hover:bg-gray-100">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete button */}
          <button className="p-1.5 bg-white rounded-full hover:bg-gray-100">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Favorite button */}
          <button className="p-1.5 bg-white rounded-full hover:bg-gray-100">
            <svg
              className="w-5 h-5 text-gray-600 hover:text-red-500"
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
        </div>

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
