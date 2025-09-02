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
} from "@heroicons/react/24/outline";
import { tabs, rateTypes } from "./constants";

import BulkUpdateModal from "./BulkUpdate";
const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};
const roomTypes = {
  b2c: [
    {
      name: "Superior Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
    {
      name: "Premium Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
  ],
  website: [
    {
      name: "Superior Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
    {
      name: "Premium Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
  ],
  b2b: [
    {
      name: "Superior Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
    {
      name: "Premium Room with Balcony",
      availabilityData: Array(7).fill({ available: "", sold: 0 }),
    },
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

  const navigate = useNavigate();

  const initializeHotelData = (dates) => {
    const initialData = {};
    tabs.forEach((tab) => {
      initialData[tab.value] = {};
      roomTypes[tab.value]?.forEach((room) => {
        initialData[tab.value][room.name] = {
          availability: dates?.map((date) => ({
            date: new Date(date).toISOString(), // Ensure date is ISO string
            available: "", // Default availability status
            sold: 0, // Default sold value
          })),
          rates: rateTypes[tab.value]?.reduce((acc, rate) => {
            acc[rate.name] = {
              1: dates?.map((date) => ({
                date: date.toISOString(), // Set the date
                value: null, // Default value
              })),
              2: dates?.map((date) => ({
                date: date.toISOString(), // Set the date
                value: null, // Default value
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
    // Initialize hotel data for all tabs
    const initialHotelData = {
      // Add the step value at the root level
    };

    tabs.forEach((tab) => {
      initialHotelData[tab.value] = {};

      roomTypes[tab.value].forEach((room) => {
        initialHotelData[tab.value][room.name] = {
          availability: room?.availabilityData?.map((data) => ({ ...data })),
          rates: {},
        };

        rateTypes[tab.value].forEach((rate) => {
          initialHotelData[tab.value][room.name].rates[rate.name] = {
            2: Array(7).fill(),
            1: Array(7).fill(),
          };
        });
      });
    });

    setHotelData(initialHotelData);
  }, []);
  const toggleRoomExpansion = (roomName) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [roomName]: !(prev[activeTab]?.[roomName] || false),
      },
    }));
  };

  const toggleRateExpansion = (rateName) => {
    setExpandedRates((prev) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [rateName]: !(prev[activeTab]?.[rateName] || false),
      },
    }));
  };

  const isRoomExpanded = (roomName) =>
    expandedRooms[activeTab]?.[roomName] || false;
  const isRateExpanded = (rateName) =>
    expandedRates[activeTab]?.[rateName] || false;

  // Handle rate changes
  const handleRateChange = (roomName, rateName, occupancy, dayIndex, value) => {
    const newValue = parseFloat(value); // Ensure the value is a number

    setHotelData((prevData) => {
      console.log("Previous Data:", prevData); // Log previous data
      console.log("Active Tab:", activeTab); // Log active tab
      console.log("Room Name:", roomName); // Log room name
      console.log("Rate Name:", rateName); // Log rate name
      console.log("Occupancy:", occupancy); // Log occupancy

      // Get the current rates for the specified room, rate name, and occupancy
      const currentRates =
        prevData[activeTab]?.[roomName]?.rates[rateName]?.[occupancy] || [];
      console.log("Current Rates:", currentRates); // Log current rates

      // Update the rates while preserving the date
      const updatedRates = currentRates.map((rate, index) => {
        if (index === dayIndex) {
          // Handle case where rate might be null
          return {
            value: newValue, // Update the value
            date: rate?.date || new Date().toISOString().split("T")[0], // Preserve the existing date or set it to today's date if undefined
          };
        }
        // If the rate is null, provide a default structure
        if (rate === null) {
          return {
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Generate a date for the future
            value: null, // Default value
          };
        }
        return rate; // Return unchanged rate for other days
      });

      console.log("Updated Rates:", updatedRates); // Log updated rates

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
                [occupancy]: updatedRates, // Update the rates for the specific occupancy
              },
            },
          },
        },
      };
    });
  };

  console.log("hoteeee", hotelData);

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Handle availability changes
  const handleAvailabilityChange = (roomName, dayIndex, value) => {
    setHotelData((prevData) => ({
      ...prevData,
      [activeTab]: {
        ...prevData[activeTab],
        [roomName]: {
          ...prevData[activeTab][roomName],
          availability: prevData[activeTab][roomName].availability.map(
            (day, index) =>
              index === dayIndex
                ? {
                    ...day,
                    available: Number(value),
                    date: day.date, // Ensure the date is preserved
                  }
                : day
          ),
        },
      },
    }));
  };

  function updateRoomTypesWithApiData(roomTypes, apiData) {
    const roomNames = apiData.map((room) => room.roomName);

    Object.keys(roomTypes).forEach((category) => {
      roomTypes[category] = roomNames.map((roomName, index) => ({
        ...(roomTypes[category]?.[index] || {}), // Safeguard against undefined
        name: roomName,
      }));
    });

    return roomTypes;
  }

  // Update the roomTypes
  const updatedRoomTypes = updateRoomTypesWithApiData(roomTypes, roomData);

  const location = useLocation();
  const [propertyName, setPropertyName] = useState("");
  const [propertyId, setPropertyId] = useState("");

  useEffect(() => {
    // Extract the ID and name from the URL
    const pathParts = location.pathname.split("/");
    const id = pathParts[pathParts.length - 1]; // Get the last part
    const name = pathParts[pathParts.length - 2]; // Get the second last part
    setPropertyId(id);
    setPropertyName(name);
  }, [location.pathname]);

  // Fetch room data from API
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!propertyId) return;

      try {
        const response = await fetch(
          `${config.API_HOST}/api/packagemaker/get-packagemaker-by-id/${propertyId}`
        );
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const result = await response.json();
        if (result.success) {
          const fetchedRoomData = result.data.rooms?.data || [];
          setRoomData(fetchedRoomData);

          const updatedHotelData = {};
          const dates = []; // Array to hold dates

          tabs.forEach((tab) => {
            const inventory = result.data.inventory[tab.value];
            updatedHotelData[tab.value] = {};
            Object.keys(inventory || {}).forEach((roomName) => {
              const room = inventory[roomName];
              updatedHotelData[tab.value][roomName] = {
                availability: room.availability.map((day) => {
                  const dateObj = new Date(day.date);
                  dates.push(dateObj); // Collecting dates from availability
                  return {
                    date: dateObj.toISOString(),
                    available: day.available || "",
                    sold: day.sold || 0,
                  };
                }),
                rates: {}, // Initialize rates here
              };

              // Populate rates for each rate type
              rateTypes[tab.value].forEach((rate) => {
                const rateData = room.rates[rate.name];

                // Ensure rateData exists and is an object
                if (rateData && typeof rateData === "object") {
                  updatedHotelData[tab.value][roomName].rates[rate.name] = {
                    1: (rateData[1] || []).map((rateEntry) => ({
                      date: rateEntry.date, // Ensure the date is included
                      value: rateEntry.value || null,
                    })),
                    2: (rateData[2] || []).map((rateEntry) => ({
                      date: rateEntry.date, // Ensure the date is included
                      value: rateEntry.value || null,
                    })),
                  };
                } else {
                  // If no rate data available, set to default empty arrays with null values
                  updatedHotelData[tab.value][roomName].rates[rate.name] = {
                    1: Array(7).fill({ date: null, value: null }),
                    2: Array(7).fill({ date: null, value: null }),
                  };
                }
              });
            });
          });

          setHotelData(updatedHotelData);

          // Set unique dates to state
          const uniqueDates = [
            ...new Set(dates.map((date) => date.toDateString())),
          ].map((date) => new Date(date));
          setDates(uniqueDates); // Assuming you have a state variable to hold dates
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    fetchRoomData();
  }, [propertyId]);

  useEffect(() => {
    console.log("Updated hotel data:", hotelData);
  }, [hotelData]);

  // Initialize hotel data on mount
  useEffect(() => {
    if (Object.keys(hotelData).length === 0) {
      setHotelData(initializeHotelData());
    }
  }, [hotelData]);

  // Effect to initialize hotel data
  useEffect(() => {
    if (!Object.keys(hotelData).length) {
      const initialHotelData = {};
      tabs.forEach((tab) => {
        initialHotelData[tab.value] = {};

        roomTypes[tab.value].forEach((room) => {
          initialHotelData[tab.value][room.name] = {
            availability: Array(7).fill({ available: "", sold: 0 }),
            rates: {},
          };

          rateTypes[tab.value].forEach((rate) => {
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

  // Effect to update hotel data when roomData changes
  useEffect(() => {
    if (roomData.length > 0) {
      // const dates = getDates();

      setHotelData((prevHotelData) => {
        const updatedData = { ...prevHotelData };
        tabs.forEach((tab) => {
          updatedData[tab.value] = updatedData[tab.value] || {};
          roomData.forEach((room) => {
            updatedData[tab.value][room.roomName] = updatedData[tab.value][
              room.roomName
            ] || {
              availability: dates?.map((date) => ({
                date,
                available: "",
                sold: 0,
              })),
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

  const handleSave = async () => {
    const url = `${config.API_HOST}/api/packagemaker/update-packagemaker/${propertyId}`;

    const payload = {
      ...hotelData, // Spread the current hotelData content
      step: 7, // Add the step key at the root level
    };

    try {
      // Send the PATCH request
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // Specify that the content is JSON
        },
        body: JSON.stringify(payload), // Convert the payload to a JSON string
      });

      // Handle the response
      if (response.ok) {
        const result = await response.json();
        window.location.reload();
        // Optionally redirect or update UI based on success
      } else {
        console.error(
          "Failed to update property:",
          response.status,
          response.statusText
        );
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
    <div className="flex min-h-screen w-[80%] mx-auto mt-1 rounded-lg">
      {/* Sidebar */}
      <BulkUpdateModal
        modalShow={modalShow}
        closeModal={closeModal}
        hotelData={hotelData}
        propertyId={propertyId}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
          <Button
            variant="text"
            className="flex items-center gap-2 text-blue-500 p-0 mb-4"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeftIcon strokeWidth={2} className="h-5 w-5" />
            Back to Hotel Listing
          </Button>
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h4" color="blue-gray">
              Manage Inventory, Rates & Restrictions
            </Typography>
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray">
                Rates in: INR
              </Typography>
            </div>
          </div>

          <Tabs value={activeTab} className="mb-6">
            <TabsHeader>
              {tabs.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                >
                  {label}
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {tabs.map(({ value }) => (
                <TabPanel key={value} value={value}>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Tooltip content="Post promotion rates information">
                      <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        POST PROMOTION RATES
                        <InformationCircleIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Create super package information">
                      <Button
                        variant="outlined"
                        color="blue-gray"
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        CREATE SUPER PACKAGE
                        <InformationCircleIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <div className="flex-1" />
                    <Button onClick={modalHandler} variant="outlined">
                      Bulk Update
                    </Button>
                    <IconButton
                      variant="outlined"
                      color="blue-gray"
                      size="sm"
                      onClick={() => changeWeek("prev")}
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton variant="outlined" color="blue-gray" size="sm">
                      <CalendarIcon className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      variant="outlined"
                      color="blue-gray"
                      size="sm"
                      onClick={() => changeWeek("next")}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </IconButton>
                  </div>

                  <Card className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          <th className="border-b border-blue-gray-100 w-[200px] bg-blue-gray-50 p-5">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                Rooms & Rates
                              </Typography>
                            </div>
                          </th>
                          {dates.map((date) => (
                            <th
                              key={date}
                              className="border-b border-gray-300 text-center p-2"
                            >
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal leading-none opacity-70"
                              >
                                {date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                })}{" "}
                                {date.getDate()}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {roomData &&
                          updatedRoomTypes[activeTab].map((roomType, index) => (
                            <React.Fragment key={index}>
                              {/* Main Room Type Row */}
                              <tr className="hover:bg-blue-gray-50/50 cursor-pointer">
                                <td
                                  className="p-4 border-b border-blue-gray-50"
                                  onClick={() =>
                                    toggleRoomExpansion(roomType.name)
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    {isRoomExpanded(roomType.name) ? (
                                      <MinusIcon className="h-4 w-4" />
                                    ) : (
                                      <PlusIcon className="h-4 w-4" />
                                    )}
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="font-normal"
                                    >
                                      {roomType.name}
                                    </Typography>
                                  </div>
                                </td>
                                {hotelData[activeTab]?.[
                                  roomType.name
                                ]?.availability?.map((day, dayIndex) => (
                                  <td
                                    key={dayIndex}
                                    className="p-2 border-b border-blue-gray-50"
                                  >
                                    <div className="text-center border rounded p-1">
                                      <input
                                        type="number"
                                        value={day.available}
                                        placeholder="enter value"
                                        className="font-medium text-center"
                                        onChange={(e) =>
                                          handleAvailabilityChange(
                                            roomType.name,
                                            dayIndex,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <Typography
                                      variant="small"
                                      color="blue-gray"
                                      className="text-center p-1 text-xs"
                                    >
                                      {day.sold} sold
                                    </Typography>
                                  </td>
                                ))}
                              </tr>

                              {/* Rate Types */}
                              {isRoomExpanded(roomType.name) &&
                                rateTypes[activeTab].map(
                                  (rateType, rateIndex) => (
                                    <React.Fragment
                                      key={`${index}-${rateIndex}`}
                                    >
                                      <tr
                                        className="hover:bg-blue-gray-50/50 cursor-pointer border-b"
                                        onClick={() =>
                                          toggleRateExpansion(rateType.name)
                                        }
                                      >
                                        <td className="p-4">
                                          <div className="flex items-center gap-2 pl-8">
                                            {isRateExpanded(rateType.name) ? (
                                              <MinusIcon className="h-3 w-3" />
                                            ) : (
                                              <PlusIcon className="h-3 w-3" />
                                            )}
                                            <div className="flex items-center gap-2">
                                              <Typography
                                                variant="small"
                                                color="blue-gray"
                                                className="font-normal"
                                              >
                                                {rateType.name}
                                              </Typography>
                                            </div>
                                          </div>
                                        </td>
                                        {Array(7)
                                          .fill(null)
                                          .map((_, dayIndex) => (
                                            <td
                                              key={dayIndex}
                                              className="p-2"
                                            />
                                          ))}
                                      </tr>

                                      {/* Base Rates when expanded */}
                                      {isRateExpanded(rateType.name) && (
                                        <>
                                          {[1, 2].map((occupancy) => (
                                            <tr
                                              key={occupancy}
                                              className="bg-gray-50/50"
                                            >
                                              <td className="p-2 border-b border-gray-200">
                                                <div className="items-center pl-20 pr-4">
                                                  <Typography
                                                    variant="small"
                                                    color="gray"
                                                    className="font-medium"
                                                  >
                                                    {occupancy}{" "}
                                                    {occupancy === 1
                                                      ? "Guest"
                                                      : "Guests"}
                                                  </Typography>
                                                </div>
                                              </td>
                                              {hotelData[activeTab]?.[
                                                roomType.name
                                              ]?.rates[rateType.name]?.[
                                                occupancy
                                              ]?.map((rate, dayIndex) => (
                                                <td
                                                  key={dayIndex}
                                                  className="p-2 border-b border-gray-200"
                                                >
                                                  <input
                                                    type="number"
                                                    value={rate?.value || ""} // Ensure value is set properly, fallback to empty string if null
                                                    onChange={(e) =>
                                                      handleRateChange(
                                                        roomType.name,
                                                        rateType.name,
                                                        occupancy,
                                                        dayIndex,
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full text-center font-bold p-1 border border-gray-300 rounded text-xs bg-white"
                                                  />
                                                </td>
                                              )) ||
                                                Array(7).fill(
                                                  <td className="p-2 border-b border-gray-200">
                                                    <input
                                                      type="number"
                                                      value={""}
                                                      className="w-full text-center font-bold p-1 border border-gray-300 rounded text-xs bg-white"
                                                    />
                                                  </td>
                                                )}
                                            </tr>
                                          ))}
                                          {console.log(
                                            hotelData[activeTab]["Deluxe Room"]
                                          )}
                                        </>
                                      )}
                                    </React.Fragment>
                                  )
                                )}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </table>
                  </Card>
                </TabPanel>
              ))}
            </TabsBody>
          </Tabs>
        </div>
        <div className="fixed bg-white p-4 flex justify-end border-gray-600 border-2 items-center gap-4 shadow-lg z-[40] w-[80%] m-auto left-0 right-0 bottom-4 rounded-lg">
          <div className="text-blue-600 text-xs underline">CANCEL CHANGES</div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
