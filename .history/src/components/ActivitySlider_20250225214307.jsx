import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaClock } from "react-icons/fa";

const ActivitySlider = ({ isOpen, onClose, selectedDay }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Any");
  const [priceRange, setPriceRange] = useState([0, 10000]);

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
    <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Add Activity, Meal or Transfer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b mb-6">
          <button className="text-blue-500 border-b-2 border-blue-500 pb-2">
            ACTIVITY
          </button>
          <button className="text-gray-500">TRANSFERS</button>
          <button className="text-gray-500">MEALS</button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="w-1/3">
              <label className="block text-sm text-gray-600 mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Any">Any</option>
                <option value="Water Activity">Water Activity</option>
                <option value="Flying Activity">Flying Activity</option>
                <option value="Trek Activity">Trek Activity</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm text-gray-600 mb-1">
                Price Range (₹{priceRange[0]} to ₹{priceRange[1]})
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                className="w-full"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
              />
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          {loading ? (
            <div>Loading activities...</div>
          ) : (
            activities
              .filter(
                (activity) =>
                  (selectedCategory === "Any" ||
                    activity.category_id === selectedCategory) &&
                  parseInt(activity.price) <= priceRange[1]
              )
              .map((activity) => (
                <div key={activity.id} className="flex gap-4 border-b pb-4">
                  <img
                    src={`https://backendactivity.plutotours.in/storage/images/products/${activity.image}`}
                    alt={activity.title}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{activity.title}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.short_description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <FaClock />
                      <span>Duration 1 Hour • Anytime</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      + ₹{activity.discount_price}
                    </div>
                    <div className="text-sm text-gray-500">per person</div>
                    <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      SELECT
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitySlider;
