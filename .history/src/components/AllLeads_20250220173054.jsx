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
    _id: "6720c5643d0bb849fbd7565a",
    cabName: "Swift Dzyre",
    cabType: "Hatchback",
    cabSeatingCapacity: "4 Seater",
    cabLuggage: "Small Trunk",
    cabImages: [
      "https://firebasestorage.googleapis.com/v0/b/mern-estate-1b3d0.appspot.com/o/1730200926947swift-dzire11.webp?alt=media&token=70c6ec4e-20d9-416e-aec6-be1bfd7c8de6",
    ],
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
  const [selectedCity, setSelectedCity] = useState("");

  // Add this state at the top with other state declarations
  const [itineraryDetails, setItineraryDetails] = useState({});
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);

  const [showCabModal, setShowCabModal] = useState(false);

  // Add this state for the sliding modal
  const [showCabSlider, setShowCabSlider] = useState(false);

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

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!selectedPackage?.package?.itineraryDays) return;

      setIsLoadingItinerary(true);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) throw new Error("No user data found");

        const userData = JSON.parse(userStr);
        const token = userData.data.token;

        for (const day of selectedPackage.package.itineraryDays) {
          // Check if the day has a selected itinerary
          if (day?.selectedItinerary?._id) {
            console.log(
              "Fetching itinerary for day:",
              day.day,
              "ID:",
              day.selectedItinerary._id
            );

            const response = await fetch(
              `${config.API_HOST}/api/itinerary/getitinerary/${day.selectedItinerary._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Itinerary API Response for day", day.day, ":", data);

            if (data.success) {
              setItineraryDetails((prevDetails) => ({
                ...prevDetails,
                [day.selectedItinerary._id]: data.itinerary,
              }));
            }
          } else {
            console.log("No itinerary selected for day:", day.day);
          }
        }
      } catch (error) {
        console.error("Error fetching itinerary details:", error);
        toast.error(`Failed to load itinerary: ${error.message}`);
      } finally {
        setIsLoadingItinerary(false);
      }
    };

    fetchItineraries();
  }, [selectedPackage?.package?.itineraryDays]);

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
  // ... existing code ...

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

    return (
      <div className="mt-6">
        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">
              HOMESTAY • 2 Nights • In {cityName}
            </h4>
            <button className="text-blue-500 font-medium">CHANGE</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {hotelsForCity.map((hotel) => (
              <div
                key={hotel._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Hotel Image */}
                  <div className="relative w-72 h-48 flex-shrink-0">
                    {hotel.photosAndVideos?.images?.[0] ? (
                      <img
                        src={hotel.photosAndVideos.images[0]}
                        alt={hotel.basicInfo?.propertyName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
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
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-sm">
                      <span className="font-medium">4.4</span>/5
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-medium">
                        {hotel.basicInfo?.propertyName}
                      </h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < (hotel.basicInfo?.hotelStarRating || 3)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-2">
                      {hotel.basicInfo?.address}, 2.7 km drive to Viceregal
                      Lodge
                    </p>

                    <div className="border-t pt-4 mt-4">
                      <h5 className="text-lg mb-2">
                        Diamond Rooms (No View) - Holidays Selections
                      </h5>
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <span>Breakfast is included</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectHotel(hotel, day.day)}
                      className="mt-4 text-blue-500 font-medium"
                    >
                      More Room Options
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

  // ... rest of your existing code ...

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
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const userData = JSON.parse(userStr);
      const token = userData.data.token;

      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched cabs data:", data);

      if (data.status === "success") {
        setCabs(data.result);
        // Set Swift Dzire as default
        const swiftDzire = data.result.find(
          (cab) => cab._id === "6720c5643d0bb849fbd7565a"
        );
        if (swiftDzire) {
          setSelectedCab(swiftDzire);
        }
      }
    } catch (error) {
      console.error("Error fetching cabs:", error);
      toast.error("Failed to load cabs. Please try again.");
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
    console.log("Opening hotel modal for day:", day);
    const cityName = day?.selectedItinerary?.cityName;
    if (cityName) {
      setSelectedCity(cityName);
      fetchHotelsForCity(cityName); // Make sure this function is called
    }
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
              onClick={() => handleHotelChangeClick(selectedDay)}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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

          <div className="fixed inset-y-0 right-0 max-w-5xl w-full bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Change Hotel</h2>
                  <button
                    onClick={() => setShowHotelModal(false)}
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

                {/* Filters */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      3★
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4★
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      5★
                    </button>
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-3 py-1 pr-8 rounded border text-sm hover:bg-gray-50">
                      <option>Any</option>
                      {/* Add location options */}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      3 & above
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4 & above
                    </button>
                    <button className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                      4.5 & above
                    </button>
                  </div>
                  <div className="relative">
                    <select className="appearance-none px-3 py-1 pr-8 rounded border text-sm hover:bg-gray-50">
                      <option>Any</option>
                      {/* Add hotel type options */}
                    </select>
                  </div>
                  <button className="flex items-center gap-1 text-blue-500 text-sm">
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
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                    MORE FILTERS
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4 relative">
                  <input
                    type="text"
                    placeholder="Search by Hotel Name or Location"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <button className="absolute right-3 top-2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hotel List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">
                      Showing {hotels.length} Stays in {selectedCity} | Sort by
                      Popularity
                    </p>
                  </div>

                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div
                        key={hotel._id}
                        className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="flex">
                          {/* Hotel Image */}
                          <div className="w-72 h-48 relative">
                            <img
                              src={hotel.photosAndVideos?.images?.[0]}
                              alt={hotel.basicInfo?.propertyName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-teal-500 text-white px-2 py-1 rounded text-sm">
                              {hotel.basicInfo?.rating || "4.2"}/5
                            </div>
                          </div>

                          {/* Hotel Details */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-medium">
                                    {hotel.basicInfo?.propertyName}
                                  </h3>
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-lg ${
                                          i <
                                          (hotel.basicInfo?.hotelStarRating ||
                                            3)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-1">
                                  {hotel.basicInfo?.address}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {hotel.basicInfo?.distanceFromLandmark} drive
                                  to Mall Road
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span className="text-gray-600">
                                    {hotel.checkInDate} - {hotel.checkOutDate}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">
                                    Includes:
                                  </span>
                                  <span className="font-medium">Breakfast</span>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">
                                    Room Type
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {hotel.roomType || "Deluxe Room"}
                                    </span>
                                    <button className="text-blue-500 text-sm">
                                      CHANGE ROOM
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-3xl font-semibold">
                                  ₹{hotel.price}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Price/Person
                                </p>
                                <button
                                  onClick={() => handleSelectHotel(hotel)}
                                  className="mt-2 px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  SELECT
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add this at the bottom of your component */}
      {showCabModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() => setShowCabModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Vehicle
                </h3>
                <div className="space-y-4">
                  {cabs.map((cab) => (
                    <div
                      key={cab._id}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                        selectedCab?._id === cab._id
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedCab({ ...cab, day: 1, quantity: 1 });
                        setShowCabModal(false);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={cab.cabImages?.[0] || "/default-car.png"}
                            alt={cab.cabName}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {cab.cabName}
                          </h4>
                          <p className="text-sm text-gray-500">{cab.cabType}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {cab.cabSeatingCapacity} Seater • {cab.cabLuggage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCabModal(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update the sliding modal design */}
      {showCabSlider && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCabSlider(false)}
            />

            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-4xl">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Change Transfer
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Changes would be reflected to whole itinerary
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCabSlider(false)}
                        className="rounded-md text-gray-400 hover:text-gray-500"
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

                  {/* Cab List */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {cabs.map((cab) => (
                        <div
                          key={cab._id}
                          className="bg-blue-50 rounded-lg p-4 relative"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-32 h-24 flex-shrink-0">
                              <img
                                src={cab.cabImages[0]}
                                alt={cab.cabName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-lg font-medium">
                                    {cab.cabName}
                                    <span className="text-gray-500 text-sm ml-2">
                                      (or Similar)
                                    </span>
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Private Transfer/{cab.cabType}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">
                                  Facilities:
                                </p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                      />
                                    </svg>
                                    {cab.cabSeatingCapacity}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                      />
                                    </svg>
                                    {cab.cabLuggage}
                                  </span>
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
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
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                      />
                                    </svg>
                                    First Aid
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 mt-2">
                                Intercity Transfer; 14 Sightseeing Transfers
                                Included
                              </p>

                              {selectedCab?._id === cab._id ? (
                                <button className="absolute top-4 right-4 text-blue-500 font-medium">
                                  REMOVE
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedCab(cab);
                                    setShowCabSlider(false);
                                  }}
                                  className="absolute bottom-4 right-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                                >
                                  SELECT
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
