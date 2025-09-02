import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";
import axios from "axios";

const config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com",
};

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

  const fetchCabs = async () => {
    try {
      setIsLoadingCabs(true);
      const response = await fetch(`${config.API_HOST}/api/cabs/getallcabs`);
      const data = await response.json();

      // Process cab data to include full image URLs
      const processedCabs = data.result.map((cab) => ({
        ...cab,
        cabImage: cab.cabImage ? `${config.API_HOST}/${cab.cabImage}` : null,
        // Calculate total price based on distance if available
        totalPrice: selectedPackage?.package?.distance
          ? cab.pricePerKm * selectedPackage.package.distance
          : cab.pricePerKm * 100, // default distance if not available
      }));

      setCabs(processedCabs);

      // Find Swift Dzire cab and set it as default
      const swiftDzire = processedCabs.find(
        (cab) =>
          cab.cabName.toLowerCase().includes("swift") &&
          cab.cabName.toLowerCase().includes("dzire")
      );

      if (swiftDzire) {
        setSelectedCab(swiftDzire);
        // If we have a selected package, update its cab information
        if (selectedPackage) {
          const updatedPackage = {
            ...selectedPackage,
            cabs: {
              ...selectedPackage.cabs,
              travelPrices: {
                ...selectedPackage.cabs?.travelPrices,
                cabImage: swiftDzire.cabImage,
                cabName: swiftDzire.cabName,
                cabType: swiftDzire.cabType,
                seatingCapacity: swiftDzire.seatingCapacity,
                luggageCapacity: swiftDzire.luggageCapacity,
                hasAC: swiftDzire.hasAC,
                pricePerKm: swiftDzire.pricePerKm,
                totalPrice: swiftDzire.totalPrice,
              },
            },
          };
          setSelectedPackage(updatedPackage);
        }
      }
    } catch (error) {
      console.error("Error fetching cabs:", error);
      toast.error("Failed to fetch cabs");
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
            cabImage: cab.cabImage,
            cabName: cab.cabName,
            cabType: cab.cabType,
            seatingCapacity: cab.seatingCapacity,
            luggageCapacity: cab.luggageCapacity,
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

  const handleChangeClick = () => {
    setPackageInfoTab("cab");
    setIsSliderOpen(true);
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

  const handleChangeHotel = (day, hotel) => {
    setSelectedDay(day);
    setSelectedHotel(hotel);
    setPackageInfoTab("hotel");
    setIsSliderOpen(true);
  };

  const handleChangeRoom = (day, hotel) => {
    setSelectedDay(day);
    setSelectedHotel(hotel);
    setPackageInfoTab("rooms");
    setIsSliderOpen(true);
  };

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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Name</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Designation</span>
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-white uppercase tracking-wider">
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
                                      {/* Day Header */}
                                      <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                          <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-sm">
                                            DAY {day.day}
                                          </span>
                                          <h4 className="text-lg font-medium">
                                            {day.selectedItinerary
                                              ?.itineraryTitle ||
                                              `${selectedPackage?.package?.packageName} - Day ${day.day}`}
                                          </h4>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                          27th Feb 25
                                        </span>
                                      </div>

                                      {/* Transfer Details - Only show on Day 1 */}
                                      {day.day === 1 && (
                                        <div className="mb-6">
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
                                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                                />
                                              </svg>
                                            </div>
                                            <div className="flex-grow">
                                              <div className="flex justify-between items-start mb-2">
                                                <div>
                                                  <p className="font-medium">
                                                    Private Transfer
                                                  </p>
                                                  <div className="text-sm text-gray-600 mt-1">
                                                    <span className="mr-2">
                                                      From:{" "}
                                                      {
                                                        selectedPackage?.package
                                                          ?.pickupLocation
                                                      }
                                                    </span>
                                                    <span>
                                                      To:{" "}
                                                      {
                                                        selectedPackage?.package
                                                          ?.dropLocation
                                                      }
                                                    </span>
                                                  </div>
                                                </div>
                                                <button
                                                  onClick={() =>
                                                    handleChangeClick()
                                                  }
                                                  className="text-orange-500 text-sm font-medium hover:text-orange-600"
                                                >
                                                  CHANGE VEHICLE
                                                </button>
                                              </div>

                                              {/* Vehicle Details */}
                                              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                  <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
                                                    {selectedCab?.cabImage ? (
                                                      <img
                                                        src={
                                                          selectedCab.cabImage
                                                        }
                                                        alt={
                                                          selectedCab.cabName
                                                        }
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                          e.target.onerror =
                                                            null;
                                                          e.target.src =
                                                            "/default-car.png"; // Add a default car image
                                                        }}
                                                      />
                                                    ) : (
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
                                                    )}
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                      <h5 className="font-medium">
                                                        {selectedCab?.cabName ||
                                                          "Swift Dzire"}
                                                      </h5>
                                                      <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                          Price per km
                                                        </p>
                                                        <p className="font-medium text-green-600">
                                                          ₹
                                                          {selectedCab?.pricePerKm ||
                                                            0}
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                      <div className="flex items-center gap-1">
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
                                                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                                          />
                                                        </svg>
                                                        <span>
                                                          {selectedCab?.seatingCapacity ||
                                                            4}{" "}
                                                          Seater
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-1">
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
                                                            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                                                          />
                                                        </svg>
                                                        <span>
                                                          {selectedCab?.luggageCapacity ||
                                                            3}{" "}
                                                          Luggage
                                                        </span>
                                                      </div>
                                                      {selectedCab?.hasAC && (
                                                        <div className="flex items-center gap-1">
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
                                                              d="M13 10V3L4 14h7v7l9-11h-7z"
                                                            />
                                                          </svg>
                                                          <span>AC</span>
                                                        </div>
                                                      )}
                                                    </div>
                                                    {selectedPackage?.package
                                                      ?.distance && (
                                                      <div className="mt-3 pt-3 border-t border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                          <div className="text-sm text-gray-600">
                                                            Total Distance:{" "}
                                                            {
                                                              selectedPackage
                                                                .package
                                                                .distance
                                                            }{" "}
                                                            km
                                                          </div>
                                                          <div>
                                                            <p className="text-sm text-gray-500">
                                                              Total Price
                                                            </p>
                                                            <p className="font-medium text-green-600">
                                                              ₹
                                                              {selectedCab?.totalPrice ||
                                                                0}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

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
                                                    ].hotelInfo.name
                                                  }
                                                </h5>
                                                <button
                                                  onClick={() =>
                                                    handleChangeHotel(day.day)
                                                  }
                                                  className="text-orange-500 text-sm font-medium hover:text-orange-600"
                                                >
                                                  CHANGE HOTEL
                                                </button>
                                              </div>
                                              <div className="mt-4 bg-gray-50 rounded-lg overflow-hidden">
                                                <div className="flex">
                                                  <div className="w-1/4">
                                                    {selectedPackage.hotels[
                                                      day.day
                                                    ].hotelInfo.photosAndVideos
                                                      ?.images?.[0] && (
                                                      <img
                                                        src={
                                                          selectedPackage
                                                            .hotels[day.day]
                                                            .hotelInfo
                                                            .photosAndVideos
                                                            .images[0]
                                                        }
                                                        alt={
                                                          selectedPackage
                                                            .hotels[day.day]
                                                            .hotelInfo.name
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
                                                        ].hotelInfo.location
                                                          .address
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
    </div>
  );
};

export default AllLeads;
