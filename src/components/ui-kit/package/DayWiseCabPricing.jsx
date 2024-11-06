import React, { useEffect, useState } from "react";
import AddPricesPerDayModal from "./AddPricesPerDayModal";
import Button from "../atoms/Button";

function DayWiseCabPricing({ travelData = {}, cabs, cabPayLoad, setCabPayload, setFormData, setPricing }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempPrice, setTempPrice] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Function to handle adding or updating prices
   // Function to handle adding or updating prices
   const handlePriceAdd = () => {
    // Validate tempPrice
    if (!tempPrice || Object.keys(tempPrice).length === 0) {
        console.error("tempPrice is empty or undefined");
        return;
    }

    const lowestOnSeasonPrices = [];
    const lowestOffSeasonPrices = [];

    // Gather prices for each cab in tempPrice
    Object.entries(tempPrice).forEach(([cabName, prices]) => {
        if (prices) {
            const onSeasonPrice = parseFloat(prices.onSeasonPrice) || 0;
            const offSeasonPrice = parseFloat(prices.offSeasonPrice) || 0;

            lowestOnSeasonPrices.push(onSeasonPrice);
            lowestOffSeasonPrices.push(offSeasonPrice);
        }
    });

    // Determine lowest prices for each season
    const lowestOnSeasonPrice = lowestOnSeasonPrices.length ? Math.min(...lowestOnSeasonPrices) : 0;
    const lowestOffSeasonPrice = lowestOffSeasonPrices.length ? Math.min(...lowestOffSeasonPrices) : 0;

    // Update global pricing state
    setPricing({
        lowestOnSeasonPrice,
        lowestOffSeasonPrice,
    });

    // Consolidate cab data into a single payload for the entire trip
    const newCabPayload = {
        prices: tempPrice,
        travelInfo: Object.values(travelData), // Optional: for entire trip details
        cabs, // Include all cab data as a single entry
    };

    // Update both cab payload and form data with consolidated pricing
    setCabPayload((prevPayload) => ({
        ...prevPayload,
        travelPrices: newCabPayload,
    }));

    setFormData((prevFormData) => ({
        ...prevFormData,
        travelPrices: newCabPayload,
    }));

    // Close the modal
    closeModal();
};

   useEffect(() => {

   })

    const openModal = () => {
        setIsModalOpen(true);
        const existingPrices = cabPayLoad[Object.keys(cabPayLoad)[0]]?.prices || {};
        setTempPrice(existingPrices);
        setIsEditing(Object.keys(existingPrices).length > 0); // Check if we're editing
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTempPrice({});
    };

    return (
        <div className="pt-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Travel Entries</h2>
            <div className="min-w-[400px] w-fit mx-auto flex justify-center flex-col p-4 rounded border-1 border-gray-100 items-center shadow-md">
            {Object.entries(travelData).map(([key, places]) => {
                const fromPlace = places?.[0]?.toUpperCase() || "Unknown";
                const toPlace = places?.[1]?.toUpperCase() || "Unknown";

                return (
                    <div
                        key={key}
                        className="flex items-center justify-between p-4 rounded-lg shadow-md w-[700px] mb-4 transition-shadow duration-300 hover:shadow-lg"
                    >
                        <div className="flex items-center justify-center w-full gap-4">
                            <div className="w-[150px]">
                                <span className="text-gray-500 font-medium">From</span>
                                <div className="text-xl font-semibold text-gray-800">{fromPlace}</div>
                            </div>

                            <div className="flex items-center mx-4">
                                <span className="text-gray-300 w-16 h-0.5 bg-gray-300" />
                                <span className="text-blue-600 mx-2 text-2xl">🚗</span>
                                <span className="text-gray-300 w-16 h-0.5 bg-gray-300" />
                            </div>

                            <div className="text-center">
                                <span className="text-gray-500 font-medium">To</span>
                                <div className="text-xl font-semibold text-gray-800">{toPlace}</div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Single Add Prices Button at the Bottom */}
            <div className="flex justify-center mt-6">
                <Button
                text={`${isEditing ? "Edit Prices" : "Add Prices"}`}
                    // css="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    onClick={openModal}
                    variant="primary"
                />
            </div>
            </div>

            {/* Prices Modal */}
            <AddPricesPerDayModal 
                isModalOpen={isModalOpen}
                cabs={cabs}
                tempPrice={tempPrice}
                setTempPrice={setTempPrice}
                closeModal={closeModal}
                handlePriceAdd={handlePriceAdd}
            />
        </div>
    );
}

export default DayWiseCabPricing;
