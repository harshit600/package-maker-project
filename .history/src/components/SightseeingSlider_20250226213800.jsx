import React, { useState, useEffect } from "react";

const SightseeingSlider = ({
  isOpen,
  onClose,
  selectedDay,
  sightseeing,
  onSightseeingSelect,
  initialSelectedSights = [],
}) => {
  const [selectedSights, setSelectedSights] = useState(initialSelectedSights);

  useEffect(() => {
    if (isOpen) {
      setSelectedSights(initialSelectedSights);
    }
  }, [isOpen, initialSelectedSights]);

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

            <div className="fixed inset-y-0 right-0 flex">
              <div className="relative w-[50vw] transform transition-transform duration-500 ease-in-out translate-x-0 animate-slide-in">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-[#2D2D44] px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl text-white font-medium">
                          Add Sightseeing
                        </h2>
                        <p className="text-sm text-gray-300">
                          Day {selectedDay?.day}
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
                  <div className="flex-1 bg-white overflow-y-auto">
                    <div className="p-4">
                      {sightseeing?.map((sight) => (
                        <div
                          key={sight._id}
                          className="mb-4 bg-gray-100 rounded-lg"
                        >
                          <div className="flex p-4">
                            <div className="w-[200px] h-[150px] bg-gray-200 rounded-lg flex-shrink-0">
                              <img
                                src={
                                  sight.images?.[0] ||
                                  "https://placehold.co/200x150?text=Sight"
                                }
                                alt={sight.placeName}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/200x150?text=Sight";
                                }}
                              />
                            </div>
                            <div className="flex-1 ml-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-xl font-medium text-gray-900">
                                    {sight.placeName}
                                  </h3>
                                  <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                    {sight.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleSightSelect(sight)}
                                  className={`px-6 py-2 rounded-md text-sm font-medium ${
                                    selectedSights.some(
                                      (s) => s._id === sight._id
                                    )
                                      ? "bg-blue-500 text-white"
                                      : "text-blue-500 bg-white border border-blue-500"
                                  }`}
                                >
                                  {selectedSights.some(
                                    (s) => s._id === sight._id
                                  )
                                    ? "Selected"
                                    : "Select"}
                                </button>
                              </div>
                              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="w-5 h-5"
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
                                    className="w-5 h-5"
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

                  {/* Footer */}
                  <div className="border-t border-gray-200 p-4">
                    <button
                      onClick={onClose}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium"
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
