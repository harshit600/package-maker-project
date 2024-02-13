import React, { useState } from 'react';
import { format, addDays } from 'date-fns';

const DayPricesModal = ({ isOpen, onClose, handleDayPriceChange, formData }) => {
  const [dayValues, setDayValues] = useState({});
  const today = new Date();

  const handleInputChange = (day, value) => {
    setDayValues((prevValues) => ({
      ...prevValues,
      [day]: value,
    }));
    handleDayPriceChange(day, +value);
  };

  const closeModal = () => {
    onClose();
    setDayValues({});
  };

  return (
    <>
      {isOpen && (
        <div className="plutomodal">
          <span className="close" onClick={closeModal}>&times;</span>
          <div className="plutomodal-content">
            {[...Array(30)].map((_, index) => {
              const currentDate = addDays(today, index);
              const day = format(currentDate, 'yyyy-MM-dd');
              const displayDate = format(currentDate, 'dd MMM');

              return (
                <div key={day}>
                  <label htmlFor={`dayPrice-${day}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-black">
                    Day {displayDate} Price
                  </label>
                  <input
                    type="number"
                    name={`dailyPrices.${day}`}
                    id={`dayPrice-${day}`}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder={`Day ${displayDate} Price`}
                    required=""
                    value={dayValues[day] || ''}
                    onChange={(e) => handleInputChange(day, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default DayPricesModal;
