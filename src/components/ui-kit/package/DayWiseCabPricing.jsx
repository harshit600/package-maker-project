import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useCabData } from "../../../context/CabContext";

function DayWiseCabPricing({
  travelData = [],
  cabs,
  cabPayLoad,
  setCabPayload,
  setFormData,
  pricing,
  setPricing,
  isEditing,
  cabsData,
}) 
{
  const { setCabData } = useCabData();
  const [prices, setPrices] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [selectedCabCard, setSelectedCabCard] = useState(null);
  const [seasonDates, setSeasonDates] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [showNotification, setShowNotification] = useState(false);
  const [bulkSeasonType, setBulkSeasonType] = useState(null);

  // Debugging: Log travelData to ensure it's being passed correctly
  useEffect(() => {
    console.log("Travel Data:", cabs);
  }, [cabs]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPrices = localStorage.getItem("cabPrices");
    const savedSeasonDates = localStorage.getItem("seasonDates");
    const savedSelectedCab = localStorage.getItem("selectedCab");

    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
    if (savedSeasonDates) {
      setSeasonDates(JSON.parse(savedSeasonDates));
    }
    if (savedSelectedCab) {
      setSelectedCab(savedSelectedCab);
      setSelectedCabCard(savedSelectedCab);
    }
  }, []);

  useEffect(() => {
    if (cabPayLoad?.prices) {
      setPrices(cabPayLoad.prices);
      setSeasonDates(cabPayLoad.seasonDates || {});
    } else if (cabs) {
      const initialPrices = {};
      const initialSeasonDates = {};

      Object.entries(cabs).forEach(([cabType, cabsOfType]) => {
        cabsOfType.forEach((cab) => {
          initialPrices[cab.cabName] = {
            onSeasonPrice: "",
            offSeasonPrice: "",
            _id: cab._id,
          };
          initialSeasonDates[cab.cabName] = {
            onSeason: [],
            offSeason: [],
          };
        });
      });
      setPrices(initialPrices);
      setSeasonDates(initialSeasonDates);
    }
  }, [cabPayLoad, cabs]);

  // Save data to localStorage whenever prices or seasonDates change
  useEffect(() => {
    localStorage.setItem("cabPrices", JSON.stringify(prices));
    localStorage.setItem("seasonDates", JSON.stringify(seasonDates));
  }, [prices, seasonDates]);

  // Update pricing state whenever selectedCab or prices change
  useEffect(() => {
    if (selectedCab) {
      const onSeasonPrice = prices[selectedCab]?.onSeasonPrice || 0;
      const offSeasonPrice = prices[selectedCab]?.offSeasonPrice || 0;
      setPricing({
        lowestOnSeasonPrice: onSeasonPrice,
        lowestOffSeasonPrice: offSeasonPrice,
      });
    }
  }, [selectedCab, prices, setPricing]);

  useEffect(() => {
    if (selectedCab) {
      setCabData({
        selectedCabInfo: {
          cabName: selectedCab,
          prices: {
            onSeasonPrice: prices[selectedCab]?.onSeasonPrice || 0,
            offSeasonPrice: prices[selectedCab]?.offSeasonPrice || 0,
            _id: prices[selectedCab]?._id,
          },
          seasonDates: seasonDates[selectedCab] || {
            onSeason: [],
            offSeason: [],
          },
          pricing: {
            lowestOnSeasonPrice: pricing.lowestOnSeasonPrice,
            lowestOffSeasonPrice: pricing.lowestOffSeasonPrice,
          },
        },
      });
    }
  }, [prices, seasonDates, selectedCab, pricing, setCabData]);

  const handleCabCardClick = (cab) => {
    setSelectedCabCard(cab.cabName);
    setSelectedCab(cab.cabName);
    setShowNotification(true);

    // Log the cab name and price of the selected cab
    console.log("Selected Cab:", cab.cabName, "Price:", prices[cab.cabName]);

    // Save selected cab to localStorage
    localStorage.setItem("selectedCab", cab.cabName);

    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handlePriceChange = (cabName, field, value) => {
    const updatedPrices = {
      ...prices,
      [cabName]: {
        ...prices[cabName],
        [field]: value,
        _id: prices[cabName]?._id,
      },
    };
    setPrices(updatedPrices);
    updateCabPayload(updatedPrices);
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handleDateRangeSelect = (value) => {
    if (!selectedSeason) return;

    setDateRange(value);

    if (value.length === 2 && value[0] && value[1]) {
      const [startDate, endDate] = value;
      const dateList = getDatesInRange(startDate, endDate);

      const updatedSeasonDates = { ...seasonDates };

      // Apply dates to all cabs
      Object.keys(cabs).forEach(cabType => {
        cabs[cabType].forEach(cab => {
          if (!updatedSeasonDates[cab.cabName]) {
            updatedSeasonDates[cab.cabName] = {
              onSeason: [],
              offSeason: []
            };
          }

          // Remove selected dates from both seasons
          updatedSeasonDates[cab.cabName].onSeason = updatedSeasonDates[cab.cabName].onSeason
            .filter(d => !dateList.includes(d));
          updatedSeasonDates[cab.cabName].offSeason = updatedSeasonDates[cab.cabName].offSeason
            .filter(d => !dateList.includes(d));

          // Add dates to selected season
          if (selectedSeason === "on") {
            updatedSeasonDates[cab.cabName].onSeason.push(...dateList);
          } else {
            updatedSeasonDates[cab.cabName].offSeason.push(...dateList);
          }
        });
      });

      setSeasonDates(updatedSeasonDates);
      updateCabPayload(prices, updatedSeasonDates);
      setTimeout(() => {
        setDateRange([null, null]);
        setShowCalendar(false);
      }, 500);
    }
  };

  const updateCabPayload = (
    updatedPrices,
    updatedSeasonDates = seasonDates
  ) => {
    setCabPayload((prev) => ({
      ...prev,
      prices: updatedPrices,
      seasonDates: updatedSeasonDates,
      travelInfo: travelData,
    }));
  };

  const getTileContent = ({ date }) => {
    if (!selectedCab) return null;

    const dateStr = date.toISOString().split("T")[0];
    const cabDates = seasonDates[selectedCab] || {
      onSeason: [],
      offSeason: [],
    };
    let price = null;

    if (cabDates.onSeason.includes(dateStr)) {
      price = prices[selectedCab]?.onSeasonPrice;
    } else if (cabDates.offSeason.includes(dateStr)) {
      price = prices[selectedCab]?.offSeasonPrice;
    }

    if (price) {
      return <div className="text-xs mt-1 font-semibold">₹{price}</div>;
    }
    return null;
  };

  const getTileClassName = ({ date }) => {
    if (!selectedCab) return "";

    const dateStr = date.toISOString().split("T")[0];
    const cabDates = seasonDates[selectedCab] || {
      onSeason: [],
      offSeason: [],
    };

    if (cabDates.onSeason.includes(dateStr)) {
      return "bg-yellow-200 hover:bg-yellow-300";
    }
    if (cabDates.offSeason.includes(dateStr)) {
      return "bg-blue-200 hover:bg-blue-300";
    }
    return "";
  };

  const openCalendarWithSeason = (cabName, season) => {
    setSelectedCab(cabName);
    setSelectedCabCard(cabName);
    setSelectedSeason(season);
    setDateRange([null, null]);
    setShowCalendar(true);
  };

  // Notification Component
  const SelectedCabNotification = () => {
    if (!selectedCab || !showNotification) return null;

    const selectedCabData = Object.values(cabs)
      .flat()
      .find((cab) => cab.cabName === selectedCab);

    if (!selectedCabData) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200 max-w-md">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16">
              <img
                src={selectedCabData.cabImages[0]}
                alt={selectedCabData.cabName}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {selectedCabData.cabName}
              </h3>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-yellow-50 p-2 rounded">
                  <p className="text-xs text-yellow-800">On Season</p>
                  <p className="font-semibold">
                    ₹{prices[selectedCab]?.onSeasonPrice || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs text-blue-800">Off Season</p>
                  <p className="font-semibold">
                    ₹{prices[selectedCab]?.offSeasonPrice || 0}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add new component for the calendar buttons
  const SeasonCalendarButtons = () => (
    <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <span className="mr-2">📅</span>
        Set Season Dates
      </h4>
      <div className="flex gap-4">
        <button
          onClick={() => {
            setSelectedSeason("on");
            setBulkSeasonType("on");
            setShowCalendar(true);
          }}
          className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          <span className="mr-2">📅</span>
          Set On Season Dates
        </button>
        <button
          onClick={() => {
            setSelectedSeason("off");
            setBulkSeasonType("off");
            setShowCalendar(true);
          }}
          className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span className="mr-2">📅</span>
          Set Off Season Dates
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 mx-auto">
      <SelectedCabNotification />

      {/* Header with Selected Cab Info */}
      <div className="bg-[rgb(45,45,68)] from-blue-600 to-blue-800 rounded-xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">Cab Price Configuration</h1>
        {selectedCab && (
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12">
                  {cabs &&
                    Object.values(cabs)
                      .flat()
                      .map((cab) => {
                        if (cab.cabName === selectedCab) {
                          return (
                            <img
                              key={cab._id}
                              src={cab.cabImages[0]}
                              alt={cab.cabName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          );
                        }
                        return null;
                      })}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedCab}</h2>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-yellow-200">
                      On: ₹{prices[selectedCab]?.onSeasonPrice || 0}
                    </span>
                    <span className="text-blue-200">
                      Off: ₹{prices[selectedCab]?.offSeasonPrice || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Info and Price Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Route Information Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">📍</span>
            Route Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-24 text-gray-500">Pickup:</div>
              <div className="font-medium text-gray-800 capitalize">
                {cabsData?.pickupLocation}
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-24 text-gray-500">Drop:</div>
              <div className="font-medium text-gray-800 capitalize">
                {cabsData?.dropLocation}
              </div>
            </div>
            {cabsData?.packagePlaces?.map((place, index) => (
              <div key={index} className="flex items-start">
                <div className="w-24 text-gray-500">Stop {index + 1}:</div>
                <div className="font-medium text-gray-800 capitalize">
                  {place.placeCover}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <span className="mr-2">💰</span>
            Price Summary
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">On Season Price:</span>
              <span className="font-semibold text-blue-600">
                ₹{pricing?.lowestOnSeasonPrice || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Off Season Price:</span>
              <span className="font-semibold text-blue-600">
                ₹{pricing?.lowestOffSeasonPrice || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Route Overview */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h4 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <span className="mr-2">🛣️</span>
          Travel Route Overview
        </h4>
        <div className="space-y-3">
          {Array.isArray(travelData) && travelData.length > 0 ? (
            travelData.map((route, index) => (
              <div
                key={index}
                className="flex items-center bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex-1 flex items-center">
                  <span className="font-medium text-gray-700 capitalize">
                    {route[0]}
                  </span>
                  <div className="mx-4 flex-1 border-t-2 border-dashed border-gray-300 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="font-medium text-gray-700 capitalize">
                    {route[1]}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No travel routes available.</div>
          )}
        </div>
      </div>

      <SeasonCalendarButtons />

      {/* Main Content - Cab Cards */}
      <div className="space-y-8">
        {cabs &&
          Object.entries(cabs).map(([cabType, cabsOfType]) => (
            <div
              key={cabType}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                {cabType}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cabsOfType.map((cab) => (
                  <div
                    key={cab._id}
                    onClick={() => handleCabCardClick(cab)}
                    className={`bg-gray-50 rounded-xl p-6 transition-all duration-200 cursor-pointer relative
                      ${
                        selectedCabCard === cab.cabName
                          ? "ring-2 ring-blue-500 shadow-lg transform scale-[1.02]"
                          : "hover:shadow-md hover:scale-[1.01]"
                      }`}
                  >
                    {/* Selection Status Indicator */}
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-gray-300">
                      {selectedCabCard === cab.cabName && (
                        <div className="absolute inset-0 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Cab Info */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 mr-4">
                        <img
                          src={cab.cabImages[0]}
                          alt={cab.cabName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{cab.cabName}</h4>
                        <p className="text-sm text-gray-500">{cab.cabType}</p>
                      </div>
                    </div>

                    {/* Price Inputs */}
                    <div className="space-y-4">
                      {/* On Season Price Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          On Season Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={prices[cab.cabName]?.onSeasonPrice || ""}
                            onChange={(e) =>
                              handlePriceChange(
                                cab.cabName,
                                "onSeasonPrice",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter price"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Off Season Price Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Off Season Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={prices[cab.cabName]?.offSeasonPrice || ""}
                            onChange={(e) =>
                              handlePriceChange(
                                cab.cabName,
                                "offSeasonPrice",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter price"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>

                      {/* Season Days Count */}
                      <div className="text-sm text-gray-600 mt-4">
                        <div>
                          On Season Days:{" "}
                          {seasonDates[cab.cabName]?.onSeason?.length || 0}
                        </div>
                        <div>
                          Off Season Days:{" "}
                          {seasonDates[cab.cabName]?.offSeason?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Set {selectedSeason === "on" ? "On" : "Off"} Season Dates for All Cabs
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Selected dates will be applied to all cabs
                </p>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <Calendar
                onChange={handleDateRangeSelect}
                value={dateRange}
                selectRange={true}
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                className="rounded-lg border custom-calendar"
              />
            </div>

            <div className="mt-4">
              <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <div>
                  Selected Range:{" "}
                  {dateRange[0] && dateRange[1]
                    ? `${dateRange[0].toLocaleDateString()} - ${dateRange[1].toLocaleDateString()}`
                    : "No dates selected"}
                </div>
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-xl font-semibold mb-6">Price Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-lg font-medium">Total On Season Price</div>
            <div className="text-3xl font-bold text-yellow-600">
              ₹{pricing?.lowestOnSeasonPrice || 0}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-medium">Total Off Season Price</div>
            <div className="text-3xl font-bold text-blue-600">
              ₹{pricing?.lowestOffSeasonPrice || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayWiseCabPricing;
