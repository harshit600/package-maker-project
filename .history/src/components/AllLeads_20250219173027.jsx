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
  const fetchHotelsForItinerary = (itineraryDays) => {
    if (!itineraryDays) return;

    const processedCities = new Set(); // To avoid duplicate requests

    itineraryDays.forEach((day) => {
      if (day.selectedItinerary?.cityName) {
        const cityName = day.selectedItinerary.cityName.trim();

        // Only fetch if we haven't processed this city yet
        if (cityName && !processedCities.has(cityName.toLowerCase())) {
          processedCities.add(cityName.toLowerCase());
          fetchHotelsByCity(cityName);
        }
      }
    });
  };

  // Update the useEffect when selectedPackage changes to fetch hotels for all cities
  useEffect(() => {
    if (selectedPackage?.package?.itineraryDays) {
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
      name: hotel.propertyName,
      description: hotel.propertyDescription,
      images: hotel.photosAndVideos?.images || [],
      // Add any other fields you need
    }));
  };

  // Function to handle the Change Hotel button click
  const handleChangeHotelClick = (dayNumber) => {
    setShowHotelsForDay(showHotelsForDay === dayNumber ? null : dayNumber);
  };

  // Modified hotel rendering function
  const renderHotels = (day, index, totalDays) => {
    // Skip hotel selection for the last day
    if (index === totalDays - 1) {
      return (
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              No hotel selection needed for the last day of your journey.
            </p>
          </div>
        </div>
      );
    }

    if (!day.selectedItinerary?.cityName) return null;

    return (
      <div className="mt-6">
        <div className="mt-4">
          <h4 className="font-medium mb-4 text-lg">
            Hotels in {day.selectedItinerary.cityName}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Updated Hotel Image Gallery */}
                <div className="relative h-48">
                  {hotel.photosAndVideos?.images?.[0] ? (
                    <img
                      src={hotel.photosAndVideos.images[0]}
                      alt={hotel.propertyName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log(
                          "Image failed to load:",
                          hotel.photosAndVideos.images[0]
                        );
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
                  {/* Image Count Badge */}
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
                        {hotel.propertyName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {hotel.hotelStarRating}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {hotel.propertyDescription}
                  </p>

                  {/* Select Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleSelectHotel(hotel, day.day)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Select Hotel
                    </button>
                  </div>
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
  {hotels && hotels.map((hotel) => {
    // Debug log for each hotel
    console.log("Processing hotel:", hotel);

    return (
      <div 
        key={hotel?._id || Math.random()}
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
                  e.target.src = '/default-hotel.png';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {hotel?.propertyName || 'Hotel Name Not Available'}
                </h3>
                <p className="text-sm text-gray-500">
                  {hotel?.hotelStarRating || 'Rating Not Available'}
                </p>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {hotel?.propertyDescription || 'No description available'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                console.log('Selected hotel:', hotel); // Debug log
                handleHotelChange(hotel);
              }}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Select This Hotel
            </button>
          </div>
        </div>
      </div>
    );
  })}

  // Update the selected hotel view with direct property access
  {selectedHotel && (
    <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {selectedHotel?.propertyName || 'Hotel Name Not Available'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {selectedHotel?.hotelStarRating || 'Rating Not Available'}
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
                e.target.src = '/default-hotel.png';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Hotel Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {/* Hotel Details */}
                                      {selectedPackage?.hotels?.[day.day] && (
                                        <div className="mt-6">
                                          <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                              <svg
                                                className="w-6 h-6 text-gray-600"
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
                                            <div className="flex-grow">
                                              <div className="flex justify-between items-start">
                                                <h5 className="font-medium mb-2">
                                                  {
                                                    selectedPackage.hotels[
                                                      day.day
                                                    ].basicInfo.propertyName
                                                  }
                                                </h5>
                                                <button
                                                  onClick={() =>
                                                    handleHotelChangeClick(
                                                      day.day
                                                    )
                                                  }
                                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2 border border-blue-600 rounded-md"
                                                >
                                                  Change Hotel
                                                </button>
                                              </div>
                                              <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                                                <div className="flex">
                                                  <div className="w-1/4">
                                                    {selectedPackage.hotels[
                                                      day.day
                                                    ].photosAndVideos
                                                      ?.images?.[0] && (
                                                      <img
                                                        src={
                                                          selectedPackage
                                                            .hotels[day.day]
                                                            .photosAndVideos
                                                            .images[0]
                                                        }
                                                        alt={
                                                          selectedPackage
                                                            .hotels[day.day]
                                                            .basicInfo
                                                            .propertyName
                                                        }
                                                        className="w-full h-full object-cover"
                                                      />
                                                    )}
                                                  </div>
                                                  <div className="p-4 flex-1">
                                                    <p className="text-sm text-gray-600">
                                                      {
                                                        selectedPackage.hotels[
                                                          day.day
                                                        ].basicInfo
                                                          .propertyDescription
                                                      }
                                                    </p>
                                                    <div className="mt-2">
                                                      <p className="text-sm font-medium">
                                                        Room Type:
                                                      </p>
                                                      <p className="text-sm text-gray-600">
                                                        {
                                                          selectedPackage
                                                            .hotels[day.day]
                                                            .roomInfo.name
                                                        }
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Itinerary Description */}
                                      {day.selectedItinerary && (
                                        <div className="mt-6 text-gray-600">
                                          <p>
                                            {
                                              day.selectedItinerary
                                                .itineraryDescription
                                            }
                                          </p>
                                          {day.selectedItinerary.cityName && (
                                            <p className="mt-2 text-sm">
                                              <span className="font-medium">
                                                City:
                                              </span>{" "}
                                              {day.selectedItinerary.cityName}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {day.selectedItinerary && (
                                        <div className="mt-6">
                                          {/* ... existing itinerary content ... */}

                                          {day.selectedItinerary.cityName && (
                                            <div className="mt-4">
                                              <h4 className="font-medium mb-2">
                                                Available Hotels in{" "}
                                                {day.selectedItinerary.cityName}
                                              </h4>
                                              <div className="grid grid-cols-2 gap-4">
                                                {getHotelsForCity(
                                                  day.selectedItinerary.cityName
                                                ).map((hotel) => (
                                                  <div
                                                    key={hotel.id}
                                                    className="border rounded-lg p-4"
                                                  >
                                                    <h5 className="font-medium">
                                                      {
                                                        hotel.basicInfo
                                                          .propertyName
                                                      }
                                                    </h5>
                                                    <p className="text-sm text-gray-600">
                                                      {
                                                        hotel.basicInfo
                                                          .propertyDescription
                                                      }
                                                    </p>
                                                    <button
                                                      onClick={() =>
                                                        handleSelectHotel(
                                                          hotel,
                                                          day.day
                                                        )
                                                      }
                                                      className="mt-2 text-blue-600 text-sm hover:text-blue-700"
                                                    >
                                                      Select Hotel
                                                    </button>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
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
                {selectedHotel.basicInfo.propertyName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedHotel.basicInfo.hotelStarRating}
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

          {/* Updated Image Gallery for Selected Hotel */}
          <div className="mb-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              {selectedHotel.photosAndVideos &&
              selectedHotel.photosAndVideos.images &&
              selectedHotel.photosAndVideos.images.length > 0 ? (
                <img
                  src={selectedHotel.photosAndVideos.images[0]}
                  alt={selectedHotel.basicInfo.propertyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(
                      "Image failed to load:",
                      selectedHotel.photosAndVideos.images[0]
                    );
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

            {/* Updated Thumbnails */}
            {selectedHotel.photosAndVideos?.images?.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto">
                {selectedHotel.photosAndVideos.images.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border border-gray-200"
                  >
                    <img
                      src={image}
                      alt={`${selectedHotel.basicInfo.propertyName} view ${
                        index + 1
                      }`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log("Thumbnail failed to load:", image);
                        e.target.onerror = null;
                        e.target.src = "/default-hotel.png";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">About the Property</h4>
              <p className="text-gray-600 mb-4">
                {selectedHotel.basicInfo.propertyDescription}
              </p>
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-gray-500 mr-2">
                  Rating:
                </span>
                <span className="text-sm font-semibold">
                  {selectedHotel.basicInfo.hotelStarRating}
                </span>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Hotel Category</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedHotel.basicInfo.hotelStarRating}
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
                  {hotels.map((hotel) => (
                    <div
                      key={hotel._id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex">
                        {/* Hotel Image */}
                        <div className="w-40 h-32 flex-shrink-0">
                          {hotel.photosAndVideos?.images?.[0] ? (
                            <img
                              src={hotel.photosAndVideos.images[0]}
                              alt={hotel.basicInfo.propertyName}
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
                              <h3 className="text-lg font-medium text-gray-900">
                                {hotel.basicInfo.propertyName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {hotel.basicInfo.hotelStarRating}
                              </p>
                              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                {hotel.basicInfo.propertyDescription}
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
                  ))}
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
