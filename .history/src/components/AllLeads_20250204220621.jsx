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

          {/* Side Panel */}
          <div
            className={`fixed inset-y-0 right-0 w-4/5 bg-[rgb(45,45,68)] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
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
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="p-6 bg-white">
                    {/* Lead Header Section */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-blue-600">
                            {selectedLead?.name?.charAt(0) || "?"}
                    <div className="space-y-4">
                      {/* Header Section */}
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-semibold text-gray-900">
                            {selectedLead?.name || "N/A"}
                          </h2>
                          <p className="text-gray-500">
                            {selectedLead?.email || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              selectedLead?.publish === "Yes"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedLead?.publish || "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Active Sequence Section */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
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
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                            <span className="font-medium text-gray-900">
                              Active sequence
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">
                              Next follow-up:
                            </span>
                            <span className="font-medium">
                              {selectedLead?.nextFollowUp || "Not scheduled"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Contact Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Phone
                            </label>
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5 text-gray-400"
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
                              <span className="text-gray-900">
                                {selectedLead?.mobile || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Source
                            </label>
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-gray-900">
                                {selectedLead?.source || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Travel Information */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Travel Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              From
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.from || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Destination
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.destination || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Travel Date
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.travelDate
                                ? new Date(
                                    selectedLead.travelDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Duration
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.days
                                ? `${selectedLead.days} Days, ${selectedLead.nights} Nights`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Package Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Package Category
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.packageCategory || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Package Type
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.packageType || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Guest Information */}
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Guest Information
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Adults
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.adults || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Kids
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.kids || "N/A"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-500">
                              Total Persons
                            </label>
                            <p className="text-gray-900">
                              {selectedLead?.persons || "N/A"}
                            </p>
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
                                  Status
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
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        pkg.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {pkg.status || "N/A"}
                                    </span>
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
        </>
      )}
    </div>
  );
};

export default AllLeads;
