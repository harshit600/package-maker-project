import React, { useState, useCallback } from "react";

const SightseeingSlider = ({
  isOpen,
  onClose,
  selectedDay,
  sightseeing,
  onSightseeingSelect,
}) => {
  const [selectedSights, setSelectedSights] = useState([]);

  const handleSightSelect = useCallback(
    (sight) => {
      console.log("handleSightSelect called with:", sight); // Debug log 1

      if (!selectedDay || !onSightseeingSelect) {
        console.log("Missing selectedDay or onSightseeingSelect:", {
          selectedDay,
          onSightseeingSelect,
        }); // Debug log 2
        return;
      }

      const sightWithDay = {
        ...sight,
        dayNumber: selectedDay.day,
        quantity: 1,
        price: sight.price || 0,
        imageUrl:
          sight.images?.[0] || "https://placehold.co/100x100?text=Sight",
      };

      console.log("Sight with day:", sightWithDay); // Debug log 3
      onSightseeingSelect(sightWithDay);
      onClose();
    },
    [selectedDay, onSightseeingSelect, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              {/* Header */}
              <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Add Sightseeing</h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Day {selectedDay?.day}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="space-y-4">
                    {sightseeing?.map((sight) => (
                      <div
                        key={sight._id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <img
                              src={
                                sight.images?.[0] ||
                                "https://placehold.co/100x100?text=Sight"
                              }
                              alt={sight.placeName}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x100?text=Sight";
                              }}
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {sight.placeName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {sight.description}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {sight.visitDuration || "1-2 hours"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                  </svg>
                                  {sight.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              ₹{sight.price || 0}
                            </p>
                            <button
                              onClick={() => handleSightSelect(sight)}
                              className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              SELECT
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SightseeingSlider;
