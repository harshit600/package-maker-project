import React, { useState } from "react";
import AddPricesPerDayModal from "./AddPricesPerDayModal";

function DayWiseCabPricing({ travelData, cabs, cabPayLoad, setCabPayload }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTravelKey, setSelectedTravelKey] = useState("");
    const [tempPrice, setTempPrice] = useState({});

    const handlePriceAdd = () => {
        const newCabPayload = {
            travelKey: selectedTravelKey,
            prices: tempPrice,
            travelInfo: travelData[selectedTravelKey],
            cabs,
        };

        setCabPayload((prevPayload) => ({
            ...prevPayload,
            [selectedTravelKey]: newCabPayload,
        }));

        closeModal();
    };

    const openModal = (key) => {
        setSelectedTravelKey(key);
        setIsModalOpen(true);

        // Prefill tempPrice with saved prices if available, otherwise initialize empty
        setTempPrice(cabPayLoad[key]?.prices || {});
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTravelKey("");
        setTempPrice({});
    };

    return (
        <div className="pt-4">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Travel Entries
            </h2>
            {Object.entries(travelData).map(([key, places]) => (
                <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-lg shadow-md mb-4 transition-shadow duration-300 hover:shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-[150px]">
                            <span className="text-gray-500 font-medium">From</span>
                            <div className="text-xl font-semibold text-gray-800">
                                {places[0].toUpperCase()}
                            </div>
                        </div>

                        <div className="flex items-center mx-4">
                            <span className="text-gray-300 w-16 h-0.5 bg-gray-300" />
                            <span className="text-blue-600 mx-2 text-2xl">🚗</span>
                            <span className="text-gray-300 w-16 h-0.5 bg-gray-300" />
                        </div>

                        <div className="text-center">
                            <span className="text-gray-500 font-medium">To</span>
                            <div className="text-xl font-semibold text-gray-800">
                                {places[1].toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Button shows "Edit Prices" if prices exist, otherwise "Add Prices" */}
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        onClick={() => openModal(key)}
                    >
                        {cabPayLoad[key] ? "Edit Prices" : "Add Prices"}
                    </button>
                </div>
            ))}
            <AddPricesPerDayModal 
                isModalOpen={isModalOpen}
                cabs={cabs}
                tempPrice={tempPrice}
                setTempPrice={setTempPrice}
                selectedTravelKey={selectedTravelKey}
                closeModal={closeModal}
                handlePriceAdd={handlePriceAdd}
            />
        </div>
    );
}

export default DayWiseCabPricing;
