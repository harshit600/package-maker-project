import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { demoLeads } from "../scripts/createDemoLeads";
import "./AllLeads.css";

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
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageFilter, setPackageFilter] = useState({
    search: "",
    category: "",
    duration: "",
  });
  const [searchMobile, setSearchMobile] = useState("");
  const [sharingMethod, setSharingMethod] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchPackages();
  }, []);

  const fetchLeads = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      const response = await fetch(`${config.API_HOST}/api/leads/get-leads`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localUser.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leads");

      const data = await response.json();
      // Combine API leads with demo leads
      const combinedLeads = [
        ...data,
        ...demoLeads.map((lead) => ({
          ...lead,
          isDemo: true, // Add flag to identify demo leads
        })),
      ];
      setLeads(combinedLeads);
    } catch (error) {
      // If API fails, at least show demo leads
      setLeads(
        demoLeads.map((lead) => ({
          ...lead,
          isDemo: true,
        }))
      );
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      console.log("Fetching packages with token:", localUser.token);

      const response = await fetch(
        `${config.API_HOST}/api/packages/getpackages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localUser.token}`,
          },
        }
      );

      // Log response details
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      // Get raw response
      const rawResponse = await response.text();
      console.log("Raw API Response:", rawResponse);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch packages: ${response.status} - ${rawResponse}`
        );
      }

      // Check if response is empty
      if (!rawResponse.trim()) {
        console.log("Empty response received");
        setPackages([]);
        return;
      }

      try {
        const data = JSON.parse(rawResponse);
        console.log("Parsed packages:", data);
        setPackages(Array.isArray(data) ? data : []);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Invalid JSON received:", rawResponse);
        throw new Error(`Invalid JSON response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error(`Error fetching packages: ${error.message}`);
      setPackages([]); // Set empty array on error
    } finally {
      setLoadingPackages(false);
    }
  };

  // Add this function to filter leads by mobile number
  const getFilteredLeads = () => {
    return leads.filter((lead) => {
      const mobileMatch = lead.mobile
        ?.toLowerCase()
        .includes(searchMobile.toLowerCase());
      return mobileMatch;
    });
  };

  // Update pagination logic to use filtered leads
  const filteredLeads = getFilteredLeads();
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

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

  const handleEditClick = (lead) => {
    setSelectedLead(lead);
    setIsEditPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsEditPanelOpen(false);
    setSelectedLead(null);
  };

  const handleAssignPackage = async (packageId) => {
    if (!selectedLead || selectedLead.isDemo) {
      toast.warning("Cannot assign package to demo lead");
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      const response = await fetch(
        `${config.API_HOST}/api/leads/assign-package`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localUser.token}`,
          },
          body: JSON.stringify({
            leadId: selectedLead._id,
            packageId: packageId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign package");

      toast.success("Package assigned successfully");
      fetchLeads(); // Refresh leads data
      setActiveTab("viewPackage"); // Switch to view package tab
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getFilteredPackages = () => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.packageName
          ?.toLowerCase()
          .includes(packageFilter.search.toLowerCase()) ||
        pkg.description
          ?.toLowerCase()
          .includes(packageFilter.search.toLowerCase());
      const matchesCategory =
        !packageFilter.category ||
        pkg.packageCategory === packageFilter.category;

      // Debug logs
      console.log("Package:", {
        id: pkg._id,
        duration: pkg.duration,
        type: typeof pkg.duration,
      });
      console.log("Filter duration:", {
        value: packageFilter.duration,
        type: typeof packageFilter.duration,
      });

      // More flexible duration comparison
      const matchesDuration =
        !packageFilter.duration ||
        String(pkg.duration) === String(packageFilter.duration);

      console.log("Matches duration:", matchesDuration);

      return matchesSearch && matchesCategory && matchesDuration;
    });
  };

  const uniqueCategories = [
    ...new Set(packages.map((pkg) => pkg.packageCategory)),
  ].filter(Boolean);
  const uniqueDurations = [
    ...new Set(packages.map((pkg) => String(pkg.duration))),
  ]
    .filter(Boolean)
    .sort((a, b) => Number(a) - Number(b));

  // Add this function to handle sharing
  const handleShare = async (method) => {
    if (!selectedLead?.assignedPackage) {
      toast.error("No package assigned to share");
      return;
    }

    try {
      setIsSharing(true);
      setSharingMethod(method);

      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

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
              Authorization: `Bearer ${localUser.token}`,
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
                Authorization: `Bearer ${localUser.token}`,
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
                Authorization: `Bearer ${localUser.token}`,
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

  // Update or add this function to handle demo leads
  const addDemoLead = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("No user data found");

      const parsedData = JSON.parse(userStr);
      const localUser = parsedData.data || parsedData;

      const response = await fetch(`${config.API_HOST}/api/leads/add-demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localUser.token}`,
        },
        body: JSON.stringify({
          name: "Manjit",
          mobile: "8219440351",
          email: "manjit@example.com",
          destination: "Shimla",
          from: "Delhi",
          travelDate: new Date().toISOString(),
          adults: "2",
          kids: "0",
          persons: "2",
          days: "4",
          nights: "3",
          budget: "15000",
          packageCategory: "Honeymoon",
          isDemo: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to add demo lead");

      const data = await response.json();
      setLeads((prevLeads) => [...prevLeads, data.lead]);
      toast.success("Demo lead added successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">All Leads</h2>
        <div className="flex items-center space-x-4">
          <input
            type="search"
            placeholder="Search by mobile number"
            value={searchMobile}
            onChange={(e) => setSearchMobile(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSearchMobile("")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {lead.packageType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-600">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.mobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      lead.publish
                    )}`}
                  >
                    {lead.publish}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleEditClick(lead)}
                      className="text-gray-600 hover:text-blue-600 edit-button"
                    >
                      <svg
                        className="h-5 w-5"
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
                    <button className="text-gray-600 hover:text-red-600">
                      <svg
                        className="h-5 w-5"
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
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-center flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
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
          {/* Side Panel - Updated width from w-4/5 to w-1/2 */}
          <div
            className={`fixed inset-y-0 right-0 w-1/2 bg-[rgb(45,45,68)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm`}
                  >
                    Lead Details
                  </button>
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className={`${
                      activeTab === "createPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4`}
                  >
                    Create Package
                  </button>
                  <button
                    onClick={() => setActiveTab("viewPackage")}
                    className={`${
                      activeTab === "viewPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4`}
                  >
                    View Package
                  </button>
                  <button
                    onClick={() => setActiveTab("sendPackage")}
                    className={`${
                      activeTab === "sendPackage"
                        ? "bg-white text-black"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-2 border-b border-b-1 font-medium text-sm ml-4`}
                  >
                    Send Package
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="bg-gray-50 min-h-full">
                    <div className="max-w-5xl mx-auto p-6">
                      {/* Lead Header Card */}
                      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-semibold text-white">
                                  {selectedLead?.name?.charAt(0) || "?"}
                                </span>
                              </div>
                              <div>
                                <h1 className="text-2xl font-bold text-white">
                                  {selectedLead?.name}
                                </h1>
                                <p className="text-blue-100">
                                  {selectedLead?.mobile}
                                </p>
                              </div>
                            </div>
                            <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white">
                              {selectedLead?.status || "New"}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h2 className="text-lg font-semibold mb-4">
                                Travel Details
                              </h2>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-gray-500">From:</span>
                                  <span className="ml-2">
                                    {selectedLead?.from || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">To:</span>
                                  <span className="ml-2">
                                    {selectedLead?.destination || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Travel Date:
                                  </span>
                                  <span className="ml-2">
                                    {selectedLead?.travelDate
                                      ? new Date(
                                          selectedLead.travelDate
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h2 className="text-lg font-semibold mb-4">
                                Package Details
                              </h2>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-gray-500">Budget:</span>
                                  <span className="ml-2">
                                    ₹{selectedLead?.budget || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Duration:
                                  </span>
                                  <span className="ml-2">
                                    {selectedLead?.days || "0"} Days
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Persons:
                                  </span>
                                  <span className="ml-2">
                                    Adults: {selectedLead?.adults || "0"},
                                    Children: {selectedLead?.kids || "0"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "createPackage" && (
                  <div className="p-6 bg-gray-50">
                    <div className="bg-white rounded-lg shadow">
                      {/* Filter Section */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                          <div className="flex-1">
                            <label
                              htmlFor="search"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Search Package
                            </label>
                            <input
                              type="text"
                              id="search"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Search by package name..."
                              value={packageFilter.search}
                              onChange={(e) =>
                                setPackageFilter((prev) => ({
                                  ...prev,
                                  search: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="flex-1">
                            <label
                              htmlFor="category"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Category
                            </label>
                            <select
                              id="category"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={packageFilter.category}
                              onChange={(e) =>
                                setPackageFilter((prev) => ({
                                  ...prev,
                                  category: e.target.value,
                                }))
                              }
                            >
                              <option value="">All Categories</option>
                              {uniqueCategories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1">
                            <label
                              htmlFor="duration"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Duration
                            </label>
                            <select
                              id="duration"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={packageFilter.duration}
                              onChange={(e) =>
                                setPackageFilter((prev) => ({
                                  ...prev,
                                  duration: e.target.value,
                                }))
                              }
                            >
                              <option value="">All Durations</option>
                              {uniqueDurations.map((duration) => (
                                <option key={duration} value={duration}>
                                  {duration} Days
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-none self-end">
                            <button
                              onClick={() =>
                                setPackageFilter({
                                  search: "",
                                  category: "",
                                  duration: "",
                                })
                              }
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Packages Table - Update the packages.map to use filtered packages */}
                      {loadingPackages ? (
                        <div className="p-6 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      ) : getFilteredPackages().length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          {packages.length === 0
                            ? "No packages available"
                            : "No packages match your filters"}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Package Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  B2B Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {getFilteredPackages().map((pkg) => (
                                <tr key={pkg._id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {pkg.packageName || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {pkg.description || "No description"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {pkg.packageCategory || "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {pkg.duration
                                        ? `${pkg.duration} Days`
                                        : "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {pkg.price ? `₹${pkg.price}` : "N/A"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                      onClick={() =>
                                        handleAssignPackage(pkg._id)
                                      }
                                      disabled={selectedLead?.isDemo}
                                      className={`text-blue-600 hover:text-blue-900 font-medium ${
                                        selectedLead?.isDemo
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      Assign
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "viewPackage" && (
                  <div className="p-6 panel-content">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Package Details
                      </h3>
                      {/* Add your package viewing content here */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">
                          No packages available for this lead.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "sendPackage" && (
                  <div className="p-6 bg-gray-50">
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                        {/* Header with gradient background */}
                        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                          <h3 className="text-2xl font-bold">Share Package</h3>
                          <p className="mt-2 text-blue-100">
                            Choose your preferred method to share the package
                            details
                          </p>
                        </div>

                        <div className="p-8">
                          {/* Package Summary Card */}
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <div className="flex items-center mb-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
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
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                  />
                                </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                Package Details
                              </h4>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">
                                  Package Name
                                </span>
                                <span className="font-medium text-gray-900">
                                  {selectedLead?.assignedPackage?.packageName ||
                                    "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Duration</span>
                                <span className="font-medium text-gray-900">
                                  {selectedLead?.assignedPackage?.duration ||
                                    "N/A"}{" "}
                                  Days
                                </span>
                              </div>
                              <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Price</span>
                                <span className="font-medium text-gray-900">
                                  ₹
                                  {selectedLead?.assignedPackage?.price ||
                                    "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Share Options */}
                          <div className="grid grid-cols-3 gap-6">
                            {/* WhatsApp Share */}
                            <button
                              onClick={() => handleShare("whatsapp")}
                              disabled={isSharing}
                              className={`group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all duration-300 ${
                                isSharing && sharingMethod === "whatsapp"
                                  ? "opacity-75 cursor-wait"
                                  : ""
                              }`}
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isSharing && sharingMethod === "whatsapp" ? (
                                  <svg
                                    className="w-5 h-5 text-green-500 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-green-500"
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
                                )}
                              </div>
                              <div
                                className={`w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform ${
                                  isSharing && sharingMethod === "whatsapp"
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              >
                                <svg
                                  className="w-8 h-8 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                WhatsApp
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                {isSharing && sharingMethod === "whatsapp"
                                  ? "Opening WhatsApp..."
                                  : "Share instantly via WhatsApp"}
                              </p>
                            </button>

                            {/* Email Share */}
                            <button
                              onClick={() => handleShare("email")}
                              className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all duration-300"
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-5 h-5 text-blue-500"
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
                              </div>
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <svg
                                  className="w-8 h-8 text-blue-600"
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
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                Email
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                Send via email
                              </p>
                            </button>

                            {/* SMS Share */}
                            <button
                              onClick={() => handleShare("sms")}
                              className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-500 transition-all duration-300"
                            >
                              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-5 h-5 text-purple-500"
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
                              </div>
                              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                <svg
                                  className="w-8 h-8 text-purple-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
                                SMS
                              </h3>
                              <p className="text-sm text-center text-gray-500">
                                Share via SMS
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleClosePanel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-md hover:bg-teal-600 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          )}
          {/* Success modal or notification */}
          {isSharing && (
            <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600">
                Sharing package via {sharingMethod}...
              </span>
            </div>
          )}
          {/* Add a button to trigger adding the demo lead (if needed) */}
          <button
            onClick={addDemoLead}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Demo Lead
          </button>
        </>
      )}
    </div>
  );
};

export default AllLeads;
