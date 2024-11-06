import React, { useState, useEffect } from 'react';
import Modal from '../atoms/Modal';

function AddPricesPerDayModal({
    isModalOpen,
    closeModal,
    handlePriceAdd,
    tempPrice = {},
    setTempPrice,
    cabs,
}) {
    const [isOnSeason, setIsOnSeason] = useState(true);

    // Handle toggle between On Season and Off Season
    const handleToggleSeason = () => {
        setIsOnSeason((prev) => !prev);
    };

    useEffect(() => {
        if (isModalOpen) {
            setIsOnSeason(true); // Reset to On Season when modal opens
        }
    }, [isModalOpen]);

    return (
        <Modal
            show={isModalOpen}
            closeModal={closeModal}
            css="!w-[1200px]"
        >
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                    {isOnSeason ? 'On Season' : 'Off Season'} Prices
                </h3>

                <div className="flex justify-end mb-4">
                    {/* Toggle switch */}
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={handleToggleSeason}>
                        <span className="font-medium">{isOnSeason ? 'On Season' : 'Off Season'}</span>
                        <div className={`relative w-12 h-6 ${isOnSeason ? 'bg-green-500' : 'bg-gray-300'} rounded-full transition duration-300`}>
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOnSeason ? 'translate-x-6' : 'translate-x-0'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className='h-[400px] overflow-scroll'>
                    {cabs && Object.entries(cabs).map(([cabType, cabList]) => (
                        <div key={cabType} className="mb-6">
                            <h4 className="text-md font-semibold mb-3">{cabType}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {cabList.map((cab) => (
                                    <div key={cab.cabName} className="flex items-center space-x-2">
                                        <img
                                            src={cab.cabImages[0]}
                                            alt={cab.cabName}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <span className="font-medium text-gray-800 pl-2 w-[200px]">{cab.cabName}</span>
                                        <input
                                            type="number"
                                            className='p-2'
                                            value={isOnSeason ? tempPrice[cab.cabName]?.onSeasonPrice || '' : tempPrice[cab.cabName]?.offSeasonPrice || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setTempPrice((prev) => ({
                                                    ...prev,
                                                    [cab.cabName]: {
                                                        ...prev[cab.cabName],
                                                        [isOnSeason ? 'onSeasonPrice' : 'offSeasonPrice']: value,
                                                    },
                                                }));
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        className="bg-blue-600 text-white px-3 py-1 rounded mr-2 hover:bg-blue-700 transition duration-300"
                        onClick={() => {
                            handlePriceAdd(); // Call the handler to process the prices
                            closeModal(); // Close the modal after submitting
                        }}
                    >
                        Submit
                    </button>
                    <button
                        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 transition duration-300"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default AddPricesPerDayModal;
