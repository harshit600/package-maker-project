import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Progress,
} from "@material-tailwind/react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ListedProperites from "./ListedPoperties";

export function Homee() {
  const [hotelCounts, setHotelCounts] = useState({
    total: 0,
    goa: 0,
  });

  // Example function to fetch hotel counts - replace with your actual API call
  useEffect(() => {
    // Simulated API call - replace with your actual data fetching logic
    const fetchHotelCounts = async () => {
      try {
        // Replace this with your actual API call
        const response = {
          totalHotels: 15789, // Example number
          goaHotels: 2911, // Example number
        };

        setHotelCounts({
          total: response.totalHotels,
          goa: response.goaHotels,
        });
      } catch (error) {
        console.error("Error fetching hotel counts:", error);
      }
    };

    fetchHotelCounts();
  }, []);

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
            <span>Hotels and more in Goa</span>
          </div>
          <div className="space-y-1">
            <Typography
              variant="h1"
              className="text-4xl font-bold text-gray-900"
            >
              {hotelCounts.goa.toLocaleString()} Properties in Goa
            </Typography>
            <Typography className="text-gray-600">
              We have {hotelCounts.total.toLocaleString()} properties across
              India
            </Typography>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white/95 mt-6 p-4 rounded-lg shadow">
          <div className="flex items-center gap-6">
            <span className="text-gray-700 font-medium">SORT BY:</span>
            <div className="flex items-center gap-4">
              <Button
                variant="text"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Popular
              </Button>
              <Button
                variant="text"
                className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded"
              >
                User Rating (Highest First)
              </Button>
              <Button
                variant="text"
                className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded"
              >
                Price (Highest First)
              </Button>
              <Button
                variant="text"
                className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded"
              >
                Price (Lowest First)
              </Button>
            </div>
            <div className="ml-auto">
              <Input
                type="search"
                placeholder="Search for locality / hotel name"
                className="min-w-[300px]"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Existing Properties Card */}
      <div className="max-w-7xl mx-auto mt-6">
        <Card className="w-full">
          <CardHeader floated={false} shadow={false} className="rounded-none">
            <div className="flex items-center justify-between gap-8 mb-8">
              <div>
                <Typography variant="h3" color="blue-gray">
                  My Properties
                </Typography>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link to="/property">
                  <Button
                    className="flex items-center gap-3"
                    size="sm"
                    color="blue"
                  >
                    <PlusIcon strokeWidth={2} className="h-4 w-4" /> Create New
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <ListedProperites />
        </Card>
      </div>
    </div>
  );
}

export default Homee;
