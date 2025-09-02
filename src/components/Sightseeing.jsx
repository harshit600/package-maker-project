import React from 'react';
import { FaPlus } from 'react-icons/fa';

const Sightseeing = ({
  day,
  citySightseeing,
  selectedPackage,
  handleRemoveSightseeing,
  handleOpenSightseeingSlider,
  setSelectedDayForSightseeing,
  setCitySightseeing,
  filterSightseeingByCity,
  currentCity
}) => {
  return (
    <div className="space-y-6">
      {/* Add Sightseeing Button */}
      <div
        onClick={() => {
          const filteredSightseeing = filterSightseeingByCity(currentCity);
          setCitySightseeing(filteredSightseeing);
          setSelectedDayForSightseeing(day);
          handleOpenSightseeingSlider(day);
        }}
        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
      >
        <div className="p-3 bg-blue-100 rounded-full">
          <FaPlus className="text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold">Add Sightseeing to your day</h3>
          <p className="text-sm text-gray-600">
            Spend the day at leisure or add an activity, transfer or meal
          </p>
        </div>
      </div>

      {/* Sightseeing List */}
      {citySightseeing && citySightseeing.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Sightseeing Header */}
          <div className="bg-[rgb(45,45,68)] text-white px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
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
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Sightseeing for Day {day.day}
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {selectedPackage?.sightseeing?.filter(
                      (sight) =>
                        Number(sight.dayNumber) === Number(day.day)
                    ).length || 0}{" "}
                    selected spots
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Sightseeing List */}
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4">
              {selectedPackage?.sightseeing
                ?.filter(
                  (spot) =>
                    Number(spot.dayNumber) === Number(day.day)
                )
                .map((spot) => (
                  <div
                    key={spot._id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={spot.images?.[0] || "https://placehold.co/100x100?text=Spot"}
                          alt={spot.placeName}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=Spot";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h5 className="text-lg font-semibold text-gray-900">
                              {spot.placeName}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {spot.description || "No description available"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSightseeing(spot._id)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1.5 text-sm"
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
                        </div>

                        {/* Spot Details */}
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
                            {spot.visitDuration || "1-2 hours"}
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
                            {spot.location || "Local attraction"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sightseeing; 