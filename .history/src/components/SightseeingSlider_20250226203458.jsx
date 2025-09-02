import React, { useState } from "react";

const SightseeingSlider = ({
  isOpen,
  onClose,
  selectedDay,
  sightseeing,
  onSightseeingSelect,
}) => {
  const [selectedSights, setSelectedSights] = useState([]);

  const handleSightSelect = (sight) => {
    const isSelected = selectedSights.some((s) => s._id === sight._id);
    let updatedSights;
    console.log("Selected Sightseeing:", selectedSights);
    if (isSelected) {
      updatedSights = selectedSights.filter((s) => s._id !== sight._id);
    } else {
      updatedSights = [
        ...selectedSights,
        { ...sight, dayNumber: selectedDay?.day },
      ];
    }

    setSelectedSights(updatedSights);
    onSightseeingSelect(updatedSights);
    console.log("Selected Sightseeing:", updatedSights);
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

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-[rgb(45,45,68)] px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">
                          Add Sightseeing
                        </h2>
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
                            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
                              selectedSights.some((s) => s._id === sight._id)
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex">
                              <div className="w-1/3 h-[200px] flex-shrink-0">
                                <img
                                  src={
                                    sight.images?.[0] ||
                                    "https://placehold.co/100x100?text=Sight"
                                  }
                                  alt={sight.placeName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/100x100?text=Sight";
                                  }}
                                />
                              </div>
                              <div className="w-2/3 p-6">
                                <div className="flex justify-between items-start">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {sight.placeName}
                                  </h3>
                                  <button
                                    onClick={() => handleSightSelect(sight)}
                                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                                      selectedSights.some((s) => s._id === sight._id)
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                  >
                                    {selectedSights.some((s) => s._id === sight._id)
                                      ? "Selected"
                                      : "Select"}
                                  </button>
                                </div>
                                <p className="text-gray-600 mt-2 line-clamp-2">
                                  {sight.description}
                                </p>
                                <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="w-5 h-5 text-gray-500"
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
                                  <span className="flex items-center gap-2">
                                    <svg
                                      className="w-5 h-5 text-gray-500"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-4">
                    <button
                      onClick={onClose}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Done
                    </button>
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
