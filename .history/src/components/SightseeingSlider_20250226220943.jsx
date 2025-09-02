import React, { useState, useEffect } from "react";

const SightseeingSlider = ({
  isOpen,
  onClose,
  selectedDay,
  sightseeing,
  onSightseeingSelect,
  initialSelectedSights = [],
  onRemoveSightseeing
}) => {
  const [selectedSights, setSelectedSights] = useState(initialSelectedSights);
  const [availableSights, setAvailableSights] = useState([]);

  // Update states when props change
  useEffect(() => {
    if (isOpen) {
      setSelectedSights(initialSelectedSights);
      setAvailableSights(sightseeing || []);
    }
  }, [isOpen, initialSelectedSights, sightseeing]);

  const handleSightSelect = (sight) => {
    const isSelected = selectedSights.some((s) => s._id === sight._id);
    let updatedSights;

    if (isSelected) {
      updatedSights = selectedSights.filter((s) => s._id !== sight._id);
      onRemoveSightseeing(sight._id);
    } else {
      const newSight = {
        ...sight,
        dayNumber: selectedDay?.day
      };
      updatedSights = [...selectedSights, newSight];
    }

    setSelectedSights(updatedSights);
    onSightseeingSelect(updatedSights);
  };

  const handleRemove = (sightId) => {
    const updatedSights = selectedSights.filter((s) => s._id !== sightId);
    setSelectedSights(updatedSights);
    onSightseeingSelect(updatedSights);
    onRemoveSightseeing(sightId);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex">
              <div className="relative w-[50vw]">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-[#2D2D44] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl text-white font-medium">
                          Add Sightseeing
                        </h2>
                        <p className="text-sm text-gray-300">
                          Day {selectedDay?.day} - {selectedSights.length} Selected
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="text-white hover:bg-white/10 rounded-lg p-2"
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
                      {availableSights.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No sightseeing spots available for this day
                        </div>
                      ) : (
                        availableSights.map((sight) => (
                          <div
                            key={sight._id}
                            className={`mb-4 rounded-lg border ${
                              selectedSights.some((s) => s._id === sight._id)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex gap-4">
                                <div className="w-48 h-32 flex-shrink-0">
                                  <img
                                    src={sight.images?.[0] || "https://placehold.co/200x150?text=Sight"}
                                    alt={sight.placeName}
                                    className="w-full h-full object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://placehold.co/200x150?text=Sight";
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="text-lg font-semibold">
                                        {sight.placeName}
                                      </h3>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {sight.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {selectedSights.some((s) => s._id === sight._id) && (
                                        <button
                                          onClick={() => handleRemove(sight._id)}
                                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-1 text-sm"
                                        >
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
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                          Remove
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleSightSelect(sight)}
                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                          selectedSights.some((s) => s._id === sight._id)
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                                        }`}
                                      >
                                        {selectedSights.some((s) => s._id === sight._id)
                                          ? "Selected"
                                          : "Select"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SightseeingSlider;
