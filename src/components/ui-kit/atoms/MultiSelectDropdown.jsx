import { useEffect, useRef, useState } from "react";

const MultiSelectDropdown = ({ options, label, handleChange, initialValue = [] }) => {
  const [selectedOptions, setSelectedOptions] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (initialValue && initialValue.length > 0) {
      setSelectedOptions(initialValue);
    }
  }, [initialValue]);

  const handleOptionToggle = (option) => {
    setSelectedOptions((prevSelected) => {
      let updatedSelection;
      if (prevSelected.includes(option)) {
        // Remove option if already selected
        updatedSelection = prevSelected.filter((item) => item !== option);
      } else {
        // Add option if not selected
        updatedSelection = [...prevSelected, option];
      }
      handleChange(updatedSelection); // Pass updated selection to parent
      return updatedSelection;
    });
  };

  const handleRemoveOption = (option) => {
    setSelectedOptions((prevSelected) => {
      const updatedSelection = prevSelected.filter((item) => item !== option);
      handleChange(updatedSelection); // Pass updated selection to parent
      return updatedSelection;
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-[530px]" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div onClick={toggleDropdown} className="flex flex-wrap items-center p-2 border rounded-lg cursor-pointer bg-white border-gray-300">
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center px-2 py-1 mr-2 text-xs font-medium text-gray-700 border-blue-400 border-2 rounded-full"
            >
              {option}
              <button
                className="ml-1 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveOption(option);
                }}
              >
                &times;
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-400">Select tags...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              className={`cursor-pointer p-2 hover:bg-gray-100 ${selectedOptions.includes(option) ? 'bg-gray-200' : ''}`}
              onClick={() => handleOptionToggle(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
