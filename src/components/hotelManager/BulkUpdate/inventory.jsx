import React from 'react';

function Inventory({ roomNames, handleSave, handleAvailabilityChange, availabilityValues, activeTab }) {
  return (
    <div>
      {/* "BULK UPDATE INVENTORY" content */}
      <h3 className="text-md font-bold mb-2">UPDATE INVENTORY BELOW</h3>
      <div className="border-t mb-4"></div>

      <div className="grid grid-cols-1 gap-6">
        {roomNames.map((roomName) => (
          <div key={roomName} className="border border-gray-200 p-4 rounded-md">
            <h4 className="text-sm font-semibold mb-4">{roomName}</h4>
            <div className="grid grid-cols-3 gap-4">
              {["b2b", "b2c", "website"].map((category) => (
                <div key={category}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    {category.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    placeholder={`Enter availability for ${category}`}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={availabilityValues[category]?.[roomName]?.availability?.[0]?.available || ""} // Displaying the first date's availability
                    onChange={(e) => {
                      const newAvailability = [
                        {
                          date: new Date().toISOString(), // Placeholder for the actual date
                          available: parseInt(e.target.value) || 0,
                          sold: 0, // Assuming sold is initially 0
                        },
                      ];
                      handleAvailabilityChange(category, roomName, newAvailability);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="mt-6 w-full absolute right-[40px] bottom-5 flex justify-end items-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-500 text-white font-medium rounded-md"
        >
          {activeTab === 0 ? "SAVE AND NEXT" : "SAVE"} {/* Change button text based on tab */}
        </button>
      </div>
    </div>
  );
}

export default Inventory;