import React, { useEffect, useState } from "react";
import config from "../../../config";
import {
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { slugify } from "../../common/functions";

function RoomListing() {
  const [roomsData, setRoomsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(
          `${config.API_HOST}/api/rooms/delete-room/${id}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();

        if (data.success) {
          setRoomsData((prevData) =>
            prevData.filter((room) => room._id !== id)
          );
        }
      } catch (error) {
        console.error("Error deleting room:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${config.API_HOST}/api/rooms/get-rooms`);
        
        // Add logging to check the raw response
        const responseText = await response.text();
        console.log('Raw API Response:', responseText);
        
        // Try to parse the response
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          console.error('Invalid JSON received:', responseText);
          setLoading(false);
          return;
        }

        if (data.success) {
          setRoomsData(data.data);
        } else {
          console.error('API request was not successful:', data);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Skeleton loader component
  const RoomSkeleton = () => (
    <div className="property-card flex justify-between mt-4 animate-pulse">
      <div className="flex gap-8 items-center">
        <div className="h-[200px] w-[200px] bg-gray-200 rounded-lg"></div>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-4 items-center mr-10">
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
        <div className="w-7 h-7 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4">
        {[1, 2, 3].map((index) => (
          <RoomSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {roomsData?.map((room) => (
        <div
          key={room._id}
          className="property-card flex justify-between mt-4 hover:bg-gray-50 transition-all duration-300 p-4 rounded-lg"
        >
          <div className="flex gap-8 items-center">
            <img
              src={room?.images?.[0]}
              height="200px"
              width="200px"
              className="rounded-lg object-cover"
              alt={room?.roomName}
            />
            <div className="flex flex-col">
              <div className="font-bold text-2xl text-gray-800">
                {room?.roomName}
              </div>
              <div className="font-normal text-gray-600 mt-2">
                Room Type: {room?.roomType} | Floor: {room?.floor} | Status:{" "}
                <span
                  className={`${
                    room?.status === "available"
                      ? "text-green-500"
                      : room?.status === "occupied"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {room?.status}
                </span>
              </div>
              <div className="font-normal text-gray-600 mt-1">
                Facility: {room?.roomFacility}
              </div>
            </div>
          </div>
          <div className="flex gap-4 items-center mr-10">
            <Link to={`/update-room/${slugify(room?.roomName)}/${room._id}`}>
              <div className="w-7 cursor-pointer hover:text-blue-500 hover:scale-110 transition-all">
                <PencilSquareIcon />
              </div>
            </Link>
            <div
              className="w-7 cursor-pointer hover:text-red-500 hover:scale-110 transition-all"
              onClick={() => handleDelete(room._id)}
            >
              <TrashIcon />
            </div>
            <Link to={`/room/${slugify(room?.roomName)}/${room._id}`}>
              <div className="w-7 cursor-pointer hover:text-green-500 hover:scale-110 transition-all">
                <CalendarIcon />
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RoomListing;
