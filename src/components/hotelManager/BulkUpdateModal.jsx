import React, { useState } from 'react';
import Modal from './Modal';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // Main style file
import 'react-date-range/dist/theme/default.css'; // Theme CSS file
import UpdateInventory from './UpdateInventory';
import { format, eachDayOfInterval } from 'date-fns'; // For handling date ranges

function BulkUpdateModal({ modalShow, closeModal, hotelData, propertyId }) {
  // State to manage the date range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  // State to track if the date range is confirmed
  const [isRangeConfirmed, setIsRangeConfirmed] = useState(false);

  // State to toggle the visibility of the date range picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State to track if user has chosen merge option
  const [hasChosenMergeOption, setHasChosenMergeOption] = useState(false);

  // State to track merge preference
  const [mergeWithPreviousData, setMergeWithPreviousData] = useState(false);

  console.log("BulkUpdateModal - hotelData:", hotelData);
  console.log("BulkUpdateModal - has hotelData:", !!hotelData);
  console.log("BulkUpdateModal - hotelData keys:", hotelData ? Object.keys(hotelData) : []);

  // Function to handle date range selection
  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  // Function to confirm the date range and proceed
  const handleConfirm = () => {
    setIsRangeConfirmed(true);
    setShowDatePicker(false);
  };

  // Function to handle merge option selection
  const handleMergeOptionSelect = (mergeWithPrevious) => {
    setMergeWithPreviousData(mergeWithPrevious);
    setHasChosenMergeOption(true);
    setShowDatePicker(true);
  };

  // Helper function to generate all dates in the selected range
  const generateDateRange = () => {
    const { startDate, endDate } = dateRange[0];
    return eachDayOfInterval({ start: startDate, end: endDate }).map((date) =>
      format(date, 'yyyy-MM-dd')
    );
  };

  // Helper function to find continuous date ranges
  const findContinuousDateRanges = (dates) => {
    if (!dates || dates.length === 0) return [];
    
    const sortedDates = [...new Set(dates)].sort();
    const ranges = [];
    let currentRange = { start: sortedDates[0], end: sortedDates[0] };
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      
      // Check if dates are consecutive (difference of 1 day)
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        // Dates are consecutive, extend current range
        currentRange.end = sortedDates[i];
      } else {
        // Gap found, save current range and start new one
        ranges.push({ ...currentRange });
        currentRange = { start: sortedDates[i], end: sortedDates[i] };
      }
    }
    
    // Add the last range
    ranges.push(currentRange);
    
    return ranges;
  };

  return (
    <Modal show={modalShow} closeModal={closeModal} title="Bulk Update Inventory and Rates">
      <div className="p-2 sm:p-4">
        {/* Show merge option first */}
        {!hasChosenMergeOption && (
          <div className="mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-4 text-gray-700 font-medium text-sm sm:text-base">
              Do you want to add new data with previous data?
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => handleMergeOptionSelect(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Yes, merge with previous data
              </button>
              <button
                onClick={() => handleMergeOptionSelect(false)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                No, start fresh
              </button>
            </div>
          </div>
        )}

        {/* Show date picker only after merge option is chosen */}
        {hasChosenMergeOption && (
          <>
            <div className="mb-2 text-gray-600 text-sm sm:text-base">Select Range to update the inventory</div>
            {/* Show previous dates only when user chose to merge with previous data */}
            {mergeWithPreviousData && (
              <div className="mb-2 text-gray-600 text-sm sm:text-base">Your Previous Selected Dates are:
                <div className='text-gray-600 font-bold text-base sm:text-lg mt-2 mb-2 text-center bg-gray-100 p-2 rounded-md text-xs sm:text-sm' >
                  {(() => {
                    // Extract all dates from all room types and rate types
                    let allDates = [];
                    
                    // Iterate through all categories (b2b, b2c, website)
                    Object.keys(hotelData || {}).forEach(category => {
                      const categoryData = hotelData[category];
                      
                      // Iterate through all room types in this category
                      Object.keys(categoryData || {}).forEach(roomName => {
                        const roomData = categoryData[roomName];
                        
                        // Get dates from availability data
                        if (roomData.availability && Array.isArray(roomData.availability)) {
                          roomData.availability.forEach(day => {
                            if (day.date) {
                              allDates.push(day.date);
                            }
                          });
                        }
                        
                        // Get dates from rates data
                        if (roomData.rates) {
                          Object.keys(roomData.rates).forEach(rateType => {
                            const rateData = roomData.rates[rateType];
                            
                            // Handle different occupancy levels (1, 2, 3, 4)
                            Object.keys(rateData || {}).forEach(occupancy => {
                              if (Array.isArray(rateData[occupancy])) {
                                rateData[occupancy].forEach(rateEntry => {
                                  if (rateEntry?.date) {
                                    allDates.push(rateEntry?.date);
                                  }
                                });
                              }
                            });
                          });
                        }
                      });
                    });
                    
                    // Remove duplicates and sort
                    allDates = [...new Set(allDates)].sort();
                    
                    if (allDates.length > 0) {
                      // Find continuous date ranges
                      const dateRanges = findContinuousDateRanges(allDates);
                      
                      // Format and display each range
                      return dateRanges.map((range, index) => {
                        const startDate = new Date(range.start).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });
                        const endDate = new Date(range.end).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });
                        
                        return (
                          <div key={index} className="mb-1 break-words">
                            {startDate} to {endDate}
                          </div>
                        );
                      });
                    }
                      
                    return "No previous dates found";
                  })()}
                </div>
              </div>
            )}
            <div className="relative">
              {/* Input field to display the selected range */}
              <input
                type="text"
                value={`${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`}
                readOnly
                onClick={() => setShowDatePicker(true)}
                className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-2 cursor-pointer mb-4 text-sm sm:text-base"
              />

              {/* DateRangePicker dropdown */}
              {showDatePicker && (
                <div className="absolute z-10 bg-white border rounded shadow-lg left-0 right-0 sm:left-auto sm:right-auto sm:w-auto">
                  <div className="max-w-full overflow-x-auto">
                    <DateRangePicker
                      ranges={dateRange}
                      onChange={handleSelect}
                      moveRangeOnFirstSelection={false}
                      editableDateInputs={true}
                      showPreview={true}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex justify-end mt-2 p-2">
                    <button
                      onClick={handleConfirm}
                      className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Show UpdateInventory only after range is confirmed */}
        {isRangeConfirmed && (
          <UpdateInventory
            dateRange={generateDateRange()} // Pass the array of dates
            hotelData={hotelData}
            propertyId={propertyId}
            mergeWithPreviousData={mergeWithPreviousData} // Pass the merge preference
          />
        )}
      </div>
    </Modal>
  );
}

export default BulkUpdateModal;
