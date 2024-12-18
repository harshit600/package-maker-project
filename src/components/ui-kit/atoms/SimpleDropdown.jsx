import React, { useState, useRef, useEffect } from "react";

const SimpleDropdown = ({ options, label, onSelect, value, invalid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);

  // Add this useEffect to handle value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Find the matching option label for the selected value
  const selectedLabel = options.find(option => option.value === value)?.label || value;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onSelect(option); // Pass the selected option to the parent component
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <label>{label}</label>
      <button
        onClick={handleToggle}
        className={`w-full px-2 text-sm ${selectedValue ? 'text-gray-800' : 'text-gray-400'} 
        py-2 h-[37px] text-left bg-white border border-gray-300 rounded-md focus:outline-none 
        focus:ring-2 focus:ring-indigo-500 ${invalid ? '!border-red-600' : 'border-gray-300 '}`}
      >
        {selectedLabel || label}
      </button>

      {isOpen && options.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options && options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SimpleDropdown;
