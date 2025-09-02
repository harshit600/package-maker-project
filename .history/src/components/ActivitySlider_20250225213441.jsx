import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ActivitySlider = ({ isOpen, onClose, selectedDay }) => {
  console.log('ActivitySlider props:', { isOpen, selectedDay }); // Debug log

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Any");
  const [priceRange, setPriceRange] = useState([0, 10000]); // Adjust max price as needed

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          "https://backendactivity.plutotours.in/api/products"
        );
        const data = await response.json();
        setActivities(data.Product || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Slider */}
      <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-[rgb(45,45,68)] text-white">
            <div>
              <h2 className="text-xl font-semibold">
                Add Activity, Meal or Transfer
              </h2>
              <p className="text-sm opacity-80">Day {selectedDay?.day}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full"
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

          {/* Tabs */}
          <div className="flex border-b">
            <button className="px-6 py-3 text-blue-500 border-b-2 border-blue-500">
              ACTIVITY
            </button>
            <button className="px-6 py-3 text-gray-500">TRANSFERS</button>
            <button className="px-6 py-3 text-gray-500">MEALS</button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex gap-4 items-center">
              <div className="w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="Any">Any</option>
                  <option value="Water Activity">Water Activity</option>
                  <option value="Trek Activity">Trek Activity</option>
                  <option value="Flying Activity">Flying Activity</option>
                </select>
              </div>
              <div className="flex-1">
                <p className="mb-2">
                  Price Range (₹{priceRange[0]} to ₹{priceRange[1]})
                </p>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-4">Loading activities...</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-4 border-b">
                  <img
                    src={`https://backendactivity.plutotours.in/storage/images/${activity.image}`}
                    alt={activity.title}
                    className="w-40 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.short_description}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Duration 1 Hour • Anytime
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            + ₹{activity.discount_price}
                          </p>
                          <p className="text-sm text-gray-500">per person</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                          SELECT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivitySlider;
