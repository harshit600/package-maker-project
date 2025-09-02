import React, { useState, useEffect } from "react";
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
import axios from "axios";
import config from "../../../config";

export function Homee() {
  const [totalHotels, setTotalHotels] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSort, setSelectedSort] = useState("Popular");
  const [searchQuery, setSearchQuery] = useState("");

  const sortOptions = [
    { label: "Popular", value: "popular" },
    { label: "User Rating (Highest First)", value: "rating_high" },
    { label: "Price (Highest First)", value: "price_high" },
    { label: "Price (Lowest First)", value: "price_low" },
  ];

  useEffect(() => {
    const fetchHotelCount = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.API_HOST}/api/packagemaker/get-packagemaker`
        );
        if (response.data.success) {
          setTotalHotels(response.data.data.length);
        }
      } catch (error) {
        console.error("Error fetching hotel count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelCount();
  }, []);

  const handleSortChange = (option) => {
    setSelectedSort(option.label);
    // Add your sorting logic here
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add your search logic here
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
              </div>
            ) : (
              <Typography
                variant="h1"
                className="text-4xl font-bold text-gray-900"
              >
                {totalHotels.toLocaleString()}{" "}
                {totalHotels === 1 ? "Property" : "Properties"}
              </Typography>
            )}
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white mt-6 p-4 rounded-lg shadow">
          <div className="flex items-center gap-6">
            <span className="text-gray-700 font-medium">SORT BY:</span>
            <Menu>
              <MenuHandler>
                <Button
                  variant="text"
                  className="flex items-center gap-2 text-gray-700"
                >
                  {selectedSort}{" "}
                  <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />
                </Button>
              </MenuHandler>
              <MenuList>
                {sortOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option)}
                    className={`${
                      selectedSort === option.label
                        ? "bg-blue-50 text-blue-900"
                        : ""
                    }`}
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
                className="min-w-[300px] placeholder-gray-500"
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

      {/* Existing Properties Card */}
      <div className="max-w-7xl mx-auto mt-6">
        <ListedProperites
          sortBy={selectedSort.toLowerCase()}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}

export default Homee;
