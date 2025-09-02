import React, { useEffect, useState } from "react";
import config from "../../../../config";
import Button from "../atoms/Button";
import { useCabData } from "../../../context/CabContext";

// Add new ImageGallery component near the top of the file
const ImageGallery = ({ images, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <img
        src={
          images[currentImageIndex]
            ? getImageUrl(images[currentImageIndex])
            : "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        }
        alt={`Gallery image ${currentImageIndex + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onError={(e) => {
          e.target.src =
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
          console.log("Gallery image load error for index:", currentImageIndex);
        }}
      />

      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
        {currentImageIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// Add this function near the top of your file
const fetchHotelDetails = async (hotelId) => {
  try {
    const response = await fetch(`${config.API_HOST}/api/hotels/${hotelId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching hotel details:", error);
    return null;
  }
};

// Add this helper function near the top of the file
const getImageUrl = (imagePath) => {
  if (!imagePath)
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
  if (imagePath.startsWith("http")) return imagePath;
  return `${config.API_HOST}/storage/${imagePath}`;
};

// Add this helper function for activity images
const getActivityImageUrl = (imagePath) => {
  if (!imagePath) return "/fallback-image.jpg";
  return `https://backendactivity.plutotours.in/storage/images/${imagePath}`;
};

// New RoomCategories component
const RoomCategories = ({
  isVisible,
  onClose,
  selectedHotel,
  currentDay,
  onRoomSelect,
  cabsData,
}) => {
  const [activeTab, setActiveTab] = useState("about");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const tabs = [
    { id: "about", label: "About the hotel" },
    { id: "rooms", label: "Rooms" },
    { id: "facilities", label: "Hotel Facilities" },
    { id: "reviews", label: "Rating and Review" },
  ];

  // Extract hotel details
  const hotelName = selectedHotel?.basicInfo?.propertyName || "Hotel Name";
  const hotelLocation = selectedHotel?.location?.search || "Hotel Location";
  const propertyDescription =
    selectedHotel?.basicInfo?.propertyDescription || "Hotel Description";
  const hotelStarRating = selectedHotel?.basicInfo?.hotelStarRating || "4.4/5";
  const mobile = selectedHotel?.basicInfo?.mobile || "Hotel Contact No";
  const email = selectedHotel?.basicInfo?.email || "Hotel Email";
  const hotelAmenities = Array.isArray(selectedHotel?.amenities)
    ? selectedHotel.amenities
    : [];
  const roomTypes = selectedHotel?.roomTypes || [];

  const handleRoomSelect = (e, room, option) => {
    console.log("Room Data:", room);
    e.preventDefault();

    const roomData = {
      hotelInfo: {
        id: selectedHotel._id,
        name: selectedHotel.basicInfo.propertyName,
        city: selectedHotel.location.city,
        location: selectedHotel.location,
        photosAndVideos: selectedHotel.photosAndVideos,
        amenities: selectedHotel.amenities,
        basicInfo: selectedHotel.basicInfo,
      },
      roomInfo: {
        id: room._id,
        name: room.roomName,
        price: parseFloat(option.price),
        meal: option.meal,
        imageUrl: room.imageUrl,
        details: {
          roomSize: room.roomsizeinnumber,
          bedType: room.bedType,
          roomView: room.roomView,
          maxOccupancy: room.maxOccupancy,
          roomType: room.roomType,
          extraBed: room.extraBed,
          amenities: room.selectedAmenities?.Mandatory || {},
          baseRate: room.baseRate,
        },
      },
    };

    setSelectedRooms((prev) => ({
      ...prev,
      [currentDay]: roomData,
    }));

    console.log("Selected Room Data:", roomData);
    onRoomSelect(roomData);
    setShowNotification(true);
  };

  useEffect(() => {
    const loadHotelData = async () => {
      if (selectedHotel?.id) {
        const hotelData = await fetchHotelDetails(selectedHotel.id);
        setHotelDetails(hotelData);
      }
    };

    loadHotelData();
  }, [selectedHotel?.id]);
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 w-1/2 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out transform z-50 ${
          isVisible ? "translate-x-0" : "translate-x-full"
        } overflow-hidden flex flex-col`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50 bg-white shadow-md"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Hotel Header Section - Remove flex-shrink-0 */}
        <div className="overflow-y-auto h-full">
          <div className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {hotelName}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Add - {hotelLocation}
                </p>
                <div className="flex items-center mt-4">
                  <span className="bg-red-100 text-red-500 px-3 py-1 rounded-full text-sm font-medium">
                    YOUR SELECTED HOTEL
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                      <svg
                        className="w-4 h-4 inline-block mr-1 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27z"
                        />
                      </svg>
                      {hotelStarRating}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                      <svg
                        className="w-4 h-4 inline-block mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6z"
                        />
                      </svg>
                      +91-{mobile}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                      <svg
                        className="w-4 h-4 inline-block mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 relative">
                  <img
                    src={getImageUrl(selectedHotel?.photosAndVideos?.images[0])}
                    alt="Hotel Main"
                    className="w-full h-[300px] object-cover rounded-l-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                    }}
                  />
                  <button
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white transition-colors"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 8h16v10H4z M4 6h16M6 4h12" />
                    </svg>
                    VIEW GALLERY
                  </button>
                </div>
                <div className="space-y-2">
                  {[1, 2].map((index) => (
                    <img
                      key={index}
                      src={getImageUrl(
                        selectedHotel?.photosAndVideos?.images[index]
                      )}
                      alt={`Room View ${index}`}
                      className={`w-full h-[147px] object-cover ${
                        index === 1 ? "rounded-tr-lg" : "rounded-br-lg"
                      }`}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs - Updated sticky positioning */}
          <div className="sticky top-0 bg-white z-50 border-b shadow-sm">
            <div className="px-4 flex space-x-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-500"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Section - Remove separate scrolling */}
          <div className="flex-1">
            {activeTab === "about" && (
              <div className="p-4">
                <div className="space-y-4">
                  <div className="description">
                    <h3 className="font-semibold text-lg mb-2">
                      Hotel Description
                    </h3>
                    <p className="text-gray-600">{propertyDescription}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rooms" && (
              <div className="divide-y divide-gray-100">
                {selectedHotel?.rooms?.data?.map((room) => (
                  <div key={room.roomName} className="p-6">
                    {/* Room Type Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {room.roomName}
                      </h3>
                    </div>

                    {/* Room Content Grid */}
                    <div className="grid grid-cols-12 gap-6">
                      {/* Left Column - Image */}
                      <div className="col-span-4">
                        <div className="relative rounded-lg overflow-hidden">
                          <img
                            src={getImageUrl(room.imageUrl)}
                            alt={room.roomName}
                            className="w-full h-[200px] object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                            }}
                          />
                        </div>
                      </div>

                      {/* Middle Column - Room Details */}
                      <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">Room Size:</span>
                              <span className="font-medium">
                                {room.roomsizeinnumber} sq.ft
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">Bed Type:</span>
                              <span className="font-medium">
                                {room.bedType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">View:</span>
                              <span className="font-medium">
                                {room.roomView}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">Max Occupancy:</span>
                              <span className="font-medium">
                                {room.maxOccupancy} Guests
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="text-sm">Room Type:</span>
                              <span className="font-medium">
                                {room.roomType}
                              </span>
                            </div>
                            {room.extraBed && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-sm">Extra Bed:</span>
                                <span className="font-medium">Available</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Room Amenities */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">
                            Room Amenities
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(
                              room.selectedAmenities.Mandatory
                            ).map(
                              ([amenity, value]) =>
                                value === "Yes" && (
                                  <div
                                    key={amenity}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <svg
                                      className="w-4 h-4 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <span>{amenity}</span>
                                  </div>
                                )
                            )}
                          </div>
                        </div>

                        {/* Pricing Options */}
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {/* Breakfast Option */}
                      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                        <div>
                          <p className="font-medium">Breakfast</p>
                          <p className="text-sm text-gray-500">Room Only</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₹{room.baseRate}</p>
                          <button
                            onClick={(e) =>
                              handleRoomSelect(e, room, {
                                meal: "Breakfast",
                                price: room.baseRate,
                              })
                            }
                            className={`mt-2 px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                              selectedRooms[currentDay]?.selectedRoom?.meal ===
                              "Breakfast"
                                ? "bg-green-500 text-white"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {selectedRooms[currentDay]?.selectedRoom?.meal ===
                            "Breakfast"
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      </div>

                      {/* 2 Meals Option */}
                      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                        <div>
                          <p className="font-medium">2 Meals</p>
                          <p className="text-sm text-gray-500">
                            Breakfast & Dinner
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            ₹{parseInt(room.baseRate) + 500}
                          </p>
                          <button
                            onClick={(e) =>
                              handleRoomSelect(e, room, {
                                meal: "2 Meals",
                                price: parseInt(room.baseRate) + 500,
                              })
                            }
                            className={`mt-2 px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                              selectedRooms[currentDay]?.selectedRoom?.meal ===
                              "2 Meals"
                                ? "bg-green-500 text-white"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {selectedRooms[currentDay]?.selectedRoom?.meal ===
                            "2 Meals"
                              ? "Selected"
                              : "Select"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "facilities" && (
              <div className="p-6">
                {/* Mandatory Facilities */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Main Facilities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(
                      selectedHotel?.amenities?.mandatory || {}
                    ).map(
                      ([facility, value]) =>
                        value === "Yes" && (
                          <div
                            key={facility}
                            className="flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>{facility}</span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Other Facility Categories */}
                {[
                  { key: "basicFacilities", title: "Basic Facilities" },
                  { key: "generalServices", title: "General Services" },
                  {
                    key: "outdoorActivitiesAndSports",
                    title: "Outdoor Activities & Sports",
                  },
                  { key: "commonArea", title: "Common Areas" },
                  { key: "foodAndDrink", title: "Food & Drink" },
                  { key: "healthAndWellness", title: "Health & Wellness" },
                  {
                    key: "businessCenterAndConferences",
                    title: "Business Facilities",
                  },
                  { key: "beautyAndSpa", title: "Beauty & Spa" },
                  { key: "security", title: "Security" },
                  { key: "transfers", title: "Transfers" },
                  { key: "entertainment", title: "Entertainment" },
                  { key: "shopping", title: "Shopping" },
                  { key: "paymentServices", title: "Payment Services" },
                  {
                    key: "indoorActivitiesAndSports",
                    title: "Indoor Activities",
                  },
                  { key: "familyAndKids", title: "Family & Kids" },
                  { key: "petEssentials", title: "Pet Essentials" },
                ].map(({ key, title }) => {
                  const facilities = selectedHotel?.amenities?.[key];
                  if (
                    !facilities ||
                    Object.values(facilities).every((value) => !value)
                  )
                    return null;

                  return (
                    <div key={key} className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">{title}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(facilities).map(
                          ([facility, value]) =>
                            value === "Yes" && (
                              <div
                                key={facility}
                                className="flex items-center gap-2"
                              >
                                <svg
                                  className="w-5 h-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{facility}</span>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* No Facilities Message */}
                {!selectedHotel?.amenities && (
                  <div className="text-center text-gray-500 py-8">
                    No facility information available for this hotel.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add the ImageGallery component */}
      <ImageGallery
        images={selectedHotel?.photosAndVideos?.images || []}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {showNotification && (
        <PriceNotification
          selectedRooms={selectedRooms}
          cabsData={cabsData}
          selectedActivities={selectedActivities}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

// Add new Notification component
const PriceNotification = ({
  selectedRooms,
  cabsData,
  selectedActivities = [],
  onClose,
}) => {
  const calculateTotal = () => {
    // Calculate rooms total
    const roomsTotal = Object.values(selectedRooms).reduce(
      (sum, room) => sum + parseFloat(room.roomInfo.price),
      0
    );

    // Get cabs total
    const cabsTotal = cabsData?.totalPrice
      ? parseFloat(cabsData.totalPrice)
      : 0;

    // Calculate activities total
    const activitiesTotal = selectedActivities.reduce(
      (sum, activity) => sum + parseFloat(activity.discount_price),
      0
    );

    return roomsTotal + cabsTotal + activitiesTotal;
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl p-6 z-[70] border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Price Summary</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Room Prices */}
        {Object.entries(selectedRooms).map(([day, selection]) => (
          <div
            key={day}
            className="flex justify-between items-center text-sm border-b pb-2"
          >
            <div>
              <p className="font-medium">
                Day {day} - {selection.hotelInfo.name}
              </p>
              <p className="text-gray-500">
                {selection.roomInfo.name} - {selection.roomInfo.meal}
              </p>
            </div>
            <span className="font-medium">₹{selection.roomInfo.price}</span>
          </div>
        ))}

        {/* Cab Prices */}
        {cabsData?.totalPrice > 0 && (
          <div className="flex justify-between items-center text-sm border-b pb-2">
            <div>
              <p className="font-medium">Cab Services</p>
              <p className="text-gray-500">All transfers included</p>
            </div>
            <span className="font-medium">₹{cabsData.totalPrice}</span>
          </div>
        )}

        {/* Add Activities Section */}
        {selectedActivities.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-2">Selected Activities</h4>
            {selectedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex justify-between items-center text-sm mb-2"
              >
                <span>{activity.title}</span>
                <span>₹{activity.discount_price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t mt-4">
          <div>
            <p className="font-semibold">Total Amount</p>
            <p className="text-xs text-gray-500">Including all taxes</p>
          </div>
          <span className="text-lg font-bold text-blue-600">
            ₹{calculateTotal()}
          </span>
        </div>
      </div>

      {/* Optional: Add a proceed button */}
      <button
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors"
        onClick={() => {
          // Add your proceed logic here
          console.log("Proceeding with booking...");
        }}
      >
        Proceed to Book
      </button>
    </div>
  );
};

// Update the ActivitiesModal component
const ActivitiesModal = ({
  isOpen,
  onClose,
  selectedActivities,
  onRemoveActivity,
  cabData,
  selectedRooms,
  onConfirmSelection,
}) => {
  const groupedActivities = selectedActivities.reduce((acc, activity) => {
    const day = activity.dayNumber || "Unspecified";
    if (!acc[day]) acc[day] = [];
    acc[day].push(activity);
    return acc;
  }, {});

  const calculateTotalAmount = () => {
    const activitiesTotal = selectedActivities.reduce(
      (sum, activity) => sum + Number(activity.discount_price),
      0
    );

    const roomsTotal = Object.values(selectedRooms).reduce(
      (sum, room) => sum + Number(room.roomInfo.price),
      0
    );

    const cabTotal = cabData?.selectedCabInfo?.prices?.offSeasonPrice || 0;

    return activitiesTotal + roomsTotal + Number(cabTotal);
  };

  const handleConfirmSelection = () => {
    const selectedData = {
      hotels: selectedRooms,
      activities: selectedActivities,
      transportation: cabData,
      totalAmount: calculateTotalAmount(),
    };
    onConfirmSelection(selectedData);
    onClose();
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-1/2 h-full bg-white shadow-lg transition-transform duration-300 ease-out z-50 flex flex-col ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } rounded-lg overflow-hidden`}
    >
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-md">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Your Selected Items</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Hotels Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Selected Hotels
          </h4>
          <div className="divide-y divide-gray-200">
            {Object.entries(selectedRooms).map(([day, selection]) => (
              <div key={day} className="py-4 first:pt-0 last:pb-0">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={getImageUrl(selection.roomInfo.imageUrl)}
                      alt={selection.roomInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                      }}
                    />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Day {day}</p>
                      <p className="text-sm text-gray-600">
                        {selection.hotelInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Room: {selection.roomInfo.name} (
                        {selection.roomInfo.meal})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">
                        ₹{selection.roomInfo.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cab Section */}
        {cabData?.selectedCabInfo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h8m-8 5h8m-4 5h4M4 3h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2z"
                />
              </svg>
              Selected Transportation
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">
                  {cabData.selectedCabInfo.cabName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Season Price:</span>
                <span className="font-medium">
                  ₹{cabData.selectedCabInfo.prices.onSeasonPrice}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Off Season Price:</span>
                <span className="font-medium">
                  ₹{cabData.selectedCabInfo.prices.offSeasonPrice}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Activities Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Selected Activities
          </h4>
          {Object.entries(groupedActivities).map(([day, activities]) => (
            <div key={day} className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Day {day}</h5>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex justify-between items-center p-2 bg-white rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">
                        {activity.location_site}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-blue-600">
                        ₹{activity.discount_price}
                      </span>
                      <button
                        onClick={() => onRemoveActivity(activity)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Footer */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-blue-600">
            ₹{calculateTotalAmount().toLocaleString()}
          </div>
        </div>
        <button
          onClick={handleConfirmSelection}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

// Replace the existing DayActivities component with this new version
const DayActivities = ({
  dayData,
  onActivitySelect,
  selectedActivities = [],
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(
          "https://backendactivity.plutotours.in/api/products"
        );
        const data = await response.json();

        const searchCity = String(dayData.city || "")
          .toLowerCase()
          .trim();
        const cityActivities = (data.Product || []).filter((activity) => {
          const activityCity = String(activity.city || "")
            .toLowerCase()
            .trim();
          return activityCity === searchCity;
        });

        setActivities(cityActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dayData.city) {
      fetchActivities();
    }
  }, [dayData.city]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4M8 16l-4-4 4-4"
          />
        </svg>
        <p>No activities available for {dayData.city}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {activities.map((activity) => {
        const isSelected = selectedActivities.some(
          (selected) =>
            selected.id === activity.id && selected.dayNumber === dayData.day
        );

        return (
          <div
            key={activity.id}
            className="group hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 p-4">
              {/* Radio Button */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                onClick={() => onActivitySelect(activity)}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 12 12"
                  >
                    <circle cx="6" cy="6" r="4" />
                  </svg>
                )}
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{activity.location_site}</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through">
                        ₹{activity.price}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ₹{activity.discount_price}
                      </span>
                    </div>
                    <span className="text-xs text-green-600">
                      Save ₹{activity.price - activity.discount_price}
                    </span>
                  </div>
                </div>

                {/* Activity Tags/Features */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {activity.duration && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {activity.duration}
                    </span>
                  )}
                  {activity.group_size && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      {activity.group_size}
                    </span>
                  )}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => onActivitySelect(activity)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Update the DaySightseeing component to display places in a list format
const DaySightseeing = ({
  dayData,
  onPlaceSelect,
  selectedPlaces = [],
  selectedHotels,
}) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const selectedHotel = selectedHotels[dayData.day];
        const searchLocation =
          selectedHotel?.hotel?.location?.search || dayData.city;
        const country = selectedHotel?.hotel?.location?.country || "India";
        const state =
          selectedHotel?.hotel?.location?.state || "himachal-pradesh";
        const city =
          dayData.city.toLowerCase() === "dharamshala"
            ? "Dharamshala"
            : dayData.city;

        const url = `${config.API_HOST}/api/places/getplaces/${country}/${state}/${city}`;
        const response = await fetch(url);
        const data = await response.json();

        const matchingPlaces = data.filter((place) => {
          const placeCity = place.city?.toLowerCase() || "";
          const searchTerm = searchLocation.toLowerCase();
          return (
            placeCity.includes(searchTerm) || searchTerm.includes(placeCity)
          );
        });

        setPlaces(matchingPlaces);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    };

    if (dayData.city) {
      fetchPlaces();
    }
  }, [dayData.city]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <p>No places found for {dayData.city}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with selection count */}
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {
            selectedPlaces.filter((place) => place.dayNumber === dayData.day)
              .length
          }{" "}
          places selected
        </span>
      </div>

      {/* Places List - Updated to flex with 30% width */}
      <div className="flex flex-wrap gap-4">
        {places.map((place) => {
          const isSelected = selectedPlaces.some(
            (selected) =>
              selected.id === place._id && selected.dayNumber === dayData.day
          );

          return (
            <div
              key={place._id}
              className={`w-[30%] flex-shrink-0 p-4 rounded-lg border ${
                isSelected
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              } transition-colors`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onPlaceSelect(place)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Place Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {place.placeName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {place.city}, {place.stateName}
                  </p>
                  {place.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      {place.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Select all checkbox */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={places.every((place) =>
              selectedPlaces.some(
                (selected) =>
                  selected.id === place._id &&
                  selected.dayNumber === dayData.day
              )
            )}
            onChange={() => {
              const allSelected = places.every((place) =>
                selectedPlaces.some(
                  (selected) =>
                    selected.id === place._id &&
                    selected.dayNumber === dayData.day
                )
              );

              if (allSelected) {
                // Deselect all places for this day
                const newSelected = selectedPlaces.filter(
                  (selected) => selected.dayNumber !== dayData.day
                );
                setSelectedPlaces(newSelected);
              } else {
                // Select all places for this day
                const newPlaces = places.map((place) => ({
                  ...place,
                  id: place._id,
                  dayNumber: dayData.day,
                }));
                const existingOtherDays = selectedPlaces.filter(
                  (selected) => selected.dayNumber !== dayData.day
                );
                setSelectedPlaces([...existingOtherDays, ...newPlaces]);
              }
            }}
          />
          <span className="ml-2 text-sm text-gray-600">
            Select all places for Day {dayData.day}
          </span>
        </label>
      </div>
    </div>
  );
};

function HotelCalculation({
  travelData,
  cabsData,
  isEditing,
  editId,
  existingHotels,
  onConfirmSelection,
}) {
  const { cabData } = useCabData();
  const [selectedHotels, setSelectedHotels] = useState(() => {
    // Initialize with default data from travelData
    const initialHotels = {};
    if (travelData && Array.isArray(travelData)) {
      let currentDay = 1;
      travelData.forEach((cityData) => {
        for (let night = 0; night < cityData.nights; night++) {
          initialHotels[currentDay] = {
            city: cityData.city,
            hotel: {
              basicInfo: {
                propertyName: `Default Hotel in ${cityData.city}`,
              },
              location: {
                search: cityData.city,
                country: "India",
                state: "himachal-pradesh",
                city: cityData.city,
                address: `Default Address in ${cityData.city}`,
                pincode: "",
                latitude: "",
                longitude: "",
              },
            },
            night: night + 1,
            totalNights: cityData.nights,
          };
          currentDay++;
        }
      });
    }
    return initialHotels;
  });
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState({
    onSeason: 0,
    offSeason: 0,
  });
  console.log(travelData);
  const [isRoomCategoriesVisible, setRoomCategoriesVisible] = useState(false);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("hotels");
  const [images, setImages] = useState([]);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [allSelectedData, setAllSelectedData] = useState(null);

  // Update the useEffect for existing hotels to merge with default data
  useEffect(() => {
    if (existingHotels && Array.isArray(existingHotels)) {
      setSelectedHotels((prev) => {
        const hotelSelections = { ...prev }; // Keep default data
        existingHotels.forEach((hotel) => {
          hotelSelections[hotel.day] = {
            city: hotel.city,
            hotel: {
              basicInfo: {
                propertyName: hotel.hotelName,
              },
              location: {
                search: hotel.city,
                country: "India",
                state: "himachal-pradesh",
                city: hotel.city,
                address: `${hotel.city}, Himachal Pradesh, India`,
                pincode: "",
                latitude: "",
                longitude: "",
              },
            },
            id: hotel._id,
            night: 1,
            totalNights: 1,
          };
        });
        return hotelSelections;
      });
    }
  }, [existingHotels]);

  // Fetch hotels for each city
  useEffect(() => {
    const fetchHotels = async () => {
      if (!travelData || !Array.isArray(travelData)) {
        console.log("No travel data available:", travelData);
        return;
      }

      setLoading(true);
      const hotelData = {};

      try {
        // Process each day's city
        for (const dayData of travelData) {
          const dayCity = String(dayData.city || "").toLowerCase().trim();
          console.log("Fetching hotels for city:", dayCity);

          // Use the correct API endpoint
          const response = await fetch(`${config.API_HOST}/api/packagemaker/get-packagemaker-hotels-by-city/${dayCity}`);
          const result = await response.json();
          console.log("Hotels received for", dayCity, ":", result);

          // Store hotels for this city
          if (result.success && result.data) {
            hotelData[dayData.city] = result.data;
          } else {
            console.log(`No hotels found for city: ${dayCity}`);
            hotelData[dayData.city] = [];
          }
        }

        console.log("Final hotel data:", hotelData);
        setHotels(hotelData);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [travelData]);

  // Generate day-wise city data
  const generateDayWiseCities = () => {
    let dayWiseData = [];
    let currentDay = 1;

    travelData.forEach((cityData) => {
      for (let night = 0; night < cityData.nights; night++) {
        dayWiseData.push({
          day: currentDay,
          city: cityData.city,
          totalNights: cityData.nights,
          currentNight: night + 1,
        });
        currentDay++;
      }
    });

    return dayWiseData;
  };

  const dayWiseCities = generateDayWiseCities();

  const handleHotelSelect = async (day, cityData, hotel) => {
    console.log("handleHotelSelect called with:", { day, cityData, hotel });

    try {
      const apiUrl = `${config.API_HOST}/api/packagemaker/get-packagemaker/${hotel._id}`;
      console.log("Fetching hotel details from:", apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const hotelDetails = result.data; // Extract hotel details from data property
      console.log("Received hotel details:", hotelDetails);

      const enrichedHotel = {
        ...hotel,
        ...hotelDetails,
      };
      console.log("Enriched hotel data:", enrichedHotel);

      setSelectedHotels((prev) => {
        const newState = {
          ...prev,
          [day]: {
            city: cityData.city,
            hotel: enrichedHotel,
            night: cityData.currentNight,
            totalNights: cityData.totalNights,
            photosAndVideos:
              enrichedHotel.photosAndVideos || hotel.photosAndVideos,
            id: hotel._id,
          },
        };
        console.log("Updated selected hotels state:", newState);
        return newState;
      });

      setSelectedHotelForRooms(enrichedHotel);
      setRoomCategoriesVisible(true);
      setCurrentDay(day);
    } catch (error) {
      console.error("Error in handleHotelSelect:", error);
      console.error("Error Stack:", error.stack);
    }
  };

  const calculateTotalPrice = (selections) => {
    const total = {
      onSeason: 0,
      offSeason: 0,
    };

    Object.values(selections).forEach(({ hotel }) => {
      if (hotel && hotel.onSeasonPrice && hotel.offSeasonPrice) {
        total.onSeason += parseFloat(hotel.onSeasonPrice);
        total.offSeason += parseFloat(hotel.offSeasonPrice);
      }
    });

    setTotalPrice(total);
  };

  const handleSubmit = async () => {
    try {
      const url = `${config.API_HOST}/api/packages/${editId}/hotels`;
      const payload = {
        selectedHotels: Object.entries(selectedHotels).map(
          ([day, { city, hotel }]) => ({
            day,
            city,
            hotelName: hotel.basicInfo.propertyName,
          })
        ),
      };

      console.log("Payload", payload);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      // if (data) {
      //   window.location.href = `/ `;
      // }
    } catch (error) {
      console.error("Error saving hotels:", error);
    }
  };

  const handleActivitySelect = (activity, dayNumber) => {
    setSelectedActivities((prev) => {
      const isAlreadySelected = prev.some(
        (item) => item.id === activity.id && item.dayNumber === dayNumber
      );

      if (isAlreadySelected) {
        return prev.filter(
          (item) => !(item.id === activity.id && item.dayNumber === dayNumber)
        );
      }

      return [...prev, { ...activity, dayNumber }];
    });
    setIsActivitiesModalOpen(true);
  };

  const handleRemoveActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.filter(
        (item) =>
          !(item.id === activity.id && item.dayNumber === activity.dayNumber)
      )
    );
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          "https://backendactivity.plutotours.in/api/images"
        );
        const data = await response.json();
        if (data.Status === "The Request Was Successful") {
          setImages(data.Iamges); // Store images in state
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (cabData) {
      console.log("Cab data in HotelCalculation:", cabData);
      // Use cabData as needed
    }
  }, [cabData]);

  const handlePlaceSelect = (place, dayNumber) => {
    setSelectedPlaces((prev) => {
      const isAlreadySelected = prev.some(
        (item) => item.id === place._id && item.dayNumber === dayNumber
      );

      if (isAlreadySelected) {
        return prev.filter(
          (item) => !(item.id === place._id && item.dayNumber === dayNumber)
        );
      }

      return [...prev, { ...place, id: place._id, dayNumber }];
    });
  };

  const handleConfirmSelection = () => {
    // Calculate total hotel price from all selected rooms
    const totalHotelPrice = Object.values(selectedRooms).reduce(
      (total, selection) => {
        return total + parseFloat(selection.roomInfo.price || 0);
      },
      0
    );

    // Prepare hotels data with full details
    const hotelsData = {
      details: {},
      price: totalHotelPrice, // Add total price at top level
    };

    Object.entries(selectedRooms).forEach(([day, selection]) => {
      hotelsData.details[day] = {
        hotel: {
          id: selection.hotelInfo.id,
          name: selection.hotelInfo.name,
          city: selection.hotelInfo.city,
          location: selection.hotelInfo.location,
          photosAndVideos: selection.hotelInfo.photosAndVideos,
          amenities: selection.hotelInfo.amenities,
          basicInfo: selection.hotelInfo.basicInfo,
        },
        room: {
          id: selection.roomInfo.id,
          name: selection.roomInfo.name,
          price: selection.roomInfo.price,
          meal: selection.roomInfo.meal,
          imageUrl: selection.roomInfo.imageUrl,
          details: selection.roomInfo.details,
        },
        night: selectedHotels[day]?.night || 1,
        totalNights: selectedHotels[day]?.totalNights || 1,
      };
    });

    // Create final data object with complete hotel information
    const finalData = {
      hotels: hotelsData,
      activities: selectedActivities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        location: activity.location_site,
        price: activity.price,
        discount_price: activity.discount_price,
        duration: activity.duration,
        dayNumber: activity.dayNumber,
      })),
      sightseeing: selectedPlaces.map((place) => ({
        id: place.id,
        placeName: place.placeName,
        city: place.city,
        stateName: place.stateName,
        category: place.category,
        dayNumber: place.dayNumber,
      })),
      transportation: cabsData,
    };

    // Pass complete data to parent
    onConfirmSelection(finalData);
  };

  const handleActivityConfirmSelection = (selectedData) => {
    // Store the selected data
    setAllSelectedData(selectedData);

    // Instead of going to Final Costing, switch to Sightseeing tab
    setActiveTab("sightseeing");

    // Close the activities modal
    setIsActivitiesModalOpen(false);
  };

  const handleSightseeingConfirmSelection = () => {
    // Now combine all data and go to Final Costing
    const finalData = {
      ...allSelectedData,
      sightseeing: selectedPlaces,
    };

    // Call the parent's onConfirmSelection with all data
    onConfirmSelection(finalData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading hotels...
      </div>
    );
  }

  if (!dayWiseCities || dayWiseCities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        No travel data available
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="inline-flex p-1 space-x-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab("hotels")}
              className={`${
                activeTab === "hotels"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              } px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Select hotels By Day</span>
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`${
                activeTab === "activities"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              } px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Select Activities By Day</span>
            </button>
            <button
              onClick={() => setActiveTab("sightseeing")}
              className={`${
                activeTab === "sightseeing"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              } px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>Sightseeing By Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "hotels" ? (
          // Hotels Tab Content
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Hotel Selection
              </h2>
              <div className="text-sm text-gray-500">
                {Object.keys(selectedHotels).length} hotels selected
              </div>
            </div>

            {dayWiseCities.map((dayData) => (
              <div
                key={dayData.day}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-xl font-semibold mb-4">
                  Day {dayData.day} - {dayData.city}
                  <span className="text-sm text-gray-600 ml-2">
                    (Night {dayData.currentNight} of {dayData.totalNights})
                  </span>
                  {selectedHotels[dayData.day] && (
                    <span className="text-green-600 ml-2">
                      Selected:{" "}
                      {selectedHotels[dayData.day].hotel.basicInfo.propertyName}
                    </span>
                  )}
                </h3>

                {/* Existing hotel selection grid */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {hotels[dayData.city]?.map((hotel) => (
                    <div
                      key={hotel._id}
                      className={`border rounded-lg w-[300px] overflow-hidden cursor-pointer transition-all
                        ${
                          selectedHotels[dayData.day]?.hotel?.basicInfo
                            ?.propertyName === hotel.basicInfo.propertyName
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      onClick={() =>
                        handleHotelSelect(dayData.day, dayData, hotel)
                      }
                    >
                      {/* Hotel Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            hotel.photosAndVideos?.images?.[0]
                              ? getImageUrl(hotel.photosAndVideos.images[0])
                              : "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                          }
                          alt={hotel.basicInfo.propertyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80";
                            console.log(
                              "Image load error for:",
                              hotel.basicInfo.propertyName
                            );
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-sm font-medium">
                          {hotel.basicInfo.hotelStarRating}
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2">
                          {hotel.basicInfo.propertyName}
                        </h4>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {hotel.basicInfo.propertyDescription}
                        </p>

                        <div className="space-y-1 text-sm">
                          <p className="flex items-center justify-between">
                            <span>Built Year:</span>
                            <span className="font-medium">
                              {hotel.basicInfo.propertyBuiltYear}
                            </span>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Booking Since:</span>
                            <span className="font-medium">
                              {hotel.basicInfo.bookingSinceYear}
                            </span>
                          </p>
                          {hotel.onSeasonPrice && (
                            <p className="flex items-center justify-between text-green-600">
                              <span>On Season:</span>
                              <span className="font-medium">
                                ₹{hotel.onSeasonPrice}/night
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "activities" ? (
          // Activities Tab Content
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Activities Selection
              </h2>
              <div className="text-sm text-gray-500">
                {selectedActivities.length} activities selected
              </div>
            </div>

            {/* Day-wise Timeline View */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {dayWiseCities.map((dayData) => (
                <div key={dayData.day} className="relative mb-8">
                  {/* Day Circle */}
                  <div className="absolute left-6 -translate-x-1/2 w-5 h-5 rounded-full border-4 border-white bg-blue-500 z-10"></div>

                  {/* Day Content */}
                  <div className="ml-16">
                    {/* Day Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          Day {dayData.day}: {dayData.city}
                        </h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-base font-medium text-gray-600">
                          Night {dayData.currentNight} of {dayData.totalNights}
                        </span>
                      </div>
                      <div className="h-px flex-grow bg-gray-100"></div>
                    </div>

                    {/* Activity Cards Container */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                      {/* City Info Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="font-medium text-gray-700">
                              Available Activities
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Activities List */}
                      <div className="divide-y divide-gray-100">
                        <DayActivities
                          dayData={dayData}
                          onActivitySelect={(activity) =>
                            handleActivitySelect(activity, dayData.day)
                          }
                          selectedActivities={selectedActivities}
                        />
                      </div>

                      {/* Day Summary Footer */}
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>
                            Selected activities for Day {dayData.day}:
                          </span>
                          <span className="font-medium">
                            {
                              selectedActivities.filter(
                                (activity) => activity.dayId === dayData.day
                              ).length
                            }{" "}
                            activities
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "sightseeing" ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Sightseeing Selection
              </h2>
              <div className="text-sm text-gray-500">
                {selectedPlaces.length} places selected
              </div>
            </div>

            {dayWiseCities.map((dayData) => (
              <div
                key={dayData.day}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold">
                    Day {dayData.day} - {dayData.city}
                    <span className="text-sm text-gray-600 ml-2">
                      (Night {dayData.currentNight} of {dayData.totalNights})
                    </span>
                  </h3>
                </div>

                <DaySightseeing
                  dayData={dayData}
                  onPlaceSelect={(place) =>
                    handlePlaceSelect(place, dayData.day)
                  }
                  selectedPlaces={selectedPlaces}
                  selectedHotels={selectedHotels} // Pass selectedHotels prop
                />
              </div>
            ))}

            {/* Add confirm button at bottom of sightseeing tab */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSightseeingConfirmSelection}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        ) : (
          // Existing activities tab content
          <div className="space-y-8">{/* Existing activities content */}</div>
        )}
      </div>

      {/* Price Notification and other components remain unchanged */}
      <RoomCategories
        isVisible={isRoomCategoriesVisible}
        onClose={() => setRoomCategoriesVisible(false)}
        selectedHotel={selectedHotelForRooms}
        currentDay={currentDay}
        cabsData={cabsData}
        onRoomSelect={(roomData) => {
          setSelectedRooms((prev) => ({
            ...prev,
            [currentDay]: roomData,
          }));
          setShowNotification(true);
        }}
      />

      {/* Confirm Selection Button - Show on all tabs */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleConfirmSelection}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Confirm Selection
        </button>
      </div>

      {/* Add the shared modal */}
      <ActivitiesModal
        isOpen={isActivitiesModalOpen}
        onClose={() => setIsActivitiesModalOpen(false)}
        selectedActivities={selectedActivities}
        onRemoveActivity={handleRemoveActivity}
        cabData={cabData}
        selectedRooms={selectedRooms}
        onConfirmSelection={handleActivityConfirmSelection}
      />
    </div>
  );
}

export default HotelCalculation;
