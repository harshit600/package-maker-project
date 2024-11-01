import React, { useState, useRef, useEffect } from "react";

const Dropdown = ({ options, label, onSelect, onChange, searchInput, setSearchInput, invalid }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

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

  // Filter options based on search input
  useEffect(() => {
    if (searchInput === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((option) =>
          option.label.toLowerCase().includes(searchInput.toLowerCase())
        )
      );
    }
  }, [searchInput, options]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setSearchInput(option.label); // Set the input text to the selected option
    onSelect(option); // Pass the selected option to the parent component
    setIsOpen(false); // Close the dropdown
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    onChange(value); // Trigger the parent function for API search
    setSearchInput(value); // Set search input value
    setIsOpen(true); // Open dropdown when typing
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        placeholder={label}
        className={`w-full text-sm px-4 py-2 text-left bg-white border
         border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2
          focus:ring-indigo-500 focus:border-indigo-500 ${invalid ? '!border-red-600' : 'border-gray-300'}`}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-4 py-2 text-xs cursor-pointer hover:bg-gray-100"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
