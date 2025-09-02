import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

// Check your config.API_HOST value
console.log("API Host:", config.API_HOST);

const AllLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leadDetails");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [sharingMethod, setSharingMethod] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [isPackageInfoOpen, setIsPackageInfoOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageInfoTab, setPackageInfoTab] = useState("package");
  const [selectedCabs, setSelectedCabs] = useState({});

  const [selectedCab, setSelectedCab] = useState({
    name: "Swift Dzire",
    type: "Private Transfer/Sedan",
    seats: 4,
    luggage: 3,
    image: "/swift-dzire.png",
    hasAC: true,
  });
  const [cabs, setCabs] = useState([]);
  const [isLoadingCabs, setIsLoadingCabs] = useState(false);
  const [cabQuantity, setCabQuantity] = useState(1);
  const [selectedCabForBooking, setSelectedCabForBooking] = useState(null);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [allHotels, setAllHotels] = useState([]);
  const [hotelsByCity, setHotelsByCity] = useState({});

  // Add state to track which day's hotels are being shown
  const [showHotelsForDay, setShowHotelsForDay] = useState(null);

  // Add these state variables at the top of your component
  const [showCabsPanel, setShowCabsPanel] = useState(false);
  const [availableCabs, setAvailableCabs] = useState([]);

  // Add this state if not already present
  const [cabQuantities, setCabQuantities] = useState({});

  // Add this state for selected cab details view
  const [showSelectedCabDetails, setShowSelectedCabDetails] = useState(false);

  // Add these state variables if not already present
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedDayForHotelChange, setSelectedDayForHotelChange] =
    useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchCabs();
  }, []);

  useEffect(() => {
    if (isSliderOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSliderOpen]);

  useEffect(() => {
    fetchHotels();
  }, [selectedPackage]);

  useEffect(() => {
    if (viewLead?.assignedPackage?.hotels?.length > 0) {
      setSelectedHotel(viewLead.assignedPackage.hotels[0]);
    }
  }, [viewLead]);

  useEffect(() => {
    if (isPackageInfoOpen) {
      fetchCabs();
    }
  }, [isPackageInfoOpen]);

  useEffect(() => {
    fetchAllHotels();
  }, []);

  // Add this to check if hotels are being set correctly

  // Function to fetch hotels for a specific city
  const fetchHotelsByCity = async (cityName) => {
    try {
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemaker-hotels-by-city/${cityName}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Hotels for ${cityName}:`, data);

      if (data.success) {
        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data.data || [],
        }));
      }
    } catch (error) {
      console.error(`Error fetching hotels for ${cityName}:`, error);
    }
  };

  // Add this new function to extract and fetch hotels for each city in the itinerary
  const fetchHotelsForItinerary = async (itineraryDays) => {
    console.log("Fetching hotels for itinerary:", itineraryDays);

    try {
      // Fetch hotels for the first day's city as a test
      if (itineraryDays && itineraryDays[0]?.selectedItinerary?.cityName) {
        const cityName = itineraryDays[0].selectedItinerary.cityName;
        console.log("Fetching hotels for city:", cityName);

        const response = await fetch(`/api/hotels?city=${cityName}`);
        const data = await response.json();
        console.log("Hotels data received:", data);

        setHotelsByCity((prev) => ({
          ...prev,
          [cityName.toLowerCase()]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  // Update the useEffect when selectedPackage changes to fetch hotels for all cities
  useEffect(() => {
    if (selectedPackage?.package?.itineraryDays) {
      console.log("Selected package:", selectedPackage);
      fetchHotelsForItinerary(selectedPackage.package.itineraryDays);
    }
  }, [selectedPackage]);

  // Modify the getHotelsForCity function to match your console data structure
  const getHotelsForCity = (cityName) => {
    if (!cityName) return [];

    const normalizedCityName = cityName.toLowerCase().trim();
    const cityHotels = hotelsByCity[normalizedCityName] || [];

    return cityHotels.map((hotel) => ({
      id: hotel._id,
      name: hotel?.basicInfo?.propertyName,
      description: hotel?.basicInfo?.propertyDescription,
      images: hotel?.photosAndVideos?.images || [],
      // Add any other fields you need
    }));
  };

  // Function to handle the Change Hotel button click
  const handleChangeHotelClick = (dayNumber) => {
    setShowHotelsForDay(showHotelsForDay === dayNumber ? null : dayNumber);
  };

  // Modified hotel rendering function
  const renderHotels = (day, index, totalDays) => {
    if (index === totalDays - 1) {
      return (
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              No hotel selection needed for the last day
            </p>
          </div>
        </div>
      );
    }

    const cityName = day.selectedItinerary?.cityName;
    if (!cityName) return null;

    const hotelsForCity = hotelsByCity[cityName.toLowerCase()] || [];
    console.log(`Hotels for ${cityName}:`, hotelsForCity);

    return (
      <div className="mt-6">
        <div className="mt-4">
          <h4 className="font-medium mb-4 text-lg">Hotels in {cityName}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelsForCity.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Hotel Image */}
                <div className="relative h-48">
                  {hotel.photosAndVideos?.images?.[0] ? (
                    <img
                      src={hotel.photosAndVideos.images[0]}
                      alt={hotel.basicInfo?.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-hotel.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Image count badge */}
                  {hotel.photosAndVideos?.images?.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                      {hotel.photosAndVideos.images.length} photos
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {hotel.basicInfo?.propertyName}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">
                          {hotel.basicInfo?.hotelStarRating} Star
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {hotel.basicInfo?.propertyDescription}
                  </p>

                  {/* Amenities */}
                  {hotel.amenities && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={() => handleSelectHotel(hotel, day.day)}
                    className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select Hotel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      // Extract token from the nested data structure
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${config.API_HOST}/api/leads/get-leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // First, let's add some console logs to debug the fetch function
  const fetchCabs = async () => {
    setIsLoadingCabs(true);
    try {
      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched cabs data:", data);

      if (data.status === "success") {
        setAvailableCabs(data.result || []);
        console.log("Available cabs set to:", data.result);
      } else {
        console.error("API returned status:", data.status);
      }
    } catch (error) {
      console.error("Error fetching cabs:", error);
    } finally {
      setIsLoadingCabs(false);
    }
  };

  // Add this new function to handle cab selection
  const handleCabSelection = (cab) => {
    setSelectedCab(cab);
    if (selectedPackage) {
      const updatedPackage = {
        ...selectedPackage,
        cabs: {
          ...selectedPackage.cabs,
          travelPrices: {
            ...selectedPackage.cabs?.travelPrices,
            cabImage: cab.cabImages[0],
            cabName: cab.cabName,
            cabType: cab.cabType,
            seatingCapacity: cab.cabSeatingCapacity,
            luggageCapacity: cab.cabLuggage,
            hasAC: cab.hasAC,
            pricePerKm: cab.pricePerKm,
          },
        },
      };
      setSelectedPackage(updatedPackage);
    }
  };

  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      const mobileMatch = lead.mobile
        ?.toLowerCase()
        .includes(searchMobile.toLowerCase());
      const nameMatch = lead.name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());
      const categoryMatch =
        !searchCategory ||
        lead.packageCategory?.toLowerCase() === searchCategory.toLowerCase();
      return mobileMatch && nameMatch && categoryMatch;
    });
  };

  // Update pagination logic to use filtered leads
  const filteredLeads = getFilteredLeads();
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  // Get unique categories from leads instead of packages
  const uniqueCategories = [
    ...new Set(leads.map((lead) => lead.packageCategory)),
  ].filter(Boolean);

  const getStatusColor = (status) => {
    switch (status) {
      case "Yes":
        return "bg-green-100 text-green-800";
      case "No":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Modify fetchPackages to accept lead as parameter
  const fetchPackages = async (lead) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      // Get destination from passed lead parameter
      const destination = lead?.destination;
      console.log("Current destination in fetchPackages:", destination); // Debug log

      if (!destination) {
        console.warn("No destination available in lead:", lead); // Warning log
        return [];
      }

      const response = await fetch(`${config.API_HOST}/api/add/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error("Failed to fetch packages");
      }

      const data = await response.json();
      console.log("All packages received:", data); // Debug log

      // Filter packages where lead destination matches package name
      const filteredPackages = data.filter((pkg) => {
        const searchTerm = destination.toLowerCase().trim();
        const packageName = (pkg.package?.packageName || "")
          .toLowerCase()
          .trim();

        console.log(`Comparing:
          Search term: "${searchTerm}"
          Package name: "${packageName}"
          Match: ${packageName.includes(searchTerm)}`);

        return packageName.includes(searchTerm);
      });

      console.log("Filtered packages:", filteredPackages); // Debug log
      return filteredPackages;
    } catch (error) {
      console.error("Error in fetchPackages:", error);
      toast.error(`Failed to load packages: ${error.message}`);
      return [];
    }
  };

  // Modify handleEditClick to pass the lead directly
  const handleEditClick = async (lead) => {
    console.log("Selected lead:", lead); // Debug log

    if (!lead) {
      console.warn("No lead provided to handleEditClick");
      return;
    }

    // Set the lead first
    setSelectedLead(lead);
    setIsEditPanelOpen(true);

    if (lead?.destination) {
      console.log("Fetching packages for destination:", lead.destination); // Debug log
      const packages = await fetchPackages(lead); // Pass lead directly
      console.log(
        `Found ${packages.length} matching packages for ${lead.destination}`
      );
      setAvailablePackages(packages);
    } else {
      console.warn("No destination found in lead:", lead); // Warning log
      setAvailablePackages([]); // Clear any existing packages
      toast.warning("No destination specified for this lead");
    }
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setSelectedLead(null);
  };

  // Add this function to handle sharing
  const handleShare = async (method) => {
    if (!selectedLead?.assignedPackage) {
      toast.error("No package assigned to share");
      return;
    }

    try {
      setIsSharing(true);
      setSharingMethod(method);

      switch (method) {
        case "whatsapp":
          // Format the message for WhatsApp
          const whatsappMessage = encodeURIComponent(
            `*Package Details*\n` +
              `Package: ${selectedLead.assignedPackage.packageName}\n` +
              `Duration: ${selectedLead.assignedPackage.duration} Days\n` +
              `Price: ₹${selectedLead.assignedPackage.price}`
          );

          // Log sharing attempt
          await fetch(`${config.API_HOST}/api/leads/log-share`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: selectedLead._id,
              packageId: selectedLead.assignedPackage._id,
              shareMethod: "whatsapp",
            }),
          });

          // Open WhatsApp in new window
          window.open(
            `https://wa.me/${selectedLead.mobile}?text=${whatsappMessage}`
          );
          toast.success("WhatsApp opened with package details");
          break;

        case "email":
          const emailResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-email`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!emailResponse.ok) throw new Error("Failed to send email");
          toast.success("Package details sent via email");
          break;

        case "sms":
          const smsResponse = await fetch(
            `${config.API_HOST}/api/leads/send-package-sms`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                leadId: selectedLead._id,
                packageId: selectedLead.assignedPackage._id,
              }),
            }
          );

          if (!smsResponse.ok) throw new Error("Failed to send SMS");
          toast.success("Package details sent via SMS");
          break;

        default:
          throw new Error("Invalid sharing method");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSharing(false);
      setSharingMethod(null);
    }
  };

  // Add this function to handle package editing
  const handleEditPackage = async (packageId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      console.log("Attempting to edit package:", packageId);
      console.log("Using token:", localUser.token);

      const response = await fetch(
        `${config.API_HOST}/api/packages/getpackage/${packageId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localUser.token}`,
          },
        }
      );

      if (!response.ok) {
        const rawResponse = await response.text();
        throw new Error(
          `Failed to fetch package details: ${response.status} - ${rawResponse}`
        );
      }

      const packageData = await response.json();
      console.log("Package data received:", packageData);

      setEditingPackageData(packageData);
      setIsEditingPackage(true);
    } catch (error) {
      console.error("Error editing package:", error);
      toast.error(`Error editing package: ${error.message}`);
    }
  };

  // Add new function to handle view click
  const handleViewClick = (lead) => {
    setViewLead(lead);
    setIsViewModalOpen(true);
  };

  // Add function to handle lead deletion
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/delete-lead/${leadId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete lead");

      toast.success("Lead deleted successfully");
      fetchLeads(); // Refresh the leads list
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add function to handle lead update
  const handleUpdateLead = async (leadId, updatedData) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${config.API_HOST}/api/leads/update-lead/${leadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("Failed to update lead");

      toast.success("Lead updated successfully");
      fetchLeads(); // Refresh the leads list
      return true;
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to save changes. Please try again.");
      return false;
    }
  };

  // Add this function to handle booking
  const handleCabBooking = (cab) => {
    setSelectedCabForBooking(cab);
    setCabQuantity(1);
  };

  // Make sure the handleChangeClick function is properly defined
  const handleChangeClick = () => {
    console.log("Change vehicle clicked");
    setShowCabsPanel(true);
    fetchCabs();
  };

  const fetchHotels = async () => {
    try {
      setIsLoadingHotels(true);
      const response = await fetch(
        `${config.API_HOST}/api/packages/getPackageHotels/${selectedPackage._id}`
      );
      const data = await response.json();
      if (data.success) {
        setHotels(data.result);
        // Set the first hotel as default selected
        setSelectedHotel(data.result[0]);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  const handleHotelChangeClick = (day) => {
    console.log("Changing hotel for day:", day);
    setSelectedDayForHotelChange(day);
    setShowHotelModal(true);
  };

  const handleChangeRoom = (day, hotel) => {
    setSelectedDay(day);
    setSelectedHotel(hotel);
    setPackageInfoTab("rooms");
    setIsSliderOpen(true);
  };

  const fetchAllHotels = async () => {
    try {
      // Add necessary headers
      const response = await fetch(
        `${config.API_HOST}/api/packagemaker/get-packagemaker`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add any other required headers like authentication
            // 'Authorization': `Bearer ${token}`,
          },
        }
      );

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        setAllHotels(data.data || []);
      } else {
        console.error("API returned success: false", data);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setAllHotels([]); // Set empty array in case of error
    }
  };

  const handleSelectHotel = (hotel, day) => {
    setSelectedLead((prev) => ({
      ...prev,
      hotels: {
        ...prev.hotels,
        [day]: hotel,
      },
    }));
    // Optional: close any modal or update UI as needed
  };

  const getMinPrice = (rooms) => {
    if (!rooms?.data?.length) return 0;
    return Math.min(...rooms.data.map((room) => parseInt(room.baseRate) || 0));
  };

  // Add this function to handle quantity changes
  const handleQuantityChange = (cabId, value) => {
    setCabQuantities((prev) => ({
      ...prev,
      [cabId]: Math.max(1, Math.min(10, value)), // Limit quantity between 1 and 10
    }));
  };

  // Update the handleSelectCab function to include quantity
  const handleSelectCab = (cab) => {
    const quantity = cabQuantities[cab._id] || 1;
    setSelectedCab({
      ...cab,
      quantity,
    });
    setShowCabsPanel(false);
    setShowSelectedCabDetails(true); // Make sure this is set to true
    console.log("Selected cab details:", cab); // Debug log
  };

  // Add useEffect to check if the panel is actually opening
  useEffect(() => {
    if (showCabsPanel) {
      console.log("Cabs panel is open");
      console.log("Current available cabs:", availableCabs);
    }
  }, [showCabsPanel]);

  // Add this function to handle hotel change
  const handleChangeHotel = (day) => {
    console.log("Changing hotel for day:", day);
    setSelectedDayForHotelChange(day);
    setShowHotelModal(true);
  };

  // Add this function to handle hotel selection from modal
  const handleHotelChange = (hotel) => {
    if (selectedDayForHotelChange) {
      handleSelectHotel(hotel, selectedDayForHotelChange);
    }
    setShowHotelModal(false);
    setSelectedDayForHotelChange(null);
  };

  // Add this console log to see what data we're receiving
  useEffect(() => {
    console.log("Hotels data:", hotels);
  }, [hotels]);

  // Update the hotel card rendering with more checks
  {
    hotels?.map((hotel) => (
      <div
        key={hotel?._id ?? Math.random()}
        className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="flex">
          {/* Hotel Image */}
          <div className="w-40 h-32 flex-shrink-0">
            {hotel?.photosAndVideos?.images?.[0] ? (
              <img
                src={hotel.photosAndVideos.images[0]}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-hotel.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.propertyName
                    : hotel?.propertyName ?? "Hotel Name Not Available"}
                </h3>
                <p className="text-sm text-gray-500">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.hotelStarRating
                    : hotel?.hotelStarRating ?? "Rating Not Available"}
                </p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {hotel?.basicInfo
                    ? hotel.basicInfo.propertyDescription
                    : hotel?.propertyDescription ?? "No description available"}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleHotelChange(hotel)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Select This Hotel
            </button>
          </div>
        </div>
      </div>
    ));
  }

  // Update the selected hotel view with direct property access
  {
    selectedHotel && (
      <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedHotel?.basicInfo?.propertyName ||
                "Hotel Name Not Available"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedHotel?.basicInfo?.hotelStarRating ||
                "Rating Not Available"}
            </p>
          </div>
          {/* ... rest of the code ... */}
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            {selectedHotel?.photosAndVideos?.images?.[0] ? (
              <img
                src={selectedHotel.photosAndVideos.images[0]}
                alt="Hotel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-hotel.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Hotel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">About the Property</h4>
            <p className="text-gray-600 mb-4">
              {selectedHotel?.basicInfo?.propertyDescription ||
                "No description available"}
            </p>
            <div className="flex items-center mb-4">
              <span className="text-sm font-medium text-gray-500 mr-2">
                Rating:
              </span>
              <span className="text-sm font-semibold">
                {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
              </span>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-500">Hotel Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white relative">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">All Leads</h2>
        <div className="flex items-center space-x-2">
          <input
            type="search"
            placeholder="Search by name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="search"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchMobile("");
              setSearchName("");
              setSearchCategory("");
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {/* Title section remains unchanged */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(45,45,68)] text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-lg font-medium">Leads Overview</h2>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[rgb(45,45,68)]">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Name</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Designation</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Email</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Mobile</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Status</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentLeads.map((lead, index) => (
              <tr
                key={lead._id || `demo-${index}`}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-[rgb(59,130,246,0.2)]"
                }`}
              >
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {lead.packageType}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="text-sm text-[rgb(45,45,68)]">
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {lead.mobile}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span
                    className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      lead.publish
                    )}`}
                  >
                    {lead.publish}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="View Details"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-gray-600 hover:text-blue-600"
                      title="Edit"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead._id)}
                      className="text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-2 bg-white border-t border-gray-200 sm:px-4">
        <div className="flex justify-center flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="relative ml-2 inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstLead + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastLead, filteredLeads.length)}
              </span>{" "}
              of <span className="font-medium">{filteredLeads.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-3 py-1 border text-sm font-medium ${
                      currentPage === number
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Edit Panel Slide-over */}
      {isEditPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-in-out z-40 ${
              isEditPanelOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClosePanel}
          />

          {/* Side Panel - Updated width from w-1/2 to w-[70%] */}
          <div
            className={`fixed inset-y-0 right-0 w-[70%] bg-[rgb(45,45,68)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
              isEditPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-[rgb(45,45,68)] text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold">Lead Information</h2>
                <button
                  onClick={handleClosePanel}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex px-3" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("leadDetails")}
                    className={`${
                      activeTab === "leadDetails"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Lead Details</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className={`${
                      activeTab === "createPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Lead</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("viewPackage")}
                    className={`${
                      activeTab === "viewPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>View Package</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className={`${
                      activeTab === "sendPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4 flex items-center space-x-2`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Send Package</span>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="p-3 bg-white">
                    <div className="space-y-3">
                      {/* Lead Header Section */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {selectedLead?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedLead?.name}
                            </h2>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <span>{selectedLead?.email}</span>
                              <span>•</span>
                              <span>{selectedLead?.mobile}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lead Information Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Lead owner
                          </div>
                          <div className="font-medium text-gray-900">
                            Sales Team
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Package Category
                          </div>
                          <div className="font-medium text-gray-900">
                            {selectedLead?.packageCategory || "N/A"}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-500 mb-0.5">
                            Annual Revenue
                          </div>
                          <div className="font-medium text-gray-900">
                            ₹{selectedLead?.budget || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Status Tabs */}
                      <div className="flex space-x-2 mb-4">
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          New
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Open
                        </div>
                        <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          In Progress
                        </div>
                      </div>

                      {/* Lead Details Section */}
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Travel Details
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                From
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.from || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Destination
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.destination || "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Travel Date
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.travelDate
                                  ? new Date(
                                      selectedLead.travelDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Duration
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.days
                                  ? `${selectedLead.days} Days, ${selectedLead.nights} Nights`
                                  : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Guest Information Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Guest Information
                            </h3>
                          </div>
                          <div className="p-3 grid grid-cols-3 gap-3">
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Adults
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.adults || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Kids
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.kids || "0"}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500 mb-1">
                                Total Guests
                              </div>
                              <div className="font-medium text-gray-900">
                                {selectedLead?.persons || "0"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Activity Card */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900">
                              Recent Activity
                            </h3>
                          </div>
                          <div className="p-3">
                            <div className="space-y-4">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Lead created
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Today at {new Date().toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "createPackage" && selectedLead && (
                  <div className="p-6 bg-white">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateLead(selectedLead._id, selectedLead);
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                value={selectedLead.name}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    name: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Email
                              </label>
                              <input
                                type="email"
                                value={selectedLead.email}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    email: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Mobile
                              </label>
                              <input
                                type="text"
                                value={selectedLead.mobile}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mobile: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Travel Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Travel Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                From
                              </label>
                              <input
                                type="text"
                                value={selectedLead.from}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    from: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Destination
                              </label>
                              <input
                                type="text"
                                value={selectedLead.destination}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    destination: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Travel Date
                              </label>
                              <input
                                type="date"
                                value={
                                  selectedLead.travelDate
                                    ? new Date(selectedLead.travelDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    travelDate: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Duration & Guests */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Duration & Guests
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Days
                              </label>
                              <input
                                type="number"
                                value={selectedLead.days}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    days: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Nights
                              </label>
                              <input
                                type="number"
                                value={selectedLead.nights}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    nights: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Adults
                              </label>
                              <input
                                type="number"
                                value={selectedLead.adults}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    adults: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Kids
                              </label>
                              <input
                                type="number"
                                value={selectedLead.kids}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    kids: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Package Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Package Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Type
                              </label>
                              <select
                                value={selectedLead.packageType}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageType: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Type</option>
                                <option value="family">Family</option>
                                <option value="honeymoon">Honeymoon</option>
                                <option value="adventure">adventure</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Package Category
                              </label>
                              <select
                                value={selectedLead.packageCategory}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    packageCategory: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Category</option>
                                <option value="luxury">Luxury</option>

                                <option value="standard">Standard</option>
                                <option value="budget">Budget</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Meal Plans
                              </label>
                              <select
                                value={selectedLead.mealPlans}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    mealPlans: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="">Select Meal Plan</option>
                                <option value="breakfast">
                                  Breakfast Only
                                </option>
                                <option value="halfboard">Half Board</option>
                                <option value="fullboard">Full Board</option>
                                <option value="allinclusive">
                                  All Inclusive
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Room Details
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Number of Rooms
                              </label>
                              <input
                                type="number"
                                value={selectedLead.noOfRooms}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    noOfRooms: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Extra Beds
                              </label>
                              <input
                                type="number"
                                value={selectedLead.extraBeds}
                                onChange={(e) =>
                                  setSelectedLead({
                                    ...selectedLead,
                                    extraBeds: e.target.value,
                                  })
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "viewPackage" && (
                  <div className="p-6 bg-white relative">
                    <div className="space-y-6">
                      {/* Debug Info */}
                      <div className="mb-4 p-2 bg-gray-100 rounded">
                        <p>
                          Available Packages: {availablePackages?.length || 0}
                        </p>
                        <p>
                          Selected Lead Destination:{" "}
                          {selectedLead?.destination || "None"}
                        </p>
                      </div>

                      {/* Lead Destination Info */}
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                          Selected Destination
                        </h3>
                        <p className="text-blue-700">
                          {selectedLead?.destination ||
                            "No destination selected"}
                        </p>
                      </div>

                      {/* Packages Table */}
                      <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Package Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Category
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Duration
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {Array.isArray(availablePackages) &&
                            availablePackages.length > 0 ? (
                              availablePackages.map((pkg, index) => (
                                <tr
                                  key={pkg._id || index}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {pkg.package?.packageName || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                      {pkg.package?.packageType || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                      {pkg.package?.packageCategory || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {pkg.package?.duration
                                      ? `${pkg.package.duration} Days`
                                      : "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-green-600">
                                      ₹
                                      {pkg.finalCosting?.finalPrices
                                        ?.grandTotal || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => {
                                        setSelectedPackage(pkg);
                                        setIsPackageInfoOpen(true);
                                      }}
                                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-sm"
                                    >
                                      Select Package
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="px-6 py-4 text-center text-gray-500"
                                >
                                  {Array.isArray(availablePackages)
                                    ? "No packages available for this destination"
                                    : "Loading packages..."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Package Info Slide-over */}
                    <div
                      className={`fixed inset-y-0 right-0 w-[90%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
                        isPackageInfoOpen ? "translate-x-0" : "translate-x-full"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-[rgb(45,45,68)] text-white">
                          <div className="px-6 py-4 flex justify-between items-center">
                            {packageInfoTab === "cab" ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setPackageInfoTab("package")}
                                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
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
                                      strokeWidth="2"
                                      d="M15 19l-7-7 7-7"
                                    />
                                  </svg>
                                </button>
                                <h2 className="text-xl font-semibold">
                                  Change Transfer
                                </h2>
                              </div>
                            ) : (
                              <h2 className="text-xl font-semibold">
                                Package Details
                              </h2>
                            )}
                            <button
                              onClick={() => setIsPackageInfoOpen(false)}
                              className="text-white hover:text-gray-200"
                            >
                              <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Package Info Tabs */}
                        <div className="border-b border-gray-200">
                          <nav className="flex px-6" aria-label="Tabs">
                            <button
                              onClick={() => setPackageInfoTab("package")}
                              className={`${
                                packageInfoTab === "package"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                            >
                              Package Info
                            </button>
                            <button
                              onClick={() => setPackageInfoTab("costing")}
                              className={`${
                                packageInfoTab === "costing"
                                  ? "border-blue-500 text-blue-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
                            >
                              Final Costing
                            </button>
                          </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                          {packageInfoTab === "package" && (
                            <div className="p-6 space-y-6">
                              {/* Package Overview */}
                              <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Package Overview
                                  </h3>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Package Name
                                    </p>
                                    <p className="font-medium">
                                      {selectedPackage?.package?.packageName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Duration
                                    </p>
                                    <p className="font-medium">
                                      {selectedPackage?.package?.duration} Days
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Category
                                    </p>
                                    <p className="font-medium">
                                      {
                                        selectedPackage?.package
                                          ?.packageCategory
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Type
                                    </p>
                                    <p className="font-medium">
                                      {selectedPackage?.package?.packageType}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Trip Itinerary Section */}
                              <div className="bg-white p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                  TRIP ITINERARY
                                </h3>

                                {selectedPackage?.package?.itineraryDays?.map(
                                  (day, index) => (
                                    <div key={index} className="mb-8 last:mb-0">
                                      {/* Day Header with enhanced styling */}
                                      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <div className="flex flex-col items-center justify-center bg-orange-500 text-white w-16 h-16 rounded-lg">
                                            <span className="text-xs font-medium">
                                              DAY
                                            </span>
                                            <span className="text-2xl font-bold">
                                              {day.day}
                                            </span>
                                          </div>
                                          <div>
                                            <h4 className="text-xl font-semibold text-gray-900">
                                              {day.selectedItinerary
                                                ?.itineraryTitle ||
                                                `${selectedPackage?.package?.packageName} - Day ${day.day}`}
                                            </h4>
                                            {day.selectedItinerary
                                              ?.cityName && (
                                              <p className="text-sm text-gray-500 mt-1">
                                                <span className="inline-flex items-center">
                                                  <svg
                                                    className="w-4 h-4 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                  </svg>
                                                  {
                                                    day.selectedItinerary
                                                      .cityName
                                                  }
                                                </span>
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-sm font-medium text-gray-500">
                                            27th Feb 25
                                          </span>
                                        </div>
                                      </div>

                                      {/* Itinerary Description with enhanced styling */}
                                      {day.selectedItinerary && (
                                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                                          <p className="text-gray-700 leading-relaxed">
                                            {
                                              day.selectedItinerary
                                                .itineraryDescription
                                            }
                                          </p>
                                        </div>
                                      )}

                                      {/* Hotel and Cab Section with enhanced styling */}
                                      {day.selectedItinerary?.cityName && (
                                        <div className="space-y-6">
                                          {/* Hotel Section */}
                                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            {/* ... existing hotel section code ... */}
                                          </div>

                                          {/* Cab Section - Only show on first day (index === 0) */}
                                          {index === 0 && (
                                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                              <div className="border-b border-gray-100">
                                                <div className="p-4 flex justify-between items-center">
                                                  <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                    </svg>
                                                    <h5 className="text-lg font-semibold text-gray-900">
                                                      Transport for Your Trip
                                                    </h5>
                                                  </div>
                                                  <button
                                                    onClick={() => setShowCabsPanel(true)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium transition-colors"
                                                  >
                                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                                    </svg>
                                                    Select Vehicle
                                                  </button>
                                                </div>
                                              </div>

                                              <div className="p-4">
                                                {selectedCab ? (
                                                  // Selected Cab Display
                                                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                                    <div className="flex gap-6">
                                                      {/* Cab Image */}
                                                      <div className="w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                                        {selectedCab.cabImages?.[0] ? (
                                                          <img
                                                            src={selectedCab.cabImages[0]}
                                                            alt={selectedCab.cabName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                              e.target.src = "/default-car.png";
                                                            }}
                                                          />
                                                        ) : (
                                                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                                                            </svg>
                                                          </div>
                                                        )}
                                                      </div>

                                                      {/* Cab Details */}
                                                      <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                          <div>
                                                            <h6 className="text-lg font-semibold text-gray-900">
                                                              {selectedCab.cabName}
                                                            </h6>
                                                            <div className="flex items-center gap-2 mt-1">
                                                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                                    {/* Cab Details */}
                                                    <div className="flex-1">
                                                      <div className="flex justify-between items-start">
                                                        <div>
                                                          <h6 className="text-lg font-semibold text-gray-900">
                                                            {
                                                              selectedCab.cabName
                                                            }
                                                          </h6>
                                                          <div className="flex items-center gap-2 mt-1">
                                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                                              {
                                                                selectedCab.cabType
                                                              }
                                                            </span>
                                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                              Selected
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                          <svg
                                                            className="w-4 h-4 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth="2"
                                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                            />
                                                          </svg>
                                                          <span>
                                                            Seats:{" "}
                                                            {
                                                              selectedCab.cabSeatingCapacity
                                                            }
                                                          </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          <svg
                                                            className="w-4 h-4 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                          >
                                                            <path
                                                              strokeLinecap="round"
                                                              strokeLinejoin="round"
                                                              strokeWidth="2"
                                                              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                                            />
                                                          </svg>
                                                          <span>
                                                            Luggage:{" "}
                                                            {
                                                              selectedCab.cabLuggage
                                                            }
                                                          </span>
                                                        </div>
                                                      </div>
                                                      {selectedCab.quantity >
                                                        1 && (
                                                        <div className="mt-2 text-sm text-blue-600 font-medium">
                                                          {selectedCab.quantity}{" "}
                                                          vehicles selected
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              ) : (
                                                // No Cab Selected State
                                                <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                  <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                  </svg>
                                                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                                                    No vehicle selected
                                                  </h3>
                                                  <p className="mt-1 text-sm text-gray-500">
                                                    Choose a vehicle for your
                                                    journey
                                                  </p>
                                                  <div className="mt-6">
                                                    <button
                                                      onClick={() =>
                                                        setShowCabsPanel(true)
                                                      }
                                                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                      <svg
                                                        className="w-4 h-4 mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          d="M12 4v16m8-8H4"
                                                        />
                                                      </svg>
                                                      Select Vehicle
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {packageInfoTab === "costing" && (
                            <div className="p-6 space-y-6">
                              {/* Final Costing Details */}
                              <div className="bg-white rounded-lg border border-gray-200">
                                <div className="px-4 py-3 border-b border-gray-200">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    Cost Breakdown
                                  </h3>
                                </div>
                                <div className="p-4">
                                  <div className="space-y-4">
                                    {/* Hotel Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Hotel Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.hotelPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Transfer Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Transfer Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.transferPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Activity Costs */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Activity Charges
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.activityPrices?.total || 0}
                                      </span>
                                    </div>

                                    {/* Taxes */}
                                    <div className="flex justify-between items-center py-2 border-b">
                                      <span className="text-gray-600">
                                        Taxes & Fees
                                      </span>
                                      <span className="font-medium">
                                        ₹
                                        {selectedPackage?.finalCosting?.taxes ||
                                          0}
                                      </span>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg mt-4">
                                      <span className="font-semibold text-lg">
                                        Grand Total
                                      </span>
                                      <span className="font-semibold text-lg text-blue-600">
                                        ₹
                                        {selectedPackage?.finalCosting
                                          ?.finalPrices?.grandTotal || 0}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Per Person Breakdown */}
                                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                      Per Person Cost
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-blue-700">
                                          Adult Cost (x
                                          {selectedLead?.adults || 1})
                                        </span>
                                        <span className="font-medium text-blue-900">
                                          ₹
                                          {selectedPackage?.finalCosting
                                            ?.finalPrices?.adultPrice || 0}
                                        </span>
                                      </div>
                                      {selectedLead?.kids > 0 && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-blue-700">
                                            Child Cost (x{selectedLead?.kids})
                                          </span>
                                          <span className="font-medium text-blue-900">
                                            ₹
                                            {selectedPackage?.finalCosting
                                              ?.finalPrices?.childPrice || 0}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showCabsPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowCabsPanel(false)}
          />

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between space-x-3">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Select Vehicle
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isLoadingCabs
                        ? "Loading vehicles..."
                        : `${availableCabs.length} vehicles available`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCabsPanel(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Updated Cab List with Quantity Selector */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 sm:px-6">
                  {isLoadingCabs ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableCabs.length > 0 ? (
                    <div className="space-y-4">
                      {availableCabs.map((cab) => (
                        <div
                          key={cab._id}
                          className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="flex">
                            {/* Cab Image section remains the same */}
                            <div className="w-40 h-32 flex-shrink-0">
                              {cab.cabImages && cab.cabImages[0] ? (
                                <img
                                  src={cab.cabImages[0]}
                                  alt={cab.cabName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log(
                                      "Image failed to load:",
                                      cab.cabImages[0]
                                    );
                                    e.target.onerror = null;
                                    e.target.src = "/default-car.png"; // Add a default car image
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Updated Cab Details with Quantity Selector */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {cab.cabName}
                                  </h3>
                                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {cab.cabSeatingCapacity}
                                    </span>
                                    <span className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {cab.cabLuggage}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Type: {cab.cabType}
                                  </p>
                                </div>
                              </div>

                              {/* Quantity Selector */}
                              <div className="mt-4 flex items-center space-x-4">
                                <label className="text-sm text-gray-600">
                                  Quantity:
                                </label>
                                <div className="flex items-center border rounded-md">
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        cab._id,
                                        (cabQuantities[cab._id] || 1) - 1
                                      )
                                    }
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-r"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={cabQuantities[cab._id] || 1}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        cab._id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-16 text-center py-1 border-none focus:ring-0"
                                  />
                                  <button
                                    onClick={() =>
                                      handleQuantityChange(
                                        cab._id,
                                        (cabQuantities[cab._id] || 1) + 1
                                      )
                                    }
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-l"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Select Button */}
                              <button
                                onClick={() => {
                                  console.log(
                                    "Selecting cab:",
                                    cab,
                                    "Quantity:",
                                    cabQuantities[cab._id] || 1
                                  );
                                  handleSelectCab({
                                    ...cab,
                                    quantity: cabQuantities[cab._id] || 1,
                                  });
                                }}
                                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Select {cabQuantities[cab._id] || 1} Vehicle
                                {(cabQuantities[cab._id] || 1) > 1 ? "s" : ""}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No vehicles available at the moment
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCab && showSelectedCabDetails && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Selected Vehicle Details
            </h3>
            <button
              onClick={() => setShowSelectedCabDetails(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              {selectedCab.cabImages && selectedCab.cabImages[0] ? (
                <img
                  src={selectedCab.cabImages[0]}
                  alt={selectedCab.cabName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(
                      "Image failed to load:",
                      selectedCab.cabImages[0]
                    );
                    e.target.onerror = null;
                    e.target.src = "/default-car.png";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {selectedCab.cabImages && selectedCab.cabImages.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto">
                {selectedCab.cabImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-20 h-20">
                    <img
                      src={image}
                      alt={`${selectedCab.cabName} view ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cab Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">
                {selectedCab.cabName}
              </h4>
              <p className="text-gray-600 mb-4">{selectedCab.cabType}</p>
              <div className="flex items-center mb-4">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{selectedCab.cabSeatingCapacity}</span>
              </div>
              <div className="flex items-center mb-4">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
                <span>{selectedCab.cabLuggage}</span>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Selected Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedCab.quantity} Vehicle
                  {selectedCab.quantity > 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Vehicle Features:</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Type: {selectedCab.cabType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Seating: {selectedCab.cabSeatingCapacity}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Luggage: {selectedCab.cabLuggage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Adjuster */}
          <div className="mt-6 flex items-center space-x-3">
            <button
              onClick={() =>
                handleQuantityChange(
                  selectedCab._id,
                  (selectedCab.quantity || 1) - 1
                )
              }
              className="p-2 border rounded-md hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="text-lg font-medium w-12 text-center">
              {selectedCab.quantity || 1}
            </span>
            <button
              onClick={() =>
                handleQuantityChange(
                  selectedCab._id,
                  (selectedCab.quantity || 1) + 1
                )
              }
              className="p-2 border rounded-md hover:bg-gray-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Selected Hotel Details View */}
      {selectedHotel && (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedHotel?.basicInfo?.propertyName ||
                  "Hotel Name Not Available"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedHotel?.basicInfo?.hotelStarRating ||
                  "Rating Not Available"}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleHotelChangeClick(selectedDay)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 border border-blue-600 rounded-md"
              >
                Change Hotel
              </button>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Hotel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">About the Property</h4>
              <p className="text-gray-600 mb-4">
                {selectedHotel?.basicInfo?.propertyDescription ||
                  "No description available"}
              </p>
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-500 mr-2">
                  Rating:
                </span>
                <span className="text-sm font-semibold">
                  {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Hotel Category</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedHotel?.basicInfo?.hotelStarRating || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the sliding modal for hotel selection */}
      {showHotelModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setShowHotelModal(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Modal Header */}
              <div className="px-4 py-6 bg-gray-50 sm:px-6">
                <div className="flex items-start justify-between space-x-3">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Select New Hotel
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a hotel for your stay
                    </p>
                  </div>
                  <button
                    onClick={() => setShowHotelModal(false)}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hotel List */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6 space-y-4">
                  {hotels?.length > 0 ? (
                    hotels.map((hotel) => (
                      <div
                        key={hotel._id}
                        className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="flex">
                          {/* Hotel Image Gallery */}
                          <div className="w-48 h-40 flex-shrink-0 relative">
                            {hotel?.photosAndVideos?.images?.length > 0 ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={hotel.photosAndVideos.images[0]}
                                  alt={hotel.basicInfo.propertyName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-hotel.png";
                                  }}
                                />
                                {hotel.photosAndVideos.images.length > 1 && (
                                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    +{hotel.photosAndVideos.images.length - 1}{" "}
                                    more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <svg
                                  className="w-12 h-12 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Hotel Details */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-medium text-gray-900">
                                    {hotel.basicInfo.propertyName}
                                  </h3>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    {hotel.basicInfo.hotelStarRating}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {hotel.basicInfo.propertyDescription}
                                </p>

                                {/* Amenities */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {hotel.basicInfo.amenities
                                    ?.slice(0, 4)
                                    .map((amenity, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                      >
                                        {amenity}
                                      </span>
                                    ))}
                                  {hotel.basicInfo.amenities?.length > 4 && (
                                    <span className="text-xs text-blue-600">
                                      +{hotel.basicInfo.amenities.length - 4}{" "}
                                      more
                                    </span>
                                  )}
                                </div>

                                {/* Price and Rating Section */}
                                <div className="mt-4 flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        Starting from
                                      </p>
                                      <p className="text-lg font-semibold text-green-600">
                                        ₹
                                        {hotel.basicInfo.startingPrice ||
                                          "Price on request"}
                                      </p>
                                    </div>
                                    {hotel.basicInfo.rating && (
                                      <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                                        <span className="text-sm font-medium text-green-700">
                                          {hotel.basicInfo.rating}
                                        </span>
                                        <svg
                                          className="w-4 h-4 text-green-700"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => handleHotelChange(hotel)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <span>Select Hotel</span>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleViewHotelDetails(hotel)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-gray-600"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hotels available for this location
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllLeads;
