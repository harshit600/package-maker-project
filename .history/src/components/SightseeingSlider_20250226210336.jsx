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
              <div className="relative w-screen max-w-[70%] transform transition-transform duration-500 ease-in-out translate-x-0 animate-slide-in">
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
                  <div className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4">
                      {/* Search and Filter Header */}
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold">Add Activity, Meal or Transfer</h2>
                          <div className="text-sm text-gray-600">
                            Day {selectedDay?.day}, 2 Adults
                          </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex gap-6 border-b">
                          <button className="text-blue-500 border-b-2 border-blue-500 pb-2 font-medium">
                            ACTIVITY
                          </button>
                          <button className="text-gray-500 pb-2 font-medium">
                            TRANSFERS
                          </button>
                          <button className="text-gray-500 pb-2 font-medium">
                            MEALS
                          </button>
                        </div>

                        {/* Filters */}
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-4">
                            <div className="w-48">
                              <select className="w-full p-2 border rounded-md text-sm">
                                <option>Any Category</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600 mb-1">Price Range (₹481 to ₹7,521)</div>
                              {/* Price slider would go here */}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activities List */}
                      <div className="space-y-4">
                        {sightseeing?.map((sight) => (
                          <div
                            key={sight._id}
                            className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex gap-4">
                              <div className="w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={sight.images?.[0] || "https://placehold.co/100x100?text=Activity"}
                                  alt={sight.placeName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {sight.placeName}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {sight.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Duration {sight.visitDuration || "1 Hour"}
                                  </span>
                                  <span>•</span>
                                  <span>{sight.timing || "Anytime"}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-between">
                                <button
                                  onClick={() => handleSightSelect(sight)}
                                  className={`px-6 py-2 rounded-md text-sm font-medium ${
                                    selectedSights.some((s) => s._id === sight._id)
                                      ? "bg-blue-500 text-white"
                                      : "bg-white text-blue-500 border border-blue-500"
                                  }`}
                                >
                                  {selectedSights.some((s) => s._id === sight._id)
                                    ? "SELECTED"
                                    : "SELECT"}
                                </button>
                                <div className="text-right">
                                  <div className="text-sm text-gray-500">per person</div>
                                  <div className="text-lg font-semibold">+ ₹{sight.price || "481"}</div>
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
