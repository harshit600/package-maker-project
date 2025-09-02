// components/CabCard.js
import React from "react";

const CabCard = ({ cab, onEdit, onDelete }) => {
  return (
    <div className="border w-[320px] rounded-lg shadow-lg m-4 bg-white overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl">
      <div className="relative">
        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            className="bg-[rgb(45,45,68)] text-white p-2 rounded-full hover:bg-opacity-90"
            onClick={() => onEdit(cab)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            className="bg-red-600 text-white p-2 rounded-full hover:bg-opacity-90"
            onClick={() => onDelete(cab._id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
