// components/CabCard.js
import React, { useState } from "react";

const CabCard = ({ cab, onEdit, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(cab._id);
    setShowDeleteModal(false);
  };

  return (
    <>
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
              onClick={handleDelete}
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
          <h2 className="text-xl font-bold text-gray-800 mt-1">
            {cab.cabName}
          </h2>

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this cab? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CabCard;
