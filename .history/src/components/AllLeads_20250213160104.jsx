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
      setCabs(data.result); // Assuming the cabs are in the result property
      // Set the first cab (Swift Dzire) as default selected cab
      setSelectedCab(
        data.result.find((cab) =>
          cab.cabName.toLowerCase().includes("swift")
        ) || data.result[0]
      );
    } catch (error) {
      console.error("Error fetching cabs:", error);
    } finally {
      setIsLoadingCabs(false);
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
      const response = await fetch(`${config.API_HOST}/api/packages/getPackageHotels/${selectedPackage._id}`);
      const data = await response.json();
      if (data.success) {
        setHotels(data.result);
        // Set the first hotel as default selected
        setSelectedHotel(data.result[0]);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setIsLoadingHotels(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
                        console.error("Error updating lead:", error);
                        toast.error(
                          "Failed to save changes. Please try again."
                        );
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors"
                  >
                    Save Changes
                  </button>
                )}
                {activeTab === "viewPackage" && (
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Next
                  </button>
                )}
                {activeTab === "sendPackage" && (
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Send Package
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add a success modal or notification */}
      {isSharing && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-sm text-gray-600">
            Sharing package via {sharingMethod}...
          </span>
        </div>
      )}

      {/* Premium View Modal with Updated Header Background */}
      {isViewModalOpen && viewLead && (
        <>
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity z-40"
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-3">
              <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all w-full max-w-4xl">
                {/* Header with New Background Color */}
                <div className="bg-[rgb(45,45,68)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl font-semibold text-white">
                          {viewLead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">
                          {viewLead.name}
                        </h2>
                        <p className="text-sm text-gray-300">
                          {viewLead.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="rounded-full p-1 hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-white"
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

                {/* Content Area with Reduced Spacing */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
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
                          <h3 className="text-sm font-semibold text-gray-900">
                            Contact Information
                          </h3>
                        </div>
                      </div>
                      <div className="p-3 space-y-2.5">
                        {/* Contact details with reduced spacing */}
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
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
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {viewLead.mobile}
                            </p>
                            <p className="text-xs text-gray-500">Mobile</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-gray-400"
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
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {viewLead.email}
                            </p>
                            <p className="text-xs text-gray-500">Email</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Travel Details Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 104 0 2 2 0 012-2v-2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Travel Details
                          </h3>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              From
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.from || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Destination
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.destination || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Travel Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.travelDate
                                ? new Date(
                                    viewLead.travelDate
                                  ).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Duration
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {viewLead.days
                                ? `${viewLead.days}D/${viewLead.nights}N`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guest Information Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          <svg
                            className="h-4 w-4 text-blue-600"
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
                          <h3 className="text-sm font-semibold text-gray-900">
                            Guest Information
                          </h3>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-blue-600 mb-0.5">
                              {viewLead.adults || "0"}
                            </p>
                            <p className="text-xs font-medium text-blue-600">
                              Adults
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-green-600 mb-0.5">
                              {viewLead.kids || "0"}
                            </p>
                            <p className="text-xs font-medium text-green-600">
                              Kids
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-purple-600 mb-0.5">
                              {viewLead.persons || "0"}
                            </p>
                            <p className="text-xs font-medium text-purple-600">
                              Total
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Information Card */}
                    {viewLead.assignedPackage && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="h-4 w-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Package Details
                            </h3>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="space-y-2.5">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Package Name
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {viewLead.assignedPackage.packageName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Category
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {viewLead.packageCategory || "N/A"}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-2">
                              <p className="text-xs font-medium text-green-600 mb-0.5">
                                Package Price
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                ₹{viewLead.assignedPackage.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Reduced Spacing */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsViewModalOpen(false)}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleEditClick(viewLead)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Edit Lead
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllLeads;
