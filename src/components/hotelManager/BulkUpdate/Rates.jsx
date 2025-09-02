import React, { useState, useEffect } from "react";

function Rates({
  roomNames,
  availabilityValues,
  setAvailabilityValues,
  dateRange,
  setRatesValues,
  ratesValues,
}) {
  const [selectedCategory, setSelectedCategory] = useState("b2b");

  useEffect(() => {
    const initializedRates = { b2b: {}, b2c: {}, website: {} };

    for (const category of Object.keys(availabilityValues)) {
      for (const roomName of Object.keys(availabilityValues[category])) {
        initializedRates[category][roomName] = {
          rates: {
            EP: { 1: null, 2: null, 3: null, 4: null },
            AP: { 1: null, 2: null, 3: null, 4: null },
            CP: { 1: null, 2: null, 3: null, 4: null },
            MAP: { 1: null, 2: null, 3: null, 4: null },
            // extraBed: { 1: null, 2: null },
            // childCharge: { 1: null, 2: null }
          },
        };
      }
    }
    // setRatesValues(initializedRates);
  }, [availabilityValues]);

  const handleRateChange = (roomName, rateType, occupancyType, value) => {
    setRatesValues((prevState) => ({
      ...prevState,
      [selectedCategory]: {
        ...prevState[selectedCategory],
        [roomName]: {
          ...prevState[selectedCategory][roomName],
          rates: {
            ...prevState[selectedCategory][roomName]?.rates,
            [rateType]: {
              ...prevState[selectedCategory][roomName]?.rates?.[rateType],
              [occupancyType]: value,
            },
          },
        },
      },
    }));
  };

  const transformRatesToSchema = () => {
    const transformed = {};

    for (const category of Object.keys(ratesValues)) {
      transformed[category] = {};

      for (const roomName of Object.keys(ratesValues[category])) {
        transformed[category][roomName] = {};

        ["EP", "AP", "CP", "MAP"].forEach((mealPlan) => {
          transformed[category][roomName][mealPlan] = {
            1: dateRange.map((date) => ({
              date: new Date(date),
              value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[1] || null,
            })),
            2: dateRange.map((date) => ({
              date: new Date(date),
              value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[2] || null,
            })),
            ...(["extraBed", "childCharge"].includes(mealPlan) ? {} : {
              3: dateRange.map((date) => ({
                date: new Date(date),
                value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[3] || null,
              })),
              4: dateRange.map((date) => ({
                date: new Date(date),
                value: ratesValues[category][roomName]?.rates?.[mealPlan]?.[4] || null,
              }))
            })
          };
        });
      }
    }

    console.log("Transformed Rates to Schema:", transformed);
    setRatesValues(transformed);
    return transformed;
  };

  return (
    <div className="p-4">
      <h3 className="text-md font-bold mb-4">Update Rates</h3>
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600 mr-5">
          Select Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-[300px] border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="b2b">B2B</option>
          <option value="b2c">B2C</option>
          <option value="website">Website</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomNames.map((roomName) => (
          <div
            key={roomName}
            className="border border-gray-200 rounded-md p-4 shadow-sm"
          >
            <h4 className="font-semibold mb-3">{roomName}</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Meal Plan</th>
                  <th className="p-2 text-center">Double</th>
                  {/* <th className="p-2 text-center">Double</th> */}
                  <th className="p-2 text-center">Triple</th>
                  <th className="p-2 text-center">Quad</th>
                </tr>
              </thead>
              <tbody>
                {["EP", "AP", "CP", "MAP", ].map((rateType) => (
                  <tr key={rateType}>
                    <td className="p-2">{rateType}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                        placeholder={`Double (${rateType})`}
                        value={ratesValues[selectedCategory]?.[roomName]?.rates?.[rateType]?.[1] || ""}
                        onChange={(e) => handleRateChange(roomName, rateType, 1, e.target.value)}
                      />
                    </td>
                    {/* <td className="p-2">
                      <input
                        type="number"
                        className="border border-gray-300 rounded-md px-2 py-1 w-full"
                        placeholder={`Double (${rateType})`}
                        value={ratesValues[selectedCategory]?.[roomName]?.rates?.[rateType]?.[2] || ""}
                        onChange={(e) => handleRateChange(roomName, rateType, 2, e.target.value)}
                      />
                    </td> */}
                    {!["extraBed", "childCharge"].includes(rateType) && (
                      <>
                        <td className="p-2">
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            placeholder={`Triple (${rateType})`}
                            value={ratesValues[selectedCategory]?.[roomName]?.rates?.[rateType]?.[3] || ""}
                            onChange={(e) => handleRateChange(roomName, rateType, 3, e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            className="border border-gray-300 rounded-md px-2 py-1 w-full"
                            placeholder={`Quad (${rateType})`}
                            value={ratesValues[selectedCategory]?.[roomName]?.rates?.[rateType]?.[4] || ""}
                            onChange={(e) => handleRateChange(roomName, rateType, 4, e.target.value)}
                          />
                        </td>
                      </>
                    )}
                    {/* {["extraBed", "childCharge"].includes(rateType) && (
                      <>
                        <td className="p-2"></td>
                        <td className="p-2"></td>
                      </>
                    )} */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <button
        onClick={transformRatesToSchema}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Transform and Save
      </button>
    </div>
  );
}

export default Rates;
