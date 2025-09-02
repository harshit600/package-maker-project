import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  IconButton,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Tooltip,
} from "@material-tailwind/react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { tabs, rateTypes } from "./constants";
import { formatDate } from "../../../common/functions";

import BulkUpdateModal from "../BulkUpdateModal";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com"
};

const roomTypes = {
  b2c: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
  website: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
  b2b: [
    { name: "Superior Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
    { name: "Premium Room with Balcony", availabilityData: Array(7).fill({ available: '', sold: 0 }) },
  ],
};

export default function HotelManagementSystem() {
  const [activeTab, setActiveTab] = useState("b2c");
  const [expandedRooms, setExpandedRooms] = useState({});
  const [expandedRates, setExpandedRates] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [roomData, setRoomData] = useState([]);
  const [inventoryData, setInventoryData] = useState({});
  const [modalShow, setModalShow] = useState(false);
  const [dates, setDates] = useState([]);

  console.log(roomData);
  const navigate = useNavigate();

  const initializeHotelData = (dates) => {
    const initialData = {};
    tabs.forEach((tab) => {
      initialData[tab.value] = {};
      roomTypes[tab.value]?.forEach((room) => {
        initialData[tab.value][room.name] = {
          availability: dates?.map((date) => ({
            date: new Date(date).toISOString(),
            available: "",
            sold: 0,
          })),
          rates: rateTypes[tab.value]?.reduce((acc, rate) => {
            acc[rate.name] = {
              1: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
              3: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
              4: dates?.map((date) => ({
                date: date.toISOString(),
                value: null,
              })),
            };
            return acc;
          }, {}),
        };
      });
    });

    return initialData;
  };

  const [hotelData, setHotelData] = useState(() => initializeHotelData());

  useEffect(() => {
    const initialHotelData = {};
    tabs.forEach(tab => {
      initialHotelData[tab.value] = {};
      roomTypes[tab.value].forEach(room => {
        initialHotelData[tab.value][room.name] = {
          availability: room?.availabilityData?.map(data => ({ ...data })),
          rates: {}
        };
        rateTypes[tab.value].forEach(rate => {
          initialHotelData[tab.value][room.name].rates[rate.name] = {
            2: Array(7).fill(),
            1: Array(7).fill()
          };
        });
      });
    });
    setHotelData(initialHotelData);
  }, []);

  const toggleRoomExpansion = (roomName) => {
    setExpandedRooms(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [roomName]: !(prev[activeTab]?.[roomName] || false)
      }
    }));
  };

  const toggleRateExpansion = (rateName) => {
    setExpandedRates(prev => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [rateName]: !(prev[activeTab]?.[rateName] || false)
      }
    }));
  };

  const isRoomExpanded = (roomName) => expandedRooms[activeTab]?.[roomName] || false;
  const isRateExpanded = (rateName) => expandedRates[activeTab]?.[rateName] || false;

  const handleRateChange = (roomName, rateName, occupancy, dayIndex, value) => {
    const newValue = parseFloat(value);
    setHotelData((prevData) => {
      const currentRates = prevData[activeTab]?.[roomName]?.rates[rateName]?.[occupancy] || [];
      const updatedRates = currentRates.map((rate, index) => {
        if (index === dayIndex) {
          return {
            value: newValue,
            date: rate?.date || new Date().toISOString().split('T')[0],
          };
        }
        if (rate === null) {
          return {
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: null,
          };
        }
        return rate;
      });

      return {
        ...prevData,
        [activeTab]: {
          ...prevData[activeTab],
          [roomName]: {
            ...prevData[activeTab][roomName],
            rates: {
              ...prevData[activeTab][roomName].rates,
              [rateName]: {
                ...prevData[activeTab][roomName].rates[rateName],
                [occupancy]: updatedRates,
              },
            },
          },
        },
      };
    });
  };

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const handleAvailabilityChange = (roomName, dayIndex, value) => {
    setHotelData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        [roomName]: {
          ...prevData[activeTab][roomName],
          availability: prevData[activeTab][roomName].availability.map((day, index) =>
            index === dayIndex ? {
              ...day,
              available: Number(value),
              date: day.date
            } : day
          ),
        },
      },
    }));
  };

  function updateRoomTypesWithApiData(roomTypes, apiData) {
    const roomNames = apiData.map((room) => room.roomName);
    Object.keys(roomTypes).forEach((category) => {
      roomTypes[category] = roomNames.map((roomName, index) => ({
        ...(roomTypes[category]?.[index] || {}),
        name: roomName,
      }));
    });
    return roomTypes;
  }

  const updatedRoomTypes = updateRoomTypesWithApiData(roomTypes, roomData);

  const location = useLocation();
  const [propertyName, setPropertyName] = useState("");
  const [propertyId, setPropertyId] = useState("");

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const name = pathParts[pathParts.length - 2];
    setPropertyId(id);
    setPropertyName(name);
  }, [location.pathname]);

  const fetchRoomData = async () => {
    if (!propertyId) return;

    try {
      const response = await fetch(`${config.API_HOST}/api/packagemaker/get-packagemaker-by-id/${propertyId}`);
      
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const result = await response.json();
      console.log(result);
      
      if (result.success) {
        const fetchedRoomData = result.data.rooms?.data || [];
        setRoomData(fetchedRoomData);

        const updatedHotelData = {};
        const dates = [];

        tabs.forEach((tab) => {
          const inventory = result.data.inventory[tab.value];
          updatedHotelData[tab.value] = {};
          Object.keys(inventory || {}).forEach((roomName) => {
            const room = inventory[roomName];
            
            // Get dates from room.rates.CP instead of availability
            if (room.rates && room.rates.CP || room.rates && room.rates.MAP) {
              Object.keys(room.rates.CP || room.rates.MAP).forEach(occupancy => {
                if (room.rates.CP[occupancy] && Array.isArray(room.rates.CP[occupancy]) || room.rates.MAP[occupancy] && Array.isArray(room.rates.MAP[occupancy])) {
                  room.rates.CP[occupancy].forEach(rateEntry => {
                    if (rateEntry.date) {
                      const dateObj = new Date(rateEntry.date);
                      if (!dates.some(existingDate => existingDate.toDateString() === dateObj.toDateString())) {
                        dates.push(dateObj);
                      }
                    }
                  });
                  room.rates.MAP[occupancy].forEach(rateEntry => {
                    if (rateEntry.date) {
                      const dateObj = new Date(rateEntry.date);
                      if (!dates.some(existingDate => existingDate.toDateString() === dateObj.toDateString())) {
                        dates.push(dateObj);
                      }
                    }
                  });
                }
              });
            }
            
            updatedHotelData[tab.value][roomName] = {
              availability: room.availability.map((day) => {
                const dateObj = new Date(day.date);
                return {
                  date: dateObj.toISOString(),
                  available: day.available || "",
                  sold: day.sold || 0,
                };
              }),
              rates: {},
            };

            rateTypes[tab.value].forEach((rate) => {
              const rateData = room.rates[rate.name];

              if (rateData && typeof rateData === 'object') {
                updatedHotelData[tab.value][roomName].rates[rate.name] = {
                  1: (rateData[1] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                  3: (rateData[3] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                  4: (rateData[4] || []).map((rateEntry) => ({
                    date: rateEntry.date,
                    value: rateEntry.value || null,
                  })),
                };
              } else {
                updatedHotelData[tab.value][roomName].rates[rate.name] = {
                  1: Array(7).fill({ date: null, value: null }),
                  3: Array(7).fill({ date: null, value: null }),
                  4: Array(7).fill({ date: null, value: null }),
                };
              }
            });
          });
        });

        setHotelData(updatedHotelData);
        const uniqueDates = [...new Set(dates.map(date => date.toDateString()))].map(date => new Date(date));
        setDates(uniqueDates);
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [propertyId]);

  useEffect(() => {
    if (Object.keys(hotelData).length === 0) {
      setHotelData(initializeHotelData());
    }
  }, [hotelData]);

  useEffect(() => {
    if (!Object.keys(hotelData).length) {
      const initialHotelData = {};
      tabs.forEach(tab => {
        initialHotelData[tab.value] = {};
        roomTypes[tab.value].forEach(room => {
          initialHotelData[tab.value][room.name] = {
            availability: Array(7).fill({ available: '', sold: 0 }),
            rates: {},
          };
          rateTypes[tab.value].forEach(rate => {
            initialHotelData[tab.value][room.name].rates[rate.name] = {
              2: Array(7).fill(),
              1: Array(7).fill(),
            };
          });
        });
      });
      setHotelData(initialHotelData);
    }
  }, []);

  useEffect(() => {
    if (roomData.length > 0) {
      setHotelData((prevHotelData) => {
        const updatedData = { ...prevHotelData };
        tabs.forEach((tab) => {
          updatedData[tab.value] = updatedData[tab.value] || {};
          roomData.forEach((room) => {
            updatedData[tab.value][room.roomName] = updatedData[tab.value][room.roomName] || {
              availability: dates?.map((date) => ({ date, available: "", sold: 0 })),
              rates: rateTypes[tab.value]?.reduce((acc, rate) => {
                acc[rate.name] = {
                  1: Array(7).fill(null),
                  2: Array(7).fill(null),
                };
                return acc;
              }, {}),
            };
          });
        });
        return updatedData;
      });
    }
  }, [roomData]);

  const handleSave = async (e) => {
    e.preventDefault();
    const url = `${config.API_HOST}/api/packagemaker/update-packagemaker/${propertyId}`;

    const payload = {
      ...hotelData,
      step: 7,
    };

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
      } else {
        console.error("Failed to update property:", response.status, response.statusText);
      }
    } catch (err) {
      console.error("Error occurred while updating property:", err);
    }
  };

  const modalHandler = () => {
    setModalShow(true);
  };

  const closeModal = () => setModalShow(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <BulkUpdateModal modalShow={modalShow} closeModal={closeModal} hotelData={hotelData} propertyId={propertyId} />
      
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6"style={{width: "1000px"}}>
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="text" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-0 mb-6 transition-colors duration-200" 
            size="sm" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeftIcon strokeWidth={2} className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Hotel Listing</span>
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <Typography variant="h3" className="text-gray-900 font-bold">
                    Manage Inventory & Rates
                  </Typography>
                  <Typography variant="paragraph" className="text-gray-600 mt-1">
                    Configure room availability and pricing for your property
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="text-center">
                <Typography variant="h5" className="text-gray-900 font-semibold">
                  {propertyName}
                </Typography>
                <Typography variant="small" className="text-gray-500">
                  Property Details
                </Typography>
              </div>
              <Button 
                onClick={fetchRoomData} 
                variant="filled" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Refresh
              </Button>
              <Button 
                onClick={modalHandler} 
                variant="filled" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <CurrencyDollarIcon className="h-5 w-5" />
                Bulk Update
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <Tabs value={activeTab} className="w-full">
            <TabsHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 rounded-none">
              {tabs.map(({ label, value }) => (
                <Tab 
                  key={value} 
                  value={value} 
                  onClick={() => setActiveTab(value)}
                  className="text-gray-700 font-medium py-4 px-6 hover:text-blue-600 transition-colors duration-200"
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            
            <TabsBody className="p-0">
              {tabs.map(({ value }) => (
                <TabPanel key={value} value={value} className="p-0">
                  <div className="relative">
                    {/* Scroll Indicators */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-r-lg shadow-lg p-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <div className="text-blue-600 text-xs font-medium">← Scroll</div>
                    </div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-l-lg shadow-lg p-2 opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <div className="text-blue-600 text-xs font-medium">Scroll →</div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                      <div className="min-w-full">
                        <table className="w-full table-fixed">
                          <thead className="sticky top-0 z-20">
                            <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                              <th className="w-80 p-6 text-left bg-gradient-to-r from-blue-600 to-indigo-600">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-white/20 rounded-lg">
                                    <CalendarIcon className="h-5 w-5" />
                                  </div>
                                  <Typography variant="h6" className="font-semibold">
                                    Rooms & Rates
                                  </Typography>
                                </div>
                              </th>
                              {dates.map((date, index) => (
                                <th key={index} className="w-32 p-4 text-center bg-gradient-to-r from-blue-600 to-indigo-600">
                                  <div className="flex flex-col items-center">
                                    <Typography variant="small" className="font-bold text-white/90">
                                      {date.toLocaleDateString('en-US', { 
                                        weekday: 'short'
                                      })}
                                    </Typography>
                                    <Typography variant="small" className="text-white/80">
                                      {date.toLocaleDateString('en-US', { 
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </Typography>
                                    <Typography variant="small" className="text-white/70 text-xs">
                                      {date.getFullYear()}
                                    </Typography>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          
                          <tbody className="divide-y divide-gray-100">
                            {roomData && updatedRoomTypes[activeTab]?.map((roomType, index) => (
                              <React.Fragment key={index}>
                                {/* Main Room Type Row */}
                                <tr className="hover:bg-blue-50/50 transition-colors duration-200">
                                  <td 
                                    className="w-80 p-6 cursor-pointer bg-white" 
                                    onClick={() => toggleRoomExpansion(roomType.name)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-100 rounded-lg">
                                        {isRoomExpanded(roomType.name) ? (
                                          <MinusIcon className="h-5 w-5 text-blue-600" />
                                        ) : (
                                          <PlusIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                      </div>
                                      <div>
                                        <Typography variant="h6" className="text-gray-900 font-semibold">
                                          {roomType.name}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-500">
                                          Click to expand rates
                                        </Typography>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  {hotelData[activeTab]?.[roomType.name]?.availability?.map((day, dayIndex) => (
                                    <td key={dayIndex} className="w-32 p-4 text-center bg-white">
                                      <div className="space-y-2">
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={day.available}
                                            placeholder="0"
                                            className="w-full text-center p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-semibold text-gray-900 placeholder-gray-400"
                                            onChange={(e) => handleAvailabilityChange(roomType.name, dayIndex, e.target.value)}
                                          />
                                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                            Available
                                          </div>
                                        </div>
                                        <div className="bg-gray-100 rounded-lg p-2">
                                          <Typography variant="small" className="text-gray-600 font-medium">
                                            {day.sold} sold
                                          </Typography>
                                        </div>
                                      </div>
                                    </td>
                                  ))}
                                </tr>

                                {/* Rate Types */}
                                {isRoomExpanded(roomType.name) && rateTypes[activeTab]?.map((rateType, rateIndex) => (
                                  <React.Fragment key={`${index}-${rateIndex}`}>
                                    <tr className="bg-gray-50/30 hover:bg-gray-50/50 transition-colors duration-200">
                                      <td 
                                        className="w-80 p-6 cursor-pointer bg-gray-50/30" 
                                        onClick={() => toggleRateExpansion(rateType.name)}
                                      >
                                        <div className="flex items-center gap-3 pl-12">
                                          <div className="p-2 bg-indigo-100 rounded-lg">
                                            {isRateExpanded(rateType.name) ? (
                                              <MinusIcon className="h-4 w-4 text-indigo-600" />
                                            ) : (
                                              <PlusIcon className="h-4 w-4 text-indigo-600" />
                                            )}
                                          </div>
                                          <div>
                                            <Typography variant="h6" className="text-indigo-900 font-semibold">
                                              {rateType.name}
                                            </Typography>
                                            <Typography variant="small" className="text-indigo-600">
                                              Click to expand occupancy rates
                                            </Typography>
                                          </div>
                                        </div>
                                      </td>
                                      {Array(7).fill(null).map((_, dayIndex) => (
                                        <td key={dayIndex} className="w-32 p-4 bg-gray-50/30" />
                                      ))}
                                    </tr>

                                    {/* Base Rates when expanded */}
                                    {isRateExpanded(rateType.name) && (
                                      <>
                                        {[1, 3, 4].map((occupancy) => (
                                          <tr key={occupancy} className="bg-white border-l-4 border-l-indigo-200">
                                            <td className="w-80 p-2 bg-white">
                                              <div className="pl-10 pr-2">
                                                <div className="flex items-center gap-2">
                                                  <div className="w-6 h-3 bg-indigo-400 rounded-full"></div>
                                                  <Typography variant="small" className="text-gray-700 font-semibold">
                                                    {occupancy === 1 && '2 Guest'}
                                                    {occupancy === 3 && '3 Guests (Extra Bed)'}
                                                    {occupancy === 4 && '4 Guests (Without Extra Bed)'}
                                                  </Typography>
                                                </div>
                                              </div>
                                            </td>
                                            
                                            {hotelData[activeTab]?.[roomType.name]?.rates[rateType.name]?.[occupancy]?.map((rate, dayIndex) => (
                                              <td key={dayIndex} className="w-32 p-2 text-center bg-white">
                                                {console.log(rate,"rate")}
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    value={rate?.value || ""}
                                                    placeholder="0"
                                                    onChange={(e) => handleRateChange(roomType.name, rateType.name, occupancy, dayIndex, e.target.value)}
                                                    className="w-24 text-center p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-bold text-gray-900 placeholder-gray-400 bg-white shadow-sm"
                                                  />
                                                  <div className="  bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                                    {formatDate(rate?.date)}
                                                  </div>
                                                </div>
                                              </td>
                                            )) || Array(7).fill(
                                              <td className="w-32 p-2 text-center bg-white">
                                                <div className="relative">
                                                  <input 
                                                    type="number" 
                                                    value="" 
                                                    placeholder="0"
                                                    className="w-24 text-center p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-bold text-gray-900 placeholder-gray-400 bg-white shadow-sm" 
                                                  />
                                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                                                    Rate
                                                  </div>
                                                </div>
                                              </td>
                                            )}
                                          </tr>
                                        ))}
                                      </>
                                    )}
                                  </React.Fragment>
                                ))}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </div>

        {/* Fixed Bottom Action Bar */}
        {/* <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-center gap-6 z-50 min-w-96">
          <div className="flex-1">
            <Typography variant="small" className="text-gray-500 text-center">
              Make sure to save your changes before leaving
            </Typography>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="text" 
              className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
            >
              Cancel Changes
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Save Changes
            </Button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
