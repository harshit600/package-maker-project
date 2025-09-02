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

  useEffect(() => {
    fetchLeads();
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

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

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
            placeholder="Search Leads"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Filter
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
                className="hover:bg-gray-50"
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
                {Math.min(indexOfLastLead, leads.length)}
              </span>{" "}
              of <span className="font-medium">{leads.length}</span> results
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
            className={`fixed inset-0 bg-gray-500 transition-opacity z-40 ${
              isEditPanelOpen
                ? "opacity-75 backdrop-in"
                : "opacity-0 backdrop-out"
            }`}
            onClick={handleClosePanel}
          />

          {/* Side Panel */}
          <div 
            className={`fixed inset-y-0 right-0 w-4/5 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out ${
              isEditPanelOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 bg-teal-500 text-white flex justify-between items-center">
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
                <nav className="flex px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("leadDetails")}
                    className={`${
                      activeTab === "leadDetails"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                  >
                    Lead Details
                  </button>
                  <button
                    onClick={() => setActiveTab("createPackage")}
                    className={`${
                      activeTab === "createPackage"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
                  >
                    Create Package
                  </button>
                  <button
                    onClick={() => setActiveTab("viewPackage")}
                    className={`${
                      activeTab === "viewPackage"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
                  >
                    View Package
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "leadDetails" && (
                  <div className="p-6 bg-gray-50">
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Name
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.name || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.email || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Mobile
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.mobile || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Source
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.source || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Package Details */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Package Details
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Package Category
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.packageCategory || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Package Type
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.packageType || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Travel Information */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Travel Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              From
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.from || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Destination
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.destination || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Travel Date
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.travelDate
                                ? new Date(
                                    selectedLead.travelDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Duration
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.days
                                ? `${selectedLead.days} Days, ${selectedLead.nights} Nights`
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Guest Information */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Guest Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Number of Adults
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.adults || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Number of Kids
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.kids || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Total Persons
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.persons || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Accommodation Details */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Accommodation Details
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Number of Rooms
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.noOfRooms || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Extra Beds
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.extraBeds || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Meal Plans
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.mealPlans || "N/A"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              EP
                            </label>
                            <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                              {selectedLead?.EP || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-3 mb-4">
                          Status
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Publish Status
                            </label>
                            <div
                              className={`text-sm inline-flex px-3 py-1 rounded-full ${
                                selectedLead?.publish === "Yes"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {selectedLead?.publish || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "createPackage" && (
                  <div className="p-6 panel-content">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Create New Package
                      </h3>
                      {/* Add your package creation form here */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        {/* Add more package fields as needed */}
                      </div>
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
