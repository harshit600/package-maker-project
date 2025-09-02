import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const config = {
    API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
  };
  
const MarginMaster = () => {
  const [marginData, setMarginData] = useState([]);
  const [expandedState, setExpandedState] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Add Indian states array
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal','Andaman and Nicobar Islands',
    'Chandigarh', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry','Telangana','sri lanka'
  ];

  // State for margins with state as key
  const [stateMargins, setStateMargins] = useState({});

  // Fetch existing margins
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/margin/get-margin`);
        const data = await response.json();
        console.log("data", data);
        // Ensure we're working with an array of data
        const formattedData = Array.isArray(data.data) ? data.data : [data.data];
        const marginsByState = {};
        formattedData.forEach(margin => {
          if (margin.state) {
            marginsByState[margin.state] = {
              firstQuoteMargins: margin.firstQuoteMargins || {},
              minimumQuoteMargins: margin.minimumQuoteMargins || {}
            };
          }
        });
        setStateMargins(marginsByState);
        setMarginData(formattedData);
      } catch (error) {
        console.error('Error fetching margin data:', error);
      }
    };
    fetchData();
  }, []);

  // Modified handleSave function
  const handleSave = async (state) => {
    try {
      const existingMargin = marginData.find(m => m.state === state);
      const endpoint = existingMargin 
        ? `${config.API_HOST}/api/margin/update/${state}`
        : `${config.API_HOST}/api/margin/create`;
      
      const marginDataToSend = {
        state,
        firstQuoteMargins: stateMargins[state]?.firstQuoteMargins || {},
        minimumQuoteMargins: stateMargins[state]?.minimumQuoteMargins || {}
      };

      const response = await fetch(endpoint, {
        method: existingMargin ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marginDataToSend)
      });

      if (!response.ok) {
        throw new Error('Failed to save margins');
      }

      // Update local state immediately
      setMarginData(prevData => {
        const newData = [...prevData];
        const existingIndex = newData.findIndex(m => m.state === state);
        
        if (existingIndex !== -1) {
          newData[existingIndex] = marginDataToSend;
        } else {
          newData.push(marginDataToSend);
        }
        
        return newData;
      });

      alert(`Margins ${existingMargin ? 'updated' : 'saved'} successfully for ${state}!`);
    } catch (error) {
      console.error('Error saving margins:', error);
      alert('Failed to save margins. Please try again.');
    }
  };

  // Helper function to get existing margins for a state
  const getExistingMargins = (state) => {
    const stateData = marginData.find(m => m.state === state);
    return {
      firstQuoteMargins: stateData?.firstQuoteMargins || {},
      minimumQuoteMargins: stateData?.minimumQuoteMargins || {}
    };
  };

  // Modified handleMarginChange function
  const handleMarginChange = (state, type, field, value) => {
    const numericValue = value === '' ? '' : Number(value);
    setStateMargins(prev => ({
      ...prev,
      [state]: {
        ...prev[state] || {},
        [type]: {
          ...(prev[state]?.[type] || {}),
          [field]: numericValue
        }
      }
    }));
  };

  // Add this function to format the date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">State-wise Margin Management</h1>
      
      {/* States Accordion */}
      <div className="space-y-2">
        {indianStates.map((state) => {
          const existingData = marginData.find(m => m.state === state) || {};
          const isExisting = !!existingData.state;
          
          return (
            <div key={state} className="border rounded-lg">
              <button
                className="w-full p-4 text-left font-semibold flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                onClick={() => setExpandedState(expandedState === state ? null : state)}
              >
                <span className="flex items-center">
                  {state}
                  {isExisting && (
                    <span className="ml-2 text-sm text-green-600">
                      (Margins Set)
                    </span>
                  )}
                </span>
                <span>{expandedState === state ? '−' : '+'}</span>
              </button>
              
              {expandedState === state && (
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 gap-8">
                    {/* First Quote Section */}
                    <div className="border p-4 rounded-lg">
                      <h2 className="text-xl font-bold mb-4">First Quote Margins</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1">Less than 1 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.firstQuoteMargins?.lessThan1Lakh ?? existingData.firstQuoteMargins?.lessThan1Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'firstQuoteMargins', 'lessThan1Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">1 Lakh - 2 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.firstQuoteMargins?.between1To2Lakh ?? existingData.firstQuoteMargins?.between1To2Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'firstQuoteMargins', 'between1To2Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">2 Lakh - 3 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.firstQuoteMargins?.between2To3Lakh ?? existingData.firstQuoteMargins?.between2To3Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'firstQuoteMargins', 'between2To3Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">More than 3 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.firstQuoteMargins?.moreThan3Lakh ?? existingData.firstQuoteMargins?.moreThan3Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'firstQuoteMargins', 'moreThan3Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Minimum Quote Section */}
                    <div className="border p-4 rounded-lg">
                      <h2 className="text-xl font-bold mb-4">maximum discount </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1">Less than 1 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.minimumQuoteMargins?.lessThan1Lakh ?? existingData.minimumQuoteMargins?.lessThan1Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'minimumQuoteMargins', 'lessThan1Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">1 Lakh - 2 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.minimumQuoteMargins?.between1To2Lakh ?? existingData.minimumQuoteMargins?.between1To2Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'minimumQuoteMargins', 'between1To2Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                     
                        <div>
                          <label className="block mb-1">2 Lakh - 3 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.minimumQuoteMargins?.between2To3Lakh ?? existingData.minimumQuoteMargins?.between2To3Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'minimumQuoteMargins', 'between2To3Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">More than 3 Lakh (%)</label>
                          <input
                            type="number"
                            value={stateMargins[state]?.minimumQuoteMargins?.moreThan3Lakh ?? existingData.minimumQuoteMargins?.moreThan3Lakh ?? ''}
                            onChange={(e) => handleMarginChange(state, 'minimumQuoteMargins', 'moreThan3Lakh', e.target.value)}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setStateMargins(prev => ({
                          ...prev,
                          [state]: undefined
                        }));
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(state)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {isExisting ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarginMaster;