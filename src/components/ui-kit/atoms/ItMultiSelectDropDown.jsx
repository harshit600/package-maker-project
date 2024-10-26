import { useEffect, useRef, useState } from "react";

const ItMultiSelectDropdown = ({ options, label, handleChange, page, value }) => {
  const [selectedOptions, setSelectedOptions] = useState(value || []);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const maxVisibleTags = 5;

  // Calculate tags to display based on `isExpanded` state
  const visibleTags = isExpanded ? selectedOptions : selectedOptions.slice(0, maxVisibleTags);
  const overflowCount = selectedOptions.length - visibleTags.length;

  useEffect(() => {
    setSelectedOptions(value || []);
  }, [value]);

  const handleOptionToggle = (option) => {
    setSelectedOptions((prevSelected) => {
      const updatedSelection = prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option];

      handleChange(updatedSelection);
      return updatedSelection;
    });
  };

  const handleRemoveOption = (option) => {
    setSelectedOptions((prevSelected) => {
      const updatedSelection = prevSelected.filter((item) => item !== option);
      handleChange(updatedSelection);
      return updatedSelection;
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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

  return (
    <div className={`relative ${page === 'itenirary' ? 'w-full' : 'w-[530px]'} min-h-[40px]`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {!isExpanded && <div
        onClick={toggleDropdown}
        className="flex items-center p-2  border rounded-lg cursor-pointer bg-white min-h-[40px] border-gray-300 h-full"
        style={{
          flexWrap: "wrap",
          overflow: "hidden",
          whiteSpace: isExpanded ? "normal" : "nowrap",
        }}
      >
        {visibleTags.map((option) => (
          <span
            key={option}
            className="flex items-center px-2 py-1 mr-2 mb-2 text-xs font-medium text-gray-700 border-blue-400 border-2 rounded-full"
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
        ))}
        {overflowCount > 0 && !isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="text-blue-500 cursor-pointer text-xs"
          >
            +{overflowCount} more
          </span>
        )}
      </div>}

      {/* Expanded view to show all tags */}
      {isExpanded && (
        <div className="flex flex-wrap items-center p-2 border rounded-lg bg-white border-gray-300 mt-2">
          {selectedOptions.map((option) => (
            <span
              key={option}
              className="flex items-center mb-2 px-2 py-1 mr-2 text-xs font-medium text-gray-700 border-blue-400 border-2 rounded-full"
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
          ))}
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="text-blue-500 cursor-pointer text-xs"
          >
            Show Less
          </span>
        </div>
      )}

      {/* Dropdown for selecting new options */}
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

export default ItMultiSelectDropdown;
