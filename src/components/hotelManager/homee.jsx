import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ListedProperites from "./ListedPoperties";
import config from "../../../config";
import { useHotelManager } from "../../context/HotelManagerContext";
export function Homee() {
  const { properties, isLoading, totalHotels } = useHotelManager();
  const [selectedSort, setSelectedSort] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedRating, setSelectedRating] = useState("All Ratings");
  const propertyTypeTabs = [
    { label: 'All', value: 'all' },
    { label: 'Hotel', value: 'hotel' },
    { label: 'BnBs', value: 'BnBs' },
    { label: 'HomeStay & Villa', value: 'homeStays&Villas' },
  ];
  const [selectedPropertyType, setSelectedPropertyType] = useState(propertyTypeTabs[0].value);

  // Derive location options from properties
  const locationOptions = useMemo(() => {
    const addresses = properties
      .map(property => property?.location?.address)
      .filter(Boolean);
    const uniqueAddresses = [...new Set(addresses)];
    return [
      { label: "All Locations", value: "all" },
      ...uniqueAddresses.map(address => {
        const parts = address.split(',');
        const cityName = parts.length > 1 ? parts[parts.length - 2].trim() : address;
        return {
          label: cityName,
          value: address
        };
      })
    ];
  }, [properties]);

  const handleSortChange = (option) => {
    setSelectedSort(option.label);
  };
  const handlePriceChange = (option) => {
    setSelectedPrice(option.label);
  };
  const handleLocationChange = (option) => {
    setSelectedLocation(option.value);
  };
  const handleRatingChange = (option) => {
    setSelectedRating(option.label);
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="py-8 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Link to="/" className="text-blue-600 hover:underline">
              Home
            </Link>
            <span>›</span>
            <span>Properties</span>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <Typography
                  variant="h1"
                  className="text-4xl font-bold text-gray-900"
                >
                  {totalHotels.toLocaleString()} {totalHotels === 1 ? "Property" : "Properties"}
                </Typography>
                <p className="text-sm text-gray-500">
                  Loading all properties automatically for better filtering experience
                </p>
              </>
            )}
          </div>
        </div>
        {/* Property Type Tabs */}
        <div className="flex gap-4 mt-6 mb-2">
          {propertyTypeTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${selectedPropertyType === tab.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setSelectedPropertyType(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Filter Section */}
        <div className="sticky top-0 z-10 bg-white mt-6 p-4 rounded-lg shadow">
          <div className="flex items-center gap-6">
            {/* Location Filter */}
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  className="flex items-center gap-2 text-gray-700"
                >
                  {locationOptions.find(opt => opt.value === selectedLocation)?.label || "All Locations"} <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />
                </Button>
              </MenuHandler>
              <MenuList>
                {locationOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleLocationChange(option)}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <div className="ml-auto flex items-center gap-4">
              <Input
                type="search"
                placeholder="Search for locality / hotel name"
                className="min-w-[300px] placeholder-gray-500 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={handleSearch}
              />
              <Link to="/property">
                <Button
                  className="flex items-center gap-3"
                  size="sm"
                  color="blue"
                >
                  <PlusIcon strokeWidth={2} className="h-4 w-4" /> New
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Properties List Component */}
      <div className="max-w-7xl mx-auto mt-6">
        <ListedProperites
          properties={properties}
          isLoading={isLoading}
          totalHotels={totalHotels}
          sortBy={selectedSort.toLowerCase()}
          searchQuery={searchQuery}
          priceFilter={selectedPrice}
          locationFilter={selectedLocation}
          ratingFilter={selectedRating}
          propertyType={selectedPropertyType}
        />
      </div>
    </div>
  );
}

export default Homee;
