import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ActivitySlider = ({
  isOpen,
  onClose,
  selectedDay,
  selectedPackage,
  setSelectedPackage,
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const config = {
    API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedDay]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const cityName = selectedDay?.selectedItinerary?.cityName;
      
      if (!cityName) {
        throw new Error("No city selected");
      }

      const response = await fetch(
        `${config.API_HOST}/api/activities/get-activities-by-city/${cityName}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivitySelect = (activity) => {
    // Check if activity is already selected
    const isSelected = selectedActivities.some((a) => a._id === activity._id);

    if (isSelected) {
      setSelectedActivities(selectedActivities.filter((a) => a._id !== activity._id));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleSaveActivities = () => {
    // Update the package with selected activities for the current day
    const updatedPackage = { ...selectedPackage };
    const dayIndex = selectedDay.day - 1;

    if (!updatedPackage.package.itineraryDays[dayIndex].activities) {
      updatedPackage.package.itineraryDays[dayIndex].activities = [];
    }

    updatedPackage.package.itineraryDays[dayIndex].activities = selectedActivities;
    setSelectedPackage(updatedPackage);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="px-4 py-6 bg-[rgb(45,45,68)] sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white">
                  Activities in {selectedDay?.selectedItinerary?.cityName}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-md text-gray-300 hover:text-white focus:outline-none"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="px-4 py-6 space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      onClick={() => handleActivitySelect(activity)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedActivities.some((a) => a._id === activity._id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={activity.images[0]}
                            alt={activity.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {activity.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {activity.description}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-900">
                              ₹{activity.price} per person
                            </span>
                            <span className="text-sm text-gray-500">
                              Duration: {activity.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-4 flex justify-end border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-300 rounded-md shadow-sm mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivities}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-transparent rounded-md shadow-sm"
              >
                Save Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySlider;
